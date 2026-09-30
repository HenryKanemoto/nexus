import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {NexusStore} from '../store/nexus.store';
import {MatIconModule} from '@angular/material/icon';
import {RelogioFlutuante} from '../components/relogio-flutuante/relogio-flutuante';
import {Usuario} from '../types/models';

@Component({
  selector: 'app-p1-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatIconModule, RelogioFlutuante],
  template: `
    <div class="min-h-screen bg-[#F6F7FB] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 font-['Sora',sans-serif]">
      <!-- Cabeçalho Institucional / Logo -->
      <div class="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div class="inline-flex items-center justify-center gap-2 mb-3">
          <div class="w-10 h-10 rounded-xl bg-[#0E1A3A] flex items-center justify-center text-white shadow-xs">
            <mat-icon class="text-xl">inventory_2</mat-icon>
          </div>
          <span class="text-3xl font-extrabold tracking-tight text-[#0E1A3A]">NEXUS</span>
        </div>
        <h1 class="text-lg font-bold text-[#0E1A3A]">
          Gestão de Empréstimos e Equipamentos
        </h1>
        <p class="text-xs text-slate-500 mt-1">
          Acesse com seu e-mail institucional ou número de matrícula
        </p>
      </div>

      <!-- Card Principal de Login (Wireframe P1) -->
      <div class="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white py-8 px-6 shadow-sm rounded-2xl border border-slate-200/90 sm:px-9 space-y-6">

          <!-- Alerta de Erro -->
          @if (mensagemErro()) {
            <div
              role="alert"
              class="p-3.5 rounded-xl bg-rose-50 border border-rose-200/90 text-xs text-rose-800 flex items-start gap-2.5 animate-fadeIn"
            >
              <mat-icon class="text-base text-rose-600 shrink-0 mt-0.5">error_outline</mat-icon>
              <div class="flex-1 font-medium leading-relaxed">
                {{ mensagemErro() }}
              </div>
            </div>
          }

          <!-- Formulário de Login -->
          <form (submit)="submeterLogin($event)" class="space-y-4">
            <div>
              <label for="identificador" class="block text-xs font-semibold text-slate-700 mb-1.5">
                E-mail ou Matrícula
              </label>
              <div class="relative rounded-xl shadow-2xs">
                <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <mat-icon class="text-lg w-5 h-5 flex items-center justify-center">account_circle</mat-icon>
                </div>
                <input
                  id="identificador"
                  name="identificador"
                  type="text"
                  [value]="identificador()"
                  (input)="identificador.set($any($event.target).value); mensagemErro.set(null)"
                  placeholder="ex: ana.souza@escola.edu.br ou ALU-1001"
                  required
                  autocomplete="username"
                  class="block w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#2F6BFF] focus:outline-hidden focus:ring-1 focus:ring-[#2F6BFF]"
                />
              </div>
            </div>

            <div>
              <div class="flex items-center justify-between mb-1.5">
                <label for="senha" class="block text-xs font-semibold text-slate-700">
                  Senha
                </label>
              </div>
              <div class="relative rounded-xl shadow-2xs">
                <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <mat-icon class="text-lg w-5 h-5 flex items-center justify-center">lock</mat-icon>
                </div>
                <input
                  id="senha"
                  name="senha"
                  [type]="mostrarSenha() ? 'text' : 'password'"
                  [value]="senha()"
                  (input)="senha.set($any($event.target).value); mensagemErro.set(null)"
                  placeholder="Sua senha"
                  required
                  autocomplete="current-password"
                  class="block w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#2F6BFF] focus:outline-hidden focus:ring-1 focus:ring-[#2F6BFF]"
                />
                <button
                  type="button"
                  (click)="alternarVisibilidadeSenha()"
                  class="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  [attr.aria-label]="mostrarSenha() ? 'Ocultar senha' : 'Exibir senha'"
                >
                  <mat-icon class="text-lg w-5 h-5 flex items-center justify-center">
                    {{ mostrarSenha() ? 'visibility_off' : 'visibility' }}
                  </mat-icon>
                </button>
              </div>
            </div>

            <button
              type="submit"
              class="w-full py-2.5 px-4 rounded-xl bg-[#2F6BFF] hover:bg-blue-600 active:bg-blue-700 text-white font-semibold text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <span>Entrar</span>
              <mat-icon class="text-base w-4 h-4 flex items-center justify-center">login</mat-icon>
            </button>
          </form>

          <!-- Link para Criação de Conta (P2) -->
          <div class="pt-4 border-t border-slate-100 text-center">
            <p class="text-xs text-slate-600">
              Não possui uma conta?
              <a
                routerLink="/cadastro"
                class="font-semibold text-[#2F6BFF] hover:text-blue-700 hover:underline ml-1 cursor-pointer"
              >
                Cadastre-se aqui
              </a>
            </p>
          </div>

          <!-- BLOCO DEMO: Botões de demonstração (fácil de remover depois) -->
          <div class="pt-4 border-t border-dashed border-slate-200">
            <p class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-center mb-2.5">
              Demonstração (1 clique preenche e entra)
            </p>
            <div class="grid grid-cols-3 gap-2">
              <button
                type="button"
                (click)="preencherEEntrar('aluno')"
                class="py-2 px-2 text-center rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 text-slate-700 transition-colors cursor-pointer text-left"
                title="Ana Souza (Aluna Ativa)"
              >
                <div class="text-[11px] font-bold text-slate-800 truncate">Aluno</div>
                <div class="text-[10px] text-slate-500 truncate">Ana Souza</div>
              </button>

              <button
                type="button"
                (click)="preencherEEntrar('professor')"
                class="py-2 px-2 text-center rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 text-slate-700 transition-colors cursor-pointer text-left"
                title="Prof. Carlos Mendes (Professor Ativo)"
              >
                <div class="text-[11px] font-bold text-slate-800 truncate">Professor</div>
                <div class="text-[10px] text-slate-500 truncate">Prof. Carlos</div>
              </button>

              <button
                type="button"
                (click)="preencherEEntrar('responsavel')"
                class="py-2 px-2 text-center rounded-lg border border-blue-200 bg-blue-50/70 hover:bg-blue-100/70 hover:border-blue-300 text-[#2F6BFF] transition-colors cursor-pointer text-left"
                title="Marta Ribeiro (Responsável Acervo)"
              >
                <div class="text-[11px] font-bold text-[#2F6BFF] truncate">Responsável</div>
                <div class="text-[10px] text-blue-700 truncate">Marta R.</div>
              </button>
            </div>
          </div>
          <!-- FIM DO BLOCO DEMO -->

        </div>
      </div>

      <!-- Relógio Simulado Nexus -->
      <app-relogio-flutuante></app-relogio-flutuante>
    </div>
  `,
})
export class P1Login {
  private readonly store = inject(NexusStore);
  private readonly router = inject(Router);

