import {ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';
import {Router} from '@angular/router';
import {NexusStore} from '../../store/nexus.store';
import {formatDateTime} from '../../lib/date-utils';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-relogio-flutuante',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  template: `
    <div class="fixed bottom-3 right-3 sm:bottom-4 sm:right-4 z-50 font-['Sora',sans-serif] max-w-[calc(100vw-1.5rem)]">
      <!-- Painel Recolhido (Trigger Botão Flutuante) -->
      @if (!aberto()) {
        <button
          type="button"
          (click)="aberto.set(true)"
          class="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full bg-[#0E1A3A] text-white shadow-xl hover:bg-[#1A2E66] transition-all border border-white/10 group cursor-pointer max-w-full"
        >
          <span class="flex h-2 w-2 relative shrink-0">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F2B705] opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-[#F2B705]"></span>
          </span>
          <mat-icon class="text-amber-400 text-xs sm:text-sm w-4 h-4 flex items-center justify-center shrink-0">schedule</mat-icon>
          <div class="text-[11px] sm:text-xs text-left truncate">
            <span class="hidden xs:inline font-medium text-slate-300">Relógio:</span>
            <span class="font-bold text-white ml-0.5 sm:ml-1 tabular-nums">{{ dataFormatada() }}</span>
          </div>
          <mat-icon class="text-slate-400 text-xs sm:text-sm w-4 h-4 group-hover:translate-y-[-1px] transition-transform shrink-0">expand_less</mat-icon>
        </button>
      } @else {
        <!-- Painel Expandido de Demonstração -->
        <div
          class="w-[calc(100vw-1.5rem)] max-w-sm rounded-2xl bg-[#0E1A3A] text-white p-4 shadow-2xl border border-white/15 animate-in fade-in slide-in-from-bottom-4 duration-200"
        >
          <!-- Cabeçalho do Painel -->
          <div class="flex items-center justify-between pb-3 border-b border-white/10">
            <div class="flex items-center gap-2">
              <mat-icon class="text-[#F2B705]">schedule</mat-icon>
              <div>
                <h4 class="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Painel de Demonstração
                </h4>
                <p class="text-sm font-semibold text-white tabular-nums">
                  {{ dataFormatada() }}
                </p>
              </div>
            </div>
            <button
              type="button"
              (click)="aberto.set(false)"
              class="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Recolher painel"
            >
              <mat-icon class="text-sm w-5 h-5 flex items-center justify-center">close</mat-icon>
            </button>
          </div>

          <!-- Controles de Avanço do Relógio -->
          <div class="mt-3">
            <span class="text-[11px] font-medium text-slate-400 block mb-1.5">
              Avançar Tempo (dispara rotinas automáticas):
            </span>
            <div class="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                (click)="avancarHoras(1)"
                class="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-white/10 hover:bg-[#2F6BFF] text-white transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <mat-icon class="text-xs w-3.5 h-3.5 flex items-center justify-center">update</mat-icon>
                +1 hora
              </button>
              <button
                type="button"
                (click)="avancarDias(1)"
                class="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-white/10 hover:bg-[#2F6BFF] text-white transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <mat-icon class="text-xs w-3.5 h-3.5 flex items-center justify-center">fast_forward</mat-icon>
                +1 dia
              </button>
              <button
                type="button"
                (click)="avancarDias(3)"
                class="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-white/10 hover:bg-[#2F6BFF] text-white transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <mat-icon class="text-xs w-3.5 h-3.5 flex items-center justify-center">skip_next</mat-icon>
                +3 dias
              </button>
            </div>
          </div>

          <!-- Alternar Usuário de Demonstração -->
          <div class="mt-3 pt-3 border-t border-white/10">
            <div class="flex items-center justify-between mb-1.5">
              <span class="text-[11px] font-medium text-slate-400">
                Alternar Usuário Simulado:
              </span>
              @if (usuarioAtual(); as u) {
                <span class="text-[10px] text-amber-300 font-medium">
                  {{ u.perfil === 'responsavel' ? 'Responsável' : 'Solicitante' }}
                </span>
              }
            </div>

            <div class="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
              @for (user of store.usuarios(); track user.id) {
                <button
                  type="button"
                  (click)="trocarUsuario(user.id)"
                  class="p-1.5 rounded-lg text-left text-xs transition-all border cursor-pointer flex flex-col gap-0.5 {{
                    store.usuarioLogado()?.id === user.id
                      ? 'bg-[#2F6BFF] border-blue-400 text-white font-semibold shadow-xs'
                      : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10'
                  }}"
                >
                  <div class="flex items-center justify-between w-full">
                    <span class="truncate">{{ user.nome }}</span>
                    @if (user.status !== 'ativa') {
                      <span class="w-1.5 h-1.5 rounded-full {{ user.status === 'bloqueada' ? 'bg-rose-400' : user.status === 'suspensa' ? 'bg-purple-400' : 'bg-amber-400' }}"></span>
                    }
                  </div>
                  <span class="text-[10px] opacity-75 truncate">
                    {{ user.perfil }} ({{ user.status }})
                  </span>
                </button>
              }
            </div>
          </div>

          <!-- Resumo de Estado Rápido -->
          <div class="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-300">
            <div class="flex items-center gap-1.5">
              <span class="text-slate-400">Política:</span>
              <span class="font-semibold text-white uppercase">{{ store.configuracao().politicaAtraso }}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-amber-300 tabular-nums">
                {{ store.solicitacoesPendentesCount() }} pendentes
              </span>
              <span>·</span>
              <span class="text-rose-300 tabular-nums">
                {{ store.emprestimosAtrasadosCount() }} atrasados
              </span>
            </div>
          </div>

          <!-- Botão Reiniciar Dados -->
          <div class="mt-3 pt-2 border-t border-white/10">
            <button
              type="button"
              (click)="reiniciarDados()"
              class="w-full py-1.5 px-3 rounded-lg text-xs font-medium text-rose-300 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <mat-icon class="text-xs w-4 h-4 flex items-center justify-center">restart_alt</mat-icon>
              Reiniciar Dados de Demonstração
            </button>
          </div>
        </div>
      }
    </div>
  `,
})
export class RelogioFlutuante {
  readonly store = inject(NexusStore);
  private readonly router = inject(Router);

  readonly aberto = signal(false);

  readonly dataFormatada = computed(() => {
    return formatDateTime(this.store.agora());
  });

  readonly usuarioAtual = computed(() => this.store.usuarioLogado());

  avancarHoras(h: number) {
    this.store.avancarRelogio(h);
  }

  avancarDias(d: number) {
    this.store.avancarDias(d);
  }

  reiniciarDados() {
    this.store.reiniciarDados();
  }

  trocarUsuario(usuarioId: string) {
    this.store.trocarUsuarioDemo(usuarioId);
    const usuario = this.store.usuarios().find((u) => u.id === usuarioId);
    if (!usuario) return;

    const currentUrl = this.router.url;
    // Se o usuário for solicitante e estiver em rota /painel, redirecionar para /catalogo
    if (usuario.perfil !== 'responsavel' && currentUrl.startsWith('/painel')) {
      if (usuario.status === 'pendente') {
        this.router.navigate(['/aguardando']);
      } else {
        this.router.navigate(['/catalogo']);
      }
    } else if (usuario.perfil === 'responsavel' && !currentUrl.startsWith('/painel')) {
      this.router.navigate(['/painel']);
    }
  }
}
