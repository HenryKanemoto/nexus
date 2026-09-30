import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import {ConfigModule, ConfigService} from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppService } from './app.service.js';
import { UsuarioController } from './usuario/usuario.controller.js';
import { UsuarioService } from './usuario/usuario.service.js';
import { UsuarioService } from './usuario/usuario.service.js';
import { HomeController } from './home/home.controller.js';
import { UsuarioController } from './usuario/usuario.controller.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal: true}),
    TypeOrmModule.forRootAsync({
      inject:[ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get('DB_HOST'),
        port: Number(config.get('DB_PORT')),
        username: config.get('DB_USER'),
        password: config.get('DB_USER'),
        database: config.get('DB_USER'),
        autoLoadEntities:true,
        synchronize:true // ATENÇÂO!!!!!!!!!!!! Só em desenvolvimento, nseipq
      })
    }),
  ],
  controllers: [AppController, UsuarioController, HomeController],
  providers: [AppService, UsuarioService],
})
export class AppModule {}
