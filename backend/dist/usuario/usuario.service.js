var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Injectable } from '@nestjs/common';
let UsuarioService = class UsuarioService {
    usuarios = [
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
};
UsuarioService = __decorate([
    Injectable()
], UsuarioService);
export { UsuarioService };
//# sourceMappingURL=usuario.service.js.map