import { Injectable, Logger } from "@nestjs/common";
import { Collection } from "chromadb";
import { RetrievalQAChain } from "langchain/chains";
import { VectorStoreRetriever } from "langchain/dist/vectorstores/base";
import { RagWikiData } from "src/models/rag-wiki-data.model";
import { OllamaService } from "src/tools/ollama-service";


@Injectable()
export class Mistral7BService {

    private ollamaConnecteur: OllamaService;

    constructor() {
        Logger.log("Mistral7BService CONSTRUCTOR")
        this.ollamaConnecteur = new OllamaService("mistral");
    }
    
    async embeddingRagData(chromaDbName: string, ragData: RagWikiData[], forceDbCreation=false): Promise<Collection> {
        return this.ollamaConnecteur.embeddingRagData(chromaDbName, ragData, forceDbCreation);
    }
    async getRetriever(chromaDb: Collection): Promise<VectorStoreRetriever> {
        return this.ollamaConnecteur.getRetriever(chromaDb);
    }
    async getChatBot(retriever: VectorStoreRetriever, prompt: string = null): Promise<RetrievalQAChain> {
        return this.ollamaConnecteur.getChatBot(retriever, prompt);
    }

}
