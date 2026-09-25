import { Item } from "../item/item.interface.js";

export interface Usuario {
    nome: string,
    items_emprestados: Item[],
}
