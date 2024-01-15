import { Body, Controller, Get, Logger, Post } from '@nestjs/common';
import { OpenAIService } from 'src/services/openia.service';
import * as fs from "fs";
import * as path from "path";
import { encycloToCsv, getEncycloFromCsv, getZeldaEncyclopedia } from 'src/tools/rag-embedding-pzelda';
import { formatDuration, intervalToDuration } from 'date-fns';
import { RagWikiData } from 'src/models/rag-wiki-data.model';

@Controller("/api/rag/openai")
export class RagOpenAIController {
  constructor(private readonly openaiService: OpenAIService) {}

  @Get("/init-pzelda")
  async initOpenAIpzelda() {
    // Si le csv pZelda est là, on l'utilise, sinon on le construit à partir du site en ligne
    const pZeldaFile = path.join(process.env.FILES_PATH, "pzelda.csv");
    let ragData: RagWikiData[] = [];
    if (fs.existsSync(pZeldaFile)) {
      Logger.log("Récupération de l'extraction CSV de l'encyclopédie pzelda");
      ragData = getEncycloFromCsv(pZeldaFile);
      Logger.log(`${ragData.length} articles récupérés`);
    } else {
      Logger.log("Construction de l'encyclopédie pzelda");
      ragData = await getZeldaEncyclopedia();
      encycloToCsv(ragData, pZeldaFile);
    }
    
    Logger.log("Création de la base de donnée vectorielle ChromaDB");
    const chromaDb = await this.openaiService.embeddingRagData("pzelda", ragData, true);

    return `Base ChromaDB 'pzelda' créée (${await chromaDb.count()} entrées)`;
  }

  @Post("/chat-pzelda")
  async askOpenAiZeldaChat(@Body() body: { question: string, prompt: string }) {
    Logger.log("askOpenAiZeldaChat: " + body.question);

    // 1: get chroma DB
    const pZeldaFile = path.join(process.env.FILES_PATH, "pzelda.csv");
    if (!fs.existsSync(pZeldaFile)) {
      throw new Error("La base 'pzelda' n'a pas été initialisée.")
    }
    const ragData = getEncycloFromCsv(pZeldaFile);
    const chromaDb = await this.openaiService.embeddingRagData("pzelda", ragData);

    // 2: get retriever
    const pzeldaRetriever = await this.openaiService.getRetriever(chromaDb);

    // 3: init chat bot, prompt and context
    const pzeldaChat = await this.openaiService.getChatBot(pzeldaRetriever, body.prompt);


    // 4: ask chat
    const start = new Date().getTime();
    const res = await pzeldaChat.call({ query: body.question });
    const duration = intervalToDuration({ start: 0, end: new Date().getTime() - start });
    Logger.log(`Traitement: ${formatDuration(duration)}`)

    const result = {
      answer: res.text,
      sources: res.sourceDocuments.map(s => s.metadata.source)
    };
    Logger.log(result)
    return result;
  }
}
