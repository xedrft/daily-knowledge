import OpenAI from "openai";
import { content } from "../ai-prompts"

export default async function contentCall(currConcept: string, currLevel: number | null, previouslyLearned: string[] = []){
    const client = new OpenAI({
        apiKey: process.env['OPENAI_API_KEY'],
    });
    
    // Format input clearly for the AI
    const formattedInput = `Concept name: ${currConcept}
Previously learned courses: [${previouslyLearned.map(c => `"${c}"`).join(', ')}]
Difficulty level: ${currLevel}`;
    
    const contentRes = await client.responses.create({
        model : "gpt-4o-mini",
        instructions : `${content}`,
        input : formattedInput,
        temperature : 0.1,
        top_p : 0.9,
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