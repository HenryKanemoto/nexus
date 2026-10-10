import {ChangeDetectionStrategy, Component, computed, inject} from '@angular/core';
import {iconeCategoria} from '../lib/categoria-utils';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {NexusStore} from '../store/nexus.store';
import {MatIconModule} from '@angular/material/icon';
import {formatDateShort} from '../lib/date-utils';
import {ItemThumb} from '../components/item-thumb/item-thumb';
import {iniciais} from '../lib/texto-utils';

@Component({
  selector: 'app-r5-retirada',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatIconModule, ItemThumb],
  templateUrl: './R5Retirada.html',
})
export class R5Retirada {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly store = inject(NexusStore);

  readonly iniciais = iniciais;

  readonly itemId = computed(() => this.route.snapshot.paramMap.get('itemId') || '');

  readonly item = computed(() => {
    const id = this.itemId();
    return this.store.itens().find((i) => i.id === id) || null;
  });

  readonly solicitacao = computed(() => {
    const it = this.item();
    if (!it) return null;
    return (
      this.store.solicitacoes().find(
        (s) => s.itemId === it.id && s.status === 'aprovada'
      ) || null
    );
  });

  getUsuario(id?: string) {
    if (!id) return undefined;
    return this.store.usuarios().find((u) => u.id === id);
  }

  formatarData(iso?: string) {
    if (!iso) return '—';
    return formatDateShort(iso);
  }

  executarConfirmacaoRetirada() {
    const it = this.item();
    const resp = this.store.usuarioLogado();
    if (!it) return;

    const res = this.store.registrarRetirada(it.id, resp?.id || 'user-marta');
    if (res.sucesso) {
      // Volta ao painel com mensagem de sucesso
      this.router.navigate(['/painel'], {
        state: { sucesso: `Retirada registrada com sucesso para "${it.nome}". O prazo oficial começou a contar agora.` },
      });
    }
  }

  getIconeCategoria(categoriaId: string): string {
    return iconeCategoria(categoriaId);
  }
}
