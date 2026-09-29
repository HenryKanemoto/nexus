import {ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {NexusStore} from '../store/nexus.store';
import {MatIconModule} from '@angular/material/icon';
import {StatusBadge} from '../components/status-badge/status-badge';

@Component({
  selector: 'app-r7-itens',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatIconModule, StatusBadge],
  template: `
    <div class="space-y-6 font-['Sora',sans-serif] max-w-7xl">
      <!-- Cabeçalho (Wireframe R7) -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-[#0E1A3A]">
            Itens
          </h1>
          <p class="text-xs text-slate-500 mt-1">
            Gestão do patrimônio escolar, controle de estoque e status em tempo real
          </p>
        </div>

        <div class="flex items-center gap-3">
          <!-- Botão "+ Novo item" -> R8 -->
          <a
            routerLink="/painel/itens/novo"
            class="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-900 border border-slate-300 font-bold text-xs flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
          >
            <mat-icon class="text-sm w-4 h-4 flex items-center justify-center">add</mat-icon>
            <span>+ Novo item</span>
          </a>

          <!-- Sininho -> R17 -->
          <a
            routerLink="/painel/notificacoes"
            class="relative p-2 rounded-xl text-slate-600 hover:text-[#0E1A3A] hover:bg-slate-100 transition-colors"
            title="Notificações"
          >
            <mat-icon class="text-2xl">notifications</mat-icon>
            @if (store.totalNaoLidas() > 0) {
              <span class="absolute top-1 right-1 flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold tabular-nums ring-2 ring-white">
                {{ store.totalNaoLidas() }}
              </span>
            }
          </a>
        </div>
      </div>

      <!-- Barra de Filtros (Wireframe R7: Nome ou patrimônio | Categoria | Situação) -->
      <div class="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <!-- Busca por Nome ou Patrimônio -->
        <div class="sm:col-span-6 relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <mat-icon class="text-base w-4 h-4 flex items-center justify-center">search</mat-icon>
          </div>
          <input
            type="text"
            [value]="termoBusca()"
            (input)="termoBusca.set($any($event.target).value)"
            placeholder="Nome ou patrimônio"
            class="block w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:border-[#2F6BFF] focus:outline-hidden focus:ring-1 focus:ring-[#2F6BFF]"
          />
        </div>

        <!-- Filtro por Categoria -->
        <div class="sm:col-span-3">
          <select
            [value]="categoriaSelecionada()"
            (change)="categoriaSelecionada.set($any($event.target).value)"
            class="block w-full py-2.5 px-3 rounded-xl border border-slate-300 bg-white text-xs text-slate-700 focus:border-[#2F6BFF] focus:outline-hidden focus:ring-1 focus:ring-[#2F6BFF] cursor-pointer"
          >
            <option value="todas">Todas as categorias</option>
            @for (cat of store.categorias(); track cat.id) {
              <option [value]="cat.id">{{ cat.nome }}</option>
            }
          </select>
        </div>

        <!-- Filtro por Situação -->
        <div class="sm:col-span-3">
          <select
            [value]="situacaoSelecionada()"
            (change)="situacaoSelecionada.set($any($event.target).value)"
            class="block w-full py-2.5 px-3 rounded-xl border border-slate-300 bg-white text-xs text-slate-700 focus:border-[#2F6BFF] focus:outline-hidden focus:ring-1 focus:ring-[#2F6BFF] cursor-pointer"
          >
            <option value="todas">Todas as situações</option>
            <option value="disponivel">Disponível</option>
            <option value="solicitado">Solicitado</option>
            <option value="reservado">Reservado</option>
            <option value="emprestado">Emprestado</option>
            <option value="atrasado">Atrasado</option>
            <option value="manutencao">Manutenção</option>
          </select>
        </div>
      </div>

      <!-- Tabela Desktop (hidden sm:block) -->
      <div class="hidden sm:block bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-xs text-left">
            <thead class="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold select-none">
              <tr>
                <th class="p-3.5 w-2/5">Nome</th>
                <th class="p-3.5 w-1/4">Categoria</th>
                <th class="p-3.5 w-1/5">Patrimônio</th>
                <th class="p-3.5 text-right">Situação</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @for (item of itensFiltrados(); track item.id) {
                @let cat = getCategoria(item.categoriaId);
                <tr
                  tabindex="0"
                  role="button"
                  (click)="abrirItem(item.id)"
                  (keydown.enter)="abrirItem(item.id)"
                  class="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                >
                  <td class="p-3.5">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-600 group-hover:text-[#2F6BFF] transition-colors">
                        <mat-icon class="text-base w-4 h-4 flex items-center justify-center">{{ getIconeCategoria(item.categoriaId) }}</mat-icon>
                      </div>
                      <div>
                        <strong class="font-bold text-[#0E1A3A] group-hover:text-[#2F6BFF] transition-colors">
                          {{ item.nome }}
                        </strong>
                        <span class="block text-[10px] text-slate-400 font-mono">
                          QR: {{ item.codigoQr }}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td class="p-3.5 text-slate-700 font-medium">
                    {{ cat?.nome || '—' }}
                  </td>
                  <td class="p-3.5 font-mono text-slate-800 font-bold">
                    {{ item.patrimonio }}
                  </td>
                  <td class="p-3.5 text-right">
                    <app-status-badge [status]="item.status"></app-status-badge>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="4" class="p-10 text-center text-xs text-slate-400 italic">
                    Nenhum item encontrado com os filtros selecionados.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Lista de Cartões para Mobile (sm:hidden) -->
      <div class="sm:hidden space-y-3">
        @for (item of itensFiltrados(); track item.id) {
          @let cat = getCategoria(item.categoriaId);
          <div
            tabindex="0"
            role="button"
            (click)="abrirItem(item.id)"
            (keydown.enter)="abrirItem(item.id)"
            class="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2.5 cursor-pointer active:bg-slate-50 transition-colors"
          >
            <div class="flex items-start justify-between gap-2">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
                  <mat-icon class="text-lg w-5 h-5 flex items-center justify-center">{{ getIconeCategoria(item.categoriaId) }}</mat-icon>
                </div>
                <div>
                  <strong class="font-bold text-sm text-[#0E1A3A] block">
                    {{ item.nome }}
                  </strong>
                  <span class="font-mono text-[10px] text-slate-400 block">{{ item.patrimonio }}</span>
                </div>
              </div>
              <app-status-badge [status]="item.status"></app-status-badge>
            </div>

            <div class="flex items-center justify-between text-xs pt-2 border-t border-slate-100 text-slate-600">
              <span>Categoria: <strong class="text-slate-700 font-semibold">{{ cat?.nome || '—' }}</strong></span>
              <span class="font-mono text-[10px] text-slate-400">QR: {{ item.codigoQr }}</span>
            </div>

            <div class="text-[11px] text-[#2F6BFF] font-bold flex items-center justify-end gap-1 pt-0.5">
              <span>Ver detalhes e histórico</span>
              <mat-icon class="text-xs w-3.5 h-3.5 flex items-center justify-center">chevron_right</mat-icon>
            </div>
          </div>
        } @empty {
          <div class="p-8 rounded-2xl bg-white border border-slate-200 text-center text-xs text-slate-400 italic">
            Nenhum item encontrado com os filtros selecionados.
          </div>
        }
      </div>

      <div class="p-3.5 bg-white sm:bg-slate-50/50 rounded-xl sm:rounded-2xl border border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
        <span>Total: <strong>{{ itensFiltrados().length }}</strong> equipamento(s)</span>
        <span class="text-[10px] italic text-slate-400">Clique na linha para ver os detalhes (R9)</span>
      </div>
    </div>
  `,
})
export class R7Itens {
  readonly store = inject(NexusStore);
  private readonly router = inject(Router);

