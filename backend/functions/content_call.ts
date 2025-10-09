import OpenAI from "openai";
import { content } from "../ai-prompts"

export default async function contentCall(currConcept, currLevel){
    const client = new OpenAI({
        apiKey: process.env['OPENAI_API_KEY'],
    });
    const contentRes = await client.responses.create({
        model : "gpt-4o-mini",
        instructions : `${content}`,
        input : `${currConcept}\n${currLevel}`,
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
                    "cot": {
                        "type": "string"
                    },
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
                    "cot",
                    "content",
                    "problemset",
                    "fields"
                    ],
                    "additionalProperties": false
                }
                },
        }
    });

    return contentRes;
}