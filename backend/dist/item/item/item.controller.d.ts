import type { ItemRequestDTO, StatusItem } from '../../types/Models.js';
import { ItemService } from './item.service.js';
import { ItemEntity } from './item.entity.js';
export declare class ItemController {
    private readonly itemService;
    constructor(itemService: ItemService);
    verItens(): Promise<ItemEntity[]>;
    verItem(id: string): Promise<ItemEntity>;
    adcionarItens(itemRequestDTO: ItemRequestDTO): Promise<ItemEntity>;
    salvarItem(id: string, itemRequestDTO: ItemRequestDTO): Promise<ItemEntity>;
    alterarStatus(id: string, status: StatusItem): Promise<ItemEntity>;
    removerItem(id: string): Promise<void>;
}
