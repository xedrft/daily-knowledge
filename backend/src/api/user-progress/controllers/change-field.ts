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

            if (!generalArea) {
                return ctx.badRequest("General area is required");
            }

            const client = new OpenAI({
                apiKey: process.env['OPENAI_API_KEY'],
            });

            // Format input clearly for the AI
            const formattedInput = `General area of science: ${generalArea}
Current field: ${currentField || "None"}
Past fields: [${pastFields.length > 0 ? pastFields.map(f => `"${f}"`).join(", ") : ''}]`;

            const fieldRes = await client.responses.create({
                model: "gpt-4o-mini",
                instructions: field,
                input : formattedInput,
                top_p: 0.75,
                text : {
                    format : {
                        "type": "json_schema",
                        "name": "field_change",
                        "strict": true,
                        "schema": {
                            "type": "object",
                            "properties": {
                                "fields": {
                                    "type": "array",
                                    "items": { "type": "string" }
                                }
                            },
                            "required": ["fields"],
                            "additionalProperties": false
                        }
                    }
                }
            });

            const suggestions = JSON.parse(fieldRes["output_text"]);

            ctx.response.body = {
                generalArea,
                suggestions: suggestions.fields || suggestions.suggestions || Object.values(suggestions)[0]
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
                }
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