  readonly termoBusca = signal('');
  readonly categoriaSelecionada = signal('todas');
  readonly situacaoSelecionada = signal('todas');

  readonly itensFiltrados = computed(() => {
    const termo = this.termoBusca().trim().toLowerCase();
    const catId = this.categoriaSelecionada();
    const situacao = this.situacaoSelecionada();

    return this.store.itens().filter((item) => {
      // Filtro de texto por nome ou patrimônio
      if (termo) {
        const nomeMatch = item.nome.toLowerCase().includes(termo);
        const patriMatch = item.patrimonio.toLowerCase().includes(termo);
        const qrMatch = item.codigoQr.toLowerCase().includes(termo);
        if (!nomeMatch && !patriMatch && !qrMatch) {
          return false;
        }
      }

      // Filtro por categoria
      if (catId !== 'todas' && item.categoriaId !== catId) {
        return false;
      }

      // Filtro por situação
      if (situacao !== 'todas' && item.status !== situacao) {
        return false;
      }

      return true;
    });
  });

  getCategoria(id: string) {
    return this.store.categorias().find((c) => c.id === id);
  }

  abrirItem(id: string) {
    // Redireciona para R9 Detalhes do item
    this.router.navigate(['/painel/itens', id]);
  }

  getIconeCategoria(categoriaId: string): string {
    switch (categoriaId) {
      case 'cat-projetores':
        return 'videocam';
      case 'cat-notebooks':
        return 'laptop_chromebook';
      case 'cat-eletronica':
        return 'developer_board';
      case 'cat-ferramentas':
        return 'handyman';
      case 'cat-laboratorio':
        return 'biotech';
      default:
        return 'inventory_2';
    }
  }
}
