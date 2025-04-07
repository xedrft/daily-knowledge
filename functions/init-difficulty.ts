import OpenAI from "openai";
import { difficulty } from "../ai-prompts"

export default async function(content){
    const client = new OpenAI({
        apiKey: process.env['OPENAI_API_KEY'],
    });

    const res = await client.responses.create({
        model : "gpt-4o-mini",
        instructions : difficulty,
        input : content,
        text : {
            format : {
                "type": "json_schema",
                "name": "difficulty",
                "strict": true,
                "schema" : {
                    "number" : {
                        "type" : "number"
                    },
                    "required" : ["number"],
                    "additionalProperties" : false
                }
            }
        }
    });
    const output = JSON.parse(res["output_text"]);

    return output["number"];
}