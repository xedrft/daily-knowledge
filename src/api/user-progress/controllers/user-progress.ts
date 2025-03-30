/**
 * user-progress controller
 */

import { factories } from '@strapi/strapi'
import * as prompts from "../../../../ai-prompts"
import OpenAI from "openai"

export default factories.createCoreController('api::user-progress.user-progress', ({ strapi }) => ({
    async getConcept(ctx){
        try {
            await this.validateQuery(ctx);
            const userId = ctx.request.body["userId"];
            const pastData = await strapi.documents("api::user-progress.user-progress").findFirst({
                filters : {
                    user_id : {
                        id : userId
                    }
                },
                populate : ["concepts"]
            });
            const pastConcepts = pastData["concepts"];
            const pastTitles = pastConcepts.map(concept => concept.title);

            const client = new OpenAI({
                apiKey: process.env['OPENAI_API_KEY']
              });
            
            const conceptRes = await client.responses.create({
                model : "gpt-4o-mini",
                instructions: prompts.concept,
                input: `${pastTitles}\n${pastData["currentField"]}`
            });
            
            const currConcept = conceptRes["output_text"];
            let content = await strapi.documents("api::concept.concept").findFirst({
                filters : {
                    title : currConcept
                }
            });

            if (content){
                ctx.response.body = {
                    content : content["content"],
                    problems : content["problems"]
                }


                pastConcepts.push(content);
                await strapi.documents("api::user-progress.user-progress").update({
                    documentId : pastData["documentId"],
                    data : {
                        concepts : pastConcepts
                    },
                    status : "published"
                });
            }
            else {
                const contentRes = await client.responses.create({
                    model : "gpt-4o-mini",
                    instructions : prompts.content,
                    input : currConcept
                });
                try {
                    content = JSON.parse(String.raw`${contentRes["output_text"]}`);
                }
                catch(err){
                    ctx.response.body = contentRes["output_text"];
                    console.log(err);
                }


            }
            
            


        }
        catch(err) {
            ctx.internalServerError("An error occurred", err);
        }
    }
}));
