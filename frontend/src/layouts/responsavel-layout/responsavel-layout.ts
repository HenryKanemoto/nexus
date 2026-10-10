import {ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';
import {Router, RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {NexusStore} from '../../store/nexus.store';
import {RelogioFlutuante} from '../../components/relogio-flutuante/relogio-flutuante';
import {Logo} from '../../components/logo/logo';
import {AvisoApi} from '../../components/aviso-api/aviso-api';
import {iniciais} from '../../lib/texto-utils';

interface NavItem {
  rotulo: string;
  rota: string;
  icone: string;
  badge?: () => number;
}

interface NavGrupo {
  titulo: string;
  itens: NavItem[];
}

@Component({
  selector: 'app-responsavel-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatIconModule, RelogioFlutuante, Logo, AvisoApi],
  templateUrl: './responsavel-layout.html',
})
export class ResponsavelLayout {
  readonly store = inject(NexusStore);
  private readonly router = inject(Router);

  readonly drawerAberto = signal(false);
  readonly iniciais = computed(() => iniciais(this.store.usuarioLogado()?.nome));

  readonly menu: NavGrupo[] = [
    {
      titulo: 'Operação',
      itens: [
        {rotulo: 'Painel', rota: '/painel', icone: 'space_dashboard'},
        {
          rotulo: 'Solicitações',
          rota: '/painel/solicitacoes',
          icone: 'inbox',
          badge: () => this.store.solicitacoesPendentesCount(),
        },
        {
          rotulo: 'Contas',
          rota: '/painel/contas',
          icone: 'how_to_reg',
          badge: () => this.store.contasPendentesCount(),
        },
        {rotulo: 'Leitor de QR code', rota: '/painel/leitor', icone: 'qr_code_scanner'},
      ],
    },
    {
      titulo: 'Acervo',
      itens: [
        {rotulo: 'Itens', rota: '/painel/itens', icone: 'inventory_2'},
        {rotulo: 'Categorias', rota: '/painel/categorias', icone: 'category'},
        {
          rotulo: 'Manutenção',
          rota: '/painel/manutencao',
          icone: 'build',
          badge: () => this.store.ocorrenciasAbertasCount(),
        },
      ],
    },
    {
      titulo: 'Pessoas e dados',
      itens: [
        {rotulo: 'Usuários', rota: '/painel/usuarios', icone: 'group'},
        {rotulo: 'Relatórios', rota: '/painel/relatorios', icone: 'insights'},
        {rotulo: 'Histórico', rota: '/painel/historico', icone: 'history'},
      ],
    },
    {
      titulo: 'Sistema',
      itens: [{rotulo: 'Configurações', rota: '/painel/configuracoes', icone: 'tune'}],
    },
  ];

  toggleDrawer() {
    this.drawerAberto.update((v) => !v);
  }

  fecharDrawer() {
    this.drawerAberto.set(false);
  }

  sair() {
    this.fecharDrawer();
    this.store.logout();
    this.router.navigate(['/login']);
  }
}
