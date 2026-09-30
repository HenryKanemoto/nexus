import {ChangeDetectionStrategy, Component, computed, inject} from '@angular/core';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {NexusStore} from '../store/nexus.store';
import {MatIconModule} from '@angular/material/icon';
import {StatusBadge} from '../components/status-badge/status-badge';
import {formatDateShort} from '../lib/date-utils';
import {Emprestimo} from '../types/models';

@Component({
  selector: 'app-r14-usuario-detalhes',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatIconModule, StatusBadge],
  template: `
    <div class="space-y-8 font-['Sora',sans-serif] max-w-7xl">
      <!-- Barra Superior: Link "<- Voltar" para R13 + Sininho -> R17 (Wireframe R14) -->
      <div class="flex items-center justify-between pb-2 border-b border-slate-200">
        <!-- Link "<- Voltar" -> R13 -->
        <a
          routerLink="/painel/usuarios"
          class="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-[#2F6BFF] transition-colors group cursor-pointer"
        >
          <mat-icon class="text-sm w-4 h-4 flex items-center justify-center group-hover:-translate-x-0.5 transition-transform">
            arrow_back
          </mat-icon>
          <span>Voltar</span>
        </a>

        <!-- Sininho -> R17 -->
        <a
          routerLink="/painel/notificacoes"
          class="relative p-2 rounded-xl text-slate-600 hover:text-[#0E1A3A] hover:bg-slate-100 transition-colors"
          title="Notificações"
        >
          <mat-icon class="text-2xl">notifications</mat-icon>
          @if (store.totalNaoLidas() > 0) {
            <span class="absolute top-1 right-1 flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold tabular-nums ring-2 ring-white">
              {{ store.totalNaoLidas() }}
            </span>
          }
        </a>
      </div>

      @if (usuario(); as u) {
        <!-- Dados do Usuário + Selo de Situação da Conta (Wireframe R14) -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            <!-- Círculo Grande de Avatar -->
            <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-slate-300 bg-slate-100 flex items-center justify-center font-bold text-xl sm:text-2xl text-[#0E1A3A] shrink-0 select-none shadow-xs">
              {{ getIniciais(u.nome) }}
            </div>

            <!-- Nome da pessoa e subtítulo -->
            <div>
              <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0E1A3A]">
                {{ u.nome }}
              </h1>
              <p class="text-xs sm:text-sm text-slate-500 capitalize mt-0.5">
                {{ u.perfil }} · matrícula <span class="font-mono font-bold text-slate-700">{{ u.matricula }}</span>
              </p>
            </div>
          </div>

          <!-- Selo de Situação da Conta (Wireframe R14: [ ATIVA ] / [ BLOQUEADA ] / [ SUSPENSA ]) -->
          <div class="shrink-0">
            <app-status-badge [status]="u.status"></app-status-badge>
            @if (u.suspensoAte) {
              <span class="block text-[11px] text-purple-700 font-semibold mt-1 text-right">
                Até {{ formatarData(u.suspensoAte) }}
              </span>
            }
          </div>
        </div>

        <!-- Três Contadores Clicáveis/Informativos (Wireframe R14: Empréstimos | Atrasos | Ocorrências) -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <!-- Contador 1: Empréstimos -->
          <div class="p-6 rounded-2xl bg-white border-2 border-slate-800 shadow-sm text-center sm:text-left space-y-1">
            <span class="block text-4xl sm:text-5xl font-black text-[#0E1A3A] tabular-nums">
              {{ totalEmprestimos() }}
            </span>
            <span class="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
              {{ totalEmprestimos() === 1 ? 'empréstimo' : 'empréstimos' }}
            </span>
          </div>

          <!-- Contador 2: Atrasos -->
          <div class="p-6 rounded-2xl bg-white border-2 border-slate-800 shadow-sm text-center sm:text-left space-y-1">
            <span
              class="block text-4xl sm:text-5xl font-black tabular-nums {{
                totalAtrasos() > 0 ? 'text-rose-600' : 'text-[#0E1A3A]'
              }}"
            >
              {{ totalAtrasos() }}
            </span>
            <span class="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
              {{ totalAtrasos() === 1 ? 'atraso' : 'atrasos' }}
            </span>
          </div>

          <!-- Contador 3: Ocorrências -->
          <div class="p-6 rounded-2xl bg-white border-2 border-slate-800 shadow-sm text-center sm:text-left space-y-1">
            <span
              class="block text-4xl sm:text-5xl font-black tabular-nums {{
                totalOcorrencias() > 0 ? 'text-amber-600' : 'text-[#0E1A3A]'
              }}"
            >
              {{ totalOcorrencias() }}
            </span>
            <span class="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
              {{ totalOcorrencias() === 1 ? 'ocorrência' : 'ocorrências' }}
            </span>
          </div>
        </div>

        <!-- Seção: Empréstimos (Wireframe R14: Item | Retirada | Devolução | Situação final) -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-bold text-[#0E1A3A]">
              Empréstimos
            </h2>
            <span class="text-xs text-slate-500 font-medium">
              Histórico completo de circulação
            </span>
          </div>

          <!-- Tabela Desktop (hidden sm:block) -->
          <div class="hidden sm:block bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-xs text-left">
                <thead class="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold select-none">
                  <tr>
                    <th class="p-4 w-2/5">Item</th>
                    <th class="p-4 w-1/5">Retirada</th>
                    <th class="p-4 w-1/5">Devolução</th>
                    <th class="p-4 text-right w-1/5">Situação final</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  @for (emp of emprestimosUsuario(); track emp.id) {
                    @let item = getItem(emp.itemId);
                    @let situacao = getSituacaoFinal(emp);
                    <tr class="hover:bg-slate-50/70 transition-colors">
                      <td class="p-4">
                        <strong class="font-bold text-[#0E1A3A] block text-xs sm:text-sm">
                          {{ item?.nome || 'Equipamento' }}
                        </strong>
                        <span class="font-mono text-[10px] text-slate-400 font-semibold block mt-0.5">
                          {{ item?.patrimonio }}
                        </span>
                      </td>
                      <td class="p-4 tabular-nums text-slate-600 font-medium">
                        {{ formatarData(emp.retiradoEm) }}
                      </td>
                      <td class="p-4 tabular-nums text-slate-600 font-medium">
                        {{ emp.devolvidoEm ? formatarData(emp.devolvidoEm) : 'Em andamento' }}
                      </td>
                      <td class="p-4 text-right">
                        <span class="inline-block px-2.5 py-1 rounded-lg text-[11px] font-semibold {{ situacao.classeCss }}">
                          {{ situacao.texto }}
                        </span>
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="4" class="p-10 text-center text-xs text-slate-400 italic">
                        Nenhum empréstimo registrado para este usuário até o momento.
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>

          <!-- Lista de Cartões para Mobile (sm:hidden) -->
          <div class="sm:hidden space-y-3">
            @for (emp of emprestimosUsuario(); track emp.id) {
              @let item = getItem(emp.itemId);
              @let situacao = getSituacaoFinal(emp);
              <div class="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2.5">
                <div class="flex items-start justify-between gap-2">
                  <div>
                    <strong class="font-bold text-[#0E1A3A] text-sm block">
                      {{ item?.nome || 'Equipamento' }}
                    </strong>
                    <span class="font-mono text-[10px] text-slate-400 font-semibold block mt-0.5">
                      {{ item?.patrimonio }}
                    </span>
                  </div>
                  <span class="px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 {{ situacao.classeCss }}">
                    {{ situacao.texto }}
                  </span>
                </div>

                <div class="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                  <div>
                    <span class="block text-[10px] text-slate-400 uppercase font-semibold">Retirada</span>
                    <span class="font-mono text-slate-700 font-medium">{{ formatarData(emp.retiradoEm) }}</span>
                  </div>
                  <div>
                    <span class="block text-[10px] text-slate-400 uppercase font-semibold">Devolução</span>
                    <span class="font-mono text-slate-700 font-medium">{{ emp.devolvidoEm ? formatarData(emp.devolvidoEm) : 'Em andamento' }}</span>
                  </div>
                </div>
              </div>
            } @empty {
              <div class="p-8 rounded-2xl bg-white border border-slate-200 text-center text-xs text-slate-400 italic">
                Nenhum empréstimo registrado para este usuário até o momento.
              </div>
            }
          </div>
        </div>
      } @else {
        <div class="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <mat-icon class="text-4xl text-slate-400">help_outline</mat-icon>
          <h2 class="text-lg font-bold text-slate-800">Usuário Não Encontrado</h2>
          <p class="text-xs text-slate-500">
            O registro solicitado não consta no cadastro escolar.
          </p>
          <a
            routerLink="/painel/usuarios"
            class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2F6BFF] text-white text-xs font-semibold"
          >
            Voltar para Usuários
          </a>
        </div>
      }
    </div>
  `,
})
export class R14UsuarioDetalhes {
  private readonly route = inject(ActivatedRoute);
  readonly store = inject(NexusStore);

