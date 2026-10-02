import {ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {NexusStore} from '../store/nexus.store';
import {MatIconModule} from '@angular/material/icon';
import {parseDate} from '../lib/date-utils';

type PeriodoOpcao = '7d' | '30d' | '90d' | 'tudo';

interface ItemRanking {
  id: string;
  nome: string;
  patrimonio: string;
  categoriaNome: string;
  total: number;
}

@Component({
  selector: 'app-r15-relatorios',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatIconModule],
  template: `
    <div class="space-y-8 font-['Sora',sans-serif] max-w-7xl">
      <!-- Cabeçalho com Seletor de Período e Sininho (Wireframe R15) -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-[#0E1A3A]">
            Relatórios
          </h1>
          <p class="text-xs text-slate-500 mt-1">
            Indicadores de circulação, índice de atrasos e ocorrências por equipamento
          </p>
        </div>

        <div class="flex items-center gap-3">
          <!-- Seletor de Período (Wireframe R15: Últimos 30 dias v) -->
          <div class="relative">
            <select
              [value]="periodoSelecionado()"
              (change)="periodoSelecionado.set($any($event.target).value)"
              class="appearance-none bg-white border-2 border-slate-800 rounded-xl px-4 py-2 pr-9 text-xs font-bold text-[#0E1A3A] focus:outline-hidden focus:ring-2 focus:ring-[#2F6BFF] cursor-pointer shadow-2xs"
            >
              <option value="7d">Últimos 7 dias</option>
              <option value="30d">Últimos 30 dias</option>
              <option value="90d">Últimos 90 dias</option>
              <option value="tudo">Tudo</option>
            </select>
            <div class="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none text-slate-700">
              <mat-icon class="text-sm w-4 h-4 flex items-center justify-center">expand_more</mat-icon>
            </div>
          </div>
        </div>
      </div>

      <!-- Linha Superior: Itens Mais Emprestados | Atrasos (Wireframe R15) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <!-- Bloco 1: Itens Mais Emprestados com Gráfico de Barras (Wireframe R15) -->
        <div class="lg:col-span-6 bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-4">
          <div class="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 class="text-base font-bold text-[#0E1A3A]">
              Itens mais emprestados
            </h2>
            <span class="text-[11px] text-slate-400 font-medium">
              Ranking no período
            </span>
          </div>

          <!-- Gráfico de Barras Horizontais com Recharts-style CSS/SVG -->
          <div class="space-y-4 pt-2">
            @for (item of rankingMaisEmprestados(); track item.id) {
              @let perc = getPorcentagemBarra(item.total);
              <div
                tabindex="0"
                role="button"
                (click)="abrirItem(item.id)"
                (keydown.enter)="abrirItem(item.id)"
                class="group cursor-pointer select-none space-y-1.5"
                title="Ver detalhes de {{ item.nome }} (R9)"
              >
                <div class="flex items-center justify-between text-xs">
                  <span class="font-bold text-slate-800 group-hover:text-[#2F6BFF] transition-colors truncate max-w-[240px]">
                    {{ item.nome }}
                  </span>
                  <span class="font-mono font-bold text-slate-700 tabular-nums">
                    {{ item.total }} {{ item.total === 1 ? 'vez' : 'vezes' }}
                  </span>
                </div>

                <!-- Barra com Moldura e Preenchimento Cinza (Wireframe R15) -->
                <div class="w-full bg-slate-100 rounded-lg h-7 p-1 border border-slate-200 overflow-hidden relative">
                  <div
                    class="h-full bg-slate-300 group-hover:bg-[#2F6BFF]/40 border border-slate-400/80 rounded transition-all duration-500 ease-out flex items-center justify-end px-2"
                    [style.width.%]="perc"
                  >
                    @if (perc > 15) {
                      <span class="text-[10px] font-mono font-bold text-slate-700">
                        {{ item.total }}
                      </span>
                    }
                  </div>
                </div>
              </div>
            } @empty {
              <div class="p-8 text-center text-xs text-slate-400 italic">
                Nenhum empréstimo registrado no período selecionado.
              </div>
            }
          </div>
        </div>

        <!-- Bloco 2: Atrasos (Wireframe R15) -->
        <div class="lg:col-span-6 bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-5">
          <div class="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 class="text-base font-bold text-[#0E1A3A]">
              Atrasos
            </h2>
          </div>

          <!-- Métricas: Agora: X | No período: Y (Wireframe R15) -->
          <div class="flex items-center gap-8 text-sm">
            <div>
              <span class="text-xs text-slate-500 block">Agora:</span>
              <strong class="text-2xl font-black text-rose-600 tabular-nums">
                {{ atrasosAgoraCount() }}
              </strong>
            </div>

            <div class="h-8 w-px bg-slate-200"></div>

            <div>
              <span class="text-xs text-slate-500 block">No período:</span>
              <strong class="text-2xl font-black text-[#0E1A3A] tabular-nums">
                {{ atrasosNoPeriodoCount() }}
              </strong>
            </div>
          </div>

          <!-- Tabela de Atrasos Desktop (hidden sm:block) -->
          <div class="hidden sm:block overflow-x-auto rounded-xl border border-slate-200">
            <table class="w-full text-xs text-left">
              <thead class="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold select-none">
                <tr>
                  <th class="p-3 w-2/5">Pessoa</th>
                  <th class="p-3 w-2/5">Item</th>
                  <th class="p-3 text-right w-1/5">Dias</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                @for (atraso of listaAtrasos(); track atraso.id) {
                  @let user = getUsuario(atraso.usuarioId);
                  @let it = getItem(atraso.itemId);
                  <tr class="hover:bg-slate-50/70 transition-colors">
                    <td class="p-3 font-medium text-slate-800">
                      {{ user?.nome || 'Usuário' }}
                    </td>
                    <td class="p-3">
                      <a
                        [routerLink]="['/painel/itens', atraso.itemId]"
                        class="text-[#2F6BFF] hover:underline font-bold"
                        title="Ver detalhes do item (R9)"
                      >
                        {{ it?.nome || 'Item' }}
                      </a>
                    </td>
                    <td class="p-3 text-right font-mono font-bold text-rose-600 tabular-nums">
                      {{ atraso.diasAtraso }} d
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="3" class="p-6 text-center text-xs text-slate-400 italic">
                      Nenhum atraso registrado no período.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Lista de Cartões de Atrasos Mobile (sm:hidden) -->
          <div class="sm:hidden space-y-2.5">
            @for (atraso of listaAtrasos(); track atraso.id) {
              @let user = getUsuario(atraso.usuarioId);
              @let it = getItem(atraso.itemId);
              <div class="p-3 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between text-xs gap-2">
                <div class="min-w-0">
                  <strong class="font-bold text-[#0E1A3A] block truncate">{{ user?.nome || 'Usuário' }}</strong>
                  <a
                    [routerLink]="['/painel/itens', atraso.itemId]"
                    class="text-[#2F6BFF] hover:underline font-semibold text-[11px] block truncate"
                  >
                    {{ it?.nome || 'Item' }}
                  </a>
                </div>
                <span class="px-2 py-1 rounded-md bg-rose-50 border border-rose-200 text-rose-700 font-mono font-bold shrink-0">
                  {{ atraso.diasAtraso }} d atraso
                </span>
              </div>
            } @empty {
              <div class="p-6 text-center text-xs text-slate-400 italic">
                Nenhum atraso registrado no período.
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Bloco 3: Itens com Mais Defeitos (Wireframe R15) -->
      <div class="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-4">
        <div class="flex items-center justify-between pb-2 border-b border-slate-100">
          <h2 class="text-base font-bold text-[#0E1A3A]">
            Itens com mais defeitos
          </h2>
          <span class="text-[11px] text-slate-400 font-medium">
            Histórico de avarias e ocorrências (RN07)
          </span>
        </div>

        <!-- Tabela Defeitos Desktop (hidden sm:block) -->
        <div class="hidden sm:block overflow-x-auto rounded-xl border border-slate-200">
          <table class="w-full text-xs text-left">
            <thead class="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold select-none">
              <tr>
                <th class="p-3.5 w-2/5">Item</th>
                <th class="p-3.5 w-2/5">Categoria</th>
                <th class="p-3.5 text-right w-1/5">Ocorrências</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @for (def of rankingDefeitos(); track def.id) {
                <tr class="hover:bg-slate-50/70 transition-colors">
                  <td class="p-3.5">
                    <a
                      [routerLink]="['/painel/itens', def.id]"
                      class="text-[#2F6BFF] hover:underline font-bold inline-block"
                      title="Ver ficha do equipamento (R9)"
                    >
                      {{ def.nome }}
                    </a>
                    <span class="block text-[10px] font-mono text-slate-400 mt-0.5">
                      {{ def.patrimonio }}
                    </span>
                  </td>
                  <td class="p-3.5 text-slate-700 font-medium">
                    {{ def.categoriaNome }}
                  </td>
                  <td class="p-3.5 text-right font-mono font-bold text-amber-700 tabular-nums">
                    {{ def.total }}
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="3" class="p-8 text-center text-xs text-slate-400 italic">
                    Nenhum defeito registrado nos equipamentos.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Lista de Cartões de Defeitos Mobile (sm:hidden) -->
        <div class="sm:hidden space-y-2.5">
          @for (def of rankingDefeitos(); track def.id) {
            <div class="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between text-xs gap-3">
              <div class="min-w-0">
                <a
                  [routerLink]="['/painel/itens', def.id]"
                  class="font-bold text-[#0E1A3A] hover:text-[#2F6BFF] block truncate"
                >
                  {{ def.nome }}
                </a>
                <span class="text-[10px] text-slate-400 font-mono block">{{ def.patrimonio }} · {{ def.categoriaNome }}</span>
              </div>
              <span class="px-2 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-800 font-mono font-bold shrink-0">
                {{ def.total }} {{ def.total === 1 ? 'defeito' : 'defeitos' }}
              </span>
            </div>
          } @empty {
            <div class="p-6 text-center text-xs text-slate-400 italic">
              Nenhum defeito registrado nos equipamentos.
            </div>
          }
        </div>
      </div>

      <!-- Nota de Rodapé explicativa conforme Wireframe R15 -->
      <div class="text-center text-xs text-slate-500 pt-2">
        <span class="text-rose-600 font-semibold">•</span>
        <span class="ml-1">clicar em um item dos rankings leva à ficha do item (<strong>R9</strong>)</span>
      </div>
    </div>
  `,
})
export class R15Relatorios {
  readonly store = inject(NexusStore);
  private readonly router = inject(Router);

