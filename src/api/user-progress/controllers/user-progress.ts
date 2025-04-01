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
                apiKey: process.env['DEEPSEEK_API_KEY'],
                baseURL: "https://api.deepseek.com"
              });
            
              const conceptRes = await client.chat.completions.create({
                model : "deepseek-chat",
                messages : [
                    {
                        role : "system",
                        content : prompts.concept
                    },
                    {
                        role : "user",
                        content : `${pastTitles}\n${pastData["currentField"]}`
                    }
                ]
            });
            
            const currConcept = conceptRes.choices[0].message.content;
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
                const contentRes = await client.chat.completions.create({
                    model : "deepseek-chat",
                    messages : [
                        {
                            role : "system",
                            content : prompts.content
                        },
                        {
                            role : "user",
                            content : currConcept
                        }
                    ],
                    temperature : 0,
                });
                const output = contentRes.choices[0].message.content;
                try {
                    content = JSON.parse(output);
                    ctx.response.body = output;
                    console.log("Success");
                }
                catch(err){
                    console.log(output);
                    ctx.response.body = output;
                    console.log(err);
                }


            }
            
            


        }
        catch(err) {
            ctx.internalServerError("An error occurred", err);
        }
    }
}));
