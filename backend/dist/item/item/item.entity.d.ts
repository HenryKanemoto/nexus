import { type StatusItem } from "../../types/Models.js";
export declare class ItemEntity {
    id: string;
    categoriaId: string;
    nome: string;
    descricao: string;
    patrimonio: string;
    codigoQr: string;
    foto: string | null;
    status: StatusItem;
    criadoEm: Date;
    atualizadoEm: Date;
}
