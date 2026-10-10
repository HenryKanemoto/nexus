import {ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {NexusStore} from '../store/nexus.store';
import {MatIconModule} from '@angular/material/icon';
import {formatDateShort, parseDate} from '../lib/date-utils';
import {StatusBadge} from '../components/status-badge/status-badge';
import {plural} from '../lib/categoria-utils';

type FiltroListaPainel = 'todos' | 'atrasados' | 'ativos' | 'aprovados';

@Component({
  selector: 'app-r1-painel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatIconModule, StatusBadge],
  templateUrl: './R1Painel.html',
})
export class R1Painel {
  readonly store = inject(NexusStore);
  private readonly router = inject(Router);

  readonly filtroAtivo = signal<FiltroListaPainel>('todos');
  readonly mensagemSucesso = signal<string | null>(null);

  readonly plural = plural;

  readonly primeiroNome = computed(() => this.store.usuarioLogado()?.nome.split(' ')[0] ?? '');

  readonly dataHoje = computed(() =>
    this.store.agora().toLocaleDateString('pt-BR', {weekday: 'long', day: 'numeric', month: 'long'}),
  );

  constructor() {
    const nav = this.router.getCurrentNavigation();
    if (nav?.extras?.state && (nav.extras.state as { sucesso?: string }).sucesso) {
      this.mensagemSucesso.set((nav.extras.state as { sucesso: string }).sucesso);
    } else if (typeof history !== 'undefined' && history.state && history.state.sucesso) {
      this.mensagemSucesso.set(history.state.sucesso);
    }
  }

  readonly totalEmprestimosAtivos = computed(() => {
    return this.store.emprestimos().filter((e) => !e.devolvidoEm).length;
  });

  readonly totalAtrasados = computed(() => {
    return this.store.emprestimos().filter((e) => !e.devolvidoEm && e.diasAtraso > 0).length;
  });

  readonly listaAtrasados = computed(() => {
    return this.store.emprestimos().filter((e) => !e.devolvidoEm && e.diasAtraso > 0);
  });

  readonly listaAprovadosHoje = computed(() => {
    return this.store.solicitacoes().filter((s) => s.status === 'aprovada');
  });

  readonly listaEmprestimosAtivos = computed(() => {
    return this.store.emprestimos().filter((e) => !e.devolvidoEm);
  });

  alternarFiltro(tipo: 'ativos' | 'atrasados') {
    if (this.filtroAtivo() === tipo) {
      this.filtroAtivo.set('todos');
    } else {
      this.filtroAtivo.set(tipo);
    }
  }

  getItem(id: string) {
    return this.store.itens().find((i) => i.id === id);
  }

  getUsuario(id: string) {
    return this.store.usuarios().find((u) => u.id === id);
  }

  formatarData(iso: string) {
    return formatDateShort(iso);
  }

  formatarHora(iso: string) {
    const d = parseDate(iso);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  }
}
