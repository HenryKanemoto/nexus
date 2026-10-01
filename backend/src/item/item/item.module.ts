import { Module } from '@nestjs/common';
import { ItemController } from './item.controller.js';
import { ItemService } from './item.service.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemEntity } from './item.entity.js';

@Module({
    imports:[
        TypeOrmModule.forFeature([ItemEntity])
    ],
    controllers:[ItemController],
    providers:[ItemService],
    exports:[ItemService]
})
export class ItemModule {

}
