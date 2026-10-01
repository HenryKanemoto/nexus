import { Body, Controller, Get, Post } from '@nestjs/common';
import type {ItemRequestDTO } from '../../types/Models.js';
import { ItemService } from './item.service.js';
import { ItemEntity } from './item.entity.js';

@Controller('item')
export class ItemController {

    constructor (private readonly itemService:ItemService){}

  @Get()
  verItens(): Promise<ItemEntity[]> {
    return this.itemService.findall();
  }

  @Post()
  adcionarItens(@Body() itemRequestDTO:ItemRequestDTO){
    this.itemService.save(itemRequestDTO);
  }

}