  readonly usuarioId = computed(() => this.route.snapshot.paramMap.get('id') || '');

  readonly usuario = computed(() => {
    const id = this.usuarioId();
    return this.store.usuarios().find((u) => u.id === id) || null;
  });

  readonly emprestimosUsuario = computed(() => {
    const id = this.usuarioId();
    return this.store.emprestimos().filter((e) => e.usuarioId === id);
  });

  // Contador 1: total de empréstimos
  readonly totalEmprestimos = computed(() => {
    return this.emprestimosUsuario().length;
  });

  // Contador 2: total de empréstimos com atraso
  readonly totalAtrasos = computed(() => {
    return this.emprestimosUsuario().filter((e) => e.diasAtraso > 0).length;
  });

  // Contador 3: total de ocorrências do usuário
  readonly totalOcorrencias = computed(() => {
    const id = this.usuarioId();
    return this.store.ocorrencias().filter((o) => o.usuarioId === id).length;
  });

  getItem(id: string) {
    return this.store.itens().find((i) => i.id === id);
  }

  formatarData(iso?: string): string {
    if (!iso) return '—';
    return formatDateShort(iso);
  }

  getIniciais(nome: string): string {
    const partes = (nome || '').trim().split(' ');
    if (partes.length >= 2) {
      return (partes[0][0] + partes[1][0]).toUpperCase();
    }
    return (nome || 'U').slice(0, 2).toUpperCase();
  }

  getSituacaoFinal(emp: Emprestimo): { texto: string; classeCss: string } {
    if (!emp.devolvidoEm) {
      if (emp.diasAtraso > 0) {
        return {
          texto: `Em atraso (${emp.diasAtraso}d)`,
          classeCss: 'bg-rose-50 text-rose-700 border border-rose-200',
        };
      }
      return {
        texto: 'Em andamento',
        classeCss: 'bg-blue-50 text-blue-700 border border-blue-200',
      };
    }

    // Se devolvido, verifica se gerou ocorrência de defeito
    const teveDefeito = this.store.ocorrencias().some((o) => o.emprestimoId === emp.id);
    if (teveDefeito) {
      return {
        texto: 'Devolvido com defeito',
        classeCss: 'bg-purple-50 text-purple-800 border border-purple-200',
      };
    }

    if (emp.diasAtraso > 0) {
      return {
        texto: `Atraso de ${emp.diasAtraso} ${emp.diasAtraso === 1 ? 'dia' : 'dias'}`,
        classeCss: 'bg-amber-50 text-amber-800 border border-amber-200',
      };
    }

    return {
      texto: 'Devolvido no prazo',
      classeCss: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
    };
  }
}
