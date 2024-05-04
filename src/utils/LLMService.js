import { Logger } from "./Logger";
import { ChatOpenAI, OpenAI } from "@langchain/openai";
import { getEmptyKeys, combineObjects } from "./special";
import { summarizerPrompt, summarizerPromptV2, correctorPrompt } from "./prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { MessagesPlaceholder } from "@langchain/core/prompts";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { z } from "zod";

const zodSchema = `
z.object({
    email: z.string().describe("Email of the user").default(""),
    name: z.string().describe("Name of the user").default(""),
    age: z.number().describe("Age of the user").default(-1),
    motivationForUsingTheApp: z.string().describe("Motivation of the user").default(""),
    occupation: z.string().describe("Occupation of the user").default(""),
    sex: z.string().describe("Sex of the user").default(""),
    language: z.string().describe("Language of the user").default(""),
})
`



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
        this.summarizerChain = summarizerPromptV2.pipe(llmModel).pipe(outputParser)
        this.corretionChain = correctorPrompt.pipe(chatModel).pipe(new StringOutputParser())
        this.json = {}
        this.nextQuestions = []
        this.keyQuestions = []
        this.chatConversation = [new AIMessage(firstQuestion)]
        this.done = false
        this.firstQuestionDone = false
        this.currentQuestion = firstQuestion
        this.messageKeys = messageKeys
    }




    async updateJson(data) {
        this.logger.log("Update json", { data, json: this.json })
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
        return this.chatConversation.map(element => this.formatMessage(element))
    }

    async nextQuestion(userInput, { pushBefore }) {
        pushBefore ? null : this.addUserMsgToConversation(userInput)
        this.logger.log("User input", { userInput, chatConversation: this.chatConversation });

        if (this.nextQuestions.length === 0 && !this.firstQuestionDone) {
            this.logger.log("First question");
            await this.firstQuestion(userInput);
        } else {
            try {
                const result = await this.summarizerChain.invoke({ format_instructions: this.outputParser, userInput: userInput, json_zod_schema: zodSchema });
                this.logger.log("Result from summarizer", { result });
                this.updateJson(result)
                this.currentQuestion = this.nextQuestions.pop();
                if (this.currentQuestion === undefined) {
                    this.addAIMsgToConversation("No more questions to ask")
                    this.done = true
                    return
                }
                console.log("currentQuestion", this.currentQuestion)
                this.addAIMsgToConversation(this.currentQuestion)
            } catch (error) {
                this.recoverFromError(error)
                return
            }
        }
    }

    async addAIMsgToConversation(aiInput) {
        this.logger.log("AI input to history", { aiInput })
        this.chatConversation.push(new AIMessage(aiInput))
    }

    async addUserMsgToConversation(userInput) {
        this.logger.log("User input to history", { userInput })
        this.chatConversation.push(new HumanMessage(userInput))
    }

    async recoverFromError(error) {
        this.logger.error("Error", { error, state: this.json })
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
            const response = await this.summarizerChain.invoke({ format_instructions: this.outputParser.getFormatInstructions(), userInput: userInput, json_zod_schema: zodSchema })
            this.json = response
        } catch (error) {
            this.recoverFromError(error)
            return
        }
        await this.createQuestionsFromJson()
        this.currentQuestion = this.nextQuestions.pop()
        this.addAIMsgToConversation(this.currentQuestion)
        this.firstQuestionDone = true
        this.logger.log("First question done", { chatConversation: this.chatConversation })
    }

    getJson() {
        return this.json
    }

    findKeyFromQuestions = (question) => {
        const keyQuestion = this.keyQuestions.find(element => element.question === question)
        return keyQuestion.key
    }


    async createQuestionsFromJson() {
        const emptyKeys = getEmptyKeys(this.json);
        if (emptyKeys.length === 0) {
            this.logger.log("No more questions to ask");
            this.addAIMsgToConversation("No more questions to ask")
            this.done = true;
            return;
        }

        const promises = emptyKeys.map(async key => {
            try {
                const question = await this.corretionChain.invoke({ information: key });
                this.nextQuestions.push(question.toString());
                this.keyQuestions.push({ key, question });
                this.logger.log("Question created", { key, question });
                return question;
            } catch (error) {
                this.recoverFromError(error);
                return null;
            }
        });

        console.log("promises", promises);
        await Promise.all(promises);
        this.logger.log("Questions created", { nextQuestions: this.nextQuestions });
    }

}




export {
    createOpenAI,
    createChatOpenAI,
    JsonAsker,
}