import {ChangeDetectionStrategy, Component, computed, inject, input, signal} from '@angular/core';
import {Router} from '@angular/router';
import {NexusStore} from '../../store/nexus.store';
import {formatDateTime} from '../../lib/date-utils';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-relogio-flutuante',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  templateUrl: './relogio-flutuante.html',
})
export class RelogioFlutuante {
  readonly store = inject(NexusStore);
  private readonly router = inject(Router);

  /** No celular, sobe o botão para não ficar em cima da navegação inferior. */
  readonly acimaDaNavegacao = input(false);

  readonly aberto = signal(false);

  readonly dataFormatada = computed(() => formatDateTime(this.store.agora()));

  readonly passos = [
    {rotulo: '+1 hora', acao: () => this.store.avancarRelogio(1)},
    {rotulo: '+1 dia', acao: () => this.store.avancarDias(1)},
    {rotulo: '+3 dias', acao: () => this.store.avancarDias(3)},
  ];

  reiniciarDados() {
    this.store.reiniciarDados();
  }

  trocarUsuario(usuarioId: string) {
    this.store.trocarUsuarioDemo(usuarioId);
    const usuario = this.store.usuarios().find((u) => u.id === usuarioId);
    if (!usuario) return;

    const currentUrl = this.router.url;
    // Se o usuário for solicitante e estiver em rota /painel, redirecionar para /catalogo
    if (usuario.perfil !== 'responsavel' && currentUrl.startsWith('/painel')) {
      if (usuario.status === 'pendente') {
        this.router.navigate(['/aguardando']);
      } else {
        this.router.navigate(['/catalogo']);
      }
    } else if (usuario.perfil === 'responsavel' && !currentUrl.startsWith('/painel')) {
      this.router.navigate(['/painel']);
    }
  }
}
