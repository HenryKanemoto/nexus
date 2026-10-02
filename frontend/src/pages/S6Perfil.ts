import {ChangeDetectionStrategy, Component, computed, inject} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {NexusStore} from '../store/nexus.store';
import {MatIconModule} from '@angular/material/icon';
import {formatDateShort} from '../lib/date-utils';

@Component({
  selector: 'app-s6-perfil',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatIconModule],
  template: `
    <div class="space-y-8 font-['Sora',sans-serif] max-w-4xl mx-auto">
      <!-- Cabeçalho (Wireframe S6) -->
      <div class="flex items-center justify-between pb-2 border-b border-slate-200">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-[#0E1A3A]">
            Meu perfil
          </h1>
          <p class="text-xs text-slate-500 mt-1">
            Informações cadastrais, situação de acesso e histórico de ocorrências
          </p>
        </div>
      </div>

      @if (usuario(); as u) {
        <!-- Seção Superior: Dados Pessoais & Situação da Conta (Wireframe S6) -->
        <div class="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          <!-- Coluna Esquerda: Avatar e Informações Cadastrais (Wireframe S6) -->
          <div class="md:col-span-7 flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <!-- Círculo Grande de Avatar -->
            <div class="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-slate-300 bg-slate-100 flex items-center justify-center shrink-0 shadow-xs">
              <span class="text-2xl sm:text-3xl font-extrabold text-[#0E1A3A] tracking-wider select-none">
                {{ iniciais() }}
              </span>
            </div>

            <!-- Dados do Usuário -->
            <div class="space-y-2 text-center sm:text-left text-xs sm:text-sm">
              <div>
                <span class="text-slate-500 text-xs block">Nome:</span>
                <strong class="font-bold text-[#0E1A3A] text-base sm:text-lg">{{ u.nome }}</strong>
              </div>

              <div>
                <span class="text-slate-500 text-xs block">E-mail:</span>
                <span class="text-slate-700 font-medium">{{ u.email }}</span>
              </div>

              <div>
                <span class="text-slate-500 text-xs block">Matrícula:</span>
                <span class="font-mono text-slate-800 font-bold">{{ u.matricula }}</span>
              </div>

              <div>
                <span class="text-slate-500 text-xs block">Perfil:</span>
                <span class="capitalize font-semibold text-slate-800">{{ u.perfil }}</span>
              </div>
            </div>
          </div>

          <!-- Coluna Direita: Situação da Conta (Wireframe S6) -->
          <div class="md:col-span-5 space-y-3">
            <h2 class="text-base font-bold text-[#0E1A3A]">
              Situação da conta
            </h2>

            <!-- Badge do Status Atual -->
            <div>
              <span
                class="inline-block px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider border shadow-2xs {{
                  u.status === 'ativa' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                  u.status === 'bloqueada' ? 'bg-rose-50 text-rose-800 border-rose-300' :
                  u.status === 'suspensa' ? 'bg-purple-50 text-purple-800 border-purple-300' :
                  'bg-amber-50 text-amber-800 border-amber-300'
                }}"
              >
                {{ u.status }}
              </span>
            </div>

            <!-- Caixa de Detalhamento com Borda Tracejada (Wireframe S6) -->
            <div class="p-4 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/70 text-xs space-y-2.5">
              @if (u.status === 'bloqueada') {
                <!-- Se Bloqueada (Wireframe S6: Motivo "Item" está atrasado há X dias + Link -> S4) -->
                @let atrasado = itemAtrasadoInfo();
                <div class="space-y-2">
                  <p class="text-slate-800 leading-relaxed">
                    <strong>Motivo:</strong>
                    @if (atrasado) {
                      "{{ atrasado.itemNome }}" está atrasado há {{ atrasado.dias }} {{ atrasado.dias === 1 ? 'dia' : 'dias' }}.
                    } @else {
                      Pendência de devolução em atraso na conta.
                    }
                  </p>
                  <div>
                    <a
                      routerLink="/meus-emprestimos"
                      class="text-[#2F6BFF] hover:underline font-bold inline-flex items-center gap-1 group"
                    >
                      <span>Ir para o item atrasado</span>
                      <span class="text-xs group-hover:translate-x-0.5 transition-transform">-> S4</span>
                    </a>
                  </div>
                </div>
              } @else if (u.status === 'suspensa') {
                <!-- Se Suspensa (Wireframe S6: "Suspensa até __/__" no lugar do bloqueio) -->
                <div class="space-y-1">
                  <p class="text-purple-900 font-bold text-sm">
                    Suspensa até {{ formatarData(u.suspensoAte) }}
                  </p>
                  <p class="text-slate-600 text-[11px] leading-relaxed">
                    Consequência aplicada pela política de atraso na última devolução. O acesso será reativado automaticamente após esta data.
                  </p>
                </div>
              } @else if (u.status === 'ativa') {
                <!-- Se Ativa -->
                <p class="text-emerald-800 leading-relaxed">
                  Conta regularizada e ativa. Você pode solicitar equipamentos livremente de acordo com os limites do catálogo.
                </p>
              } @else {
                <!-- Se Pendente -->
                <p class="text-amber-800 leading-relaxed">
                  Cadastro aguardando liberação e aprovação de um responsável pelo acervo escolar (RN08).
                </p>
              }
            </div>
          </div>
        </div>

        <!-- Tabela: Ocorrências (Wireframe S6) -->
        <div class="space-y-3 pt-4 border-t border-slate-200">
          <div class="flex items-center justify-between">
            <h2 class="text-base font-bold text-[#0E1A3A]">
              Ocorrências
            </h2>
            <span class="text-xs text-slate-500">
              Registros de avarias ou peças danificadas vinculadas (RN07)
            </span>
          </div>

          <div class="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-2xs">
            <table class="w-full text-xs text-left">
              <thead class="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th class="p-3.5 w-1/4">Item</th>
                  <th class="p-3.5 w-28">Data</th>
                  <th class="p-3.5">Descrição</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                @for (ocorr of ocorrencias(); track ocorr.id) {
                  @let it = getItem(ocorr.itemId);
                  <tr class="hover:bg-slate-50/60">
                    <td class="p-3.5">
                      <strong class="font-bold text-[#0E1A3A]">{{ it?.nome || 'Equipamento' }}</strong>
                      <span class="block text-[10px] font-mono text-slate-400">{{ it?.patrimonio }}</span>
                    </td>
                    <td class="p-3.5 tabular-nums text-slate-600 font-medium">
                      {{ formatarData(ocorr.criadoEm) }}
                    </td>
                    <td class="p-3.5 text-slate-700 leading-relaxed">
                      {{ ocorr.descricao }}
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="3" class="p-8 text-center text-xs text-slate-400 italic">
                      Nenhuma ocorrência registrada em seu histórico.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- Botão Sair no canto inferior esquerdo (Wireframe S6: Sair -> P1) -->
        <div class="pt-6">
          <button
            type="button"
            (click)="sair()"
            class="px-6 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 text-slate-700 font-bold text-xs uppercase tracking-wider transition-colors shadow-2xs flex items-center gap-2 cursor-pointer"
          >
            <mat-icon class="text-sm w-4 h-4 flex items-center justify-center">logout</mat-icon>
            <span>Sair</span>
          </button>
        </div>
      }
    </div>
  `,
})
export class S6Perfil {
  readonly store = inject(NexusStore);
  private readonly router = inject(Router);