  readonly periodoSelecionado = signal<PeriodoOpcao>('30d');

  private getFiltroDataMs(): number {
    const agora = this.store.agora().getTime();
    switch (this.periodoSelecionado()) {
      case '7d':
        return agora - 7 * 24 * 60 * 60 * 1000;
      case '30d':
        return agora - 30 * 24 * 60 * 60 * 1000;
      case '90d':
        return agora - 90 * 24 * 60 * 60 * 1000;
      case 'tudo':
      default:
        return 0;
    }
  }

  // Empréstimos filtrados pelo período selecionado
  readonly emprestimosPeriodo = computed(() => {
    const minMs = this.getFiltroDataMs();
    return this.store.emprestimos().filter((e) => {
      const ms = parseDate(e.retiradoEm).getTime();
      return ms >= minMs;
    });
  });

  // Ocorrências filtradas pelo período selecionado
  readonly ocorrenciasPeriodo = computed(() => {
    const minMs = this.getFiltroDataMs();
    return this.store.ocorrencias().filter((o) => {
      const ms = parseDate(o.criadoEm).getTime();
      return ms >= minMs;
    });
  });

  // 1. Ranking dos Itens Mais Emprestados
  readonly rankingMaisEmprestados = computed<ItemRanking[]>(() => {
    const emps = this.emprestimosPeriodo();
    const contagemPorItem = new Map<string, number>();

    emps.forEach((e) => {
      contagemPorItem.set(e.itemId, (contagemPorItem.get(e.itemId) || 0) + 1);
    });

    const resultado: ItemRanking[] = [];
    contagemPorItem.forEach((total, itemId) => {
      const it = this.store.itens().find((i) => i.id === itemId);
      if (it) {
        const cat = this.store.categorias().find((c) => c.id === it.categoriaId);
        resultado.push({
          id: it.id,
          nome: it.nome,
          patrimonio: it.patrimonio,
          categoriaNome: cat?.nome || '—',
          total,
        });
      }
    });

    return resultado.sort((a, b) => b.total - a.total).slice(0, 5);
  });

