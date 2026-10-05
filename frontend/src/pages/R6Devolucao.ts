import {ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {NexusStore} from '../store/nexus.store';
import {MatIconModule} from '@angular/material/icon';
import {calculateDiasAtraso, formatDateShort} from '../lib/date-utils';

@Component({
  selector: 'app-r6-devolucao',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatIconModule],
  template: `
    <div class="space-y-6 font-['Sora',sans-serif] max-w-4xl">
      <!-- Cabeçalho (Wireframe R6) -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-[#0E1A3A]">
            Registrar devolução
          </h1>
          <p class="text-xs text-slate-500 mt-1">
            Encerramento do empréstimo, verificação de integridade e aplicação de regras de atraso
          </p>
        </div>
      </div>

      @if (item(); as i) {
        @if (emprestimo(); as emp) {
          @let user = getUsuario(emp.usuarioId);
          @let diasAtrasoAtual = getDiasAtraso(emp.devolucaoPrevista);
          @let politica = store.configuracao().politicaAtraso;

          <!-- Cartão Principal de Devolução (Wireframe R6) -->
          <div class="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <!-- Foto / Ilustração do Item (Quadrado com X / Ícone) -->
              <div class="md:col-span-3 flex items-center justify-center">
                <div class="w-full aspect-square rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center p-4 text-[#0E1A3A]">
                  <div class="w-16 h-16 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-center mb-2">
                    <mat-icon class="text-3xl text-[#2F6BFF]">{{ getIconeCategoria(i.categoriaId) }}</mat-icon>
                  </div>
                  <span class="font-mono text-[11px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {{ i.patrimonio }}
                  </span>
                </div>
              </div>

              <!-- Informações Centrais (Wireframe R6) -->
              <div class="md:col-span-5 space-y-3">
                <h2 class="text-xl font-extrabold text-[#0E1A3A]">
                  {{ i.nome }}
                </h2>

                <div class="space-y-1.5 text-xs text-slate-600">
                  <div class="flex items-center gap-1.5">
                    <span class="text-slate-500">Solicitante:</span>
                    <strong class="text-slate-900 font-semibold">{{ user?.nome }}</strong>
                  </div>

                  <div class="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                    <span>Retirado em: <strong class="text-slate-700">{{ formatarData(emp.retiradoEm) }}</strong></span>
                    <span>·</span>
                    <span>Devolver até: <strong class="text-slate-700">{{ formatarData(emp.devolucaoPrevista) }}</strong></span>
                  </div>
                </div>
              </div>

              <!-- Destaque Amarelo de Atraso (Wireframe R6: "Atenção: 3 dias de atraso - Suspensão de 3 dias será aplicada") -->
              <div class="md:col-span-4">
                @if (diasAtrasoAtual > 0) {
                  <div class="p-4 rounded-2xl bg-[#FFF8E1] border border-amber-300 shadow-2xs text-[#7A5200] space-y-1">
                    <div class="flex items-center gap-1.5 font-extrabold text-sm text-[#7A5200]">
                      <mat-icon class="text-base text-amber-600">warning</mat-icon>
                      <span>Atenção: {{ diasAtrasoAtual }} {{ diasAtrasoAtual === 1 ? 'dia' : 'dias' }} de atraso</span>
                    </div>

                    <p class="text-xs font-semibold text-[#8C6000]">
                      @if (politica === 'rigida') {
                        Suspensão de {{ diasAtrasoAtual }} {{ diasAtrasoAtual === 1 ? 'dia' : 'dias' }} será aplicada à conta
                      } @else if (politica === 'intermediaria') {
                        Conta será desbloqueada após entrega
                      } @else {
                        Sem suspensão (política simples)
                      }
                    </p>
                  </div>
                } @else {
                  <div class="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 space-y-1 text-center">
                    <div class="flex items-center justify-center gap-1 font-bold text-xs text-emerald-700">
                      <mat-icon class="text-sm">verified</mat-icon>
                      <span>Devolução no Prazo</span>
                    </div>
                    <p class="text-[11px] text-emerald-600">Nenhuma penalidade aplicável</p>
                  </div>
                }
              </div>
            </div>

            <!-- Seção de Avaria / Defeito (Wireframe R6) -->
            <div class="pt-4 border-t border-slate-100 space-y-3">
              <label class="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  [checked]="comDefeito()"
                  (change)="comDefeito.set($any($event.target).checked)"
                  class="w-4 h-4 rounded border-slate-300 text-[#2F6BFF] focus:ring-[#2F6BFF] cursor-pointer"
                />
                <span class="text-sm font-bold text-[#0E1A3A]">
                  Item com defeito
                </span>
              </label>

              <!-- Caixa de Texto Condicional quando Marcado (Wireframe R6) -->
              @if (comDefeito()) {
                <div class="space-y-2 animate-fadeIn">
                  <label for="descricaoDefeito" class="block text-xs font-bold text-slate-700">
                    Descreva o defeito <span class="text-rose-500">*</span>
                  </label>
                  <textarea
                    id="descricaoDefeito"
                    rows="3"
                    [value]="descricaoDefeito()"
                    (input)="descricaoDefeito.set($any($event.target).value)"
                    placeholder="Ex.: Lente do projetor trincada durante o transporte, botão de ligar travado, etc."
                    class="block w-full rounded-2xl border border-slate-300 p-3 text-xs text-slate-800 focus:border-[#2F6BFF] focus:outline-hidden focus:ring-1 focus:ring-[#2F6BFF]"
                    required
                  ></textarea>
                  <p class="text-[11px] text-rose-600 font-medium">
                    marcado: item vai para manutenção + ocorrência no histórico
                  </p>
                </div>
              }

              @if (erroValidacao()) {
                <div class="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <mat-icon class="text-rose-600 text-sm">error_outline</mat-icon>
                    <span>{{ erroValidacao() }}</span>
                  </div>
                  <button type="button" (click)="erroValidacao.set(null)" class="text-rose-600 hover:text-rose-800">
                    <mat-icon class="text-xs">close</mat-icon>
                  </button>
                </div>
              }
            </div>

            <!-- Botões de Ação (Wireframe R6) -->
            <div class="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                (click)="executarConfirmacaoDevolucao()"
                class="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <mat-icon class="text-sm w-4 h-4 flex items-center justify-center">done_all</mat-icon>
                <span>Confirmar devolução</span>
              </button>

              <a
                routerLink="/painel/leitor"
                class="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs uppercase tracking-wider transition-colors text-center cursor-pointer"
              >
                Cancelar
              </a>
            </div>
          </div>
        } @else {
          <!-- Não há empréstimo ativo -->
          <div class="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-3">
            <mat-icon class="text-4xl text-slate-400">check_circle</mat-icon>
            <h2 class="text-lg font-bold text-slate-800">Item Já Devolvido ou Disponível</h2>
            <p class="text-xs text-slate-500 max-w-md mx-auto">
              Não há registro de empréstimo em aberto para o equipamento "{{ i.nome }}" ({{ i.patrimonio }}).
            </p>
            <div class="pt-2">
              <a
                routerLink="/painel/leitor"
                class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2F6BFF] text-white text-xs font-semibold"
              >
                Voltar ao Leitor de QR
              </a>
            </div>
          </div>
        }
      } @else {
        <div class="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-3">
          <mat-icon class="text-4xl text-slate-400">help_outline</mat-icon>
          <h2 class="text-lg font-bold text-slate-800">Item Não Encontrado</h2>
          <a
            routerLink="/painel/leitor"
            class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold"
          >
            Voltar ao Leitor
          </a>
        </div>
      }
    </div>
  `,
})
export class R6Devolucao {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly store = inject(NexusStore);

