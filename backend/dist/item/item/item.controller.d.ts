import type { ItemRequestDTO } from '../../types/Models.js';
import { ItemService } from './item.service.js';
import { ItemEntity } from './item.entity.js';
export declare class ItemController {
    private readonly itemService;
    constructor(itemService: ItemService);
    verItens(): Promise<ItemEntity[]>;
    adcionarItens(itemRequestDTO: ItemRequestDTO): void;
}
