import { Logger } from "@nestjs/common";
import { ChromaClient, Collection, IEmbeddingFunction } from "chromadb";
import { RagWikiData } from "src/models/rag-wiki-data.model";
import { OllamaEmbeddings } from "langchain/embeddings/ollama";
import { VectorStoreRetriever } from "langchain/dist/vectorstores/base";
import { Chroma } from "langchain/vectorstores/chroma";
import { RetrievalQAChain } from "langchain/chains";
import { ChatOllama } from "@langchain/community/chat_models/ollama";
import { PromptTemplate } from "langchain/prompts";


export class OllamaService {
    private llm: string;

    constructor (llm: string) {
        this.llm = llm;
    }

    /**
     * Embedding Data dans une base chroma db avec Open AI
     * @param chromaDbName le nom de la base de donnée chroma
     * @param ragData les données RAG à vectoriser
     * @param forceDbCreation est-ce qu'on force la création de base ou non (si elle existe déjà elle sera supprimé et recrée)
     */
    async embeddingRagData(chromaDbName: string, ragData: RagWikiData[], forceDbCreation=false): Promise<Collection> {
        const dbName =  `${this.llm}-${chromaDbName}`;
        Logger.log(`ChromaDb path: ${process.env.CHROMADB_PATH}, dbname: ${dbName}`);
        
        // On va se créer notre propre méthode d'embedding basé 
        // sur les modèles pré-entrainé libre de HF
        class MyEmbeddingFunction implements IEmbeddingFunction {
            private embedding: any = null;
    
            constructor(llm: string) {
                // On choisi un model de vectorisation pour l'embedding: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
                // On choisi un modèle qui donne la similitude entre différents textes
                // this.pipe = await pipeline.call("sentence-similarity", "sentence-transformers/all-MiniLM-L6-v2");
                this.embedding = new OllamaEmbeddings({
                    model: llm,
                    baseUrl: process.env.OLLAMA_PATH,
                });
            }
          
            public async generate(texts: string[]): Promise<number[][]> {
                return this.embedding.embedDocuments(texts);
            }
        }
        
        // On crée le client vers la base de données vectorielle
        const client = new ChromaClient({ path: process.env.CHROMADB_PATH });
    
        // On supprime la collection si elle existe déjà pour assurer que l'étape de création fonctionne
        const collections = await client.listCollections()
        const col = collections.find(c => c.name === dbName);
        // if (col && forceDbCreation) {
        //     Logger.log(" > Suppression de la base " + col.name);
        //     await client.deleteCollection({ name: col.name });
        // }
        
        let collection = null;
        if (forceDbCreation || !col)
        {
            // Logger.log(" > Création de la base " + dbName);
            // collection = await client.createCollection({ 
            //     name: dbName,
            //     embeddingFunction: new MyEmbeddingFunction(this.llm)
            // });
            Logger.log(" > Récupération de la base Chroma");
            collection = await client.getCollection({
                name: col.name,
                embeddingFunction: new MyEmbeddingFunction(this.llm)
            })
            // On y ajoute nos données persos
            Logger.log(" > Ajout des donnée à la base Chroma");
            let count = 562;
            // for (const doc of ragData) {
            for (let docIdx=562; docIdx<ragData.length; docIdx+=1) {
                count += 1;
                const doc = ragData[docIdx];
                Logger.log(` > embedding document: ${count}/${ragData.length}`);
                //process.stdout.write(`\rEmbedding document: ${count}/${ragData.length}`);
                await collection.add({
                    ids: doc.name,
                    metadatas: { source: `${doc.name}: ${doc.url}`},
                    documents: doc.text
                });
            }
        } else {
            Logger.log(" > Récupération de la base Chroma");
            collection = await client.getCollection({
                name: col.name,
                embeddingFunction: new MyEmbeddingFunction(this.llm)
            })
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
            new OllamaEmbeddings({ model: this.llm, baseUrl: process.env.OLLAMA_PATH }),
            { collectionName: chromaDb.name, url: process.env.CHROMADB_PATH },
        );
        // Logger.log("\n\n====\n\n", vectorStore.similaritySearch("Abeille", 2), "\n\n")
    
        return vectorStore.asRetriever();
    }

    async getChatBot(retriever: VectorStoreRetriever, prompt: string = null): Promise<RetrievalQAChain> {
        Logger.log("Création du ChatBot")
        Logger.log(" > Récupération du LLM Chat GPT")
        const llm = new ChatOllama({ baseUrl: process.env.CHROMADB_PATH });
    
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