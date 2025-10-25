import { factories } from '@strapi/strapi';
import { OpenAI } from 'openai';
import {field} from "../../../../ai-prompts";

export default factories.createCoreController('api::user-progress.user-progress', ({ strapi }) => ({
    async checkUserField(ctx) {
        try {
            await this.validateQuery(ctx);
            const user = ctx.state.user;
            console.log("[checkUserField] ctx.state.user:", user);
            console.log("[checkUserField] Authorization header:", ctx.request.headers.authorization);
            if (!user) {
                console.log("[checkUserField] No user in ctx.state, returning unauthorized");
                return ctx.unauthorized("No token found or invalid token");
            }

            const userId = user.id;
            console.log("[checkUserField] User ID:", userId);

            const userProgress = await strapi.documents("api::user-progress.user-progress").findFirst({
                filters: {
                    user_id: {
                        id: userId
                    }
                }
            });

            if (!userProgress) {
                ctx.response.body = { 
                    hasField: false, 
                    currentField: null,
                    current_level: null,
                    previouslyLearned: [],
                    onboardingComplete: false,
                    message: "User progress not found" 
                };
                return;
            }

            const currentFieldConcepts = Array.isArray(userProgress.currentFieldConcepts) ? userProgress.currentFieldConcepts : [];
            const allPastConcepts = Array.isArray(userProgress.allPastConcepts) ? userProgress.allPastConcepts : [];

            ctx.response.body = {
                hasField: userProgress.currentField == "None" ? false : true,
                currentField: userProgress.currentField,
                pastFields: userProgress.pastFields || [],
                currentFieldConcepts: currentFieldConcepts,
                allPastConcepts: allPastConcepts,
                current_level: userProgress.current_level ?? null,
                previouslyLearned: Array.isArray((userProgress as any).previouslyLearned) ? (userProgress as any).previouslyLearned : [],
                onboardingComplete: !!(userProgress as any).onboardingComplete,
                conceptStats: {
                    currentFieldCount: currentFieldConcepts.length,
                    totalConceptsCount: allPastConcepts.length + currentFieldConcepts.length
                }
            };

        } catch (error) {
            console.error('Error checking user field:', error);
            return ctx.badRequest("An error occurred while checking field. Please try again.");
        }
    },
    async initializeProfile(ctx) {
        try {
            await this.validateQuery(ctx);
            const user = ctx.state.user;
            if (!user) return ctx.unauthorized("No token found or invalid token");

            const { level, field, previouslyLearned } = ctx.request.body || {};
            if (typeof level !== 'number' || level < 1 || level > 15) return ctx.badRequest("Level must be a number between 1 and 15");
            if (!field || typeof field !== 'string') return ctx.badRequest("Field is required");
            const learned = Array.isArray(previouslyLearned) ? previouslyLearned : [];

            const existing = await strapi.documents("api::user-progress.user-progress").findFirst({
                filters: { user_id: { id: user.id } }
            });

            if (existing) {
                await strapi.documents("api::user-progress.user-progress").update({
                    documentId: existing.documentId,
                    data: {
                        current_level: level,
                        currentField: field,
                        pastFields: existing.pastFields || [],
                        currentFieldConcepts: [],
                        allPastConcepts: existing.allPastConcepts || [],
                        previouslyLearned: learned,
                        onboardingComplete: true,
                    },
                    status: 'published'
                });
            } else {
                await strapi.documents("api::user-progress.user-progress").create({
                    data: {
                        user_id: user.id,
                        current_level: level,
                        currentField: field,
                        pastFields: [],
                        currentFieldConcepts: [],
                        allPastConcepts: [],
                        previouslyLearned: learned,
                        onboardingComplete: true,
                    },
                    status: 'published'
                });
            }

            ctx.response.body = { ok: true };
        } catch (error) {
            console.error('Error initializing profile:', error);
            return ctx.badRequest("An error occurred while initializing profile.");
        }
    },
    async updateLevel(ctx) {
        try {
            await this.validateQuery(ctx);
            const user = ctx.state.user;
            if (!user) return ctx.unauthorized("No token found or invalid token");
            const { level } = ctx.request.body || {};
            if (typeof level !== 'number' || level < 1 || level > 15) return ctx.badRequest("Level must be 1-15");
            const up = await strapi.documents("api::user-progress.user-progress").findFirst({ filters: { user_id: { id: user.id } } });
            if (!up) return ctx.badRequest("User progress not found");
            await strapi.documents("api::user-progress.user-progress").update({ documentId: up.documentId, data: { current_level: level }, status: 'published' });
            ctx.response.body = { ok: true };
        } catch (error) {
            console.error('Error updating level:', error);
            return ctx.badRequest("An error occurred while updating level.");
        }
    },
    async updatePreviouslyLearned(ctx) {
        try {
            await this.validateQuery(ctx);
            const user = ctx.state.user;
            if (!user) return ctx.unauthorized("No token found or invalid token");
            const { courses } = ctx.request.body || {};
            if (!Array.isArray(courses)) return ctx.badRequest("courses must be an array of strings");
            const up = await strapi.documents("api::user-progress.user-progress").findFirst({ filters: { user_id: { id: user.id } } });
            if (!up) return ctx.badRequest("User progress not found");
            await strapi.documents("api::user-progress.user-progress").update({ documentId: up.documentId, data: { previouslyLearned: courses }, status: 'published' });
            ctx.response.body = { ok: true };
        } catch (error) {
            console.error('Error updating previously learned:', error);
            return ctx.badRequest("An error occurred while updating previously learned.");
        }
    },

    async getSuggestedFields(ctx) {
        try {
            await this.validateQuery(ctx);
            const user = ctx.state.user;
            console.log(user);
            if (!user) {
                return ctx.unauthorized("No token found or invalid token");
            }

            const userId = user.id;

            const userProgress = await strapi.documents("api::user-progress.user-progress").findFirst({
                filters: {
                    user_id: {
                        id: userId
                    }
                }
            });

            if (!userProgress) {
                return ctx.badRequest("User progress not found");
            }

            const currentField = userProgress.currentField;
            const pastFields = Array.isArray(userProgress.pastFields) ? userProgress.pastFields : [];
            const generalArea = ctx.request.body["generalArea"];
            const providedLevel = ctx.request.body["level"];
            const currentLevel = typeof providedLevel === 'number' ? providedLevel : (typeof userProgress.current_level === 'number' ? userProgress.current_level : null);
            const providedLearned = ctx.request.body["previouslyLearned"];
            const previouslyLearned = Array.isArray(providedLearned)
                ? providedLearned
                : (Array.isArray((userProgress as any).previouslyLearned) ? (userProgress as any).previouslyLearned : []);

            if (!generalArea) {
                return ctx.badRequest("General area is required");
            }

            const client = new OpenAI({
                apiKey: process.env['OPENAI_API_KEY'],
            });

            // Format input clearly for the AI
            const formattedInput = `General area of science: ${generalArea}
Current level (1-15): ${currentLevel ?? 'unknown'}
Current field: ${currentField}
Past fields: [${pastFields.length > 0 ? pastFields.map(f => `"${f}"`).join(", ") : ''}]
Previously learned courses: [${previouslyLearned.length > 0 ? previouslyLearned.map((c: string) => `"${c}"`).join(", ") : ''}]`;

            const fieldRes = await client.responses.create({
                model: "gpt-4o-mini",
                instructions: field,
                input : formattedInput,
                top_p: 0.75,
                text : {
                    format : {
                        type: "json_schema",
                        name: "field_change",
                        strict: true,
                        schema: {
                            type: "object",
                            properties: {
                                cot: { type: "string" },
                                fields: {
                                    type: "array",
                                    minItems: 5,
                                    maxItems: 7,
                                    items: { type: "string" }
                                }
                            },
                            required: ["cot", "fields"],
                            additionalProperties: false
                        }
                    }
                }
            });

            const suggestions = JSON.parse(fieldRes["output_text"] || "{}");
            const fields = suggestions.fields || suggestions.suggestions || Object.values(suggestions)[0];
            const cot = suggestions.cot || "";

            ctx.response.body = {
                generalArea,
                cot,
                suggestions: fields
            };

        } catch (error) {
            console.error('Error getting field suggestions:', error);
            return ctx.badRequest("An error occurred while getting suggestions. Please try again.");
        }
    },

    async changeField(ctx) {
        try {
            await this.validateQuery(ctx);
            const user = ctx.state.user;
            console.log(user);
            if (!user) {
                return ctx.unauthorized("No token found or invalid token");
            }

            const userId = user.id;

            const userProgress = await strapi.documents("api::user-progress.user-progress").findFirst({
                filters: {
                    user_id: {
                        id: userId
                    }
                }
            });

            if (!userProgress) {
                return ctx.badRequest("User progress not found");
            }

            const selectedField = ctx.request.body["field"];
            if (!selectedField) {
                return ctx.badRequest("Field is required");
            }

            // Update user's field
            const currentField = userProgress.currentField;
            const pastFields = Array.isArray(userProgress.pastFields) ? userProgress.pastFields : [];
            const currentFieldConcepts = Array.isArray(userProgress.currentFieldConcepts) ? userProgress.currentFieldConcepts : [];
            const allPastConcepts = Array.isArray(userProgress.allPastConcepts) ? userProgress.allPastConcepts : [];

            // Add current field to past fields if it exists
            const updatedPastFields = currentField != "None" ? [...pastFields, currentField] : pastFields;
            
            // Move current field concepts to all past concepts and reset current field concepts
            const updatedAllPastConcepts = [...allPastConcepts, ...currentFieldConcepts];

            await strapi.documents("api::user-progress.user-progress").update({
                documentId: userProgress.documentId,
                data: {
                    currentField: selectedField,
                    pastFields: updatedPastFields,
                    currentFieldConcepts: [], // Reset for new field
                    allPastConcepts: updatedAllPastConcepts
                },
                status: 'published'
            });

            ctx.response.body = {
                message: "Field changed successfully!",
                newField: selectedField,
                pastFields: updatedPastFields,
                conceptsMovedToPast: currentFieldConcepts.length
            };

        } catch (error) {
            console.error('Error changing field:', error);
            return ctx.badRequest("An error occurred while changing field. Please try again.");
        }
    }
}));