export interface Item {
    id: number;
    nome: string;
    tipo: string;
    emprestado: boolean;
    dataEmprestado: Date;
}
export interface ItemRequestDTO {
    nome: string;
    tipo: string;
}
export interface Usuario {
    nome: string;
    items_emprestados: Item[];
}
