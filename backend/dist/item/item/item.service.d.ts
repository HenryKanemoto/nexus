import { ItemEntity } from './item.entity.js';
import { Repository } from 'typeorm';
import { ItemRequestDTO, StatusItem } from '../../types/Models.js';
export declare class ItemService {
    private readonly itemRepository;
    constructor(itemRepository: Repository<ItemEntity>);
    findall(): Promise<ItemEntity[]>;
    findOne(id: string): Promise<ItemEntity>;
    save(itemRequestDTO: ItemRequestDTO): Promise<ItemEntity>;
    upsert(id: string, itemRequestDTO: ItemRequestDTO): Promise<ItemEntity>;
    alterarStatus(id: string, status: StatusItem): Promise<ItemEntity>;
    remove(id: string): Promise<void>;
    private gravar;
    private validarStatus;
}
