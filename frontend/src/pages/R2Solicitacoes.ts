import {ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';
import {RouterLink} from '@angular/router';
import {NexusStore} from '../store/nexus.store';
import {MatIconModule} from '@angular/material/icon';
import {Solicitacao} from '../types/models';
import {differenceInHours, formatDateShort, parseDate} from '../lib/date-utils';

@Component({
  selector: 'app-r2-solicitacoes',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatIconModule],
  template: `
    <div class="space-y-6 font-['Sora',sans-serif] max-w-7xl">
      <!-- Cabeçalho (Wireframe R2) -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-[#0E1A3A]">
            Solicitações pendentes
          </h1>
          <p class="text-xs text-slate-500 mt-1">
            Avaliação de pedidos de empréstimo de alunos e professores
          </p>
        </div>
      </div>

      <!-- Feedback de Ação -->
      @if (feedbackMensagem()) {
        <div
          role="status"
          class="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between shadow-2xs animate-fadeIn"
        >
          <div class="flex items-center gap-2">
            <mat-icon class="text-emerald-600">check_circle</mat-icon>
            <span>{{ feedbackMensagem() }}</span>
          </div>
          <button
            type="button"
            (click)="feedbackMensagem.set(null)"
            class="text-emerald-600 hover:text-emerald-800 cursor-pointer p-1"
          >
            <mat-icon class="text-sm w-4 h-4 flex items-center justify-center">close</mat-icon>
          </button>
        </div>
      }

      <!-- Tabela 1: Solicitações Pendentes (Wireframe R2) -->
      <div class="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <h2 class="text-base font-bold text-[#0E1A3A]">
              Pedidos Aguardando Análise
            </h2>
            <span class="text-xs font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full">
              {{ solicitacoesPendentes().length }}
            </span>
          </div>
          <span class="text-xs text-slate-500">
            Todo pedido necessita de aprovação prévia
          </span>
        </div>

        <!-- Tabela Desktop (hidden md:block) -->
        <div class="hidden md:block overflow-x-auto rounded-xl border border-slate-200">
          <table class="w-full text-xs text-left">
            <thead class="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th class="p-3 w-1/4">Solicitante</th>
                <th class="p-3 w-28">Perfil</th>
                <th class="p-3 w-1/4">Item</th>
                <th class="p-3 w-28">Devolver até</th>
                <th class="p-3 w-24">Há</th>
                <th class="p-3 text-right w-44">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @for (s of solicitacoesPendentes(); track s.id) {
                @let item = getItem(s.itemId);
                @let user = getUsuario(s.solicitanteId);
                <tr class="hover:bg-slate-50/60 transition-colors" [class.bg-amber-50/30]="s.lembreteEnviadoEm">
                  <td class="p-3">
                    <div class="flex items-center gap-2">
                      @if (s.lembreteEnviadoEm) {
                        <span
                          class="px-1.5 py-0.5 rounded bg-amber-100 border border-amber-300 text-amber-900 font-bold text-[10px] shrink-0"
                          title="Este solicitante enviou um lembrete de cobrança"
                        >
                          (!) Lembrete
                        </span>
                      }
                      <div>
                        <strong class="font-bold text-slate-800">{{ user?.nome || 'Solicitante' }}</strong>
                        <span class="block text-[10px] font-mono text-slate-400">{{ user?.matricula }}</span>
                      </div>
                    </div>
                  </td>
                  <td class="p-3">
                    <span
                      class="px-2 py-0.5 rounded text-[11px] font-semibold capitalize"
                      [class.bg-blue-50]="user?.perfil === 'aluno'"
                      [class.text-blue-700]="user?.perfil === 'aluno'"
                      [class.bg-purple-50]="user?.perfil === 'professor'"
                      [class.text-purple-700]="user?.perfil === 'professor'"
                    >
                      {{ user?.perfil || 'aluno' }}
                    </span>
                  </td>
                  <td class="p-3">
                    <span class="font-bold text-[#0E1A3A]">{{ item?.nome }}</span>
                    <span class="block text-[10px] font-mono text-slate-400">{{ item?.patrimonio }}</span>
                  </td>
                  <td class="p-3 tabular-nums font-semibold text-slate-700">
                    {{ formatarData(s.devolucaoDesejada) }}
                  </td>
                  <td class="p-3 tabular-nums text-slate-500">
                    {{ getTempoDecorrido(s.criadoEm) }}
                  </td>
                  <td class="p-3 text-right">
                    <div class="inline-flex items-center gap-2">
                      <button
                        type="button"
                        (click)="aprovarPedido(s.id)"
                        class="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] transition-colors shadow-2xs flex items-center gap-1 cursor-pointer"
                        title="Aprovar pedido (item fica reservado para retirada hoje)"
                      >
                        <mat-icon class="text-xs w-3.5 h-3.5 flex items-center justify-center">check</mat-icon>
                        <span>Aprovar</span>
                      </button>
                      <button
                        type="button"
                        (click)="abrirModalRecusa(s)"
                        class="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 text-slate-700 font-semibold text-[11px] transition-colors cursor-pointer"
                        title="Recusar pedido com confirmação"
                      >
                        <span>Recusar</span>
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="6" class="p-8 text-center text-xs text-slate-400 italic">
                    Nenhuma solicitação pendente no momento.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Lista de Cartões para Mobile (md:hidden) -->
        <div class="md:hidden space-y-3">
          @for (s of solicitacoesPendentes(); track s.id) {
            @let item = getItem(s.itemId);
            @let user = getUsuario(s.solicitanteId);
            <div class="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3" [class.border-amber-300]="s.lembreteEnviadoEm" [class.bg-amber-50/40]="s.lembreteEnviadoEm">
              <div class="flex items-start justify-between gap-2">
                <div>
                  <div class="flex items-center gap-1.5">
                    @if (s.lembreteEnviadoEm) {
                      <span class="px-1.5 py-0.5 rounded bg-amber-200 border border-amber-300 text-amber-900 font-bold text-[10px]">
                        (!) Lembrete
                      </span>
                    }
                    <strong class="text-sm font-bold text-[#0E1A3A]">{{ user?.nome }}</strong>
                  </div>
                  <span class="text-[11px] text-slate-500 capitalize">{{ user?.perfil }} · {{ user?.matricula }}</span>
                </div>
                <span class="text-[10px] text-slate-400 font-mono">Há {{ getTempoDecorrido(s.criadoEm) }}</span>
              </div>

              <div class="p-2.5 rounded-lg bg-white border border-slate-200 text-xs">
                <span class="block text-[10px] text-slate-400 font-semibold uppercase">Item Solicitado</span>
                <strong class="text-[#0E1A3A] font-bold">{{ item?.nome }}</strong>
                <span class="block text-[10px] font-mono text-slate-500">{{ item?.patrimonio }}</span>
                <div class="mt-1 pt-1 border-t border-slate-100 flex justify-between text-[11px] text-slate-600">
                  <span>Devolução prevista:</span>
                  <strong class="text-slate-800 font-bold">{{ formatarData(s.devolucaoDesejada) }}</strong>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  (click)="aprovarPedido(s.id)"
                  class="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1 shadow-2xs"
                >
                  <mat-icon class="text-xs w-3.5 h-3.5 flex items-center justify-center">check</mat-icon>
                  <span>Aprovar</span>
                </button>
                <button
                  type="button"
                  (click)="abrirModalRecusa(s)"
                  class="py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-rose-50 text-slate-700 font-bold text-xs transition-colors text-center"
                >
                  <span>Recusar</span>
                </button>
              </div>
            </div>
          } @empty {
            <div class="p-6 text-center text-xs text-slate-400 italic">
              Nenhuma solicitação pendente no momento.
            </div>
          }
        </div>
      </div>

      <!-- Tabela 2: Aprovados aguardando retirada hoje (Wireframe R2) -->
      <div class="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 space-y-3">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
            <h2 class="text-sm sm:text-base font-bold text-[#0E1A3A]">
              Aprovados aguardando retirada hoje
            </h2>
            <span class="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
              {{ pedidosAprovadosHoje().length }}
            </span>
          </div>
          <span class="text-[11px] text-amber-700 font-medium">
            não retirado até o fim do dia -> expira
          </span>
        </div>

        <!-- Tabela 2 Desktop (hidden md:block) -->
        <div class="hidden md:block overflow-x-auto rounded-xl border border-slate-200">
          <table class="w-full text-xs text-left">
            <thead class="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th class="p-3 w-1/4">Solicitante</th>
                <th class="p-3 w-1/3">Item</th>
                <th class="p-3 w-32">Aprovado às</th>
                <th class="p-3 w-36">Expira</th>
                <th class="p-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @for (solic of pedidosAprovadosHoje(); track solic.id) {
                @let item = getItem(solic.itemId);
                @let user = getUsuario(solic.solicitanteId);
                <tr class="hover:bg-slate-50/60">
                  <td class="p-3">
                    <strong class="font-bold text-slate-800">{{ user?.nome }}</strong>
                    <span class="block text-[10px] text-slate-400 capitalize">{{ user?.perfil }} · {{ user?.matricula }}</span>
                  </td>
                  <td class="p-3">
                    <span class="font-bold text-[#0E1A3A]">{{ item?.nome }}</span>
                    <span class="block text-[10px] font-mono text-slate-400">{{ item?.patrimonio }} ({{ item?.codigoQr }})</span>
                  </td>
                  <td class="p-3 tabular-nums font-semibold text-slate-700">
                    {{ formatarHora(solic.avaliadoEm || solic.criadoEm) }}
                  </td>
                  <td class="p-3 tabular-nums">
                    <span class="px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-800 font-semibold text-[11px]">
                      Hoje às 18:00
                    </span>
                  </td>
                  <td class="p-3 text-right">
                    <a
                      [routerLink]="['/painel/retirada', solic.itemId]"
                      class="px-2.5 py-1 rounded-lg bg-[#2F6BFF] hover:bg-blue-600 text-white font-medium text-[11px] transition-colors shadow-2xs inline-flex items-center gap-1"
                    >
                      <mat-icon class="text-xs w-3 h-3 flex items-center justify-center">qr_code_scanner</mat-icon>
                      Registrar Retirada
                    </a>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="5" class="p-8 text-center text-xs text-slate-400 italic">
                    Nenhum pedido aprovado aguardando retirada hoje.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Lista de Cartões para Mobile Tabela 2 (md:hidden) -->
        <div class="md:hidden space-y-3">
          @for (solic of pedidosAprovadosHoje(); track solic.id) {
            @let item = getItem(solic.itemId);
            @let user = getUsuario(solic.solicitanteId);
            <div class="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5">
              <div class="flex items-start justify-between gap-2">
                <div>
                  <strong class="text-sm font-bold text-[#0E1A3A] block">{{ user?.nome }}</strong>
                  <span class="text-[11px] text-slate-500 capitalize">{{ user?.perfil }} · {{ user?.matricula }}</span>
                </div>
                <span class="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-semibold text-[10px]">
                  Expira hoje 18:00
                </span>
              </div>

              <div class="text-xs text-slate-700">
                <span class="text-slate-400">Item: </span>
                <strong class="font-bold text-[#0E1A3A]">{{ item?.nome }}</strong>
                <span class="font-mono text-[10px] text-slate-500 ml-1">({{ item?.patrimonio }})</span>
              </div>

              <div class="pt-1 flex justify-end">
                <a
                  [routerLink]="['/painel/retirada', solic.itemId]"
                  class="w-full py-2 rounded-xl bg-[#2F6BFF] hover:bg-blue-600 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <mat-icon class="text-xs w-3.5 h-3.5 flex items-center justify-center">qr_code_scanner</mat-icon>
                  <span>Registrar Retirada</span>
                </a>
              </div>
            </div>
          } @empty {
            <div class="p-6 text-center text-xs text-slate-400 italic">
              Nenhum pedido aprovado aguardando retirada hoje.
            </div>
          }
        </div>
      </div>

      <!-- Modal de Confirmação de Recusa (Wireframe R2: pede confirmação) -->
      @if (solicitacaoParaRecusar(); as solic) {
        @let it = getItem(solic.itemId);
        @let usr = getUsuario(solic.solicitanteId);
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4 animate-fadeIn">
          <div class="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div class="flex items-center gap-3 text-rose-600">
              <div class="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center">
                <mat-icon class="text-xl">help_outline</mat-icon>
              </div>
              <div>
                <h3 class="font-bold text-base text-[#0E1A3A]">Confirmar Recusa</h3>
                <p class="text-xs text-slate-500">O item retornará ao catálogo como disponível</p>
              </div>
            </div>

            <div class="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs space-y-1">
              <p><strong>Solicitante:</strong> {{ usr?.nome }} ({{ usr?.perfil }})</p>
              <p><strong>Item:</strong> {{ it?.nome }} ({{ it?.patrimonio }})</p>
              <p><strong>Devolução pretendida:</strong> {{ formatarData(solic.devolucaoDesejada) }}</p>
            </div>

            <div>
              <label for="motivoRecusa" class="block text-xs font-semibold text-slate-700 mb-1">
                Motivo da recusa (opcional):
              </label>
              <input
                id="motivoRecusa"
                type="text"
                #motivoInput
                placeholder="ex: Equipamento reservado para manutenção preventiva"
                class="block w-full rounded-xl border border-slate-300 py-2 px-3 text-xs focus:border-[#2F6BFF] focus:outline-hidden focus:ring-1 focus:ring-[#2F6BFF]"
              />
            </div>

            <div class="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                (click)="solicitacaoParaRecusar.set(null)"
                class="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                (click)="confirmarRecusa(solic.id, motivoInput.value)"
                class="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <mat-icon class="text-xs w-3.5 h-3.5 flex items-center justify-center">close</mat-icon>
                <span>Confirmar Recusa</span>
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class R2Solicitacoes {
  readonly store = inject(NexusStore);

  readonly feedbackMensagem = signal<string | null>(null);
  readonly solicitacaoParaRecusar = signal<Solicitacao | null>(null);

  readonly solicitacoesPendentes = computed(() => {
    return this.store.solicitacoes().filter((s) => s.status === 'pendente');
  });

  readonly pedidosAprovadosHoje = computed(() => {
    return this.store.solicitacoes().filter((s) => s.status === 'aprovada');
  });

  getItem(id: string) {
    return this.store.itens().find((i) => i.id === id);
  }

  getUsuario(id: string) {
    return this.store.usuarios().find((u) => u.id === id);
  }

  formatarData(iso: string) {
    return formatDateShort(iso);
  }

  formatarHora(iso: string) {
    const d = parseDate(iso);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  }

  getTempoDecorrido(criadoEm: string): string {
    const agora = this.store.agora();
    const criado = parseDate(criadoEm);
    const diffH = Math.floor(differenceInHours(agora, criado));
    if (diffH <= 0) {
      const diffMin = Math.max(1, Math.floor((agora.getTime() - criado.getTime()) / (1000 * 60)));
      return `${diffMin} min`;
    }
    return `${diffH} h`;
  }

  aprovarPedido(solicitacaoId: string) {
    const respId = this.store.usuarioLogado()?.id || 'user-marta';
    const res = this.store.aprovarPedido(solicitacaoId, respId);
    if (res.sucesso) {
      this.feedbackMensagem.set('Pedido aprovado! O item foi marcado como reservado e aguarda retirada hoje.');
    }
  }

  abrirModalRecusa(solic: Solicitacao) {
    this.solicitacaoParaRecusar.set(solic);
  }

  confirmarRecusa(solicitacaoId: string, motivo: string) {
    const respId = this.store.usuarioLogado()?.id || 'user-marta';
    const res = this.store.recusarPedido(solicitacaoId, respId, motivo || 'Solicitação recusada pelo responsável');
    this.solicitacaoParaRecusar.set(null);
    if (res.sucesso) {
      this.feedbackMensagem.set('Pedido recusado. O item retornou como disponível para o catálogo.');
    }
  }
}
