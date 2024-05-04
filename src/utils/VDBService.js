import { Pinecone } from "@pinecone-database/pinecone";
import { Document } from "@langchain/core/documents";
import { OpenAIEmbeddings } from "@langchain/openai";
import { createRetrieverTool } from "langchain/tools/retriever";
import { PineconeStore } from "@langchain/pinecone";
import { Logger } from "../utils/Logger.js"

const loggingActive = true



class DocStore {
    static async create(namespace) {
        const logger = new Logger({ context: "DocStore", instance: namespace, enabled: loggingActive});
        const pinecone = new Pinecone({
            apiKey: import.meta.env.VITE_PINECONE_API_KEY,
        });
        const pineconeIndex = pinecone.Index(import.meta.env.VITE_PINECONE_INDEX_TEST);
        const embeddings = new OpenAIEmbeddings({
            apiKey: import.meta.env.VITE_OPENAI_API_KEY,
        });
        const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
            pineconeIndex,
        });
        logger.log("DocStore created", { namespace, vectorStore });
        return new DocStore(vectorStore, namespace, logger);
    }
    constructor(vectorStore, namespace, logger) {
        this.vectorStore = vectorStore;
        this.namespace = namespace;
        this.logger = logger;
    }

    async addDocument(text, metadata = null) {
        const doc = new Document({ pageContent: text, metadata });
        try {
            const ids = await this.vectorStore.addDocuments([doc], {
                namespace: this.namespace,
            });
            this.logger.log("Document added", { text, metadata, ids });
            return ids
        } catch (e) {
            this.logger.error("Error adding document", { text, metadata, e })
            return null
        }
    }
    async addDocuments(documents) {
        documents.forEach((doc) => {
            this.addDocument(doc);
        });
    }

    async queryDocuments({ query, k = 3, filter = null }) {
        return await this.vectorStore.similaritySearch(query, k, filter)
    }

    async deleteDocument(docId) {
        try {
            await this.vectorStore.delete({
                ids: [docId],
            });
            this.logger.log("Document deleted", { docId });
        } catch (e) {
            this.logger.error("Error deleting document", { docId, e })
        }
    }

    async maximumMarginalSearch({ query, k = 3, fk = 20, filter = null }) {
        try {
            const result = await this.vectorStore.maxMarginalRelevanceSearch(query, {
                k,
                fetchK: fk,
                filter
            });
            this.logger.log("Maximum marginal search", { query, k, fk, filter, result });
            return result
        }
        catch (e) {
            this.logger.error("Error in maximum marginal search", { query, k, fk, filter, e });
            return null
        }
    }

    asRetriever() {
        return this.vectorStore.asRetriever();
    }

    asTool({ name, description }) {
        const retrieverTool = createRetrieverTool(this.asRetriever(), {
            name,
            description,
        });
        this.logger.log("Retriever tool created", { name, description, retrieverTool });
        return retrieverTool;
    }

}

export default DocStore;