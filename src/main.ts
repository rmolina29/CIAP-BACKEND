import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';

async function bootstrap() {
  dotenv.config();
  const server = express();
  const app = await NestFactory.create(AppModule,new ExpressAdapter(server));
  await app.listen(3000);

  app.use(express.json());
}
bootstrap();
