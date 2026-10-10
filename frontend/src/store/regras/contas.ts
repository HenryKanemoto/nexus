import {StatusUsuario, Usuario} from '../../types/models';
import {NexusState, Transicao, novaNotificacao, responsaveis} from '../estado';

export interface ResultadoLogin {
  sucesso: boolean;
  mensagem?: string;
  usuario?: Usuario;
}

export interface DadosCadastro {
  nome: string;
  email: string;
  matricula: string;
  senha?: string;
  perfil: 'aluno' | 'professor';
}

export interface ResultadoCadastro {
  sucesso: boolean;
  mensagem: string;
  campo?: 'email' | 'matricula' | 'senha' | 'geral';
  usuarioId?: string;
  usuario?: Usuario;
}

export function login(s: NexusState, identificador: string, senha?: string): Transicao<ResultadoLogin> {
  const cleanId = identificador.trim().toLowerCase();
  const user = s.usuarios.find(
    (u) => u.email.toLowerCase() === cleanId || u.matricula.toLowerCase() === cleanId,
  );
  if (!user) {
    return {estado: s, resultado: {sucesso: false, mensagem: 'E-mail ou matrícula incorretos.'}};
  }

  const senhaDigitada = (senha ?? '').trim();
  const senhaCadastrada = (user.senha ?? '123456').trim();

  // Aceita a senha cadastrada pelo usuário e as senhas padrão de teste (123456 ou 123)
  const senhaValida =
    !senhaDigitada ||
    senhaDigitada === senhaCadastrada ||
    senhaDigitada === '123456' ||
    senhaDigitada === '123';

  if (!senhaValida) {
    return {
      estado: s,
      resultado: {sucesso: false, mensagem: 'Senha incorreta. Tente novamente (senha padrão de teste: 123456).'},
    };
  }

  return {estado: {...s, usuarioLogadoId: user.id}, resultado: {sucesso: true, usuario: user}};
}

/** RN08: Conta nova nasce pendente e os responsáveis são notificados. */
export function cadastrarUsuario(s: NexusState, dados: DadosCadastro): Transicao<ResultadoCadastro> {
  const emailClean = dados.email.trim().toLowerCase();
  const matriculaClean = dados.matricula.trim().toUpperCase();

  if (s.usuarios.some((u) => u.email.toLowerCase() === emailClean)) {
    return {
      estado: s,
      resultado: {sucesso: false, campo: 'email', mensagem: 'Este e-mail institucional já está cadastrado.'},
    };
  }

  if (s.usuarios.some((u) => u.matricula.toUpperCase() === matriculaClean)) {
    return {estado: s, resultado: {sucesso: false, campo: 'matricula', mensagem: 'Esta matrícula já está em uso.'}};
  }

  const novoId = 'user-' + Date.now();
  const novoUsuario: Usuario = {
    id: novoId,
    nome: dados.nome.trim(),
    email: dados.email.trim(),
    matricula: dados.matricula.trim(),
    senha: dados.senha || '123456',
    perfil: dados.perfil,
    status: 'pendente',
    criadoEm: s.agora,
  };

  const novasNotifs = responsaveis(s).map((r) =>
    novaNotificacao(
      r.id,
      'nova_conta',
      `Nova conta de ${dados.perfil}: ${dados.nome} aguarda aprovação.`,
      s.agora,
      '/painel/contas',
    ),
  );

  return {
    estado: {
      ...s,
      usuarios: [...s.usuarios, novoUsuario],
      notificacoes: [...novasNotifs, ...s.notificacoes],
      usuarioLogadoId: novoId,
    },
    resultado: {
      sucesso: true,
      mensagem: 'Cadastro realizado com sucesso! Sua conta aguarda aprovação de um responsável.',
      usuarioId: novoId,
      usuario: novoUsuario,
    },
  };
}

function alterarStatus(s: NexusState, usuarioId: string, mudanca: Partial<Usuario>): NexusState['usuarios'] {
  return s.usuarios.map((u) => (u.id === usuarioId ? {...u, ...mudanca} : u));
}

export function aprovarUsuario(s: NexusState, usuarioId: string): NexusState {
  if (!s.usuarios.some((u) => u.id === usuarioId)) return s;

  const notif = novaNotificacao(
    usuarioId,
    'aprovacao',
    'Sua conta no Nexus foi aprovada! Você já pode consultar o catálogo e solicitar itens.',
    s.agora,
    '/catalogo',
  );
  return {
    ...s,
    usuarios: alterarStatus(s, usuarioId, {status: 'ativa'}),
    notificacoes: [notif, ...s.notificacoes],
  };
}

export function recusarUsuario(s: NexusState, usuarioId: string, motivo?: string): NexusState {
  if (!s.usuarios.some((u) => u.id === usuarioId)) return s;

  const notif = novaNotificacao(
    usuarioId,
    'recusa',
    `Sua solicitação de cadastro no Nexus não foi aceita.${motivo ? ' Motivo: ' + motivo : ''}`,
    s.agora,
    '/login',
  );
  return {
    ...s,
    usuarios: alterarStatus(s, usuarioId, {status: 'recusada' as StatusUsuario}),
    notificacoes: [notif, ...s.notificacoes],
  };
}

export function bloquearUsuario(s: NexusState, usuarioId: string): NexusState {
  return {...s, usuarios: alterarStatus(s, usuarioId, {status: 'bloqueada'})};
}

export function desbloquearUsuario(s: NexusState, usuarioId: string): NexusState {
  return {...s, usuarios: alterarStatus(s, usuarioId, {status: 'ativa', suspensoAte: undefined})};
}
