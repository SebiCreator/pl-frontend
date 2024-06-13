import { StringOutputParser } from "@langchain/core/output_parsers";
import {
    createOpenAIFunctionsAgent,
    AgentExecutor,
    createReactAgent,
} from "langchain/agents";
import { ChatOpenAI, OpenAI } from "@langchain/openai";
import {
    ChatPromptTemplate,
    MessagesPlaceholder,
} from "@langchain/core/prompts";

const llm = new ChatOpenAI({
    openAIApiKey: "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",
    temperature: 0,
    model: "gpt-4o"
})
const baseLLM = new OpenAI({
    openAIApiKey: "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",
    temperature: 0,
    model: "gpt-4o"
})

const p1 = ChatPromptTemplate.fromTemplate(`
    Erstelle für folgendes Thema eine Aufgabe die der Benutzer lösen muss
    Erstelle eine Aufgabe die direkt an den Benutzer gerichtet ist 
    Thema: {topic}
    Schwierigkeitsgrad: {difficulty}
`)

const p2 = ChatPromptTemplate.fromTemplate(`
    Erstelle für folgendes Thema einen Code mit Fehlern die der Benutzer finden muss
    Es soll kein Markdown oder HTML verwendet werden
    Thema: {topic}
    Schwiereigkeitsgrad: {difficulty}
`)

const c1 = p1.pipe(baseLLM).pipe(new StringOutputParser())
const c2 = p2.pipe(baseLLM).pipe(new StringOutputParser())


import { DynamicTool, DynamicStructuredTool } from "@langchain/core/tools";

const questionGeneratorTool = new DynamicTool({
    name: "QuestionGenerator",
    description: "Use this tool to generate a question based on the topic",
    func: async (topic) => await c1.invoke({ topic, difficulty: "easy" })
})

const errorCodeTool = new DynamicTool({
    name: "errorCode",
    description: "Use this tool to generate a code with errors for the user to find  based on the topic ",
    func: async (topic) => await c2.invoke({ topic, difficulty: "easy" }),
    callbacks: {
        onInvoke: (result) => {
            console.log(result)
        }
    }
})

const describeTool = new DynamicTool({
    name: "describeTool",
    description: "use this tool if the user wants something explained",
    func: async (input) => "I am a tool that can help you with that",
    callbacks: {
        onInvoke: (result) => {
            console.log(result)
        }
    }
})


const tools = [questionGeneratorTool, errorCodeTool, describeTool]

const prompt = ChatPromptTemplate.fromMessages([
    ("system", "Du bist ein Tutor für Programmieren. In folgendem Thema: {topic}"),
    ("system", "Verwende kein Markdown oder HTML!"),
    ("user", "{input}"),
    new MessagesPlaceholder("agent_scratchpad"),
])



const agent = await createOpenAIFunctionsAgent({
    llm, prompt, tools
})
const agentExecutor = new AgentExecutor({ agent, tools, verbose: true})



const topic = "Python"
const result = await agentExecutor.invoke({ input: "Beschreibe mir das", topic })

console.log(result)
