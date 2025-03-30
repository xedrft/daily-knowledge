/**
 * user-progress controller
 */

import { factories } from '@strapi/strapi'
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
                instructions: "You are a knowledgeable and engaging science tutor specializing in picking fitting complex concepts to teach to the user. Your goal is to suggest highly specific scientific concepts (such as theorems, axioms, laws, theories, etc.) to the user based on past concepts (which you should base off as example and never repeat) and the field the user is interested in. You will be given two values, seperated by a new line, the first being a list of past concepts, and the second being the current field. Choose an appropriate concept that the user would be interested in, and output only the name of the concept.",
                input: `${pastTitles}\n${pastData["currentField"]}`
            });
            
            const currConcept = conceptRes["output_text"];
            const content = await strapi.documents("api::concept.concept").findFirst({
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
            console.log(content);


        }
        catch(err) {
            ctx.internalServerError("An error occurred", err);
        }
    }
}));
