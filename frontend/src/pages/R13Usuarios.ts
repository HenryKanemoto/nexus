import {ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {NexusStore} from '../store/nexus.store';
import {MatIconModule} from '@angular/material/icon';
import {StatusBadge} from '../components/status-badge/status-badge';

@Component({
  selector: 'app-r13-usuarios',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatIconModule, StatusBadge],
  template: `
    <div class="space-y-6 font-['Sora',sans-serif] max-w-7xl">
      <!-- Cabeçalho (Wireframe R13) -->
      <div class="flex items-center justify-between pb-2 border-b border-slate-200">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-[#0E1A3A]">
            Usuários
          </h1>
          <p class="text-xs text-slate-500 mt-1">
            Cadastro de alunos, professores e responsáveis pelo acervo escolar
          </p>
        </div>

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

      <!-- Campo de Busca por Nome ou Matrícula (Wireframe R13) -->
      <div class="max-w-md relative">
        <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <mat-icon class="text-base w-4 h-4 flex items-center justify-center">search</mat-icon>
        </div>
        <input
          type="text"
          [value]="termoBusca()"
          (input)="termoBusca.set($any($event.target).value)"
          placeholder="Nome ou matrícula"
          class="block w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:border-[#2F6BFF] focus:outline-hidden focus:ring-1 focus:ring-[#2F6BFF]"
        />
      </div>

      <!-- Tabela Desktop (hidden sm:block) -->
      <div class="hidden sm:block bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-xs text-left">
            <thead class="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold select-none">
              <tr>
                <th class="p-4 w-2/5">Nome</th>
                <th class="p-4 w-1/5">Matrícula</th>
                <th class="p-4 w-1/5">Perfil</th>
                <th class="p-4 text-right w-1/5">Situação</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @for (user of usuariosFiltrados(); track user.id) {
                <tr
                  tabindex="0"
                  role="button"
                  (click)="abrirUsuario(user.id)"
                  (keydown.enter)="abrirUsuario(user.id)"
                  class="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                >
                  <td class="p-4">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700 shrink-0 group-hover:bg-[#2F6BFF] group-hover:text-white transition-colors">
                        {{ getIniciais(user.nome) }}
                      </div>
                      <div>
                        <strong class="font-bold text-[#0E1A3A] group-hover:text-[#2F6BFF] transition-colors block text-xs sm:text-sm">
                          {{ user.nome }}
                        </strong>
                        <span class="block text-[11px] text-slate-400">
                          {{ user.email }}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td class="p-4 font-mono font-bold text-slate-700">
                    {{ user.matricula }}
                  </td>
                  <td class="p-4 capitalize font-medium text-slate-800">
                    {{ user.perfil }}
                  </td>
                  <td class="p-4 text-right">
                    <app-status-badge [status]="user.status"></app-status-badge>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="4" class="p-10 text-center text-xs text-slate-400 italic">
                    Nenhum usuário encontrado com o termo informado.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Lista de Cartões para Mobile (sm:hidden) -->
      <div class="sm:hidden space-y-3">
        @for (user of usuariosFiltrados(); track user.id) {
          <div
            tabindex="0"
            role="button"
            (click)="abrirUsuario(user.id)"
            (keydown.enter)="abrirUsuario(user.id)"
            class="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2.5 cursor-pointer active:bg-slate-50 transition-colors"
          >
            <div class="flex items-start justify-between gap-2">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700 shrink-0">
                  {{ getIniciais(user.nome) }}
                </div>
                <div>
                  <strong class="font-bold text-sm text-[#0E1A3A] block">
                    {{ user.nome }}
                  </strong>
                  <span class="text-[11px] text-slate-400 block">{{ user.email }}</span>
                </div>
              </div>
              <app-status-badge [status]="user.status"></app-status-badge>
            </div>

            <div class="flex items-center justify-between text-xs pt-2 border-t border-slate-100 text-slate-600">
              <span>Matrícula: <strong class="font-mono text-slate-800">{{ user.matricula }}</strong></span>
              <span class="capitalize font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">{{ user.perfil }}</span>
            </div>

            <div class="text-[11px] text-[#2F6BFF] font-bold flex items-center justify-end gap-1 pt-0.5">
              <span>Ver histórico completo</span>
              <mat-icon class="text-xs w-3.5 h-3.5 flex items-center justify-center">chevron_right</mat-icon>
            </div>
          </div>
        } @empty {
          <div class="p-8 rounded-2xl bg-white border border-slate-200 text-center text-xs text-slate-400 italic">
            Nenhum usuário encontrado com o termo informado.
          </div>
        }
      </div>

      <div class="p-3.5 bg-white sm:bg-slate-50/50 rounded-xl sm:rounded-2xl border border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
        <span>Total: <strong>{{ usuariosFiltrados().length }}</strong> usuário(s)</span>
        <span class="text-[10px] text-slate-400 italic">Clique na linha ou cartão para ver o histórico (R14)</span>
      </div>
    </div>
  `,
})
export class R13Usuarios {
  readonly store = inject(NexusStore);
  private readonly router = inject(Router);

  readonly termoBusca = signal('');

  readonly usuariosFiltrados = computed(() => {
    const termo = this.termoBusca().trim().toLowerCase();
    const todos = this.store.usuarios();

    if (!termo) {
      return todos;
    }

    return todos.filter(
      (u) =>
        u.nome.toLowerCase().includes(termo) ||
        u.matricula.toLowerCase().includes(termo) ||
        u.email.toLowerCase().includes(termo)
    );
  });

  abrirUsuario(id: string) {
    this.router.navigate(['/painel/usuarios', id]);
  }

  getIniciais(nome: string): string {
    const partes = (nome || '').trim().split(' ');
    if (partes.length >= 2) {
      return (partes[0][0] + partes[1][0]).toUpperCase();
    }
    return (nome || 'U').slice(0, 2).toUpperCase();
  }
}
