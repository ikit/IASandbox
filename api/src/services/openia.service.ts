import { Injectable, Logger } from "@nestjs/common";
import { ChromaClient, Collection, OpenAIEmbeddingFunction } from "chromadb";
import { formatDuration, intervalToDuration } from "date-fns";
import { RetrievalQAChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { VectorStoreRetriever } from "langchain/dist/vectorstores/base";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PromptTemplate } from "langchain/prompts";
import { Chroma } from "langchain/vectorstores/chroma";
import { RagWikiData } from "src/models/rag-wiki-data.model";

@Injectable()
export class OpenAIService {

    /**
     * Embedding Data dans une base chroma db avec Open AI
     * @param chromaDbName le nom de la base de donnée chroma
     * @param ragData les données RAG à vectoriser
     * @param forceDbCreation est-ce qu'on force la création de base ou non (si elle existe déjà elle sera supprimé et recrée)
     */
    async embeddingRagData(chromaDbName: string, ragData: RagWikiData[], forceDbCreation=false): Promise<Collection> {
        const dbName = `OpenAI-${chromaDbName}`;
        Logger.log(`ChromaDb path: ${process.env.CHROMADB_PATH}, dbname: ${dbName}`);
        
        // On crée le client vers la base de données vectorielle
        const client = new ChromaClient({ path: process.env.CHROMADB_PATH });
        const embeddingFunction = new OpenAIEmbeddingFunction({ openai_api_key: process.env.OAIK });
    
        // On supprime la collection si elle existe déjà pour assurer que l'étape de création fonctionne
        const collections = await client.listCollections()
        const col = collections.find(c => c.name === dbName);
        if (col && forceDbCreation) {
            Logger.log(" > Suppression de la base " + col.name);
            await client.deleteCollection({ name: col.name });
        }
        
        let collection = null;
        if (forceDbCreation || !col)
        {
            Logger.log(" > Création de la base " + dbName);
            collection = await client.createCollection({ 
                name: dbName,
                embeddingFunction
            });
            // On y ajoute nos données persos
            Logger.log(` > Ajout des ${ragData.length} documents à la base Chroma`);
            const start = new Date().getTime();
            await collection.add({
                ids: ragData.map(d => d.name),
                metadatas: ragData.map(d => ({ source: `${d.name}: ${d.url}`})),
                documents: ragData.map(d => d.text)
            });
            const duration = intervalToDuration({ start: 0, end: new Date().getTime() - start });
            Logger.log(` > Durée de l'embedding: ${formatDuration(duration, {
                format: duration.minutes ? ["minutes", "seconds"] : ["seconds"],
                zero: true,
                delimiter: ", "
            })}`)
        } else {
            Logger.log(" > Récupération de la base Chroma");
            collection = await client.getCollection({
                name: col.name,
                embeddingFunction
            });
        };
    
        return collection;
    }

    /**
     * Fournis le "retriever" qui permet de requêter la base vectoriel OpenAI 
     * où on été vectorisé les données
     * @param chromaDb la base vectoriel chromaDB
     */
    async getRetriever(chromaDb: Collection): Promise<VectorStoreRetriever> {
        Logger.log("chromaDb requêtage base vectoriel")
    
        Logger.log(" > Retriever d'OpenIA");
        const vectorStore = await Chroma.fromExistingCollection(
            new OpenAIEmbeddings({ openAIApiKey: process.env.OAIK }),
            { collectionName: chromaDb.name, url: process.env.CHROMADB_PATH },
        );
        // Logger.log("\n\n====\n\n", vectorStore.similaritySearch("Abeille", 2), "\n\n")
    
        return vectorStore.asRetriever();
    }

    async getChatBot(retriever: VectorStoreRetriever, prompt: string = null): Promise<RetrievalQAChain> {
        Logger.log("Création du ChatBot")
        Logger.log(" > Récupération du LLM Chat GPT")
        const llm = new ChatOpenAI({ openAIApiKey: process.env.OAIK });
    
        // On crée le template du prompt chatBot pour conditionner l'IA et lui donner le context "data" pour répondre les questions de l'utilisateur
        Logger.log(" > Création du prompt");
        let iaPrompt = prompt ? prompt : `Tu es un assitant qui répond toujours en français et qui peut répondre aux questions sur l'encyclopédie de Zelda. 
        Utilise seulement le contexte pour répondre. Si tu ne trouve pas la réponse dans le contexte, répond que l'information ne se trouve pas dans l'Encyclopédie Zelda.`
        const template = `${iaPrompt}
        Contexte : {context}
        Question : {question}`;
    
        // On utlise langchain pour "brancher le LLM (chatBot) avec notre base de donnée vectorisée"
        Logger.log(" > Requetage de la base vectorielle via le LLM");
        return RetrievalQAChain.fromLLM(llm, retriever, {
            prompt: PromptTemplate.fromTemplate(template),
            returnSourceDocuments: true,
        });
    }
}
