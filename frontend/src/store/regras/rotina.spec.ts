import {PoliticaAtraso} from '../../types/models';
import {NexusState} from '../estado';
import {buscar, em, emprestimo, estadoDeTeste, solicitacao, usuario} from './estado-de-teste';
import {executarRotinaAutomatica} from './rotina';

function rodarEm(s: NexusState, iso: string): NexusState {
  return executarRotinaAutomatica({...s, agora: iso}, new Date(iso));
}

function comEmprestimo(politica: PoliticaAtraso, devolucaoPrevista = '2026-10-15'): NexusState {
  const s = estadoDeTeste({
    configuracao: {politicaAtraso: politica},
    emprestimos: [emprestimo('e', 'a1', {devolucaoPrevista})],
  });
  s.itens[0] = {...s.itens[0], status: 'emprestado'};
  return s;
}

describe('rotina automática', () => {
  describe('RN04: pedido aprovado e não retirado', () => {
    function comAprovado(): NexusState {
      const s = estadoDeTeste({
        solicitacoes: [solicitacao('p', 'a1', {status: 'aprovada', avaliadoEm: em(2026, 10, 15, 9, 0)})],
      });
      s.itens[0] = {...s.itens[0], status: 'reservado'};
      return s;
    }

    it('continua válido até o fim do dia da aprovação', () => {
      const s = rodarEm(comAprovado(), em(2026, 10, 15, 23, 59));
      expect(buscar.solicitacao(s, 'p').status).toBe('aprovada');
      expect(buscar.item(s, 'a1').status).toBe('reservado');
    });

    it('expira depois da meia-noite e o item volta ao catálogo', () => {
      const s = rodarEm(comAprovado(), em(2026, 10, 16, 0, 0));
      expect(buscar.solicitacao(s, 'p').status).toBe('expirada');
      expect(buscar.item(s, 'a1').status).toBe('disponivel');
      expect(s.notificacoes[0]).toMatchObject({usuarioId: 'aluna', tipo: 'expiracao'});
    });
  });

  it('RN10: pedido pendente nunca expira', () => {
    const s = estadoDeTeste({solicitacoes: [solicitacao('p', 'a1', {criadoEm: em(2026, 10, 1, 8, 0)})]});
    expect(buscar.solicitacao(rodarEm(s, em(2026, 10, 30, 8, 0)), 'p').status).toBe('pendente');
  });

  describe('RN06: atraso', () => {
    it('não marca atraso no dia previsto', () => {
      const s = rodarEm(comEmprestimo('rigida'), em(2026, 10, 15, 23, 0));
      expect(buscar.emprestimo(s, 'e').diasAtraso).toBe(0);
      expect(buscar.item(s, 'a1').status).toBe('emprestado');
    });

    it.each([
      ['simples', 'ativa'],
      ['intermediaria', 'bloqueada'],
      ['rigida', 'bloqueada'],
    ] as const)('política %s: marca atraso e a conta fica %s', (politica, statusConta) => {
      const s = rodarEm(comEmprestimo(politica), em(2026, 10, 17, 9, 0));
      expect(buscar.emprestimo(s, 'e').diasAtraso).toBe(2);
      expect(buscar.item(s, 'a1').status).toBe('atrasado');
      expect(buscar.usuario(s, 'aluna').status).toBe(statusConta);
    });

    it('avisa a pessoa e o responsável uma única vez, mesmo rodando de novo', () => {
      const uma = rodarEm(comEmprestimo('rigida'), em(2026, 10, 16, 9, 0));
      const duas = rodarEm(uma, em(2026, 10, 17, 9, 0));
      const atrasos = duas.notificacoes.filter((n) => n.tipo === 'atraso');
      expect(atrasos.map((n) => n.usuarioId).sort()).toEqual(['aluna', 'resp']);
    });

    it('não bloqueia conta suspensa ou pendente, só a ativa', () => {
      const s = comEmprestimo('rigida');
      s.usuarios = [usuario('resp', {perfil: 'responsavel'}), usuario('aluna', {status: 'suspensa', suspensoAte: em(2026, 10, 30)})];
      expect(buscar.usuario(rodarEm(s, em(2026, 10, 17, 9, 0)), 'aluna').status).toBe('suspensa');
    });
  });

  it('avisa sobre o prazo no dia anterior ao vencimento, uma vez', () => {
    const s = comEmprestimo('rigida', '2026-10-16');
    expect(rodarEm(s, em(2026, 10, 14, 23, 0)).notificacoes).toHaveLength(0);

    const uma = rodarEm(s, em(2026, 10, 15, 8, 0));
    const duas = rodarEm(uma, em(2026, 10, 15, 20, 0));
    expect(duas.notificacoes.filter((n) => n.tipo === 'prazo_proximo')).toHaveLength(1);
  });

  it('encerra a suspensão quando a data chega', () => {
    const s = estadoDeTeste({
      usuarios: [usuario('resp', {perfil: 'responsavel'}), usuario('aluna', {status: 'suspensa', suspensoAte: em(2026, 10, 17, 10, 0)})],
    });
    expect(buscar.usuario(rodarEm(s, em(2026, 10, 17, 9, 59)), 'aluna').status).toBe('suspensa');

    const depois = rodarEm(s, em(2026, 10, 17, 10, 0));
    expect(buscar.usuario(depois, 'aluna')).toMatchObject({status: 'ativa', suspensoAte: undefined});
    expect(depois.notificacoes[0].usuarioId).toBe('aluna');
  });

  it('é idempotente: rodar duas vezes no mesmo instante não muda nada', () => {
    const uma = rodarEm(comEmprestimo('rigida'), em(2026, 10, 17, 9, 0));
    const duas = rodarEm(uma, em(2026, 10, 17, 9, 0));
    expect(duas.notificacoes).toHaveLength(uma.notificacoes.length);
    expect(duas.usuarios).toEqual(uma.usuarios);
    expect(duas.itens).toEqual(uma.itens);
  });
});
