/**
 * user-progress controller
 */

import { factories } from '@strapi/strapi'
import * as prompts from "../../../../ai-prompts"
import OpenAI from "openai"
import init_difficulty from '../../../../functions/init-difficulty';
import contentCall from '../../../../functions/content_call';

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
            const currLevel = pastData["current_level"];

            const client = new OpenAI({
                apiKey: process.env['OPENAI_API_KEY'],
              });
            
            const conceptRes = await client.responses.create({
                model : "gpt-4o-mini",
                instructions: prompts.concept,
                input: `${pastData["currentField"]}\n${pastTitles}\n${currLevel}`,
                top_p : 0.75
            });
            
            const currConcept = conceptRes["output_text"];
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
                    difficulty: content["difficulty"]
                }
            } else {
                const contentRes = await contentCall(currConcept, currLevel);
                
                const output = contentRes["output_text"];
                content = JSON.parse(output);
                ctx.response.body = {
                  title: currConcept,
                  content: content.content,
                  problemset: content.problemset,
                  fields: content.fields,
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
