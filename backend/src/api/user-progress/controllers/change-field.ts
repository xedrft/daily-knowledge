import { factories } from '@strapi/strapi';
import axios from 'axios';
import { OpenAI } from 'openai';
import {field} from "../../../../ai-prompts";

export default factories.createCoreController('api::user-progress.user-progress', ({ strapi }) => ({
    async changeField(ctx) {
        try {
            const jwt = ctx.cookies.get("jwt");

            if (!jwt) {
                return ctx.unauthorized("No token found");
            }

            const decoded = await strapi.plugins['users-permissions'].services.jwt.verify(jwt);
            const userId = decoded.id;

            const current_field = await strapi.documents("api::user-progress.user-progress").findFirst({
                filters : {
                    user_id : {
                        id : userId
                    }
                }
            })["currentField"];

            const past_fields = await strapi.documents("api::user-progress.user-progress").findFirst({
                filters : {
                    user_id : {
                        id : userId
                    }
                }
            })["pastFields"];


            const client = new OpenAI({
                apiKey: process.env['OPENAI_API_KEY'],
            });

            const fieldRes = await client.responses.create({
                model: "gpt-4.1-mini",
                instructions: field,
                input: `${current_field}\n${past_fields}\n${ctx.request.body["field"]}`,
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

        ctx.response.body = fieldRes["output_text"];

        }
        catch (error) {
            console.error('An error occurred:', error);
            ctx.response.body = { error: "An error occurred while changing field. Please try again." };
            ctx.response.status = 400;
        }
    }
}));