export declare const STATUS_ITEM: readonly ["disponivel", "solicitado", "reservado", "emprestado", "atrasado", "manutencao"];
export type StatusItem = typeof STATUS_ITEM[number];
export interface Item {
    id: string;
    categoriaId: string;
    nome: string;
    descricao: string;
    patrimonio: string;
    codigoQr: string;
    foto?: string | null;
    status: StatusItem;
}
export interface ItemRequestDTO {
    id?: string;
    categoriaId: string;
    nome: string;
    descricao?: string;
    patrimonio: string;
    codigoQr: string;
    foto?: string | null;
    status?: StatusItem;
}
export interface Usuario {
    nome: string;
    items_emprestados: Item[];
}
