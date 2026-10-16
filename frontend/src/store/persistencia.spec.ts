import {estadoDeTeste} from './regras/estado-de-teste';
import {carregarEstado, salvarEstado} from './persistencia';

describe('persistência no navegador', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.restoreAllMocks());

  it('sem nada salvo, começa do seed', () => {
    const {estado, doSeed} = carregarEstado();
    expect(doSeed).toBe(true);
    expect(estado.itens.length).toBeGreaterThan(0);
  });

  it('grava em protem:v1 e lê de volta', () => {
    const s = estadoDeTeste({usuarioLogadoId: 'aluna'});
    expect(salvarEstado(s)).toBe('ok');
    expect(localStorage.getItem('protem:v1')).not.toBeNull();
    expect(carregarEstado()).toEqual({estado: s, doSeed: false});
  });

  it('aproveita os dados salvos com a chave antiga do Nexus', () => {
    localStorage.setItem('nexus_app_state_v2', JSON.stringify(estadoDeTeste({usuarioLogadoId: 'resp'})));
    const {estado, doSeed} = carregarEstado();
    expect(doSeed).toBe(false);
    expect(estado.usuarioLogadoId).toBe('resp');
  });

  it('prefere a chave nova à antiga', () => {
    localStorage.setItem('nexus_app_state_v2', JSON.stringify(estadoDeTeste({usuarioLogadoId: 'resp'})));
    salvarEstado(estadoDeTeste({usuarioLogadoId: 'aluna'}));
    expect(carregarEstado().estado.usuarioLogadoId).toBe('aluna');
  });

  it.each([
    ['JSON inválido', '{quebrado'],
    ['null', 'null'],
    ['lista faltando', JSON.stringify({...estadoDeTeste(), itens: undefined})],
    ['relógio inválido', JSON.stringify({...estadoDeTeste(), agora: 'ontem'})],
    ['política desconhecida', JSON.stringify({...estadoDeTeste(), configuracao: {politicaAtraso: 'x'}})],
  ])('dados corrompidos (%s) voltam para o seed', (_caso, texto) => {
    localStorage.setItem('protem:v1', texto);
    expect(carregarEstado().doSeed).toBe(true);
  });

  it('informa cota cheia sem lançar erro', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('cheio', 'QuotaExceededError');
    });
    expect(salvarEstado(estadoDeTeste())).toBe('cota');
  });
});
