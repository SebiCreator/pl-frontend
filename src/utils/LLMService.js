import { Logger } from "./Logger";
import { ChatOpenAI, OpenAI } from "@langchain/openai";


const createOpenAI = ({model="gpt-4",temp=0.2}={model: "gpt-4",  temp : 0.2}) => {
    return new OpenAI({
        openAIApiKey: import.meta.env.VITE_OPENAI_API_KEY,
        temperature : temp,
        model : model
    });
}
const createChatOpenAI = ({model="gpt-4",temp=0}={model: "gpt-4",  temp : 0}) => {
    return new ChatOpenAI({
        openAIApiKey: import.meta.env.VITE_OPENAI_API_KEY,
        temperature : temp,
        model : model
    });
}




export {
    createOpenAI,
    createChatOpenAI
}