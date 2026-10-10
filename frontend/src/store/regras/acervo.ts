import {Categoria, Item, PoliticaAtraso, StatusItem} from '../../types/models';
import {NexusState} from '../estado';

function upsert<T extends {id: string}>(lista: T[], registro: T): T[] {
  return lista.some((r) => r.id === registro.id)
    ? lista.map((r) => (r.id === registro.id ? registro : r))
    : [registro, ...lista];
}

export function salvarItem(s: NexusState, item: Item): NexusState {
  return {...s, itens: upsert(s.itens, item)};
}

export function removerItem(s: NexusState, itemId: string): NexusState {
  return {...s, itens: s.itens.filter((i) => i.id !== itemId)};
}

export function salvarCategoria(s: NexusState, cat: Categoria): NexusState {
  return {...s, categorias: upsert(s.categorias, cat)};
}

export function resolverOcorrencia(s: NexusState, ocorrenciaId: string, itemRetornarDisponivel = true): NexusState {
  const ocorr = s.ocorrencias.find((o) => o.id === ocorrenciaId);
  if (!ocorr) return s;

  return {
    ...s,
    ocorrencias: s.ocorrencias.map((o) =>
      o.id === ocorrenciaId ? {...o, status: 'resolvida' as const, resolvidoEm: s.agora} : o,
    ),
    itens: itemRetornarDisponivel
      ? s.itens.map((i) => (i.id === ocorr.itemId ? {...i, status: 'disponivel' as StatusItem} : i))
      : s.itens,
  };
}

export function alterarPoliticaAtraso(s: NexusState, politicaAtraso: PoliticaAtraso): NexusState {
  return {...s, configuracao: {...s.configuracao, politicaAtraso}};
}

export function marcarNotificacaoComoLida(s: NexusState, notificacaoId: string): NexusState {
  return {...s, notificacoes: s.notificacoes.map((n) => (n.id === notificacaoId ? {...n, lida: true} : n))};
}

export function marcarTodasNotificacoesComoLidas(s: NexusState, usuarioId: string): NexusState {
  return {...s, notificacoes: s.notificacoes.map((n) => (n.usuarioId === usuarioId ? {...n, lida: true} : n))};
}
