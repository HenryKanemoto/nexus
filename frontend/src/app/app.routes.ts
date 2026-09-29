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
    title: 'Entrar | Nexus',
    loadComponent: () => import('../pages/P1Login').then((m) => m.P1Login),
  },
  {
    path: 'cadastro',
    title: 'Cadastro de Usuário | Nexus',
    canActivate: [cadastroPublicGuard],
    loadComponent: () => import('../pages/P2Cadastro').then((m) => m.P2Cadastro),
  },
  {
    path: 'aguardando',
    title: 'Aguardando Aprovação | Nexus',
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
        title: 'Catálogo de Equipamentos | Nexus',
        loadComponent: () => import('../pages/S1Catalogo').then((m) => m.S1Catalogo),
      },
      {
        path: 'item/:id',
        title: 'Detalhes do Equipamento | Nexus',
        loadComponent: () => import('../pages/S2Item').then((m) => m.S2Item),
      },
      {
        path: 'solicitar/:id',
        title: 'Solicitar Empréstimo | Nexus',
        canActivate: [podeSolicitarGuard],
        loadComponent: () => import('../pages/S3Solicitar').then((m) => m.S3Solicitar),
      },
      {
        path: 'meus-emprestimos',
        title: 'Meus Empréstimos | Nexus',
        loadComponent: () => import('../pages/S4MeusEmprestimos').then((m) => m.S4MeusEmprestimos),
      },
      {
        path: 'notificacoes',
        title: 'Minhas Notificações | Nexus',
        loadComponent: () => import('../pages/S5Notificacoes').then((m) => m.S5Notificacoes),
      },
      {
        path: 'perfil',
        title: 'Meu Perfil | Nexus',
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
        title: 'Painel de Gestão | Nexus',
        loadComponent: () => import('../pages/R1Painel').then((m) => m.R1Painel),
      },
      {
        path: 'solicitacoes',
        title: 'Solicitações de Empréstimo | Nexus',
        loadComponent: () => import('../pages/R2Solicitacoes').then((m) => m.R2Solicitacoes),
      },
      {
        path: 'contas',
        title: 'Aprovação de Contas | Nexus',
        loadComponent: () => import('../pages/R3Contas').then((m) => m.R3Contas),
      },
      {
        path: 'leitor',
        title: 'Leitor de QR Code | Nexus',
        loadComponent: () => import('../pages/R4Leitor').then((m) => m.R4Leitor),
      },
      {
        path: 'retirada/:itemId',
        title: 'Confirmar Retirada | Nexus',
        loadComponent: () => import('../pages/R5Retirada').then((m) => m.R5Retirada),
      },
      {
        path: 'devolucao/:itemId',
        title: 'Registrar Devolução | Nexus',
        loadComponent: () => import('../pages/R6Devolucao').then((m) => m.R6Devolucao),
      },
      {
        path: 'itens',
        title: 'Itens do Acervo | Nexus',
        loadComponent: () => import('../pages/R7Itens').then((m) => m.R7Itens),
      },
      {
        path: 'itens/novo',
        title: 'Cadastrar Item | Nexus',
        loadComponent: () => import('../pages/R8ItemForm').then((m) => m.R8ItemForm),
      },
      {
        path: 'itens/:id/editar',
        title: 'Editar Item | Nexus',
        loadComponent: () => import('../pages/R8ItemForm').then((m) => m.R8ItemForm),
      },
      {
        path: 'itens/:id',
        title: 'Ficha do Equipamento | Nexus',
        loadComponent: () => import('../pages/R9ItemDetalhes').then((m) => m.R9ItemDetalhes),
      },
      {
        path: 'categorias',
        title: 'Categorias de Equipamentos | Nexus',
        loadComponent: () => import('../pages/R10Categorias').then((m) => m.R10Categorias),
      },
      {
        path: 'categorias/nova',
        title: 'Cadastrar Categoria | Nexus',
        loadComponent: () => import('../pages/R11CategoriaForm').then((m) => m.R11CategoriaForm),
      },
      {
        path: 'categorias/:id/editar',
        title: 'Editar Categoria | Nexus',
        loadComponent: () => import('../pages/R11CategoriaForm').then((m) => m.R11CategoriaForm),
      },
      {
        path: 'manutencao',
        title: 'Gestão de Manutenção | Nexus',
        loadComponent: () => import('../pages/R12Manutencao').then((m) => m.R12Manutencao),
      },
      {
        path: 'usuarios',
        title: 'Gestão de Usuários | Nexus',
        loadComponent: () => import('../pages/R13Usuarios').then((m) => m.R13Usuarios),
      },
      {
        path: 'usuarios/:id',
        title: 'Histórico da Pessoa | Nexus',
        loadComponent: () => import('../pages/R14UsuarioDetalhes').then((m) => m.R14UsuarioDetalhes),
      },
      {
        path: 'relatorios',
        title: 'Relatórios e Indicadores | Nexus',
        loadComponent: () => import('../pages/R15Relatorios').then((m) => m.R15Relatorios),
      },
      {
        path: 'configuracoes',
        title: 'Configurações de Política | Nexus',
        loadComponent: () => import('../pages/R16Configuracoes').then((m) => m.R16Configuracoes),
      },
      {
        path: 'notificacoes',
        title: 'Notificações da Gestão | Nexus',
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
