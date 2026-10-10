var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { STATUS_ITEM } from "../../types/Models.js";
let ItemEntity = class ItemEntity {
    id;
    categoriaId;
    nome;
    descricao;
    patrimonio;
    codigoQr;
    foto;
    status;
    criadoEm;
    atualizadoEm;
};
__decorate([
    PrimaryColumn({ length: 64 }),
    __metadata("design:type", String)
], ItemEntity.prototype, "id", void 0);
__decorate([
    Column({ length: 64 }),
    __metadata("design:type", String)
], ItemEntity.prototype, "categoriaId", void 0);
__decorate([
    Column({ length: 120 }),
    __metadata("design:type", String)
], ItemEntity.prototype, "nome", void 0);
__decorate([
    Column({ type: 'text' }),
    __metadata("design:type", String)
], ItemEntity.prototype, "descricao", void 0);
__decorate([
    Column({ length: 40, unique: true }),
    __metadata("design:type", String)
], ItemEntity.prototype, "patrimonio", void 0);
__decorate([
    Column({ length: 60, unique: true }),
    __metadata("design:type", String)
], ItemEntity.prototype, "codigoQr", void 0);
__decorate([
    Column({ type: 'longtext', nullable: true }),
    __metadata("design:type", Object)
], ItemEntity.prototype, "foto", void 0);
__decorate([
    Column({
        type: 'enum',
        enum: STATUS_ITEM,
        default: 'disponivel'
    }),
    __metadata("design:type", String)
], ItemEntity.prototype, "status", void 0);
__decorate([
    CreateDateColumn(),
    __metadata("design:type", Date)
], ItemEntity.prototype, "criadoEm", void 0);
__decorate([
    UpdateDateColumn(),
    __metadata("design:type", Date)
], ItemEntity.prototype, "atualizadoEm", void 0);
ItemEntity = __decorate([
    Entity('itens')
], ItemEntity);
export { ItemEntity };
//# sourceMappingURL=item.entity.js.map