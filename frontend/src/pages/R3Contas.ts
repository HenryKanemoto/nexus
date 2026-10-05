import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NexusStore } from '../store/nexus.store';
import { MatIconModule } from '@angular/material/icon';
import { Usuario } from '../types/models';
import { formatDateShort } from '../lib/date-utils';

@Component({
  selector: 'app-r3-contas',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  template: `
    <div class="space-y-6 font-['Sora',sans-serif] max-w-7xl">
      <!-- Cabeçalho (Wireframe R3) -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-[#0E1A3A]">
            Contas pendentes
          </h1>
          <p class="text-xs text-slate-500 mt-1">
            Novos cadastros de alunos e professores aguardando liberação de acesso
          </p>
        </div>
      </div>

      <!-- Feedback de Operação -->
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

      <!-- Tabela Principal: Contas Pendentes (Wireframe R3) -->
      <div class="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-[#2F6BFF]"></span>
            <h2 class="text-base font-bold text-[#0E1A3A]">
              Cadastros para Avaliação
            </h2>
            <span class="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
              {{ contasPendentes().length }}
            </span>
          </div>
          <span class="text-xs text-slate-500">
            Aprovação libera acesso ao catálogo e solicitações
          </span>
        </div>

        <!-- Tabela Desktop (hidden md:block) -->
        <div class="hidden md:block overflow-x-auto rounded-xl border border-slate-200">
          <table class="w-full text-xs text-left">
            <thead class="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th class="p-3 w-1/4">Nome</th>
                <th class="p-3 w-1/4">E-mail</th>
                <th class="p-3 w-28">Matrícula</th>
                <th class="p-3 w-24">Perfil</th>
                <th class="p-3 w-28">Data do cadastro</th>
                <th class="p-3 text-right w-44">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @for (u of contasPendentes(); track u.id) {
                <tr class="hover:bg-slate-50/60 transition-colors">
                  <td class="p-3">
                    <strong class="font-bold text-slate-800">{{ u.nome }}</strong>
                  </td>
                  <td class="p-3">
                    <span class="text-slate-600 select-all">{{ u.email }}</span>
                  </td>
                  <td class="p-3 font-mono text-slate-700 font-semibold">
                    {{ u.matricula }}
                  </td>
                  <td class="p-3">
                    <span
                      class="px-2 py-0.5 rounded text-[11px] font-semibold capitalize"
                      [class.bg-blue-50]="u.perfil === 'aluno'"
                      [class.text-blue-700]="u.perfil === 'aluno'"
                      [class.bg-purple-50]="u.perfil === 'professor'"
                      [class.text-purple-700]="u.perfil === 'professor'"
                    >
                      {{ u.perfil }}
                    </span>
                  </td>
                  <td class="p-3 tabular-nums text-slate-500">
                    {{ formatarData(u.criadoEm) }}
                  </td>
                  <td class="p-3 text-right">
                    <div class="inline-flex items-center gap-2">
                      <button
                        type="button"
                        (click)="aprovarConta(u)"
                        class="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] transition-colors shadow-2xs flex items-center gap-1 cursor-pointer"
                        title="Aprovar conta (deixa ativa e notifica)"
                      >
                        <mat-icon class="text-xs w-3.5 h-3.5 flex items-center justify-center">check</mat-icon>
                        <span>Aprovar</span>
                      </button>

                      <button
                        type="button"
                        (click)="abrirModalRecusa(u)"
                        class="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 text-slate-700 font-semibold text-[11px] transition-colors cursor-pointer"
                        title="Recusar cadastro com confirmação"
                      >
                        <span>Recusar</span>
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="6" class="p-8 text-center text-xs text-slate-400 italic">
                    Nenhuma conta pendente de aprovação no momento.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Lista de Cartões para Mobile (md:hidden) -->
        <div class="md:hidden space-y-3">
          @for (u of contasPendentes(); track u.id) {
            <div class="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div class="flex items-start justify-between gap-2">
                <div>
                  <strong class="text-sm font-bold text-[#0E1A3A] block">{{ u.nome }}</strong>
                  <span class="text-[11px] text-slate-500">{{ u.email }}</span>
                </div>
                <span
                  class="px-2 py-0.5 rounded text-[10px] font-bold capitalize shrink-0"
                  [class.bg-blue-100]="u.perfil === 'aluno'"
                  [class.text-blue-800]="u.perfil === 'aluno'"
                  [class.bg-purple-100]="u.perfil === 'professor'"
                  [class.text-purple-800]="u.perfil === 'professor'"
                >
                  {{ u.perfil }}
                </span>
              </div>

              <div class="flex items-center justify-between text-xs text-slate-600 pt-1 border-t border-slate-200/80">
                <span>Matrícula: <strong class="font-mono text-slate-800">{{ u.matricula }}</strong></span>
                <span class="text-slate-400 text-[10px]">{{ formatarData(u.criadoEm) }}</span>
              </div>

              <div class="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  (click)="aprovarConta(u)"
                  class="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1 shadow-2xs"
                >
                  <mat-icon class="text-xs w-3.5 h-3.5 flex items-center justify-center">check</mat-icon>
                  <span>Aprovar</span>
                </button>
                <button
                  type="button"
                  (click)="abrirModalRecusa(u)"
                  class="py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-rose-50 text-slate-700 font-bold text-xs transition-colors text-center"
                >
                  <span>Recusar</span>
                </button>
              </div>
            </div>
          } @empty {
            <div class="p-6 text-center text-xs text-slate-400 italic">
              Nenhuma conta pendente de aprovação no momento.
            </div>
          }
        </div>
      </div>

      <!-- Modal de Confirmação para Recusa de Conta (Wireframe R3: pede confirmação) -->
      @if (usuarioParaRecusar(); as usr) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4 animate-fadeIn">
          <div class="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div class="flex items-center gap-3 text-rose-600">
              <div class="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center">
                <mat-icon class="text-xl">person_remove</mat-icon>
              </div>
              <div>
                <h3 class="font-bold text-base text-[#0E1A3A]">Confirmar Recusa de Conta</h3>
                <p class="text-xs text-slate-500">A conta será marcada como recusada</p>
              </div>
            </div>

            <div class="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs space-y-1">
              <p><strong>Nome:</strong> {{ usr.nome }}</p>
              <p><strong>E-mail:</strong> {{ usr.email }}</p>
              <p><strong>Matrícula:</strong> {{ usr.matricula }} ({{ usr.perfil }})</p>
            </div>

            <div>
              <label for="motivoContaRecusa" class="block text-xs font-semibold text-slate-700 mb-1">
                Motivo da recusa (opcional):
              </label>
              <input
                id="motivoContaRecusa"
                type="text"
                #motivoContaInput
                placeholder="ex: Matrícula não localizada nos registros acadêmicos"
                class="block w-full rounded-xl border border-slate-300 py-2 px-3 text-xs focus:border-[#2F6BFF] focus:outline-hidden focus:ring-1 focus:ring-[#2F6BFF]"
              />
            </div>

            <div class="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                (click)="usuarioParaRecusar.set(null)"
                class="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                (click)="confirmarRecusaConta(usr.id, motivoContaInput.value)"
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
export class R3Contas {
  readonly store = inject(NexusStore);

  readonly feedbackMensagem = signal<string | null>(null);
  readonly usuarioParaRecusar = signal<Usuario | null>(null);

  readonly contasPendentes = computed(() => {
    return this.store.usuarios().filter((u) => u.status === 'pendente');
  });

  formatarData(iso?: string) {
    if (!iso) return '—';
    return formatDateShort(iso);
  }

  aprovarConta(u: Usuario) {
    this.store.aprovarUsuario(u.id);
    this.feedbackMensagem.set(`Conta de ${u.nome} foi aprovada com sucesso! O solicitante foi notificado.`);
  }

  abrirModalRecusa(u: Usuario) {
    this.usuarioParaRecusar.set(u);
  }

  confirmarRecusaConta(usuarioId: string, motivo: string) {
    this.store.recusarUsuario(usuarioId, motivo);
    this.usuarioParaRecusar.set(null);
    this.feedbackMensagem.set('Cadastro recusado e usuário notificado.');
  }
}
