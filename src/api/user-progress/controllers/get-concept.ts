/**
 * user-progress controller
 */

import { factories } from '@strapi/strapi'
import * as prompts from "../../../../ai-prompts"
import OpenAI from "openai"
import init_difficulty from '../../../../functions/init-difficulty';

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
                apiKey: process.env['OPENAI_API_KEY'],
              });
            
            const conceptRes = await client.responses.create({
                model : "gpt-4o-mini",
                instructions: prompts.concept,
                input: `${pastTitles}\n${pastData["currentField"]}`,
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
                    content : content["content"],
                    problems : content["problems"]
                }
            }
            else {
                const contentRes = await client.responses.create({
                    model : "gpt-4o-mini",
                    instructions : prompts.content,
                    input : currConcept,
                    temperature : 0.4,
                    top_p : 0.8,
                    text : {
                        format : {
                            "type": "json_schema",
                            "name": "science_response",
                            "strict": true,
                            "schema": {
                              "type": "object",
                              "properties": {
                                "content": {
                                  "type": "string"
                                },
                                "problemset": {
                                  "type": "array",
                                  "items": {
                                    "type": "object",
                                    "properties": {
                                      "problem": {
                                        "type": "string"
                                      },
                                      "solution": {
                                        "type": "string"
                                      },
                                      "answer": {
                                        "type": "string"
                                      }
                                    },
                                    "required": [
                                      "solution",
                                      "problem",
                                      "answer"
                                    ],
                                    "additionalProperties": false
                                  }
                                },
                                "fields": {
                                  "type": "array",
                                  "items": {
                                    "type": "string"
                                  }
                                }
                              },
                              "required": [
                                "content",
                                "problemset",
                                "fields"
                              ],
                              "additionalProperties": false
                            }
                          },
                    }
                });
                const output = contentRes["output_text"];
                content = JSON.parse(output);
                ctx.response.body = content;

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
            pastConcepts.push(content);
            await strapi.documents("api::user-progress.user-progress").update({
                documentId : pastData["documentId"],
                data : {
                    concepts : pastConcepts
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
