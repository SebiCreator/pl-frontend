import { Logger } from "./Logger";
import { ChatOpenAI, OpenAI } from "@langchain/openai";
import { getEmptyKeys } from "./special";
import { summarizerPrompt, correctorPrompt } from "./prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { LLMChain } from "langchain/chains";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { MessagesPlaceholder } from "@langchain/core/prompts";
import { HumanMessage, AIMessage } from "@langchain/core/messages";




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


class JsonAsker {
    static async withConverstationMemory(firstQuestion, outputParser, messageKeys = { user: "end", ai: "start" }) {
        const embeddings = createEmbeddings()
        const model = createChatOpenAI()
        const jsonAsker = new JsonAsker(firstQuestion, outputParser, messageKeys)
        const vectorstore = await MemoryVectorStore.fromDocuments(
            [],
            embeddings
        );
        const retriever = vectorstore.asRetriever({ k: 2 });
        const retrieverPrompt = ChatPromptTemplate.fromMessages([
            new MessagesPlaceholder("chat_history"),
            ["user", "{input}"],
            [
                "user",
                "Given the above conversation, generate a search query to look up in order to get information relevant to the conversation",
            ],
        ]);

        const retrieverChain = await createHistoryAwareRetriever({
            llm: model,
            retriever,
            rephrasePrompt: retrieverPrompt,
        });


        const chatHistory = [
            new HumanMessage("What does LCEL stand for?"),
            new AIMessage("LangChain Expression Language"),
        ];


        const prompt = ChatPromptTemplate.fromMessages([
            [
                "system",
                "Answer the user's questions based on the following context: {context}.",
            ],
            new MessagesPlaceholder("chat_history"),
            ["user", "{input}"],
        ]);


        const chain = await createStuffDocumentsChain({
            llm: model,
            prompt: prompt,
        });

        const conversationChain = await createRetrievalChain({
            combineDocsChain: chain,
            retriever: retrieverChain,
        });

        jsonAsker.summarizerChain = conversationChain
        return jsonAsker
    }
    constructor(firstQuestion, outputParser, messageKeys = { user: "end", ai: "start" }) {
        const chatModel = createChatOpenAI()
        const llmModel = createOpenAI()
        this.logger = new Logger({ context: "JsonAsker", enabled: true })
        this.outputParser = outputParser
        this.summarizerChain = summarizerPrompt.pipe(llmModel).pipe(outputParser)
        this.corretionChain = correctorPrompt.pipe(chatModel).pipe(new StringOutputParser())
        this.json = {}
        this.nextQuestions = []
        this.chatConversation = [new AIMessage(firstQuestion)]
        this.done = false
        this.firstQuestionDone = false
        this.currentQuestion = firstQuestion
        this.messageKeys = messageKeys
    }




    async updateJson(data) {
        this.json = combineObjects(this.json, data)
    }

    formatMessage(message) {
        if (message instanceof HumanMessage) {
            return { msg: message.content, position: this.messageKeys.user }
        } else if (message instanceof AIMessage) {
            return { msg: message.content, position: this.messageKeys.ai }
        } else {
            throw new Error("Invalid message type")
        }
    }

    getConversationHistory() {
        const r =   this.chatConversation.map(element => this.formatMessage(element))
        console.log({ r, cc: this.chatConversation })
        return r
    }

    async nextQuestion(userInput, { pushBefore }) {
        pushBefore ? this.addUserMsgToConversation(userInput) : null
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
                this.addAIMsgToConversation(this.currentQuestion)
            } catch (error) {
                this.recoverFromError(error)
                return
            }
        }
    }

    async addAIMsgToConversation(aiInput) {
        console.log("Adding AI message", aiInput)
        this.conversationChain.push(AIMessage(aiInput))
    }

    async addUserMsgToConversation(userInput) {
        this.conversationChain.push(HumanMessage(userInput))
    }

    async recoverFromError(error) {
        this.logger.error("Error", { error })
        if (this.json == {}) {
            this.nextQuestions = [] // Start again with first question if no data has been collected

        } else {
            this.addAIMsgToConversation("Sorry something went wrong")
            await this.createQuestionsFromJson()
            this.currentQuestion = this.nextQuestions.pop()
            this.addAIMsgToConversation(this.currentQuestion)
        }

    }

    async firstQuestion(userInput) {
        try {
            const response = await this.summarizerChain.invoke({ format_instructions: this.outputParser, userInput: userInput })
        } catch (error) {
            this.recoverFromError(error)
            return
        }
        this.updateJson(response)
        await this.createQuestionsFromJson()
        this.logger.log("Poping first question")
        this.currentQuestion = this.nextQuestions.pop()
        console.log("Current question", this.currentQuestion)
        this.addAIMsgToConversation(this.currentQuestion)
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

        emptyKeys.forEach(async key => {
            try {
                const question = await this.corretionChain.invoke({ information: key })
                this.nextQuestions.push(question.toString())
                this.logger.log("Question created", { key, question })
            } catch (error) {
                this.recoverFromError(error)
                return
            }
        })
        this.logger.log("Questions created", { nextQuestions: this.nextQuestions })
    }
}




export {
    createOpenAI,
    createChatOpenAI,
    JsonAsker,
}