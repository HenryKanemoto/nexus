import {ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {NexusStore} from '../store/nexus.store';
import {MatIconModule} from '@angular/material/icon';
import {formatDateShort, parseDate} from '../lib/date-utils';

type FiltroListaPainel = 'todos' | 'atrasados' | 'ativos' | 'aprovados';

@Component({
  selector: 'app-r1-painel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatIconModule],
  template: `
    <div class="space-y-6 font-['Sora',sans-serif] max-w-7xl">
      <!-- Cabeçalho do Painel (Wireframe R1) -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-[#0E1A3A]">
            Painel
          </h1>
          <p class="text-xs text-slate-500 mt-1">
            Visão geral da operação do acervo, pendências e retiradas do dia
          </p>
        </div>
      </div>

      <!-- Feedback de Sucesso (vindo de Retirada R5 ou Devolução R6) -->
      @if (mensagemSucesso()) {
        <div
          role="status"
          class="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between gap-3 shadow-2xs animate-fadeIn"
        >
          <div class="flex items-center gap-2.5">
            <mat-icon class="text-emerald-600 shrink-0">check_circle</mat-icon>
            <span class="font-medium leading-relaxed">{{ mensagemSucesso() }}</span>
          </div>
          <button
            type="button"
            (click)="mensagemSucesso.set(null)"
            class="text-emerald-600 hover:text-emerald-800 cursor-pointer p-1"
          >
            <mat-icon class="text-base w-4 h-4 flex items-center justify-center">close</mat-icon>
          </button>
        </div>
      }

      <!-- Linha dos Três Contadores Clicáveis + Botão Grande "Ler QR code" (Wireframe R1) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- 1. Pedidos Pendentes (Clica e leva a /painel/solicitacoes -> R2) -->
        <a
          routerLink="/painel/solicitacoes"
          class="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-[#2F6BFF] hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer"
        >
          <div class="text-3xl sm:text-4xl font-extrabold text-[#0E1A3A] group-hover:text-[#2F6BFF] transition-colors tabular-nums">
            {{ store.solicitacoesPendentesCount() }}
          </div>
          <div class="mt-3 flex items-center justify-between">
            <span class="text-xs font-semibold text-slate-600">Pedidos pendentes</span>
            <mat-icon class="text-sm text-slate-400 group-hover:text-[#2F6BFF] group-hover:translate-x-0.5 transition-all">
              arrow_forward
            </mat-icon>
          </div>
        </a>

        <!-- 2. Empréstimos Ativos (Clica e filtra a lista correspondente na tela) -->
        <button
          type="button"
          (click)="alternarFiltro('ativos')"
          class="p-5 rounded-2xl bg-white border shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer text-left"
          [class.border-[#2F6BFF]]="filtroAtivo() === 'ativos'"
          [class.ring-2]="filtroAtivo() === 'ativos'"
          [class.ring-[#2F6BFF]/20]="filtroAtivo() === 'ativos'"
          [class.border-slate-200/90]="filtroAtivo() !== 'ativos'"
        >
          <div class="text-3xl sm:text-4xl font-extrabold text-[#0E1A3A] group-hover:text-[#2F6BFF] transition-colors tabular-nums">
            {{ totalEmprestimosAtivos() }}
          </div>
          <div class="mt-3 flex items-center justify-between">
            <span class="text-xs font-semibold text-slate-600">Empréstimos ativos</span>
            <span class="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded">
              {{ filtroAtivo() === 'ativos' ? 'Exibindo' : 'Filtrar' }}
            </span>
          </div>
        </button>

        <!-- 3. Atrasados (Clica e filtra a lista correspondente na tela) -->
        <button
          type="button"
          (click)="alternarFiltro('atrasados')"
          class="p-5 rounded-2xl bg-white border shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer text-left"
          [class.border-rose-400]="filtroAtivo() === 'atrasados'"
          [class.ring-2]="filtroAtivo() === 'atrasados'"
          [class.ring-rose-400/20]="filtroAtivo() === 'atrasados'"
          [class.border-slate-200/90]="filtroAtivo() !== 'atrasados'"
        >
          <div class="text-3xl sm:text-4xl font-extrabold text-rose-600 tabular-nums">
            {{ totalAtrasados() }}
          </div>
          <div class="mt-3 flex items-center justify-between">
            <span class="text-xs font-semibold text-slate-600">Atrasados</span>
            <span class="text-[10px] text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded">
              {{ filtroAtivo() === 'atrasados' ? 'Filtrado' : 'Ver lista' }}
            </span>
          </div>
        </button>

        <!-- 4. Botão Grande "Ler QR code" (Wireframe R1 -> R4) -->
        <a
          routerLink="/painel/leitor"
          class="p-5 rounded-2xl bg-slate-100 hover:bg-slate-200/90 border border-slate-300 shadow-2xs transition-all flex flex-col items-center justify-center text-center group cursor-pointer space-y-2"
        >
          <div class="w-12 h-12 rounded-xl bg-white border border-slate-300 flex items-center justify-center text-[#0E1A3A] group-hover:scale-105 transition-transform shadow-2xs">
            <mat-icon class="text-2xl">qr_code_scanner</mat-icon>
          </div>
          <span class="text-sm font-extrabold text-[#0E1A3A] group-hover:text-[#2F6BFF] transition-colors">
            Ler QR code
          </span>
          <span class="text-[10px] text-slate-500 font-medium">
            Retiradas e Devoluções
          </span>
        </a>
      </div>

      <!-- Se o filtro 'ativos' estiver ativado, exibe a tabela completa de Empréstimos Ativos -->
      @if (filtroAtivo() === 'ativos') {
        <div class="bg-white rounded-2xl border border-blue-200 shadow-2xs p-5 space-y-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-[#2F6BFF]"></span>
              <h2 class="text-base font-bold text-[#0E1A3A]">
                Todos os Empréstimos Ativos ({{ totalEmprestimosAtivos() }})
              </h2>
            </div>
            <button
              type="button"
              (click)="filtroAtivo.set('todos')"
              class="text-xs text-slate-500 hover:text-slate-800 cursor-pointer flex items-center gap-1"
            >
              <mat-icon class="text-xs w-3.5 h-3.5 flex items-center justify-center">close</mat-icon>
              <span>Fechar filtro</span>
            </button>
          </div>

          <div class="overflow-x-auto rounded-xl border border-slate-200">
            <table class="w-full text-xs text-left">
              <thead class="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th class="p-3">Pessoa</th>
                  <th class="p-3">Item</th>
                  <th class="p-3">Retirado em</th>
                  <th class="p-3">Devolver até</th>
                  <th class="p-3">Situação</th>
                  <th class="p-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                @for (emp of listaEmprestimosAtivos(); track emp.id) {
                  @let it = getItem(emp.itemId);
                  @let user = getUsuario(emp.usuarioId);
                  <tr class="hover:bg-slate-50/50">
                    <td class="p-3">
                      <strong class="font-semibold text-slate-800">{{ user?.nome }}</strong>
                      <span class="block text-[10px] text-slate-400 capitalize">{{ user?.perfil }}</span>
                    </td>
                    <td class="p-3">
                      <span class="font-medium text-[#0E1A3A]">{{ it?.nome }}</span>
                      <span class="block text-[10px] font-mono text-slate-400">{{ it?.patrimonio }}</span>
                    </td>
                    <td class="p-3 tabular-nums">{{ formatarData(emp.retiradoEm) }}</td>
                    <td class="p-3 tabular-nums">{{ formatarData(emp.devolucaoPrevista) }}</td>
                    <td class="p-3">
                      @if (emp.diasAtraso > 0) {
                        <span class="px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 font-bold">
                          {{ emp.diasAtraso }} d atrasado
                        </span>
                      } @else {
                        <span class="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-medium">
                          No prazo
                        </span>
                      }
                    </td>
                    <td class="p-3 text-right">
                      <a
                        [routerLink]="['/painel/devolucao', emp.itemId]"
                        class="px-2.5 py-1 rounded-lg bg-[#2F6BFF] hover:bg-blue-600 text-white font-medium text-[11px] transition-colors shadow-2xs inline-flex items-center gap-1"
                      >
                        <mat-icon class="text-xs w-3 h-3 flex items-center justify-center">keyboard_return</mat-icon>
                        Devolução
                      </a>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- Tabela 1: Atrasados (Wireframe R1) -->
      <div
        class="bg-white rounded-2xl border shadow-2xs p-5 space-y-3"
        [class.border-rose-300]="filtroAtivo() === 'atrasados'"
        [class.border-slate-200/90]="filtroAtivo() !== 'atrasados'"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <h2 class="text-base font-bold text-[#0E1A3A]">
              Atrasados
            </h2>
            <span class="text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
              {{ listaAtrasados().length }}
            </span>
          </div>

          @if (filtroAtivo() === 'atrasados') {
            <button
              type="button"
              (click)="filtroAtivo.set('todos')"
              class="text-xs text-slate-500 hover:text-slate-800 cursor-pointer flex items-center gap-1"
            >
              <mat-icon class="text-xs w-3.5 h-3.5 flex items-center justify-center">close</mat-icon>
              <span>Limpar filtro</span>
            </button>
          }
        </div>

        <div class="overflow-x-auto rounded-xl border border-slate-200">
          <table class="w-full text-xs text-left">
            <thead class="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th class="p-3 w-1/3">Pessoa</th>
                <th class="p-3 w-1/3">Item</th>
                <th class="p-3 w-1/4">Dias de atraso</th>
                <th class="p-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @for (emp of listaAtrasados(); track emp.id) {
                @let it = getItem(emp.itemId);
                @let user = getUsuario(emp.usuarioId);
                <tr class="hover:bg-rose-50/30">
                  <td class="p-3">
                    <strong class="font-semibold text-slate-800">{{ user?.nome }}</strong>
                    <span class="block text-[10px] text-slate-400 capitalize">{{ user?.perfil }} · {{ user?.matricula }}</span>
                  </td>
                  <td class="p-3">
                    <span class="font-bold text-[#0E1A3A]">{{ it?.nome }}</span>
                    <span class="block text-[10px] font-mono text-slate-400">{{ it?.patrimonio }}</span>
                  </td>
                  <td class="p-3">
                    <span class="px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-bold tabular-nums inline-flex items-center gap-1">
                      <mat-icon class="text-xs w-3.5 h-3.5 flex items-center justify-center text-rose-600">warning</mat-icon>
                      {{ emp.diasAtraso }} {{ emp.diasAtraso === 1 ? 'dia' : 'dias' }}
                    </span>
                  </td>
                  <td class="p-3 text-right">
                    <a
                      [routerLink]="['/painel/devolucao', emp.itemId]"
                      class="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-medium text-[11px] transition-colors shadow-2xs inline-flex items-center gap-1"
                    >
                      <mat-icon class="text-xs w-3.5 h-3.5 flex items-center justify-center">keyboard_return</mat-icon>
                      Devolver
                    </a>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="4" class="p-8 text-center text-xs text-slate-400 italic">
                    Nenhum empréstimo em atraso no momento.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tabela 2: Aprovados aguardando retirada hoje (Wireframe R1) -->
      <div class="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <h2 class="text-base font-bold text-[#0E1A3A]">
              Aprovados aguardando retirada hoje
            </h2>
            <span class="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
              {{ listaAprovadosHoje().length }}
            </span>
          </div>
          <span class="text-[11px] text-amber-700 font-medium">
            Expira ao fim do dia se não retirado
          </span>
        </div>

        <div class="overflow-x-auto rounded-xl border border-slate-200">
          <table class="w-full text-xs text-left">
            <thead class="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th class="p-3 w-1/3">Pessoa</th>
                <th class="p-3 w-1/3">Item</th>
                <th class="p-3 w-1/4">Aprovado às</th>
                <th class="p-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @for (solic of listaAprovadosHoje(); track solic.id) {
                @let it = getItem(solic.itemId);
                @let user = getUsuario(solic.solicitanteId);
                <tr class="hover:bg-amber-50/30">
                  <td class="p-3">
                    <strong class="font-semibold text-slate-800">{{ user?.nome }}</strong>
                    <span class="block text-[10px] text-slate-400 capitalize">{{ user?.perfil }} · {{ user?.matricula }}</span>
                  </td>
                  <td class="p-3">
                    <span class="font-bold text-[#0E1A3A]">{{ it?.nome }}</span>
                    <span class="block text-[10px] font-mono text-slate-400">{{ it?.patrimonio }}</span>
                  </td>
                  <td class="p-3 tabular-nums font-medium text-slate-700">
                    {{ formatarHora(solic.avaliadoEm || solic.criadoEm) }}
                  </td>
                  <td class="p-3 text-right">
                    <a
                      [routerLink]="['/painel/retirada', solic.itemId]"
                      class="px-2.5 py-1 rounded-lg bg-[#2F6BFF] hover:bg-blue-600 text-white font-medium text-[11px] transition-colors shadow-2xs inline-flex items-center gap-1"
                    >
                      <mat-icon class="text-xs w-3.5 h-3.5 flex items-center justify-center">qr_code</mat-icon>
                      Registrar Retirada
                    </a>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="4" class="p-8 text-center text-xs text-slate-400 italic">
                    Nenhum pedido aprovado aguardando retirada hoje.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class R1Painel {
  readonly store = inject(NexusStore);
  private readonly router = inject(Router);

  readonly filtroAtivo = signal<FiltroListaPainel>('todos');
  readonly mensagemSucesso = signal<string | null>(null);

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
