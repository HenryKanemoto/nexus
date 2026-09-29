import {inject} from '@angular/core';
import {CanActivateFn, Router} from '@angular/router';
import {NexusStore} from '../store/nexus.store';

/**
 * Guard para rotas de Solicitante (/catalogo, /item/:id, /solicitar/:id, /meus-emprestimos, /notificacoes, /perfil).
 * Permite apenas perfis 'aluno' ou 'professor'.
 * Se for 'responsavel', redireciona para /painel.
 * Se status for 'pendente', redireciona para /aguardando.
 * Se não logado, redireciona para /login.
 */
export const solicitanteGuard: CanActivateFn = () => {
  const store = inject(NexusStore);
  const router = inject(Router);
  const usuario = store.usuarioLogado();

  if (!usuario) {
    return router.parseUrl('/login');
  }

  // Se um usuário pendente tentar acessar qualquer outra rota, redirecione para /aguardando
  if (usuario.status === 'pendente') {
    return router.parseUrl('/aguardando');
  }

  if (usuario.perfil === 'responsavel') {
    return router.parseUrl('/painel');
  }

  return true;
};

/**
 * Guard específico para a rota /solicitar/:id:
 * Usuário com status 'bloqueada' ou 'suspensa' NÃO pode solicitar; deve ir para /perfil.
 */
export const podeSolicitarGuard: CanActivateFn = () => {
  const store = inject(NexusStore);
  const router = inject(Router);
  const usuario = store.usuarioLogado();

  if (!usuario) {
    return router.parseUrl('/login');
  }

  if (usuario.status === 'pendente') {
    return router.parseUrl('/aguardando');
  }

  if (usuario.status === 'bloqueada' || usuario.status === 'suspensa') {
    return router.parseUrl('/perfil');
  }

  return true;
};

/**
 * Guard para rotas do Responsável (/painel e sub-rotas).
 * Permite apenas perfil 'responsavel'.
 * Se pendente, redireciona para /aguardando.
 * Se for solicitante, redireciona para /catalogo (ou /perfil se bloqueado/suspenso).
 * Se não logado, redireciona para /login.
 */
export const responsavelGuard: CanActivateFn = () => {
  const store = inject(NexusStore);
  const router = inject(Router);
  const usuario = store.usuarioLogado();

  if (!usuario) {
    return router.parseUrl('/login');
  }

  if (usuario.status === 'pendente') {
    return router.parseUrl('/aguardando');
  }

  if (usuario.perfil !== 'responsavel') {
    if (usuario.status === 'bloqueada' || usuario.status === 'suspensa') {
      return router.parseUrl('/perfil');
    }
    return router.parseUrl('/catalogo');
  }

  return true;
};

/**
 * Guard para rotas públicas (como /cadastro):
 * Se o usuário atual for 'pendente', redireciona para /aguardando.
 */
export const cadastroPublicGuard: CanActivateFn = () => {
  const store = inject(NexusStore);
  const router = inject(Router);
  const usuario = store.usuarioLogado();

  if (usuario && usuario.status === 'pendente') {
    return router.parseUrl('/aguardando');
  }

  return true;
};