  readonly identificador = signal('marta@escola.edu.br');
  readonly senha = signal('123456');
  readonly mostrarSenha = signal(false);
  readonly mensagemErro = signal<string | null>(null);

  alternarVisibilidadeSenha() {
    this.mostrarSenha.update((v) => !v);
  }

  preencherEEntrar(perfil: 'aluno' | 'professor' | 'responsavel') {
    if (perfil === 'aluno') {
      this.identificador.set('ana.souza@escola.edu.br');
      this.senha.set('123456');
    } else if (perfil === 'professor') {
      this.identificador.set('carlos.mendes@escola.edu.br');
      this.senha.set('123456');
    } else {
      this.identificador.set('marta@escola.edu.br');
      this.senha.set('123456');
    }
    this.mensagemErro.set(null);
    this.executarLogin();
  }

  submeterLogin(event: Event) {
    event.preventDefault();
    this.executarLogin();
  }

  private executarLogin() {
    const idVal = this.identificador().trim();
    const passVal = this.senha().trim();

    if (!idVal) {
      this.mensagemErro.set('Por favor, informe seu e-mail ou matrícula.');
      return;
    }

    if (!passVal) {
      this.mensagemErro.set('Por favor, informe sua senha.');
      return;
    }

    const resultado = this.store.login(idVal, passVal);

    if (resultado.sucesso && resultado.usuario) {
      this.redirecionarAposLogin(resultado.usuario);
    } else {
      this.mensagemErro.set(resultado.mensagem || 'E-mail, matrícula ou senha incorretos.');
    }
  }

  /**
   * Regras de Redirecionamento pós-login:
   * - Solicitante ativo -> /catalogo
   * - Responsável -> /painel
   * - Conta pendente -> /aguardando (RN08)
   * - Conta bloqueada ou suspensa -> /perfil (não pode solicitar)
   */
  private redirecionarAposLogin(usuario: Usuario) {
    if (usuario.perfil === 'responsavel') {
      this.router.navigate(['/painel']);
      return;
    }

    if (usuario.status === 'pendente') {
      this.router.navigate(['/aguardando']);
      return;
    }

    if (usuario.status === 'bloqueada' || usuario.status === 'suspensa') {
      this.router.navigate(['/perfil']);
      return;
    }

    // Solicitante ativo
    this.router.navigate(['/catalogo']);
  }
}
