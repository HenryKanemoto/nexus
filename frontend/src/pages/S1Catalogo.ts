import {ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';
import {RouterLink} from '@angular/router';
import {NexusStore} from '../store/nexus.store';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-s1-catalogo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatIconModule],
  template: `
    <div class="space-y-6 font-['Sora',sans-serif]">
      <!-- Aviso de Restrição de Conta (se bloqueada ou suspensa) -->
      @if (usuario(); as u) {
        @if (u.status === 'bloqueada') {
          <div class="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-3">
            <mat-icon class="text-rose-600 shrink-0 mt-0.5">lock</mat-icon>
            <div>
              <strong class="font-bold">Conta Bloqueada por Pendência de Atraso:</strong>
              <p class="mt-0.5 text-rose-700">
                Você possui itens com devolução em atraso. É possível visualizar os itens do catálogo, mas novas solicitações estão suspensas até a devolução na coordenação.
              </p>
            </div>
          </div>
        } @else if (u.status === 'suspensa') {
          <div class="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-3">
            <mat-icon class="text-amber-600 shrink-0 mt-0.5">hourglass_empty</mat-icon>
            <div>
              <strong class="font-bold">Conta Temporariamente Suspensa:</strong>
              <p class="mt-0.5 text-amber-700">
                Pela política de empréstimos, sua conta está suspensa e impedida de solicitar novos itens até o término do prazo.
              </p>
            </div>
          </div>
        }
      }

      <!-- Título da Tela (Wireframe S1) -->
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-[#0E1A3A]">
          Catálogo
        </h1>
        <p class="text-xs text-slate-500 mt-1">
          Materiais e equipamentos disponíveis para solicitação de empréstimo
        </p>
      </div>

      <!-- Barra de Busca e Filtro de Categoria (Wireframe S1) -->
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <!-- Input de Busca -->
        <div class="relative flex-1 rounded-xl shadow-2xs">
          <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <mat-icon class="text-lg w-5 h-5 flex items-center justify-center">search</mat-icon>
          </div>
          <input
            type="text"
            [value]="termoBusca()"
            (input)="termoBusca.set($any($event.target).value)"
            placeholder="Buscar item pelo nome..."
            class="block w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#2F6BFF] focus:outline-hidden focus:ring-1 focus:ring-[#2F6BFF]"
          />
          @if (termoBusca()) {
            <button
              type="button"
              (click)="termoBusca.set('')"
              class="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <mat-icon class="text-base w-4 h-4 flex items-center justify-center">close</mat-icon>
            </button>
          }
        </div>

        <!-- Seletor de Categoria -->
        <div class="relative min-w-[200px] sm:w-64">
          <select
            [value]="categoriaSelecionada()"
            (change)="categoriaSelecionada.set($any($event.target).value)"
            class="block w-full appearance-none rounded-xl border border-slate-300 bg-white py-2.5 pl-3.5 pr-10 text-sm text-slate-800 shadow-2xs focus:border-[#2F6BFF] focus:outline-hidden focus:ring-1 focus:ring-[#2F6BFF] cursor-pointer"
          >
            <option value="todas">Todas as categorias</option>
            @for (cat of store.categorias(); track cat.id) {
              <option [value]="cat.id">{{ cat.nome }}</option>
            }
          </select>
          <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500">
            <mat-icon class="text-lg w-5 h-5 flex items-center justify-center">expand_more</mat-icon>
          </div>
        </div>
      </div>

      <!-- Grade de Cartões (Wireframe S1) -->
      @if (itensFiltrados().length > 0) {
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 pt-2">
          @for (item of itensFiltrados(); track item.id) {
            @let cat = getCategoria(item.categoriaId);
            <a
              [routerLink]="['/item', item.id]"
              class="group bg-white rounded-2xl border border-slate-200/90 overflow-hidden hover:border-[#2F6BFF]/40 hover:shadow-md transition-all flex flex-col cursor-pointer"
            >
              <!-- Área Visual / Foto Ilustrativa com Ícone e Borda Interna -->
              <div class="aspect-4/3 bg-slate-50 border-b border-slate-100 flex items-center justify-center relative group-hover:bg-blue-50/40 transition-colors p-6">
                <!-- Ilustração estilizada baseada na categoria -->
                <div class="w-16 h-16 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-center text-[#0E1A3A] group-hover:text-[#2F6BFF] group-hover:scale-105 transition-all">
                  <mat-icon class="text-3xl">{{ getIconeCategoria(item.categoriaId) }}</mat-icon>
                </div>
                <!-- Tag de Patrimônio discreta -->
                <span class="absolute top-2.5 right-2.5 font-mono text-[10px] text-slate-400 bg-white/90 px-1.5 py-0.5 rounded border border-slate-100">
                  {{ item.patrimonio }}
                </span>
              </div>

              <!-- Informações do Cartão -->
              <div class="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 class="font-bold text-sm text-[#0E1A3A] group-hover:text-[#2F6BFF] transition-colors line-clamp-1 leading-snug">
                    {{ item.nome }}
                  </h3>
                  <p class="text-xs text-slate-500 mt-0.5">
                    {{ cat?.nome || 'Geral' }}
                  </p>
                </div>

                <div class="pt-2 border-t border-slate-100 text-xs text-slate-600 flex items-center justify-between">
                  <span>Prazo máx.:</span>
                  <strong class="font-semibold text-slate-800">
                    {{ cat?.prazoMaxDias }} {{ cat?.prazoMaxDias === 1 ? 'dia' : 'dias' }}
                  </strong>
                </div>
              </div>
            </a>
          }
        </div>
      } @else {
        <!-- Estado Vazio (conforme especificado no Wireframe S1) -->
        <div class="py-16 px-4 rounded-2xl border border-dashed border-slate-300 bg-white text-center space-y-3">
          <div class="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <mat-icon class="text-2xl">search_off</mat-icon>
          </div>
          <h3 class="text-sm font-semibold text-slate-700">
            Nenhum item disponível nessa categoria agora
          </h3>
          <p class="text-xs text-slate-500 max-w-sm mx-auto">
            Todos os itens podem estar em empréstimo ou em manutenção. Tente selecionar outra categoria ou verificar novamente mais tarde.
          </p>
          @if (termoBusca() || categoriaSelecionada() !== 'todas') {
            <button
              type="button"
              (click)="limparFiltros()"
              class="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              <mat-icon class="text-xs w-3.5 h-3.5 flex items-center justify-center">restart_alt</mat-icon>
              Limpar filtros
            </button>
          }
        </div>
      }
    </div>
  `,
})
export class S1Catalogo {
  readonly store = inject(NexusStore);

  readonly termoBusca = signal('');
  readonly categoriaSelecionada = signal<string>('todas');

  readonly usuario = computed(() => this.store.usuarioLogado());

  /**
   * RN09: Somente itens com status "disponivel" aparecem no catálogo.
   */
  readonly itensFiltrados = computed(() => {
    // store.itensCatalogo() já filtra por status === 'disponivel'
    let lista = this.store.itensCatalogo();

    const catId = this.categoriaSelecionada();
    if (catId !== 'todas') {
      lista = lista.filter((i) => i.categoriaId === catId);
    }

    const busca = this.termoBusca().trim().toLowerCase();
    if (busca) {
      lista = lista.filter(
        (i) =>
          i.nome.toLowerCase().includes(busca) ||
          i.descricao.toLowerCase().includes(busca) ||
          i.patrimonio.toLowerCase().includes(busca)
      );
    }

    return lista;
  });

  getCategoria(categoriaId: string) {
    return this.store.categorias().find((c) => c.id === categoriaId);
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

  limparFiltros() {
    this.termoBusca.set('');
    this.categoriaSelecionada.set('todas');
  }
}
