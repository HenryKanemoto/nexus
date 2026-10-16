import {
  ALFABETO_CODIGO,
  codigoConfere,
  codigosEmUso,
  garantirCodigosDeRetirada,
  gerarCodigoRetirada,
  normalizarCodigo,
} from './codigos';
import {buscar, estadoDeTeste, solicitacao} from './estado-de-teste';

describe('código de retirada', () => {
  it('tem 6 caracteres sem os que se confundem (0/O, 1/I/L)', () => {
    for (let i = 0; i < 200; i++) {
      const codigo = gerarCodigoRetirada(new Set());
      expect(codigo).toMatch(/^[A-Z2-9]{6}$/);
      expect(codigo).not.toMatch(/[01OIL]/);
    }
    expect(ALFABETO_CODIGO).not.toMatch(/[01OIL]/);
  });

  it('não repete um código que ainda está em uso', () => {
    // Sorteio "viciado": a primeira tentativa sempre dá AAAAAA, a segunda BBBBBB
    let chamadas = 0;
    const aleatorio = () => (chamadas++ < 6 ? 0 : 1 / ALFABETO_CODIGO.length);
    expect(gerarCodigoRetirada(new Set(['AAAAAA']), aleatorio)).toBe('BBBBBB');
  });

  it('só conta como em uso o código de pedido aprovado', () => {
    const s = estadoDeTeste({
      solicitacoes: [
        solicitacao('a', 'a1', {status: 'aprovada', codigoRetirada: 'AAAAAA'}),
        solicitacao('c', 'a2', {status: 'concluida', codigoRetirada: 'BBBBBB'}),
        solicitacao('e', 'b1', {status: 'expirada', codigoRetirada: 'CCCCCC'}),
      ],
    });
    expect([...codigosEmUso(s)]).toEqual(['AAAAAA']);
  });

  it('normaliza o que foi digitado', () => {
    expect(normalizarCodigo(' k7p-m4x ')).toBe('K7PM4X');
  });

  it('confere só em pedido aprovado e com o código certo', () => {
    const aprovado = solicitacao('p', 'a1', {status: 'aprovada', codigoRetirada: 'K7PM4X'});
    expect(codigoConfere(aprovado, 'k7pm4x')).toBe(true);
    expect(codigoConfere(aprovado, 'K7PM4Y')).toBe(false);
    expect(codigoConfere({...aprovado, status: 'concluida'}, 'K7PM4X')).toBe(false);
    expect(codigoConfere({...aprovado, codigoRetirada: undefined}, '')).toBe(false);
  });

  it('dá código a pedido aprovado salvo antes de o código existir, sem mexer nos outros', () => {
    const s = estadoDeTeste({
      solicitacoes: [
        solicitacao('antigo', 'a1', {status: 'aprovada'}),
        solicitacao('comCodigo', 'a2', {status: 'aprovada', codigoRetirada: 'K7PM4X'}),
        solicitacao('pendente', 'b1'),
      ],
    });
    const depois = garantirCodigosDeRetirada(s);
    expect(buscar.solicitacao(depois, 'antigo').codigoRetirada).toMatch(/^[A-Z2-9]{6}$/);
    expect(buscar.solicitacao(depois, 'antigo').codigoRetirada).not.toBe('K7PM4X');
    expect(buscar.solicitacao(depois, 'comCodigo').codigoRetirada).toBe('K7PM4X');
    expect(buscar.solicitacao(depois, 'pendente').codigoRetirada).toBeUndefined();
    expect(garantirCodigosDeRetirada(depois)).toBe(depois);
  });
});
