import { Logger } from "./Logger";
import { ChatOpenAI, OpenAI } from "@langchain/openai";
import { getEmptyKeys } from "./special";
import { summarizerPrompt, correctorPrompt } from "./prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { LLMChain } from "langchain/chains";
import { MemoryVectorStore } from "@langchain/core/memory";




const turbo = "gpt-3.5-turbo"

const createOpenAI = ({ model = turbo, temp = 0.2 } = { model: turbo, temp: 0.2 }) => {
    return new OpenAI({
        openAIApiKey: import.meta.env.VITE_OPENAI_API_KEY,
        temperature: temp,
        model: model
    });
}
const createChatOpenAI = ({ model = turbo, temp = 0 } = { model: turbo, temp: 0 }) => {
    return new ChatOpenAI({
        openAIApiKey: import.meta.env.VITE_OPENAI_API_KEY,
        temperature: temp,
        model: model
    });
}

const createEmbeddings = () => {
    return new OpenAIEmbeddings({
        openAIApiKey: import.meta.env.VITE_OPENAI_API_KEY,
    });

}

function combineObjects(obj1, obj2) {
    const combinedObj = {};

    for (const key in obj1) {
        if (obj1.hasOwnProperty(key)) {
            combinedObj[key] = (obj1[key] === '' || obj1[key] === -1 || obj1[key] === null || obj1[key] === undefined) ? obj2[key] : obj1[key];
        }
    }

    for (const key in obj2) {
        if (obj2.hasOwnProperty(key) && !obj1.hasOwnProperty(key)) {
            combinedObj[key] = (obj2[key] === '' || obj2[key] === -1 || obj2[key] === null || obj2[key] === undefined) ? obj1[key] : obj2[key];
        }
    }

    return combinedObj;
}



// Add Converstation History TODO

// Create Vector Store
const vectorstore = await MemoryVectorStore.fromDocuments(
  [],
  createEmbeddings()
);

const retriever = vectorstore.asRetriever({ k: 2 });

class JsonAsker {
    constructor(firstQuestion, outputParser, messageKeys={user: "end", ai: "start"}) {
        const chatModel = createChatOpenAI()
        const llmModel = createOpenAI()
        this.logger = new Logger({ context: "JsonAsker", enabled: true })
        this.outputParser = outputParser
        this.summarizerChain = summarizerPrompt.pipe(llmModel).pipe(outputParser)
        this.summarizerChain = new LLMChain({ llm: llmModel, memory: llmMemory, prompt: summarizerPrompt, outputParser: outputParser })
        this.corretionChain = correctorPrompt.pipe(chatModel).pipe(new StringOutputParser())
        this.json = {}
        this.nextQuestions = []
        this.chatConversation = [{ msg: firstQuestion, position: messageKeys.ai }]
        this.done = false
        this.firstQuestionDone = false
        this.currentQuestion = firstQuestion
        this.messageKeys = messageKeys
    }


    async updateJson(data) {
        this.json = combineObjects(this.json, data)
    }

    async nextQuestion(userInput) {
        this.logger.log("User input", { userInput, chatConversation: this.chatConversation });
    
        if (this.nextQuestions.length === 0 && !this.firstQuestionDone) {
            this.logger.log("First question");
            await this.firstQuestion(userInput);
        } else {
            try {
                const result = await this.summarizerChain.invoke({ format_instructions: this.outputParser, userInput: userInput });
                this.logger.log("Result from summarizer", { result });
                this.updateJson(result);
                this.currentQuestion = this.nextQuestions.pop();
                this.addToConversation(this.currentQuestion)
            } catch (error) {
                // Handle errors here
                console.error("An error occurred:", error);
            }
        }
    }

    async addToConversation(aiInput) {
        this.chatConversation.push({ msg: aiInput, position: this.messageKeys.ai });
    }

    async recoverFromError() {
       if(this.json == {}) {
            this.nextQuestions = [] // Start again with first question if no data has been collected
            
       } else {
            this.addToConversation("Sorry something went wrong")
            await this.createQuestionsFromJson()
            this.currentQuestion = this.nextQuestions.pop()
            this.addToConversation(this.currentQuestion)
       }

    }
    
    async firstQuestion(userInput) {
        const response = await this.summarizerChain.invoke({ format_instructions: this.outputParser, userInput: userInput })
        this.updateJson(response)
        await this.createQuestionsFromJson()
        this.logger.log("Poping first question")
        this.currentQuestion = this.nextQuestions.pop()
        this.addToConversation(this.currentQuestion)
        this.firstQuestionDone = true
        this.logger.log("First question done", { chatConversation: this.chatConversation })
    }
    async createQuestionsFromJson() {
        const emptyKeys = getEmptyKeys(this.json)
        if (emptyKeys.length === 0) {
            this.logger.log("No more questions to ask")
            this.done = true
            return
        }
        for (const key of emptyKeys) {
            const question = await this.corretionChain.invoke({ information: key })
            this.nextQuestions.push(question.toString())
            this.logger.log("Question created", { key, question })
        }
        this.logger.log("Questions created", { nextQuestions: this.nextQuestions })
    }
}




export {
    createOpenAI,
    createChatOpenAI,
    JsonAsker,
}