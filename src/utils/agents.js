import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { createOpenAIFunctionsAgent, AgentExecutor, createReactAgent } from "langchain/agents";
import { createChatOpenAI, } from "./LLMService.js"
import { pull } from "langchain/hub";
import { Logger } from "./Logger.js";




class Agent {
    constructor({ llm=createChatOpenAI(), prompt, tools, verbose = false, reAct = false }) {
        this.logger = new Logger({ context: "Agent", enabled: true })
        this.llm = llm
        this.prompt = prompt
        this.tools = tools
        this.executor = null
        this.chatHistory = []
        this.verbose = verbose
        this.reAct = reAct
        this.logger.log("Agent created", { llm, prompt, tools, verbose, reAct })
    }

    async createAgent() {
        let agent = null
        if (this.reAct) {
            agent = await createReactAgent({
                llm: this.llm,
                prompt: this.prompt,
                tools: this.tools
            })
        } else {
            agent = await createOpenAIFunctionsAgent({
                llm: this.llm,
                prompt: this.prompt,
                tools: this.tools
            })
        }
        this.executor = new AgentExecutor({ agent, tools, verbose: this.verbose })
        this.logger.log("Agent created", { agent, executor: this.executor })
    }

    async invoke(input) {
        this.logger.log("Agent invoked", { input })
        if (!this.executor) {
            await this.createAgent()
        }
        try {
            const response = await this.executor.invoke({ ...input, chatHistory: this.chatHistory })
            this.chatHistory.push(new HumanMessage(input));
            this.chatHistory.push(new AIMessage(response.output));
        } catch (e) {
            this.logger.error("Error invoking agent", { input, e })
        }
    }

}

const mainFunc = async () => {
    const llm = createChatOpenAI()
    const template = await pull("hwchase17/openai-functions-agent")
    const agent = new Agent({ llm, prompt: template, tools, verbose: false })
    await agent.invoke({ input: "generate a random number between 10 and 200" })
}

export { mainFunc, Agent }


