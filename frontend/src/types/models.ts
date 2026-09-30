export type PerfilUsuario = 'aluno' | 'professor' | 'responsavel';
export type StatusUsuario = 'pendente' | 'ativa' | 'bloqueada' | 'suspensa' | 'recusada';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  matricula: string;
  senha?: string;
  perfil: PerfilUsuario;
  status: StatusUsuario;
  suspensoAte?: string; // ISO date string
  criadoEm: string;    // ISO date string
}

export interface Categoria {
  id: string;
  nome: string;
  prazoMaxDias: number;
  limitePorPessoa: number;
  descricao?: string;
}

export type StatusItem =
  | 'disponivel'
  | 'solicitado'
  | 'reservado'
  | 'emprestado'
  | 'atrasado'
  | 'manutencao';

export interface Item {
  id: string;
  categoriaId: string;
  nome: string;
  descricao: string;
  patrimonio: string;
  codigoQr: string;
  foto?: string;
  status: StatusItem;
}

export type StatusSolicitacao =
  | 'pendente'
  | 'aprovada'
  | 'recusada'
  | 'expirada'
  | 'concluida';

export interface Solicitacao {
  id: string;
  solicitanteId: string;
  itemId: string;
  avaliadoPor?: string;
  devolucaoDesejada: string; // ISO date string YYYY-MM-DD
  status: StatusSolicitacao;
  criadoEm: string;          // ISO date string
  avaliadoEm?: string;       // ISO date string
  lembreteEnviadoEm?: string; // ISO date string
}

export interface Emprestimo {
  id: string;
  solicitacaoId: string;
  itemId: string;
  usuarioId: string;
  registradoPor: string;
  retiradoEm: string;        // ISO date string
  devolucaoPrevista: string; // ISO date string YYYY-MM-DD
  devolvidoEm?: string;      // ISO date string
  diasAtraso: number;
}

export type StatusOcorrencia = 'aberta' | 'resolvida';

export interface Ocorrencia {
  id: string;
  emprestimoId?: string;
  itemId: string;
  usuarioId: string;
  descricao: string;
  status: StatusOcorrencia;
  criadoEm: string;          // ISO date string
  resolvidoEm?: string;      // ISO date string
}

export type TipoNotificacao =
  | 'aprovacao'
  | 'recusa'
  | 'expiracao'
  | 'prazo_proximo'
  | 'atraso'
  | 'lembrete'
  | 'novo_pedido'
  | 'nova_conta';

export interface Notificacao {
  id: string;
  usuarioId: string;
  tipo: TipoNotificacao;
  mensagem: string;
  lida: boolean;
  criadoEm: string; // ISO date string
  destino: string;  // Route path e.g. /meus-emprestimos or /painel/solicitacoes
}

export type PoliticaAtraso = 'simples' | 'intermediaria' | 'rigida';

export interface Configuracao {
  politicaAtraso: PoliticaAtraso;
}
