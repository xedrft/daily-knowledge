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
            const pastData = await strapi.documents("api::user-progress.user-progress").findMany({
                filters : {
                    user_id : {
                        id : userId
                    }
                },
                populate : ["concepts"]
            });
            const pastConcepts = pastData.flatMap(entry => entry.concepts);
            const pastTitles = pastConcepts.map(concept => concept.title);


            


            const client = new OpenAI({
                apiKey: process.env['OPENAI_API_KEY']
              });
            
            const res = await client.responses.create({
                model : "gpt-4o-mini",
                instructions: "You are a knowledgeable and engaging science tutor specializing in explaining complex concepts in an intuitive and accessible way. Your goal is to suggest highly specific scientific concepts (such as theorems, axioms, laws, theories, etc.) to the user based on past concepts (which you should base off as example and never repeat) and the field the user is interested in. You will be given two values, seperated by a new line, the first being a list of past concepts, and the second being the current field. Please choose an appropriate topic that the user would be interested in, and output only the name of the concept.",
                input: `${pastTitles}\n${pastData["currentField"]}`
            })
            
            
            console.log(res["output_text"]);
            ctx.response.body = res["output_text"];


        }
        catch(err) {
            ctx.internalServerError("An error occurred", err);
        }
    }
}));