  readonly usuario = computed(() => this.store.usuarioLogado());

  readonly iniciais = computed(() => {
    const nome = this.usuario()?.nome || 'Nexus';
    const partes = nome.trim().split(' ');
    if (partes.length >= 2) {
      return (partes[0][0] + partes[1][0]).toUpperCase();
    }
    return nome.slice(0, 2).toUpperCase();
  });

  readonly itemAtrasadoInfo = computed(() => {
    const u = this.usuario();
    if (!u) return null;
    const emp = this.store.emprestimos().find(
      (e) => e.usuarioId === u.id && !e.devolvidoEm && e.diasAtraso > 0
    );
    if (!emp) return null;
    const it = this.store.itens().find((i) => i.id === emp.itemId);
    return {
      itemNome: it?.nome || 'Equipamento',
      dias: emp.diasAtraso,
    };
  });

  readonly ocorrencias = computed(() => {
    const u = this.usuario();
    if (!u) return [];
    return this.store.ocorrencias().filter((o) => o.usuarioId === u.id);
  });

  getItem(id: string) {
    return this.store.itens().find((i) => i.id === id);
  }

  formatarData(iso?: string) {
    if (!iso) return '—';
    return formatDateShort(iso);
  }

  sair() {
    this.store.logout();
    this.router.navigate(['/login']);
  }
}
