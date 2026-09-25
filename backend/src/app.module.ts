import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { UsuarioController } from './usuario/usuario.controller.js';
import { UsuarioService } from './usuario/usuario.service.js';
import { UsuarioService } from './usuario/usuario.service.js';
import { HomeController } from './home/home.controller.js';
import { UsuarioController } from './usuario/usuario.controller.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    // Distributed tracing, auto-correlated logs, request/job metrics, error
    // telemetry, alarms, and more — out of the box. Sign up at https://observe.nestjs.com
    ObserveModule.forRoot({
      appKey: 'YOUR_APP_KEY',
      appSecret: 'YOUR_APP_SECRET',
      serviceId: 'backend',
    }),
  ],
  controllers: [AppController, UsuarioController, HomeController],
  providers: [AppService, UsuarioService],
})
export class AppModule {}
