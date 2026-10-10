import {
  Categoria,
  Configuracao,
  Emprestimo,
  Item,
  Notificacao,
  Ocorrencia,
  Solicitacao,
  TipoNotificacao,
  Usuario,
} from '../types/models';

export interface NexusState {
  agora: string; // ISO date string do relógio simulado
  usuarioLogadoId: string | null;
  configuracao: Configuracao;
  usuarios: Usuario[];
  categorias: Categoria[];
  itens: Item[];
  solicitacoes: Solicitacao[];
  emprestimos: Emprestimo[];
  ocorrencias: Ocorrencia[];
  notificacoes: Notificacao[];
}

/** Resultado de uma regra de negócio: o novo estado e o que deve voltar para a tela. */
export interface Transicao<R> {
  estado: NexusState;
  resultado: R;
}

export interface ResultadoAcao {
  sucesso: boolean;
  mensagem: string;
}

export function novaNotificacao(
  usuarioId: string,
  tipo: TipoNotificacao,
  mensagem: string,
  criadoEm: string,
  destino: string,
): Notificacao {
  return {
    id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    usuarioId,
    tipo,
    mensagem,
    lida: false,
    criadoEm,
    destino,
  };
}

export function responsaveis(s: NexusState): Usuario[] {
  return s.usuarios.filter((u) => u.perfil === 'responsavel');
}
