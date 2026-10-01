import { ItemEntity } from './item.entity.js';
import { Repository } from 'typeorm';
import { ItemRequestDTO } from '../../types/Models.js';
export declare class ItemService {
    private readonly itemRepository;
    constructor(itemRepository: Repository<ItemEntity>);
    findall(): Promise<ItemEntity[]>;
    save(itemRequestDTO: ItemRequestDTO): Promise<void>;
}
