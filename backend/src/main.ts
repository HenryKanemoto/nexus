import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule, ObserveInstrument } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    instrument: ObserveInstrument,
  });
  // Todas as rotas ficam em /api (o frontend chama /api/... via proxy do Angular)
  app.setGlobalPrefix('api');
  // Fotos dos itens chegam em base64 dentro do JSON
  app.useBodyParser('json', { limit: '10mb' });
  await app.listen(process.env.PORT ?? 3001);
}
await bootstrap();
