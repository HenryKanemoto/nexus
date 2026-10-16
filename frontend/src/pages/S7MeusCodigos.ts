import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProtemStore } from '../store/protem.store';
import { MatIconModule } from '@angular/material/icon';
import { ItemThumb } from '../components/item-thumb/item-thumb';

import { formatDateShort } from '../lib/date-utils';

@Component({
  selector: 'app-s7-meus-codigos',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatIconModule, ItemThumb],
  templateUrl: './S7MeusCodigos.html',
})

export class S7MeusCodigos {
  readonly store = inject(ProtemStore);
  readonly usuario = computed(() => this.store.usuarioLogado());

  // 3. Empréstimos Ativos
  readonly listaEmprestimosAtivos = computed(() => {
    const u = this.usuario();
    if (!u) return [];
    return this.store
      .emprestimos()
      .filter((e) => e.usuarioId === u.id && !e.devolvidoEm);
  });
  
  getItem(itemId?: string) {
    if (!itemId) return undefined;
    return this.store.itens().find((i) => i.id === itemId);
  }

  formatarData(iso?: string) {
    if (!iso) return '—';
    return formatDateShort(iso);
  }
}
