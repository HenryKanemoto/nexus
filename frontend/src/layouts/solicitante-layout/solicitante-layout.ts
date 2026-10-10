import {ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';
import {Router, RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {NexusStore} from '../../store/nexus.store';
import {RelogioFlutuante} from '../../components/relogio-flutuante/relogio-flutuante';
import {Logo} from '../../components/logo/logo';
import {AvisoApi} from '../../components/aviso-api/aviso-api';
import {iniciais, rotuloPerfil} from '../../lib/texto-utils';

@Component({
  selector: 'app-solicitante-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatIconModule, RelogioFlutuante, Logo, AvisoApi],
  templateUrl: './solicitante-layout.html',
})
export class SolicitanteLayout {
  readonly store = inject(NexusStore);
  private readonly router = inject(Router);

  readonly menuAberto = signal(false);

  readonly usuario = computed(() => this.store.usuarioLogado());
  readonly iniciais = computed(() => iniciais(this.usuario()?.nome));
  readonly perfil = computed(() => rotuloPerfil(this.usuario()?.perfil));

  readonly links = [
    {rotulo: 'Catálogo', rota: '/catalogo'},
    {rotulo: 'Meus empréstimos', rota: '/meus-emprestimos'},
  ];

  readonly linksMobile = [
    {rotulo: 'Catálogo', rota: '/catalogo', icone: 'grid_view'},
    {rotulo: 'Empréstimos', rota: '/meus-emprestimos', icone: 'assignment'},
    {rotulo: 'Avisos', rota: '/notificacoes', icone: 'notifications_none'},
    {rotulo: 'Perfil', rota: '/perfil', icone: 'person_outline'},
  ];

  toggleMenu() {
    this.menuAberto.update((v) => !v);
  }

  sair() {
    this.menuAberto.set(false);
    this.store.logout();
    this.router.navigate(['/login']);
  }
}
