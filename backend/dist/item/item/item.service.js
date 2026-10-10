var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ItemEntity } from './item.entity.js';
import { Not, Repository } from 'typeorm';
import { randomUUID } from 'node:crypto';
import { STATUS_ITEM } from '../../types/Models.js';
let ItemService = class ItemService {
    itemRepository;
    constructor(itemRepository) {
        this.itemRepository = itemRepository;
    }
    async findall() {
        return await this.itemRepository.find({ order: { patrimonio: 'ASC' } });
    }
    async findOne(id) {
        const item = await this.itemRepository.findOneBy({ id });
        if (!item) {
            throw new NotFoundException(`Item ${id} não encontrado.`);
        }
        return item;
    }
    async save(itemRequestDTO) {
        const id = itemRequestDTO.id?.trim() || randomUUID();
        if (await this.itemRepository.existsBy({ id })) {
            throw new ConflictException(`Já existe um item com o id ${id}.`);
        }
        return this.gravar(id, itemRequestDTO);
    }
    async upsert(id, itemRequestDTO) {
        return this.gravar(id, itemRequestDTO);
    }
    async alterarStatus(id, status) {
        this.validarStatus(status);
        const item = await this.findOne(id);
        item.status = status;
        return this.itemRepository.save(item);
    }
    async remove(id) {
        const resultado = await this.itemRepository.delete({ id });
        if (!resultado.affected) {
            throw new NotFoundException(`Item ${id} não encontrado.`);
        }
    }
    async gravar(id, dto) {
        const nome = dto.nome?.trim();
        const categoriaId = dto.categoriaId?.trim();
        const patrimonio = dto.patrimonio?.trim().toUpperCase();
        const codigoQr = dto.codigoQr?.trim().toUpperCase();
        if (!nome || !categoriaId || !patrimonio || !codigoQr) {
            throw new BadRequestException('Os campos nome, categoriaId, patrimonio e codigoQr são obrigatórios.');
        }
        const status = dto.status ?? 'disponivel';
        this.validarStatus(status);
        if (await this.itemRepository.existsBy({ patrimonio, id: Not(id) })) {
            throw new ConflictException(`O patrimônio ${patrimonio} já está cadastrado.`);
        }
        if (await this.itemRepository.existsBy({ codigoQr, id: Not(id) })) {
            throw new ConflictException(`O código QR ${codigoQr} já está cadastrado.`);
        }
        return this.itemRepository.save({
            id,
            nome,
            categoriaId,
            patrimonio,
            codigoQr,
            descricao: dto.descricao?.trim() ?? '',
            foto: dto.foto ?? null,
            status,
        });
    }
    validarStatus(status) {
        if (!STATUS_ITEM.includes(status)) {
            throw new BadRequestException(`Status inválido: ${status}. Use: ${STATUS_ITEM.join(', ')}.`);
        }
    }
};
ItemService = __decorate([
    Injectable(),
    __param(0, InjectRepository(ItemEntity)),
    __metadata("design:paramtypes", [Repository])
], ItemService);
export { ItemService };
//# sourceMappingURL=item.service.js.map