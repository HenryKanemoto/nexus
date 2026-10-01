import { Injectable } from '@nestjs/common';
import { Usuario } from '../types/Models.js';
@Injectable()
export class UsuarioService {

    private readonly usuarios: Usuario[] = [
        {
            "nome": "joao",
            "items_emprestados": [{
                "id":12,
                "nome": "PC",
                "tipo": "Computador",
                "emprestado": true,
                "dataEmprestado": new Date("2026-01-01")
            }]
        },
    ];

    findAll() {
        return this.usuarios;
    }

}
