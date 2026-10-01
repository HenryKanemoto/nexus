import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ItemEntity } from './item.entity.js';
import { Repository } from 'typeorm';
import { ItemRequestDTO } from '../../types/Models.js';


@Injectable()
export class ItemService {

    constructor(@InjectRepository(ItemEntity) private readonly itemRepository:Repository<ItemEntity>){}

    async findall(): Promise<ItemEntity[]>{
        return await this.itemRepository.find();
    }

    async save(itemRequestDTO:ItemRequestDTO){
        this.itemRepository.insert(itemRequestDTO);
    }

}