  readonly comDefeito = signal(false);
  readonly descricaoDefeito = signal('');
  readonly erroValidacao = signal<string | null>(null);

  readonly itemId = computed(() => this.route.snapshot.paramMap.get('itemId') || '');

  readonly item = computed(() => {
    const id = this.itemId();
    return this.store.itens().find((i) => i.id === id) || null;
  });

  readonly emprestimo = computed(() => {
    const it = this.item();
    if (!it) return null;
    return (
      this.store.emprestimos().find(
        (e) => e.itemId === it.id && !e.devolvidoEm
      ) || null
    );
  });

  getUsuario(id?: string) {
    if (!id) return undefined;
    return this.store.usuarios().find((u) => u.id === id);
  }

  formatarData(iso?: string) {
    if (!iso) return '—';
    return formatDateShort(iso);
  }

  getDiasAtraso(devolucaoPrevista: string): number {
    return calculateDiasAtraso(devolucaoPrevista, this.store.agora());
  }

  executarConfirmacaoDevolucao() {
    const emp = this.emprestimo();
    const resp = this.store.usuarioLogado();
    const it = this.item();
    if (!emp) return;

    this.erroValidacao.set(null);
    if (this.comDefeito() && !this.descricaoDefeito().trim()) {
      this.erroValidacao.set('Por favor, informe a descrição do defeito identificado no equipamento.');
      return;
    }

    const res = this.store.registrarDevolucao(
      emp.id,
      resp?.id || 'user-marta',
      this.comDefeito(),
      this.comDefeito() ? this.descricaoDefeito().trim() : undefined
    );

    if (res.sucesso) {
      // Volta ao painel com mensagem de sucesso
      this.router.navigate(['/painel'], {
        state: { sucesso: `Devolução registrada com sucesso para "${it?.nome}". ${res.mensagem}` },
      });
    }
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
