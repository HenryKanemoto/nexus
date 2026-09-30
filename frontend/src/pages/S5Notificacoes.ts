import {ChangeDetectionStrategy, Component, computed, inject} from '@angular/core';
import {Router} from '@angular/router';
import {NexusStore} from '../store/nexus.store';
import {MatIconModule} from '@angular/material/icon';
import {formatRelativeTime} from '../lib/date-utils';
import {Notificacao, TipoNotificacao} from '../types/models';

@Component({
  selector: 'app-s5-notificacoes',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  template: `
    <div class="space-y-6 font-['Sora',sans-serif] max-w-4xl mx-auto">
      <!-- Cabeçalho (Wireframe S5) -->
      <div class="flex items-center justify-between pb-2 border-b border-slate-200">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-[#0E1A3A]">
            Notificações
          </h1>
          <p class="text-xs text-slate-500 mt-1">
            Acompanhe aprovações, recusas, prazos e alertas sobre seus pedidos
          </p>
        </div>

        <!-- Botão "Marcar todas como lidas" (Wireframe S5) -->
        @if (temNaoLidas()) {
          <button
            type="button"
            (click)="marcarTodasComoLidas()"
            class="text-xs font-semibold text-[#2F6BFF] hover:underline cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <mat-icon class="text-xs w-3.5 h-3.5 flex items-center justify-center">done_all</mat-icon>
            <span>Marcar todas como lidas</span>
          </button>
        }
      </div>

      <!-- Lista de Avisos (Wireframe S5) -->
      <div class="space-y-3">
        @for (n of notificacoes(); track n.id) {
          @let circulo = getSimboloCirculo(n.tipo);
          <div
            tabindex="0"
            role="button"
            (click)="abrirNotificacao(n)"
            (keydown.enter)="abrirNotificacao(n)"
            class="w-full text-left p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer shadow-2xs hover:shadow-xs group flex items-start gap-4"
            [class.bg-[#FEF9C3]]="!n.lida"
            [class.border-amber-300]="!n.lida"
            [class.bg-white]="n.lida"
            [class.border-slate-200]="n.lida"
          >
            <!-- Círculo com Letra/Símbolo do Tipo (Wireframe S5: A, P, R, E, !) -->
            <div
              class="w-10 h-10 rounded-full border flex items-center justify-center shrink-0 font-bold text-sm select-none"
              [class.bg-white]="!n.lida"
              [class.border-amber-400]="!n.lida"
              [class.text-amber-900]="!n.lida"
              [class.bg-slate-100]="n.lida"
              [class.border-slate-300]="n.lida"
              [class.text-slate-700]="n.lida"
            >
              {{ circulo }}
            </div>

            <!-- Conteúdo da Mensagem e Tempo Relativo -->
            <div class="flex-1 min-w-0">
              <p
                class="text-xs sm:text-sm font-semibold text-[#0E1A3A] group-hover:text-[#2F6BFF] transition-colors leading-snug"
              >
                {{ n.mensagem }}
              </p>
              <div class="flex items-center gap-2 mt-1.5 text-[11px] text-slate-500">
                <span class="tabular-nums font-medium">{{ getTempoRelativo(n.criadoEm) }}</span>
                @if (!n.lida) {
                  <span class="inline-block w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  <span class="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Nova</span>
                }
              </div>
            </div>

            <!-- Seta indicativa para S4 -->
            <div class="hidden sm:flex items-center text-slate-400 group-hover:text-[#2F6BFF] group-hover:translate-x-0.5 transition-all text-xs font-semibold shrink-0 gap-1 pt-1">
              <span>Ver em S4</span>
              <mat-icon class="text-sm">arrow_forward</mat-icon>
            </div>
          </div>
        } @empty {
          <div class="bg-white rounded-3xl border border-slate-200/90 p-12 text-center space-y-3">
            <div class="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <mat-icon class="text-3xl">notifications_off</mat-icon>
            </div>
            <h3 class="font-bold text-slate-800 text-sm">Você não possui notificações</h3>
            <p class="text-xs text-slate-500 max-w-sm mx-auto">
              Quando seus pedidos forem aprovados, recusados ou estiverem com prazos próximos, você será avisado aqui.
            </p>
          </div>
        }
      </div>

      <!-- Nota de rodapé conforme Wireframe S5: "amarelo = não lida · clicar no aviso -> pedido em S4" -->
      <div class="pt-2 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
        <span class="inline-block w-3 h-3 rounded-full bg-[#FEF9C3] border border-amber-300"></span>
        <span>amarelo = não lida</span>
        <span>·</span>
        <span>clicar no aviso leva a <strong>Meus empréstimos (S4)</strong></span>
      </div>
    </div>
  `,
})
export class S5Notificacoes {
  readonly store = inject(NexusStore);
  private readonly router = inject(Router);

  readonly usuario = computed(() => this.store.usuarioLogado());

  readonly notificacoes = computed(() => {
    const u = this.usuario();
    if (!u) return [];
    return this.store.notificacoes().filter((n) => n.usuarioId === u.id);
  });

  readonly temNaoLidas = computed(() => {
    return this.notificacoes().some((n) => !n.lida);
  });

  getTempoRelativo(iso: string): string {
    return formatRelativeTime(iso, this.store.agora());
  }

  getSimboloCirculo(tipo: TipoNotificacao): string {
    switch (tipo) {
      case 'aprovacao':
        return 'A';
      case 'prazo_proximo':
        return 'P';
      case 'recusa':
        return 'R';
      case 'expiracao':
        return 'E';
      case 'atraso':
        return '!';
      default:
        return '•';
    }
  }

  abrirNotificacao(n: Notificacao) {
    if (!n.lida) {
      this.store.marcarNotificacaoComoLida(n.id);
    }
    // Clicar no aviso leva ao pedido em /meus-emprestimos (Wireframe S5)
    this.router.navigate(['/meus-emprestimos']);
  }

  marcarTodasComoLidas() {
    const u = this.usuario();
    if (u) {
      this.store.marcarTodasNotificacoesComoLidas(u.id);
    }
  }
}
