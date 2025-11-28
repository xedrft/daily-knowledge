/**
 * user-progress controller
 */

import { factories } from '@strapi/strapi'
import * as prompts from "../../../../ai-prompts"
import OpenAI from "openai"
import init_difficulty from '../../../../functions/init-difficulty';
import contentCall from '../../../../functions/content_call';
import { aggregateInternal, blendWithUserSet, type DifficultyEntry } from '../../../../functions/internal-difficulty';

export default factories.createCoreController('api::user-progress.user-progress', ({ strapi }) => ({
    async getConcept(ctx){
        try {
            await this.validateQuery(ctx);
            const user = ctx.state.user;
            console.log(user);
            if (!user) {
                return ctx.unauthorized("No token found or invalid token");
            }

            const pastData = await strapi.documents("api::user-progress.user-progress").findFirst({
                filters : {
                    user_id : {
                        id : user.id
                    }
                },
                populate : ["concepts"]
            });
            
            if (!pastData) {
                return ctx.badRequest("User progress not found. Please select a field first.");
            }
            
            // Get current field concepts and all past concepts
            const currentFieldConcepts = Array.isArray(pastData["currentFieldConcepts"]) ? pastData["currentFieldConcepts"] : [];
            const allPastConcepts = Array.isArray(pastData["allPastConcepts"]) ? pastData["allPastConcepts"] : [];
            
            // Use current field concepts for AI prompt (field-specific learning progression)
            const pastTitles = currentFieldConcepts.map(concept => {
                if (typeof concept === 'string') return concept;
                if (concept && typeof concept === 'object' && 'title' in concept) {
                    return (concept as any).title;
                }
                return '';
            }).filter(Boolean);
            
            // Compute adaptive difficulty from user's rating history
            const internalDifficulties = (Array.isArray(pastData["internalDifficulties"]) 
                ? pastData["internalDifficulties"] 
                : []) as DifficultyEntry[];
            const now = new Date();
            const aggregated = aggregateInternal(internalDifficulties, now);
            const userSetLevel = pastData["current_level"];
            
            // Blend aggregated difficulty with user's set level (confidence-weighted)
            // If user has rated many concepts, trust their performance more
            // If few ratings, fall back to their manually set level
            // Normalize userSetLevel from 1-15 to 0-1 for blending
            const normalizedUserLevel = userSetLevel / 15;
            const blendedDifficulty = blendWithUserSet(aggregated, normalizedUserLevel, {
                maxTrust: 0.8,  // At most, trust 80% of aggregated difficulty
                minTrust: 0.2,  // At least, trust 20% of aggregated difficulty
                scale: 20       // Full trust after ~20 ratings
            });
            
            // Convert from 0-1 scale to 1-15 AI difficulty scale using sigmoid-like curve
            // Small differences → small adjustments, large differences → asymptotic to ±5 levels
            const performanceDelta = blendedDifficulty - normalizedUserLevel;
            // Apply tanh for smooth S-curve: tanh(x) maps (-∞,∞) to (-1,1)
            // Scale input by 3 to make ±0.1 diff → ±0.3 output, ±0.3 diff → ±0.8 output
            const scaledAdjustment = Math.tanh(performanceDelta * 3) * 5; // Max ±5 levels asymptotically
            const currLevel = Math.max(1, Math.min(15, Math.round(userSetLevel + scaledAdjustment)));
            
            const previouslyLearned = Array.isArray((pastData as any).previouslyLearned) ? (pastData as any).previouslyLearned : [];

            const client = new OpenAI({
                apiKey: process.env['OPENAI_API_KEY'],
              });
            
            // Format input properly: field, then array of past concepts, then difficulty
            const formattedInput = `Current field: ${pastData["currentField"]}
Past concepts: [${pastTitles.map(t => `"${t}"`).join(', ')}]
Previously learned courses: [${previouslyLearned.map((c: string) => `"${c}"`).join(', ')}]
Difficulty level: ${currLevel}`;
            
            const conceptRes = await client.responses.create({
                model : "gpt-4o-mini",
                instructions: prompts.concept,
                input: formattedInput,
                top_p : 0.75,
                text: {
                    format: {
                        type: "json_schema",
                        name: "concept_selection",
                        strict: true,
                        schema: {
                            type: "object",
                            properties: {
                                cot: { type: "string" },
                                concept: { type: "string" }
                            },
                            required: ["cot", "concept"],
                            additionalProperties: false
                        }
                    }
                }
            });
            
            const conceptJson = JSON.parse(conceptRes["output_text"] || "{}");
            const currConcept = conceptJson.concept;
            const conceptCot = conceptJson.cot;
            console.log(currConcept);
            let content = await strapi.documents("api::concept.concept").findFirst({
                filters : {
                    title : currConcept
                }
            });

                        if (content){
                ctx.response.body = {
                                        title: currConcept,
                    content : content["content"],
                    problemset : content["problemset"],
                    fields: content["fields"],
                                        difficulty: content["difficulty"],
                                        cot: conceptCot
                }
            } else {
                const contentRes = await contentCall(currConcept, currLevel, previouslyLearned);
                
                const output = contentRes["output_text"];
                content = JSON.parse(output);
                ctx.response.body = {
                  title: currConcept,
                  content: content.content,
                  problemset: content.problemset,
                                    fields: content.fields,
                                    cot: conceptCot
                };

                content["title"] = currConcept;
                await strapi.documents("api::concept.concept").create({
                    data : {
                        title : currConcept,
                        content : content["content"],
                        problemset: content["problemset"],
                        fields : content["fields"],
                        difficulty : await init_difficulty(content["content"]),
                        creationDate : new Date()
                    },
                    status : "published"
                });
            }
            content = await strapi.documents("api::concept.concept").findFirst({
              filters : {
                  title : currConcept
              }
            });
            
            // Add to current field concepts and all past concepts
            const updatedCurrentFieldConcepts = [...currentFieldConcepts, currConcept];
            const updatedAllPastConcepts = [...allPastConcepts, currConcept];
            
            // Also update the old concepts relation for backward compatibility
            const pastConcepts = pastData["concepts"] || [];
            pastConcepts.push(content);
            
            await strapi.documents("api::user-progress.user-progress").update({
                documentId : pastData["documentId"],
                data : {
                    concepts : pastConcepts,
                    currentFieldConcepts: updatedCurrentFieldConcepts,
                    allPastConcepts: updatedAllPastConcepts
                },
                status : "published"
            });
            
        }
        catch(err) {
            ctx.internalServerError("An error occurred", err);
            console.log(err);
        }
    }
}));