  readonly maxEmprestimosRanking = computed(() => {
    const r = this.rankingMaisEmprestados();
    return r.length > 0 ? r[0].total : 1;
  });

  getPorcentagemBarra(total: number): number {
    const max = this.maxEmprestimosRanking();
    return Math.max(12, Math.round((total / max) * 100));
  }

  // 2. Atrasos: Agora e No Período
  readonly atrasosAgoraCount = computed(() => {
    return this.store.emprestimos().filter((e) => !e.devolvidoEm && e.diasAtraso > 0).length;
  });

  readonly atrasosNoPeriodoCount = computed(() => {
    return this.emprestimosPeriodo().filter((e) => e.diasAtraso > 0).length;
  });

  readonly listaAtrasos = computed(() => {
    return this.emprestimosPeriodo().filter((e) => e.diasAtraso > 0);
  });

  // 3. Ranking de Itens com Mais Defeitos
  readonly rankingDefeitos = computed<ItemRanking[]>(() => {
    const ocorrs = this.ocorrenciasPeriodo();
    const contagemDefeitos = new Map<string, number>();

    ocorrs.forEach((o) => {
      contagemDefeitos.set(o.itemId, (contagemDefeitos.get(o.itemId) || 0) + 1);
    });

    const resultado: ItemRanking[] = [];
    contagemDefeitos.forEach((total, itemId) => {
      const it = this.store.itens().find((i) => i.id === itemId);
      if (it) {
        const cat = this.store.categorias().find((c) => c.id === it.categoriaId);
        resultado.push({
          id: it.id,
          nome: it.nome,
          patrimonio: it.patrimonio,
          categoriaNome: cat?.nome || '—',
          total,
        });
      }
    });

    return resultado.sort((a, b) => b.total - a.total).slice(0, 5);
  });

  getUsuario(id?: string) {
    if (!id) return undefined;
    return this.store.usuarios().find((u) => u.id === id);
  }

  getItem(id?: string) {
    if (!id) return undefined;
    return this.store.itens().find((i) => i.id === id);
  }

  abrirItem(id: string) {
    this.router.navigate(['/painel/itens', id]);
  }
}
