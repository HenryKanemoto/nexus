import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Put } from '@nestjs/common';
import type { ItemRequestDTO, StatusItem } from '../../types/Models.js';
import { ItemService } from './item.service.js';
import { ItemEntity } from './item.entity.js';

@Controller('item')
export class ItemController {

    constructor (private readonly itemService:ItemService){}

  @Get()
  verItens(): Promise<ItemEntity[]> {
    return this.itemService.findall();
  }

  @Get(':id')
  verItem(@Param('id') id:string): Promise<ItemEntity> {
    return this.itemService.findOne(id);
  }

  @Post()
  adcionarItens(@Body() itemRequestDTO:ItemRequestDTO): Promise<ItemEntity> {
    return this.itemService.save(itemRequestDTO);
  }

  @Put(':id')
  salvarItem(@Param('id') id:string, @Body() itemRequestDTO:ItemRequestDTO): Promise<ItemEntity> {
    return this.itemService.upsert(id, itemRequestDTO);
  }

  @Patch(':id/status')
  alterarStatus(@Param('id') id:string, @Body('status') status:StatusItem): Promise<ItemEntity> {
    return this.itemService.alterarStatus(id, status);
  }

  @Delete(':id')
  @HttpCode(204)
  removerItem(@Param('id') id:string): Promise<void> {
    return this.itemService.remove(id);
  }

}
