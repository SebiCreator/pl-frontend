import { ChatPromptTemplate } from "@langchain/core/prompts";
import { createOpenAI } from "./LLMService.js";
import { } from "./prompts.js"
import { } from "./outputParsers.js"
import { StructuredOutputParser } from "langchain/output_parsers";
import { z } from "zod";
import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";




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
    const invokeChain = async (topic, language) => chain.invoke({ topic, language, format_instructions: outputParser.getFormatInstructions() })
    return invokeChain

}


const helloUserPrompt = ChatPromptTemplate.fromTemplate(`
    Your are a tutor for coding.
    Please greet the user that wants to learn {topic}.
    Ask him if he has specific questions or if he just wants to start the learning?
    Your name is: {name}.
    In the language {language}.
`)
const helloUserChain = helloUserPrompt.pipe(llm)



const subGoalSplitterParser = StructuredOutputParser.fromZodSchema(
    z.object({
        subgoals: z.array(z.object({
            name : z.string().describe("The subgoal to be achieved").default(""),
            description: z.string().describe("The description of the subgoal").default(""),
        }))
    }).describe("The subgoals to be achieved for the main goal").default({})
)
const subGoalSplitterPrompt = ChatPromptTemplate.fromTemplate(`
    Das Ziel des Users : {goal}
    Beschreibung was er dabei genau lernen will: {description}
    Du bist ein Tutor für Programmieren.
    Deine Aufgabe ist es ein Ziel mit der Beschreibung in mindestens 10 kleinere Teilziele zu unterteilen.
    Diese Teilziele sollen Themen enthalten die nacheinander erlernt werden können um das Hauptziel zu erreichen.
    Es sollen keine Lernmethoden oder ähnliches enthalten sein nur die fachlichen Unterthemen.
    Es soll bei allen Teilzielen so gut es geht der Kontext des Ziels und der Beschreibung eingehen
    Format Instructions: {format_instructions}
    Sprace der der Json Datei: {language}
`)

const subGoalSplitterChain = subGoalSplitterPrompt.pipe(llm).pipe(subGoalSplitterParser)


const useSubGoalSplitter = async ({ goal, description, language }) => {
    return subGoalSplitterChain.invoke({ goal, description, language,  format_instructions: subGoalSplitterParser.getFormatInstructions() })
}





export {
    mainFunc,
    helloUserChain,
    useSubGoalSplitter
}