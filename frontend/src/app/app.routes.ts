import {Routes} from '@angular/router';
import {
  cadastroPublicGuard,
  podeSolicitarGuard,
  responsavelGuard,
  solicitanteGuard,
} from '../guards/auth.guard';
import {SolicitanteLayout} from '../layouts/solicitante-layout/solicitante-layout';
import {ResponsavelLayout} from '../layouts/responsavel-layout/responsavel-layout';

export const routes: Routes = [
  // Rotas Públicas / Acesso
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login',
  },
  {
    path: 'login',
    title: 'Entrar · Protem · Plataforma Web de Empréstimos',
    loadComponent: () => import('../pages/P1Login').then((m) => m.P1Login),
  },
  {
    path: 'cadastro',
    title: 'Cadastro de Usuário · Protem',
    canActivate: [cadastroPublicGuard],
    loadComponent: () => import('../pages/P2Cadastro').then((m) => m.P2Cadastro),
  },
  {
    path: 'aguardando',
    title: 'Aguardando Aprovação · Protem',
    loadComponent: () => import('../pages/P3Aguardando').then((m) => m.P3Aguardando),
  },

  // Rotas de Solicitante (Aluno e Professor) - Protegidas por solicitanteGuard
  {
    path: '',
    component: SolicitanteLayout,
    canActivate: [solicitanteGuard],
    children: [
      {
        path: 'catalogo',
        title: 'Catálogo de Equipamentos · Protem',
        loadComponent: () => import('../pages/S1Catalogo').then((m) => m.S1Catalogo),
      },
      {
        path: 'item/:id',
        title: 'Detalhes do Equipamento · Protem',
        loadComponent: () => import('../pages/S2Item').then((m) => m.S2Item),
      },
      {
        path: 'solicitar/:id',
        title: 'Solicitar Empréstimo · Protem',
        canActivate: [podeSolicitarGuard],
        loadComponent: () => import('../pages/S3Solicitar').then((m) => m.S3Solicitar),
      },
      {
        path: 'meus-emprestimos',
        title: 'Meus Empréstimos · Protem',
        loadComponent: () => import('../pages/S4MeusEmprestimos').then((m) => m.S4MeusEmprestimos),
      },
      {
        path: 'notificacoes',
        title: 'Minhas Notificações · Protem',
        loadComponent: () => import('../pages/S5Notificacoes').then((m) => m.S5Notificacoes),
      },
      {
        path: 'perfil',
        title: 'Meu Perfil · Protem',
        loadComponent: () => import('../pages/S6Perfil').then((m) => m.S6Perfil),
      },
    ],
  },

  // Rotas do Responsável - Protegidas por responsavelGuard
  {
    path: 'painel',
    component: ResponsavelLayout,
    canActivate: [responsavelGuard],
    children: [
      {
        path: '',
        title: 'Painel de Gestão · Protem',
        loadComponent: () => import('../pages/R1Painel').then((m) => m.R1Painel),
      },
      {
        path: 'solicitacoes',
        title: 'Solicitações de Empréstimo · Protem',
        loadComponent: () => import('../pages/R2Solicitacoes').then((m) => m.R2Solicitacoes),
      },
      {
        path: 'contas',
        title: 'Aprovação de Contas · Protem',
        loadComponent: () => import('../pages/R3Contas').then((m) => m.R3Contas),
      },
      {
        path: 'leitor',
        title: 'Leitor de QR Code · Protem',
        loadComponent: () => import('../pages/R4Leitor').then((m) => m.R4Leitor),
      },
      {
        path: 'retirada/:itemId',
        title: 'Confirmar Retirada · Protem',
        loadComponent: () => import('../pages/R5Retirada').then((m) => m.R5Retirada),
      },
      {
        path: 'devolucao/:itemId',
        title: 'Registrar Devolução · Protem',
        loadComponent: () => import('../pages/R6Devolucao').then((m) => m.R6Devolucao),
      },
      {
        path: 'itens',
        title: 'Itens do Acervo · Protem',
        loadComponent: () => import('../pages/R7Itens').then((m) => m.R7Itens),
      },
      {
        path: 'itens/novo',
        title: 'Cadastrar Item · Protem',
        loadComponent: () => import('../pages/R8ItemForm').then((m) => m.R8ItemForm),
      },
      {
        path: 'itens/:id/editar',
        title: 'Editar Item · Protem',
        loadComponent: () => import('../pages/R8ItemForm').then((m) => m.R8ItemForm),
      },
      {
        path: 'itens/:id',
        title: 'Ficha do Equipamento · Protem',
        loadComponent: () => import('../pages/R9ItemDetalhes').then((m) => m.R9ItemDetalhes),
      },
      {
        path: 'categorias',
        title: 'Categorias de Equipamentos · Protem',
        loadComponent: () => import('../pages/R10Categorias').then((m) => m.R10Categorias),
      },
      {
        path: 'categorias/nova',
        title: 'Cadastrar Categoria · Protem',
        loadComponent: () => import('../pages/R11CategoriaForm').then((m) => m.R11CategoriaForm),
      },
      {
        path: 'categorias/:id/editar',
        title: 'Editar Categoria · Protem',
        loadComponent: () => import('../pages/R11CategoriaForm').then((m) => m.R11CategoriaForm),
      },
      {
        path: 'manutencao',
        title: 'Gestão de Manutenção · Protem',
        loadComponent: () => import('../pages/R12Manutencao').then((m) => m.R12Manutencao),
      },
      {
        path: 'usuarios',
        title: 'Gestão de Usuários · Protem',
        loadComponent: () => import('../pages/R13Usuarios').then((m) => m.R13Usuarios),
      },
      {
        path: 'usuarios/:id',
        title: 'Histórico da Pessoa · Protem',
        loadComponent: () => import('../pages/R14UsuarioDetalhes').then((m) => m.R14UsuarioDetalhes),
      },
      {
        path: 'relatorios',
        title: 'Relatórios e Indicadores · Protem',
        loadComponent: () => import('../pages/R15Relatorios').then((m) => m.R15Relatorios),
      },
      {
        path: 'configuracoes',
        title: 'Configurações de Política · Protem',
        loadComponent: () => import('../pages/R16Configuracoes').then((m) => m.R16Configuracoes),
      },
      {
        path: 'historico',
        title: 'Histórico de Movimentações · Protem',
        loadComponent: () => import('../pages/R18Historico').then((m) => m.R18Historico),
      },
      {
        path: 'notificacoes',
        title: 'Notificações da Gestão · Protem',
        loadComponent: () => import('../pages/R17Notificacoes').then((m) => m.R17Notificacoes),
      },
    ],
  },

  // Fallback
  {
    path: '**',
    redirectTo: 'login',
  },
];
