import { factories } from '@strapi/strapi';
import axios from 'axios';
import { OpenAI } from 'openai';
import {field} from "../../../../ai-prompts";

export default factories.createCoreController('api::user-progress.user-progress', ({ strapi }) => ({
    async checkUserField(ctx) {
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
                ctx.response.body = { 
                    hasField: false, 
                    currentField: null,
                    message: "User progress not found" 
                };
                return;
            }

            ctx.response.body = {
                hasField: !!userProgress.currentField,
                currentField: userProgress.currentField,
                pastFields: userProgress.pastFields || []
            };

        } catch (error) {
            console.error('Error checking user field:', error);
            ctx.response.body = { error: "An error occurred while checking field. Please try again." };
            ctx.response.status = 400;
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

            const current_field = userProgress.currentField;
            const past_fields = Array.isArray(userProgress.pastFields) ? userProgress.pastFields : [];
            const generalArea = ctx.request.body["generalArea"];

            if (!generalArea) {
                return ctx.badRequest("General area is required");
            }

            const client = new OpenAI({
                apiKey: process.env['OPENAI_API_KEY'],
            });


            const fieldRes = await client.responses.create({
                model: "gpt-4o-mini",
                instructions: field,
                input : `General Area: ${generalArea}\nCurrent Field: ${current_field || "None"}\nPast Fields: ${past_fields.length > 0 ? past_fields.join(", ") : "None"}`,
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
            ctx.response.body = { error: "An error occurred while getting suggestions. Please try again." };
            ctx.response.status = 400;
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

            // Add current field to past fields if it exists
            const updatedPastFields = currentField ? [...pastFields, currentField] : pastFields;

            await strapi.documents("api::user-progress.user-progress").update({
                documentId: userProgress.documentId,
                data: {
                    currentField: selectedField,
                    pastFields: updatedPastFields
                }
            });

            ctx.response.body = {
                message: "Field changed successfully!",
                newField: selectedField,
                pastFields: updatedPastFields
            };

        } catch (error) {
            console.error('Error changing field:', error);
            ctx.response.body = { error: "An error occurred while changing field. Please try again." };
            ctx.response.status = 400;
        }
    }
}));