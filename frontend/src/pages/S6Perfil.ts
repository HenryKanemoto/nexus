import {ChangeDetectionStrategy, Component, computed, inject} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {NexusStore} from '../store/nexus.store';
import {MatIconModule} from '@angular/material/icon';
import {formatDateShort} from '../lib/date-utils';
import {StatusBadge} from '../components/status-badge/status-badge';
import {iniciais, rotuloPerfil} from '../lib/texto-utils';
import {plural} from '../lib/categoria-utils';

@Component({
  selector: 'app-s6-perfil',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatIconModule, StatusBadge],
  templateUrl: './S6Perfil.html',
})
export class S6Perfil {
  readonly store = inject(NexusStore);
  private readonly router = inject(Router);

  readonly usuario = computed(() => this.store.usuarioLogado());

  readonly iniciais = computed(() => iniciais(this.usuario()?.nome));
  readonly perfil = computed(() => rotuloPerfil(this.usuario()?.perfil));

  readonly plural = plural;

  readonly itemAtrasadoInfo = computed(() => {
    const u = this.usuario();
    if (!u) return null;
    const emp = this.store.emprestimos().find(
      (e) => e.usuarioId === u.id && !e.devolvidoEm && e.diasAtraso > 0
    );
    if (!emp) return null;
    const it = this.store.itens().find((i) => i.id === emp.itemId);
    return {
      itemNome: it?.nome || 'Equipamento',
      dias: emp.diasAtraso,
    };
  });

  readonly ocorrencias = computed(() => {
    const u = this.usuario();
    if (!u) return [];
    return this.store.ocorrencias().filter((o) => o.usuarioId === u.id);
  });

  getItem(id: string) {
    return this.store.itens().find((i) => i.id === id);
  }

  formatarData(iso?: string) {
    if (!iso) return '—';
    return formatDateShort(iso);
  }

  sair() {
    this.store.logout();
    this.router.navigate(['/login']);
  }
}
