import {addDays, parseDate} from '../lib/date-utils';
import {getInitialDemoState} from './demo-data';
import {executarRotinaAutomatica} from './regras/rotina';

describe('seed de demonstração', () => {
  const seed = getInitialDemoState();
  const depoisDaRotina = executarRotinaAutomatica(seed, parseDate(seed.agora));

  it('já está coerente com as regras: a rotina ao carregar não muda itens, pedidos nem contas', () => {
    expect(depoisDaRotina.itens).toEqual(seed.itens);
    expect(depoisDaRotina.solicitacoes).toEqual(seed.solicitacoes);
    expect(depoisDaRotina.usuarios).toEqual(seed.usuarios);
    expect(depoisDaRotina.emprestimos).toEqual(seed.emprestimos);
  });

  it('a rotina gera os avisos de atraso e de prazo próximo', () => {
    const novos = depoisDaRotina.notificacoes.slice(0, depoisDaRotina.notificacoes.length - seed.notificacoes.length);
    expect(novos.map((n) => `${n.usuarioId}:${n.tipo}`).sort()).toEqual([
      'user-bruno:atraso',
      'user-camila:prazo_proximo',
      'user-enzo:atraso',
    ]);
  });

  it('tem uma situação de cada tipo para nenhuma tela ficar vazia', () => {
    expect(new Set(seed.usuarios.map((u) => u.perfil))).toEqual(new Set(['aluno', 'professor', 'responsavel']));
    expect(new Set(seed.usuarios.map((u) => u.status))).toEqual(new Set(['ativa', 'bloqueada', 'suspensa', 'pendente']));
    expect(new Set(seed.itens.map((i) => i.status))).toEqual(
      new Set(['disponivel', 'solicitado', 'reservado', 'emprestado', 'atrasado', 'manutencao']),
    );
    expect(new Set(seed.solicitacoes.map((s) => s.status))).toEqual(
      new Set(['pendente', 'aprovada', 'recusada', 'expirada', 'concluida']),
    );
    expect(seed.ocorrencias.some((o) => o.status === 'aberta')).toBe(true);
    expect(seed.emprestimos.some((e) => e.devolvidoEm)).toBe(true);
  });

  it('cada item fora do catálogo tem o pedido ou empréstimo correspondente', () => {
    const ativo = (itemId: string) => seed.emprestimos.find((e) => e.itemId === itemId && !e.devolvidoEm);
    const pedido = (itemId: string, status: string) =>
      seed.solicitacoes.find((s) => s.itemId === itemId && s.status === status);

    for (const item of seed.itens) {
      if (item.status === 'solicitado') expect(pedido(item.id, 'pendente'), item.id).toBeTruthy();
      if (item.status === 'reservado') expect(pedido(item.id, 'aprovada'), item.id).toBeTruthy();
      if (item.status === 'emprestado' || item.status === 'atrasado') expect(ativo(item.id), item.id).toBeTruthy();
      if (item.status === 'manutencao') expect(seed.ocorrencias.find((o) => o.itemId === item.id), item.id).toBeTruthy();
    }
  });

  it('RN02: toda data de devolução respeita o prazo da categoria a partir do pedido', () => {
    for (const s of seed.solicitacoes) {
      const item = seed.itens.find((i) => i.id === s.itemId)!;
      const categoria = seed.categorias.find((c) => c.id === item.categoriaId)!;
      const limite = addDays(parseDate(s.criadoEm), categoria.prazoMaxDias);
      limite.setHours(23, 59, 59);
      expect(parseDate(s.devolucaoDesejada).getTime(), s.id).toBeLessThanOrEqual(limite.getTime());
    }
  });

  it('usa só dados fictícios do domínio da escola', () => {
    expect(seed.usuarios.every((u) => u.email.endsWith('@escola.edu.br'))).toBe(true);
  });

  it('todo pedido aprovado já tem código de retirada', () => {
    const aprovados = seed.solicitacoes.filter((s) => s.status === 'aprovada');
    expect(aprovados.length).toBeGreaterThan(0);
    expect(aprovados.every((s) => /^[A-Z2-9]{6}$/.test(s.codigoRetirada ?? ''))).toBe(true);
  });
});
