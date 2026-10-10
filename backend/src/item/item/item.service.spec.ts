import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ItemEntity } from './item.entity.js';
import { ItemService } from './item.service.js';

// Repositório em memória com só o que o serviço usa
function repositorioFalso(inicial: Partial<ItemEntity>[] = []) {
    const itens = new Map(inicial.map((i) => [i.id!, { ...i } as ItemEntity]));
    const casa = (item: ItemEntity, filtro: Record<string, unknown>) =>
        Object.entries(filtro).every(([campo, valor]) => {
            // Not(id) do TypeORM vira um FindOperator com _type 'not'
            if (valor && typeof valor === 'object' && (valor as { _type?: string })._type === 'not') {
                return item[campo as keyof ItemEntity] !== (valor as { _value: unknown })._value;
            }
            return item[campo as keyof ItemEntity] === valor;
        });

    return {
        find: async () => [...itens.values()],
        findOneBy: async (filtro: Record<string, unknown>) => [...itens.values()].find((i) => casa(i, filtro)) ?? null,
        existsBy: async (filtro: Record<string, unknown>) => [...itens.values()].some((i) => casa(i, filtro)),
        save: async (item: ItemEntity) => {
            itens.set(item.id, { ...itens.get(item.id), ...item });
            return itens.get(item.id)!;
        },
        delete: async ({ id }: { id: string }) => ({ affected: itens.delete(id) ? 1 : 0 }),
    } as unknown as Repository<ItemEntity>;
}

const base = { nome: 'Projetor', categoriaId: 'cat-projetores', patrimonio: 'nx-0001', codigoQr: 'nx-proj-001' };

describe('ItemService', () => {
    it('cria item com id gerado, códigos em maiúsculas e status disponível', async () => {
        const service = new ItemService(repositorioFalso());
        const item = await service.save(base);
        expect(item.id).toBeTruthy();
        expect(item.patrimonio).toBe('NX-0001');
        expect(item.codigoQr).toBe('NX-PROJ-001');
        expect(item.status).toBe('disponivel');
    });

    it('recusa campos obrigatórios vazios', async () => {
        const service = new ItemService(repositorioFalso());
        await expect(service.save({ ...base, nome: '  ' })).rejects.toBeInstanceOf(BadRequestException);
    });

    it('recusa patrimônio repetido em outro item', async () => {
        const service = new ItemService(repositorioFalso([{ id: 'a', patrimonio: 'NX-0001', codigoQr: 'X' }]));
        await expect(service.save({ ...base, codigoQr: 'NOVO' })).rejects.toBeInstanceOf(ConflictException);
    });

    it('permite atualizar o próprio item mantendo o patrimônio', async () => {
        const service = new ItemService(repositorioFalso([{ id: 'a', ...base, patrimonio: 'NX-0001', codigoQr: 'NX-PROJ-001' }]));
        const item = await service.upsert('a', { ...base, nome: 'Projetor novo' });
        expect(item.nome).toBe('Projetor novo');
    });

    it('recusa status inválido', async () => {
        const service = new ItemService(repositorioFalso([{ id: 'a', ...base }]));
        await expect(service.alterarStatus('a', 'voando' as never)).rejects.toBeInstanceOf(BadRequestException);
    });

    it('avisa quando o item não existe', async () => {
        const service = new ItemService(repositorioFalso());
        await expect(service.findOne('nada')).rejects.toBeInstanceOf(NotFoundException);
        await expect(service.remove('nada')).rejects.toBeInstanceOf(NotFoundException);
    });
});
