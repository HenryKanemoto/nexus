import {ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';
import {Router, RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {NexusStore} from '../../store/nexus.store';
import {RelogioFlutuante} from '../../components/relogio-flutuante/relogio-flutuante';

interface NavItem {
  rotulo: string;
  rota: string;
  icone: string;
  badge?: () => number;
  badgeColor?: string;
}

@Component({
  selector: 'app-responsavel-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatIconModule, RelogioFlutuante],
  template: `
    <div class="min-h-screen flex bg-[#F6F7FB] text-[#0E1A3A] font-['Sora',sans-serif]">
      <!-- Backdrop para Mobile quando o Drawer estiver aberto -->
      @if (drawerAberto()) {
        <div
          tabindex="0"
          role="button"
          (click)="fecharDrawer()"
          (keydown.enter)="fecharDrawer()"
          class="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden transition-opacity cursor-pointer"
          aria-label="Fechar menu"
        ></div>
      }

      <!-- Menu Lateral Recolhível (Drawer no Mobile, Fixo no Desktop) -->
      <aside
        class="w-64 bg-[#0E1A3A] text-white flex-shrink-0 flex flex-col fixed inset-y-0 left-0 z-50 shadow-2xl lg:shadow-xl border-r border-slate-800 transition-transform duration-300 ease-in-out"
        [class.translate-x-0]="drawerAberto()"
        [class.-translate-x-full]="!drawerAberto()"
        [class.lg:translate-x-0]="true"
      >
        <!-- Topo do Drawer: Logo & Botão Fechar no Mobile -->
        <div class="h-16 px-6 flex items-center justify-between border-b border-white/10 shrink-0">
          <div class="flex items-center gap-2.5 min-w-0">
            <img
              src="/leve_horizontal_fundo_escuro.png"
              alt="Nexus"
              class="h-7 sm:h-8 w-auto object-contain rounded-md"
            />
            <span class="text-[10px] font-bold uppercase tracking-wider text-[#F2B705] bg-white/10 px-2 py-0.5 rounded shrink-0">
              Gestão
            </span>
          </div>

          <!-- Botão Fechar no Mobile -->
          <button
            type="button"
            (click)="fecharDrawer()"
            class="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 lg:hidden cursor-pointer"
            title="Fechar menu"
          >
            <mat-icon class="text-base w-5 h-5 flex items-center justify-center">close</mat-icon>
          </button>
        </div>

        <!-- Lista de Itens do Menu com fecharDrawer ao clicar -->
        <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          @for (item of menuItems; track item.rota) {
            <a
              [routerLink]="item.rota"
              (click)="fecharDrawer()"
              routerLinkActive="bg-[#2F6BFF] text-white font-semibold shadow-xs"
              [routerLinkActiveOptions]="{exact: item.rota === '/painel'}"
              class="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-white/10 transition-colors group cursor-pointer"
            >
              <div class="flex items-center gap-3">
                <mat-icon class="text-slate-400 group-hover:text-white group-[.bg-\\[\\#2F6BFF\\]]:text-white text-lg w-5 h-5 flex items-center justify-center">
                  {{ item.icone }}
                </mat-icon>
                <span>{{ item.rotulo }}</span>
              </div>

              @if (item.badge && item.badge() > 0) {
                <span
                  class="px-2 py-0.5 rounded-full text-[10px] font-bold tabular-nums {{ item.badgeColor || 'bg-amber-400 text-slate-900' }}"
                >
                  {{ item.badge() }}
                </span>
              }
            </a>
          }
        </nav>

        <!-- Rodapé do Menu Lateral: Usuário Ativo -->
        <div class="p-3 border-t border-white/10 bg-black/20 shrink-0">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2.5 min-w-0">
              <div class="w-8 h-8 rounded-lg bg-[#F2B705] text-[#0E1A3A] flex items-center justify-center font-bold text-xs shrink-0">
                MR
              </div>
              <div class="min-w-0">
                <p class="text-xs font-semibold text-white truncate">{{ store.usuarioLogado()?.nome }}</p>
                <p class="text-[10px] text-slate-400">Responsável</p>
              </div>
            </div>
            <button
              type="button"
              (click)="sair()"
              class="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Encerrar sessão"
            >
              <mat-icon class="text-sm w-4 h-4 flex items-center justify-center">logout</mat-icon>
            </button>
          </div>
        </div>
      </aside>

      <!-- Área de Conteúdo Principal (ml-0 no mobile, ml-64 no desktop) -->
      <div class="flex-1 flex flex-col min-w-0 ml-0 lg:ml-64 min-h-screen">
        <!-- Topo com Botão Hamburger para Mobile, Título e Sininho -->
        <header class="h-16 bg-white/95 backdrop-blur-sm border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
          <!-- Esquerda: Botão Hamburger (Mobile) + Título -->
          <div class="flex items-center gap-3 min-w-0">
            <button
              type="button"
              (click)="toggleDrawer()"
              class="p-2 -ml-1 rounded-xl text-slate-700 hover:text-[#0E1A3A] hover:bg-slate-100 lg:hidden cursor-pointer shrink-0"
              title="Abrir menu"
            >
              <mat-icon class="text-xl">menu</mat-icon>
            </button>

            <div class="min-w-0">
              <h1 class="text-xs sm:text-sm font-bold text-[#0E1A3A] tracking-tight truncate">
                Painel de Gestão
              </h1>
              <span class="hidden sm:inline-block text-[11px] text-slate-500 font-medium">
                Política: <strong class="uppercase text-[#2F6BFF]">{{ store.configuracao().politicaAtraso }}</strong>
              </span>
            </div>
          </div>

          <!-- Direita: Sininho & Acesso Rápido ao QR -->
          <div class="flex items-center gap-2 sm:gap-4 shrink-0">
            <!-- Sininho com contador de não lidas -->
            <a
              routerLink="/painel/notificacoes"
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

            <!-- Acesso rápido ao Leitor de QR -->
            <a
              routerLink="/painel/leitor"
              class="px-2.5 sm:px-3.5 py-1.5 rounded-lg bg-[#2F6BFF] hover:bg-blue-600 text-white text-xs font-semibold flex items-center gap-1 sm:gap-1.5 transition-colors shadow-xs"
            >
              <mat-icon class="text-sm w-4 h-4 flex items-center justify-center">qr_code_scanner</mat-icon>
              <span class="hidden xs:inline">Escanear</span>
            </a>
          </div>
        </header>

        <!-- Viewport Principal de Conteúdo -->
        <main class="flex-1 p-3.5 sm:p-6 lg:p-8 min-w-0 overflow-x-hidden">
          <router-outlet></router-outlet>
        </main>
      </div>

      <!-- Relógio Virtual Flutuante -->
      <app-relogio-flutuante></app-relogio-flutuante>
    </div>
  `,
})
export class ResponsavelLayout {
  readonly store = inject(NexusStore);
  private readonly router = inject(Router);

  readonly drawerAberto = signal(false);
  readonly totalNaoLidas = computed(() => this.store.totalNaoLidas());

  readonly menuItems: NavItem[] = [
    { rotulo: 'Painel', rota: '/painel', icone: 'dashboard' },
    {
      rotulo: 'Solicitações',
      rota: '/painel/solicitacoes',
      icone: 'assignment',
      badge: () => this.store.solicitacoesPendentesCount(),
      badgeColor: 'bg-amber-400 text-slate-950 font-bold',
    },
    {
      rotulo: 'Contas',
      rota: '/painel/contas',
      icone: 'how_to_reg',
      badge: () => this.store.contasPendentesCount(),
      badgeColor: 'bg-amber-400 text-slate-950 font-bold',
    },
    { rotulo: 'Leitor de QR code', rota: '/painel/leitor', icone: 'qr_code_scanner' },
    { rotulo: 'Itens', rota: '/painel/itens', icone: 'inventory_2' },
    { rotulo: 'Categorias', rota: '/painel/categorias', icone: 'category' },
    {
      rotulo: 'Manutenção',
      rota: '/painel/manutencao',
      icone: 'build',
      badge: () => this.store.ocorrencias().filter((o) => o.status === 'aberta').length,
      badgeColor: 'bg-purple-200 text-purple-900 font-bold',
    },
    { rotulo: 'Usuários', rota: '/painel/usuarios', icone: 'group' },
    { rotulo: 'Relatórios', rota: '/painel/relatorios', icone: 'bar_chart' },
    { rotulo: 'Histórico', rota: '/painel/historico', icone: 'history' },
    { rotulo: 'Configurações', rota: '/painel/configuracoes', icone: 'settings' },
  ];

  toggleDrawer() {
    this.drawerAberto.update((v) => !v);
  }

  fecharDrawer() {
    this.drawerAberto.set(false);
  }

  sair() {
    this.fecharDrawer();
    this.store.logout();
    this.router.navigate(['/login']);
  }
}
