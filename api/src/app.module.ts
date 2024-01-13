import { Module } from '@nestjs/common';
import { RagController } from './controllers/rag.controller';
import { OpenAIService } from './services/openia.service';

@Module({
  imports: [],
  controllers: [RagController],
  providers: [OpenAIService],
})
export class AppModule {}
