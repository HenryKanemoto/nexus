import { NestFactory } from '@nestjs/core';
import { AppModule, ObserveInstrument } from './app.module.js';
async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        instrument: ObserveInstrument,
    });
    app.setGlobalPrefix('api');
    app.useBodyParser('json', { limit: '10mb' });
    await app.listen(process.env.PORT ?? 3001);
}
await bootstrap();
//# sourceMappingURL=main.js.map