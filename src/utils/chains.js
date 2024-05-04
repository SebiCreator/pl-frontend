import { ChatPromptTemplate } from "@langchain/core/prompts";
import { createOpenAI } from "./LLMService.js";
import { } from "./prompts.js"
import { } from "./outputParsers.js"
import { StructuredOutputParser } from "langchain/output_parsers";
import { z } from "zod";



const llm = createOpenAI()
const outputParser = StructuredOutputParser.fromZodSchema(
    z.object({
        code: z.string().describe("The code example that demonstrates the topic").default(""),
    })
)


const prompt = ChatPromptTemplate.fromTemplate(`
    Based on the following topic create a code example in the following programming language that demonstrates the topic.
    Topic: {topic}
    Text Language: {language}
    Programming Language: {programming_language}
    Formatting Instructions: {format_instructions}
`)


const mainFunc = () => {
    const chain = prompt.pipe(llm).pipe(outputParser)
    const invokeChain = async (topic,language) => chain.invoke({ topic,language,  format_instructions: outputParser.getFormatInstructions() })
    return invokeChain

}

export {
    mainFunc
}