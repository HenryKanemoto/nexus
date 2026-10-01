var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module } from '@nestjs/common';
import { ItemController } from './item.controller.js';
import { ItemService } from './item.service.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemEntity } from './item.entity.js';
let ItemModule = class ItemModule {
};
ItemModule = __decorate([
    Module({
        imports: [
            TypeOrmModule.forFeature([ItemEntity])
        ],
        controllers: [ItemController],
        providers: [ItemService],
        exports: [ItemService]
    })
], ItemModule);
export { ItemModule };
//# sourceMappingURL=item.module.js.map