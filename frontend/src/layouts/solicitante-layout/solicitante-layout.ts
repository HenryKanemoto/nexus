import {ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';
import {Router, RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {NexusStore} from '../../store/nexus.store';
import {RelogioFlutuante} from '../../components/relogio-flutuante/relogio-flutuante';

@Component({
  selector: 'app-solicitante-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatIconModule, RelogioFlutuante],
  template: `
    <div class="min-h-screen flex flex-col bg-[#F6F7FB] text-[#0E1A3A] font-['Sora',sans-serif]">
      <!-- Cabeçalho do Solicitante (Compacto no Mobile) -->
      <header class="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200/80 shadow-2xs">
        <div class="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 h-15 sm:h-16 flex items-center justify-between">
          <!-- Logo & Navegação Primária Desktop -->
          <div class="flex items-center gap-4 sm:gap-8 min-w-0">
            <a routerLink="/catalogo" class="flex items-center gap-2 group shrink-0">
              <img
                src="/leve_horizontal_fundo_escuro.png"
                alt="Nexus"
                class="h-7 sm:h-8 w-auto object-contain rounded-md"
              />
              <span class="hidden sm:inline-block text-[10px] font-bold uppercase tracking-widest text-[#2F6BFF] bg-blue-50 px-2 py-0.5 rounded">
                Acervo
              </span>
            </a>

            <!-- Links de Navegação Desktop -->
            <nav class="hidden md:flex items-center gap-1">
              <a
                routerLink="/catalogo"
                routerLinkActive="bg-[#2F6BFF]/10 text-[#2F6BFF] font-semibold"
                class="px-3.5 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-[#2F6BFF] hover:bg-slate-100/70 transition-all flex items-center gap-2"
              >
                <mat-icon class="text-base w-4 h-4 flex items-center justify-center">category</mat-icon>
                Catálogo
              </a>
              <a
                routerLink="/meus-emprestimos"
                routerLinkActive="bg-[#2F6BFF]/10 text-[#2F6BFF] font-semibold"
                class="px-3.5 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-[#2F6BFF] hover:bg-slate-100/70 transition-all flex items-center gap-2"
              >
                <mat-icon class="text-base w-4 h-4 flex items-center justify-center">assignment</mat-icon>
                Meus empréstimos
              </a>
            </nav>
          </div>

          <!-- Direita: Notificações & Perfil -->
          <div class="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <!-- Sininho com contador de não lidas -->
            <a
              routerLink="/notificacoes"
              class="relative p-2 rounded-xl text-slate-600 hover:text-[#0E1A3A] hover:bg-slate-100 transition-colors"
              title="Notificações"
            >
              <mat-icon class="text-xl">notifications</mat-icon>
              @if (totalNaoLidas() > 0) {
                <span
                  class="absolute top-1 right-1 flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold tabular-nums ring-2 ring-white"
                >
                  {{ totalNaoLidas() }}
                </span>
              }
            </a>

            <!-- Menu Avatar do Usuário -->
            <div class="relative">
              <button
                type="button"
                (click)="toggleMenu()"
                class="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 transition-all cursor-pointer border border-transparent hover:border-slate-200"
              >
                <div class="w-8 h-8 rounded-lg bg-[#2F6BFF] text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                  {{ iniciaisNome() }}
                </div>
                <div class="hidden sm:block text-left text-xs">
                  <p class="font-semibold text-[#0E1A3A] leading-tight truncate max-w-[120px]">
                    {{ usuario()?.nome || 'Usuário' }}
                  </p>
                  <p class="text-slate-500 capitalize text-[10px]">
                    {{ usuario()?.perfil }}
                  </p>
                </div>
                <mat-icon class="text-slate-400 text-sm hidden xs:block">expand_more</mat-icon>
              </button>

              <!-- Dropdown do Avatar -->
              @if (menuAberto()) {
                <div
                  class="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150"
                >
                  <div class="px-3.5 py-2.5 border-b border-slate-100">
                    <p class="text-xs font-bold text-[#0E1A3A] truncate">{{ usuario()?.nome }}</p>
                    <p class="text-[11px] text-slate-500 truncate">{{ usuario()?.email }}</p>
                    <p class="text-[10px] font-mono text-slate-400 mt-0.5">Matrícula: {{ usuario()?.matricula }}</p>
                  </div>

                  <a
                    routerLink="/perfil"
                    (click)="menuAberto.set(false)"
                    class="w-full text-left px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#2F6BFF] flex items-center gap-2 transition-colors"
                  >
                    <mat-icon class="text-sm w-4 h-4 flex items-center justify-center">account_circle</mat-icon>
                    Meu perfil
                  </a>

                  <button
                    type="button"
                    (click)="sair()"
                    class="w-full text-left px-3.5 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors cursor-pointer border-t border-slate-100"
                  >
                    <mat-icon class="text-sm w-4 h-4 flex items-center justify-center text-rose-600">logout</mat-icon>
                    Sair
                  </button>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Barra de Navegação Compacta Mobile (360px+) -->
        <div class="md:hidden border-t border-slate-100 px-2 py-1.5 flex items-center justify-around bg-slate-50/80">
          <a
            routerLink="/catalogo"
            routerLinkActive="text-[#2F6BFF] font-bold bg-blue-50/80"
            class="flex-1 text-center text-xs text-slate-600 rounded-lg py-1.5 px-2 flex items-center justify-center gap-1.5 transition-colors"
          >
            <mat-icon class="text-sm w-4 h-4 flex items-center justify-center">category</mat-icon>
            <span>Catálogo</span>
          </a>

          <div class="w-px h-4 bg-slate-200"></div>

          <a
            routerLink="/meus-emprestimos"
            routerLinkActive="text-[#2F6BFF] font-bold bg-blue-50/80"
            class="flex-1 text-center text-xs text-slate-600 rounded-lg py-1.5 px-2 flex items-center justify-center gap-1.5 transition-colors"
          >
            <mat-icon class="text-sm w-4 h-4 flex items-center justify-center">assignment</mat-icon>
            <span>Empréstimos</span>
          </a>
        </div>
      </header>

      <!-- Conteúdo da Página -->
      <main class="flex-1 max-w-7xl w-full mx-auto p-3.5 sm:p-6 lg:p-8">
        <router-outlet></router-outlet>
      </main>

      <!-- Relógio Virtual Flutuante -->
      <app-relogio-flutuante></app-relogio-flutuante>
    </div>
  `,
})
export class SolicitanteLayout {
  readonly store = inject(NexusStore);
  private readonly router = inject(Router);

  readonly menuAberto = signal(false);

  readonly usuario = computed(() => this.store.usuarioLogado());
  readonly totalNaoLidas = computed(() => this.store.totalNaoLidas());

  readonly iniciaisNome = computed(() => {
    const nome = this.usuario()?.nome || 'Nexus';
    const partes = nome.trim().split(' ');
    if (partes.length >= 2) {
      return (partes[0][0] + partes[1][0]).toUpperCase();
    }
    return nome.slice(0, 2).toUpperCase();
  });

  toggleMenu() {
    this.menuAberto.update((v) => !v);
  }

  sair() {
    this.menuAberto.set(false);
    this.store.logout();
    this.router.navigate(['/login']);
  }
}
