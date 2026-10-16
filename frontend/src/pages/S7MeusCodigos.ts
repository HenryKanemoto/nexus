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

  readonly listarSolicitacoes = computed(() => {
    const u = this.usuario();
    if (!u) return []; 
    return this.store.solicitacoes().filter((e) => e.solicitanteId === u.id)
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
