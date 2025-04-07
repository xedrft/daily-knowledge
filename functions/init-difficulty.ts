import OpenAI from "openai";
import { difficulty } from "../ai-prompts"

export default async function(content){
    try{
        const client = new OpenAI({
            apiKey: process.env['OPENAI_API_KEY'],
        });

        const res = await client.responses.create({
            model : "gpt-4o-mini",
            instructions : difficulty,
            input : content,
            text: {
                format: {
                    type: "json_schema",
                    name: "difficulty",
                    strict: true,
                    schema: {
                        type: "object",
                        properties: {
                        num: { type: "number" }
                        },
                    required: ["num"],
                    additionalProperties: false
                    }
                }
            }
        });
        const output = JSON.parse(res["output_text"]);

        return output["num"];
    }
    catch(err){
        console.log(err);
        return 0;
    }
}