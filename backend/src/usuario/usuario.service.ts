import { Injectable } from '@nestjs/common';
import { Usuario } from '../types/usuario/usuario.interface.js';

@Injectable()
export class UsuarioService {

    private readonly usuarios: Usuario[] = [
        {
            "nome": "joao",
            "items_emprestados": [{
                "nome": "PC",
                "tipo": "Computador",
                "emprestado": true,
                "dataEmprestado": "01/01/2026"
            }]
        },
    ];

    findAll() {
        return this.usuarios;
    }

}
