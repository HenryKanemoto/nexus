import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {RouterLink} from '@angular/router';
import {NexusStore} from '../store/nexus.store';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-r10-categorias',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatIconModule],
  template: `
    <div class="space-y-6 font-['Sora',sans-serif] max-w-7xl">
      <!-- Cabeçalho (Wireframe R10) -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-[#0E1A3A]">
            Categorias
          </h1>
          <p class="text-xs text-slate-500 mt-1">
            Políticas por categoria: prazo máximo e limite simultâneo por pessoa
          </p>
        </div>

        <div class="flex items-center gap-3">
          <!-- Botão "+ Nova categoria" -> R11 -->
          <a
            routerLink="/painel/categorias/nova"
            class="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-900 border border-slate-300 font-bold text-xs flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
          >
            <mat-icon class="text-sm w-4 h-4 flex items-center justify-center">add</mat-icon>
            <span>+ Nova categoria</span>
          </a>
        </div>
      </div>

      <!-- Tabela Desktop (hidden sm:block) -->
      <div class="hidden sm:block bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-xs text-left">
            <thead class="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold select-none">
              <tr>
                <th class="p-4 w-2/5">Nome</th>
                <th class="p-4 w-1/5">Prazo máximo</th>
                <th class="p-4 w-1/5">Limite por pessoa</th>
                <th class="p-4 w-24 text-center">Itens</th>
                <th class="p-4 text-right w-24">Ação</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @for (cat of store.categorias(); track cat.id) {
                @let totalItens = contarItens(cat.id);
                <tr class="hover:bg-slate-50/70 transition-colors">
                  <td class="p-4">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-600">
                        <mat-icon class="text-base w-4 h-4 flex items-center justify-center">{{ getIconeCategoria(cat.id) }}</mat-icon>
                      </div>
                      <div>
                        <strong class="font-bold text-[#0E1A3A] text-xs sm:text-sm">
                          {{ cat.nome }}
                        </strong>
                        @if (cat.descricao) {
                          <span class="block text-[11px] text-slate-400 mt-0.5">
                            {{ cat.descricao }}
                          </span>
                        }
                      </div>
                    </div>
                  </td>
                  <td class="p-4 font-bold text-slate-800">
                    {{ cat.prazoMaxDias }} {{ cat.prazoMaxDias === 1 ? 'dia' : 'dias' }}
                  </td>
                  <td class="p-4 font-bold text-slate-800">
                    {{ cat.limitePorPessoa }} {{ cat.limitePorPessoa === 1 ? 'item' : 'itens' }}
                  </td>
                  <td class="p-4 text-center">
                    <span class="font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full text-[11px]">
                      {{ totalItens }}
                    </span>
                  </td>
                  <td class="p-4 text-right">
                    <a
                      [routerLink]="['/painel/categorias', cat.id, 'editar']"
                      class="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 hover:text-[#2F6BFF] text-slate-700 font-bold text-xs transition-colors shadow-2xs inline-flex items-center gap-1 cursor-pointer"
                    >
                      <mat-icon class="text-xs w-3.5 h-3.5 flex items-center justify-center">edit</mat-icon>
                      <span>Editar</span>
                    </a>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="5" class="p-8 text-center text-xs text-slate-400 italic">
                    Nenhuma categoria cadastrada.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Lista de Cartões para Mobile (sm:hidden) -->
      <div class="sm:hidden space-y-3">
        @for (cat of store.categorias(); track cat.id) {
          @let totalItens = contarItens(cat.id);
          <div class="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
            <div class="flex items-start justify-between gap-3">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
                  <mat-icon class="text-lg w-5 h-5 flex items-center justify-center">{{ getIconeCategoria(cat.id) }}</mat-icon>
                </div>
                <div>
                  <h3 class="font-bold text-sm text-[#0E1A3A]">{{ cat.nome }}</h3>
                  @if (cat.descricao) {
                    <p class="text-[11px] text-slate-400">{{ cat.descricao }}</p>
                  }
                </div>
              </div>

              <span class="font-mono text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full shrink-0">
                {{ totalItens }} {{ totalItens === 1 ? 'item' : 'itens' }}
              </span>
            </div>

            <div class="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
              <div class="p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span class="block text-[10px] text-slate-400 uppercase font-semibold">Prazo Máximo</span>
                <strong class="text-slate-800 font-bold">{{ cat.prazoMaxDias }} {{ cat.prazoMaxDias === 1 ? 'dia' : 'dias' }}</strong>
              </div>
              <div class="p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span class="block text-[10px] text-slate-400 uppercase font-semibold">Limite Pessoa</span>
                <strong class="text-slate-800 font-bold">{{ cat.limitePorPessoa }} {{ cat.limitePorPessoa === 1 ? 'item' : 'itens' }}</strong>
              </div>
            </div>

            <div class="pt-1 flex justify-end">
              <a
                [routerLink]="['/painel/categorias', cat.id, 'editar']"
                class="w-full py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <mat-icon class="text-xs w-4 h-4 flex items-center justify-center">edit</mat-icon>
                <span>Editar categoria</span>
              </a>
            </div>
          </div>
        } @empty {
          <div class="p-8 rounded-2xl bg-white border border-slate-200 text-center text-xs text-slate-400 italic">
            Nenhuma categoria cadastrada.
          </div>
        }
      </div>

      <div class="p-3.5 bg-white sm:bg-slate-50/50 rounded-xl sm:rounded-2xl border border-slate-200 text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-1 text-center sm:text-left">
        <span>Total: <strong>{{ store.categorias().length }}</strong> categoria(s)</span>
        <span class="text-[10px] text-slate-400">Alterações em prazos e limites valem para novos pedidos</span>
      </div>
    </div>
  `,
})
export class R10Categorias {
  readonly store = inject(NexusStore);

  contarItens(catId: string): number {
    return this.store.itens().filter((i) => i.categoriaId === catId).length;
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
        return 'category';
    }
  }
}
