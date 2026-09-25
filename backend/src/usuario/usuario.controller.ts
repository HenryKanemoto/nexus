import { Body, Controller, Get } from '@nestjs/common';
import { UsuarioService } from './usuario.service.js';

@Controller('usuario')
export class UsuarioController {

    constructor(usuarioService: UsuarioService) {}

    @Get
    

}
