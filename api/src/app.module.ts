import { Module } from '@nestjs/common';
import { OpenAIService } from './services/openia.service';
import { Mistral7BService } from './services/mistral.service';
import { RagOpenAIController } from './controllers/rag.openai.controller';
import { RagMistralController } from './controllers/rag.mistral.controller';

@Module({
  imports: [],
  controllers: [RagOpenAIController, RagMistralController],
  providers: [OpenAIService, Mistral7BService],
})
export class AppModule {}
