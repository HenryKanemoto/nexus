import {ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';
import {NexusStore} from '../store/nexus.store';
import {MatIconModule} from '@angular/material/icon';
import {PoliticaAtraso} from '../types/models';

@Component({
  selector: 'app-r16-configuracoes',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  template: `
    <div class="space-y-6 font-['Sora',sans-serif] max-w-4xl">
      <!-- Cabeçalho (Wireframe R16) -->
      <div class="flex items-center justify-between pb-2 border-b border-slate-200">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-[#0E1A3A]">
            Configurações
          </h1>
          <p class="text-xs text-slate-500 mt-1">
            Definições institucionais de penalidades e conformidade de acervo (RN06)
          </p>
        </div>
      </div>

      <!-- Alerta de Sucesso (Wireframe R16: mesma tela + mensagem de sucesso) -->
      @if (mensagemSucesso()) {
        <div class="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between shadow-2xs animate-fadeIn">
          <div class="flex items-center gap-2">
            <mat-icon class="text-emerald-600">check_circle</mat-icon>
            <span class="font-medium">{{ mensagemSucesso() }}</span>
          </div>
          <button
            type="button"
            (click)="mensagemSucesso.set(null)"
            class="text-emerald-600 hover:text-emerald-800 cursor-pointer p-1"
          >
            <mat-icon class="text-sm w-4 h-4 flex items-center justify-center">close</mat-icon>
          </button>
        </div>
      }

      <!-- Pergunta Principal (Wireframe R16) -->
      <div class="space-y-4">
        <h2 class="text-base sm:text-lg font-bold text-[#0E1A3A]">
          O que acontece quando alguém atrasa a devolução?
        </h2>

        <!-- Três Opções de Rádio (Wireframe R16) -->
        <div class="space-y-3">
          <!-- Opção 1: Só marcar o atraso -->
          <div
            tabindex="0"
            role="button"
            (click)="selecionar('simples')"
            (keydown.enter)="selecionar('simples')"
            class="w-full text-left p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-4 shadow-2xs"
            [class.bg-[#FEF9C3]]="politicaSelecionada() === 'simples'"
            [class.border-slate-800]="politicaSelecionada() === 'simples'"
            [class.bg-white]="politicaSelecionada() !== 'simples'"
            [class.border-slate-300]="politicaSelecionada() !== 'simples'"
          >
            <!-- Círculo de Rádio -->
            <div class="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5"
              [class.border-slate-800]="politicaSelecionada() === 'simples'"
              [class.border-slate-400]="politicaSelecionada() !== 'simples'"
            >
              @if (politicaSelecionada() === 'simples') {
                <div class="w-2.5 h-2.5 rounded-full bg-slate-900"></div>
              }
            </div>

            <!-- Textos -->
            <div>
              <strong class="font-bold text-[#0E1A3A] text-xs sm:text-sm block">
                Só marcar o atraso
              </strong>
              <p class="text-xs text-slate-600 mt-0.5">
                O empréstimo aparece como atrasado no painel.
              </p>
            </div>
          </div>

          <!-- Opção 2: Bloquear até devolver -->
          <div
            tabindex="0"
            role="button"
            (click)="selecionar('intermediaria')"
            (keydown.enter)="selecionar('intermediaria')"
            class="w-full text-left p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-4 shadow-2xs"
            [class.bg-[#FEF9C3]]="politicaSelecionada() === 'intermediaria'"
            [class.border-slate-800]="politicaSelecionada() === 'intermediaria'"
            [class.bg-white]="politicaSelecionada() !== 'intermediaria'"
            [class.border-slate-300]="politicaSelecionada() !== 'intermediaria'"
          >
            <!-- Círculo de Rádio -->
            <div class="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5"
              [class.border-slate-800]="politicaSelecionada() === 'intermediaria'"
              [class.border-slate-400]="politicaSelecionada() !== 'intermediaria'"
            >
              @if (politicaSelecionada() === 'intermediaria') {
                <div class="w-2.5 h-2.5 rounded-full bg-slate-900"></div>
              }
            </div>

            <!-- Textos -->
            <div>
              <strong class="font-bold text-[#0E1A3A] text-xs sm:text-sm block">
                Bloquear até devolver
              </strong>
              <p class="text-xs text-slate-600 mt-0.5">
                A pessoa não faz novos pedidos enquanto estiver com item atrasado.
              </p>
            </div>
          </div>

          <!-- Opção 3: Bloquear e suspender (padrão) -->
          <div
            tabindex="0"
            role="button"
            (click)="selecionar('rigida')"
            (keydown.enter)="selecionar('rigida')"
            class="w-full text-left p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-4 shadow-2xs"
            [class.bg-[#FEF9C3]]="politicaSelecionada() === 'rigida'"
            [class.border-slate-800]="politicaSelecionada() === 'rigida'"
            [class.bg-white]="politicaSelecionada() !== 'rigida'"
            [class.border-slate-300]="politicaSelecionada() !== 'rigida'"
          >
            <!-- Círculo de Rádio -->
            <div class="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5"
              [class.border-slate-800]="politicaSelecionada() === 'rigida'"
              [class.border-slate-400]="politicaSelecionada() !== 'rigida'"
            >
              @if (politicaSelecionada() === 'rigida') {
                <div class="w-2.5 h-2.5 rounded-full bg-slate-900"></div>
              }
            </div>

            <!-- Textos -->
            <div>
              <div class="flex items-center gap-2">
                <strong class="font-bold text-[#0E1A3A] text-xs sm:text-sm">
                  Bloquear e suspender (padrão)
                </strong>
                <span class="text-[10px] font-bold bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded">
                  Padrão Nexus
                </span>
              </div>
              <p class="text-xs text-slate-600 mt-0.5">
                Bloqueia até devolver e depois suspende pelo mesmo número de dias de atraso.
              </p>
            </div>
          </div>
        </div>

        <!-- Botão Salvar configurações (Wireframe R16) -->
        <div class="pt-4 flex items-center gap-4">
          <button
            type="button"
            (click)="salvar()"
            class="px-6 py-3 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-900 border border-slate-300 font-bold text-xs uppercase tracking-wider transition-all shadow-xs cursor-pointer flex items-center gap-2"
          >
            <mat-icon class="text-sm w-4 h-4 flex items-center justify-center">save</mat-icon>
            <span>Salvar configurações</span>
          </button>
        </div>

        <!-- Nota Informativa RN06 -->
        <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 leading-relaxed">
          <strong>Regra Institucional (RN06):</strong> A política selecionada será aplicada aos próximos atrasos calculados pelo relógio virtual do sistema e aos retornos de materiais realizados a partir deste momento.
        </div>
      </div>
    </div>
  `,
})
export class R16Configuracoes {
  readonly store = inject(NexusStore);

  readonly politicaAtual = computed(() => this.store.configuracao().politicaAtraso);
  readonly politicaSelecionada = signal<PoliticaAtraso>('rigida');
  readonly mensagemSucesso = signal<string | null>(null);

  constructor() {
    this.politicaSelecionada.set(this.politicaAtual());
  }

  selecionar(pol: PoliticaAtraso) {
    this.politicaSelecionada.set(pol);
  }

  salvar() {
    const novaPolitica = this.politicaSelecionada();
    this.store.alterarPoliticaAtraso(novaPolitica);
    this.mensagemSucesso.set(
      'Configurações salvas com sucesso! A nova política institucional de atraso foi atualizada no sistema (RN06).'
    );
  }
}
