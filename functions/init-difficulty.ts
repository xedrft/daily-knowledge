import OpenAI from "openai";


export default function(content){
    const client = new OpenAI({
        apiKey: process.env['OPENAI_API_KEY'],
    });

    return 5;    
}