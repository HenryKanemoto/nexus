import { Injectable } from '@nestjs/common';
import { Usuario } from '../types/Models.js';
@Injectable()
export class UsuarioService {

    private readonly usuarios: Usuario[] = [
        {
            "nome": "joao",
            "items_emprestados": [{
                "id": "item-03",
                "categoriaId": "cat-notebooks",
                "nome": "Notebook Dell Latitude 3420 #1",
                "descricao": "Intel Core i5 11ª Gen, 16GB RAM, SSD 256GB, tela 14\".",
                "patrimonio": "NX-0003",
                "codigoQr": "NX-NOTE-001",
                "status": "emprestado"
            }]
        },
    ];

    findAll() {
        return this.usuarios;
    }

}
