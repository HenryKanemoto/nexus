import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {NexusStore} from '../store/nexus.store';
import {MatIconModule} from '@angular/material/icon';
import {RelogioFlutuante} from '../components/relogio-flutuante/relogio-flutuante';

interface ErrosFormulario {
  nome?: string;
  email?: string;
  matricula?: string;
  perfil?: string;
  senha?: string;
  confirmacaoSenha?: string;
  geral?: string;
}

@Component({
  selector: 'app-p2-cadastro',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatIconModule, RelogioFlutuante],
  template: `
    <div class="min-h-screen bg-[#F6F7FB] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 font-['Sora',sans-serif]">
      <!-- Cabeçalho -->
      <div class="sm:mx-auto sm:w-full sm:max-w-lg text-center">
        <div class="inline-flex items-center justify-center gap-2 mb-2">
          <div class="w-9 h-9 rounded-xl bg-[#0E1A3A] flex items-center justify-center text-white shadow-xs">
            <mat-icon class="text-lg">person_add</mat-icon>
          </div>
          <span class="text-2xl font-extrabold tracking-tight text-[#0E1A3A]">NEXUS</span>
        </div>
        <h1 class="text-xl font-bold text-[#0E1A3A]">
          Criar Nova Conta
        </h1>
        <p class="text-xs text-slate-500 mt-1">
          Cadastre-se como solicitante para requisitar materiais e equipamentos
        </p>
      </div>

      <!-- Card do Formulário (Wireframe P2) -->
      <div class="mt-6 sm:mx-auto sm:w-full sm:max-w-lg">
        <div class="bg-white py-8 px-6 shadow-sm rounded-2xl border border-slate-200/90 sm:px-9 space-y-5">

          <!-- Aviso de RN08 -->
          <div class="p-3.5 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-900 flex items-start gap-2.5">
            <mat-icon class="text-base text-[#2F6BFF] shrink-0 mt-0.5">info</mat-icon>
            <div class="leading-relaxed">
              <strong>Regra de Cadastro:</strong> Novas contas são criadas com status
              <span class="font-semibold text-blue-800">pendente</span> e necessitam de aprovação
              de um responsável antes de permitir empréstimos.
            </div>
          </div>

          @if (erros().geral) {
            <div role="alert" class="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
              <mat-icon class="text-sm text-rose-600">error_outline</mat-icon>
              <span>{{ erros().geral }}</span>
            </div>
          }

          <form (submit)="submeterCadastro($event)" class="space-y-4" novalidate>
            <!-- Campo Nome -->
            <div>
              <label for="nome" class="block text-xs font-semibold text-slate-700 mb-1">
                Nome Completo <span class="text-rose-500">*</span>
              </label>
              <div class="relative rounded-xl shadow-2xs">
                <input
                  id="nome"
                  type="text"
                  [value]="nome()"
                  (input)="nome.set($any($event.target).value); limparErro('nome')"
                  placeholder="ex: Lucas de Oliveira"
                  class="block w-full rounded-xl border py-2.5 px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-1"
                  [class.border-rose-300]="erros().nome"
                  [class.border-slate-300]="!erros().nome"
                  [class.focus:border-[#2F6BFF]]="!erros().nome"
                  [class.focus:ring-[#2F6BFF]]="!erros().nome"
                  [class.focus:border-rose-500]="erros().nome"
                  [class.focus:ring-rose-500]="erros().nome"
                />
              </div>
              @if (erros().nome) {
                <p class="mt-1 text-xs text-rose-600 flex items-center gap-1">
                  <mat-icon class="text-xs w-3.5 h-3.5 flex items-center justify-center">error</mat-icon>
                  {{ erros().nome }}
                </p>
              }
            </div>

            <!-- Campo E-mail -->
            <div>
              <label for="email" class="block text-xs font-semibold text-slate-700 mb-1">
                E-mail Institucional <span class="text-rose-500">*</span>
              </label>
              <div class="relative rounded-xl shadow-2xs">
                <input
                  id="email"
                  type="email"
                  [value]="email()"
                  (input)="email.set($any($event.target).value); limparErro('email')"
                  placeholder="ex: lucas.oliveira@escola.edu.br"
                  class="block w-full rounded-xl border py-2.5 px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-1"
                  [class.border-rose-300]="erros().email"
                  [class.border-slate-300]="!erros().email"
                  [class.focus:border-[#2F6BFF]]="!erros().email"
                  [class.focus:ring-[#2F6BFF]]="!erros().email"
                  [class.focus:border-rose-500]="erros().email"
                  [class.focus:ring-rose-500]="erros().email"
                />
              </div>
              @if (erros().email) {
                <p class="mt-1 text-xs text-rose-600 flex items-center gap-1">
                  <mat-icon class="text-xs w-3.5 h-3.5 flex items-center justify-center">error</mat-icon>
                  {{ erros().email }}
                </p>
              }
            </div>

            <!-- Grid: Matrícula e Perfil -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <!-- Matrícula -->
              <div>
                <label for="matricula" class="block text-xs font-semibold text-slate-700 mb-1">
                  Matrícula <span class="text-rose-500">*</span>
                </label>
                <div class="relative rounded-xl shadow-2xs">
                  <input
                    id="matricula"
                    type="text"
                    [value]="matricula()"
                    (input)="matricula.set($any($event.target).value.toUpperCase()); limparErro('matricula')"
                    placeholder="ex: ALU-1090"
                    class="block w-full rounded-xl border py-2.5 px-3.5 text-sm uppercase text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 font-mono"
                    [class.border-rose-300]="erros().matricula"
                    [class.border-slate-300]="!erros().matricula"
                    [class.focus:border-[#2F6BFF]]="!erros().matricula"
                    [class.focus:ring-[#2F6BFF]]="!erros().matricula"
                    [class.focus:border-rose-500]="erros().matricula"
                    [class.focus:ring-rose-500]="erros().matricula"
                  />
                </div>
                @if (erros().matricula) {
                  <p class="mt-1 text-xs text-rose-600 flex items-center gap-1">
                    <mat-icon class="text-xs w-3.5 h-3.5 flex items-center justify-center">error</mat-icon>
                    {{ erros().matricula }}
                  </p>
                }
              </div>

              <!-- Perfil (Aluno ou Professor) -->
              <div>
                <span class="block text-xs font-semibold text-slate-700 mb-1">
                  Perfil de Solicitante <span class="text-rose-500">*</span>
                </span>
                <div class="grid grid-cols-2 gap-2" role="group" aria-label="Perfil de Solicitante">
                  <button
                    type="button"
                    (click)="perfil.set('aluno')"
                    class="py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    [style.background-color]="perfil() === 'aluno' ? '#2F6BFF' : null"
                    [class.text-white]="perfil() === 'aluno'"
                    [style.border-color]="perfil() === 'aluno' ? '#2F6BFF' : null"
                    [class.bg-slate-50]="perfil() !== 'aluno'"
                    [class.text-slate-700]="perfil() !== 'aluno'"
                    [class.border-slate-200]="perfil() !== 'aluno'"
                  >
                    <mat-icon style="width: 20px; height: 20px; font-size: 20px;" class="!overflow-visible flex items-center justify-center">school</mat-icon>
                    Aluno
                  </button>

                  <button
                    type="button"
                    (click)="perfil.set('professor')"
                    class="py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    [style.background-color]="perfil() === 'professor' ? '#2F6BFF' : null"
                    [class.text-white]="perfil() === 'professor'"
                    [style.border-color]="perfil() === 'professor' ? '#2F6BFF' : null"
                    [class.bg-slate-50]="perfil() !== 'professor'"
                    [class.text-slate-700]="perfil() !== 'professor'"
                    [class.border-slate-200]="perfil() !== 'professor'"
                  >
                    <mat-icon style="width: 20px; height: 20px; font-size: 20px;" class="!overflow-visible flex items-center justify-center">psychology</mat-icon>
                    Professor
                  </button>
                </div>
              </div>
            </div>

            <!-- Grid: Senha e Confirmação -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <!-- Senha -->
              <div>
                <label for="senha" class="block text-xs font-semibold text-slate-700 mb-1">
                  Senha <span class="text-rose-500">*</span>
                </label>
                <div class="relative rounded-xl shadow-2xs">
                  <input
                    id="senha"
                    [type]="mostrarSenha() ? 'text' : 'password'"
                    [value]="senha()"
                    (input)="senha.set($any($event.target).value); limparErro('senha')"
                    placeholder="Mínimo 6 dígitos"
                    class="block w-full rounded-xl border py-2.5 px-3.5 pr-9 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-1"
                    [class.border-rose-300]="erros().senha"
                    [class.border-slate-300]="!erros().senha"
                    [class.focus:border-[#2F6BFF]]="!erros().senha"
                    [class.focus:ring-[#2F6BFF]]="!erros().senha"
                    [class.focus:border-rose-500]="erros().senha"
                    [class.focus:ring-rose-500]="erros().senha"
                  />
                  <button
                    type="button"
                    (click)="alternarMostrarSenha()"
                    class="absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    aria-label="Ver senha"
                  >
                    <mat-icon class="text-base w-4 h-4 flex items-center justify-center">
                      {{ mostrarSenha() ? 'visibility_off' : 'visibility' }}
                    </mat-icon>
                  </button>
                </div>
                @if (erros().senha) {
                  <p class="mt-1 text-xs text-rose-600 flex items-center gap-1">
                    <mat-icon class="text-xs w-3.5 h-3.5 flex items-center justify-center">error</mat-icon>
                    {{ erros().senha }}
                  </p>
                }
              </div>

              <!-- Confirmação de Senha -->
              <div>
                <label for="confirmacaoSenha" class="block text-xs font-semibold text-slate-700 mb-1">
                  Confirmar Senha <span class="text-rose-500">*</span>
                </label>
                <div class="relative rounded-xl shadow-2xs">
                  <input
                    id="confirmacaoSenha"
                    [type]="mostrarSenha() ? 'text' : 'password'"
                    [value]="confirmacaoSenha()"
                    (input)="confirmacaoSenha.set($any($event.target).value); limparErro('confirmacaoSenha')"
                    placeholder="Repita a senha"
                    class="block w-full rounded-xl border py-2.5 px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-1"
                    [class.border-rose-300]="erros().confirmacaoSenha"
                    [class.border-slate-300]="!erros().confirmacaoSenha"
                    [class.focus:border-[#2F6BFF]]="!erros().confirmacaoSenha"
                    [class.focus:ring-[#2F6BFF]]="!erros().confirmacaoSenha"
                    [class.focus:border-rose-500]="erros().confirmacaoSenha"
                    [class.focus:ring-rose-500]="erros().confirmacaoSenha"
                  />
                </div>
                @if (erros().confirmacaoSenha) {
                  <p class="mt-1 text-xs text-rose-600 flex items-center gap-1">
                    <mat-icon class="text-xs w-3.5 h-3.5 flex items-center justify-center">error</mat-icon>
                    {{ erros().confirmacaoSenha }}
                  </p>
                }
              </div>
            </div>

            <!-- Botão de Concluir Cadastro -->
            <button
              type="submit"
              class="w-full py-3 px-4 rounded-xl bg-[#2F6BFF] hover:bg-blue-600 active:bg-blue-700 text-white font-semibold text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer mt-4"
            >
              <mat-icon class="text-base w-4 h-4 flex items-center justify-center">check_circle</mat-icon>
              <span>Concluir Cadastro</span>
            </button>
          </form>

          <!-- Rodapé / Voltar ao Login -->
          <div class="pt-3 border-t border-slate-100 text-center">
            <p class="text-xs text-slate-600">
              Já tem uma conta cadastrada?
              <a
                routerLink="/login"
                class="font-semibold text-[#2F6BFF] hover:text-blue-700 hover:underline ml-1 cursor-pointer"
              >
                Voltar para o Login
              </a>
            </p>
          </div>

        </div>
      </div>

      <!-- Relógio Simulado Nexus -->
      <app-relogio-flutuante></app-relogio-flutuante>
    </div>
  `,
})
export class P2Cadastro {
  private readonly store = inject(NexusStore);
  private readonly router = inject(Router);

  readonly nome = signal('');
  readonly email = signal('');
  readonly matricula = signal('');
  readonly perfil = signal<'aluno' | 'professor'>('aluno');
  readonly senha = signal('');
  readonly confirmacaoSenha = signal('');
  readonly mostrarSenha = signal(false);

  readonly erros = signal<ErrosFormulario>({});

  alternarMostrarSenha() {
    this.mostrarSenha.update((v) => !v);
  }

  limparErro(campo: keyof ErrosFormulario) {
    this.erros.update((atual) => {
      const novo = {...atual};
      delete novo[campo];
      delete novo.geral;
      return novo;
    });
  }

  submeterCadastro(event: Event) {
    event.preventDefault();

    const nomeVal = this.nome().trim();
    const emailVal = this.email().trim();
    const matriculaVal = this.matricula().trim().toUpperCase();
    const perfilVal = this.perfil();
    const senhaVal = this.senha().trim();
    const confirmacaoVal = this.confirmacaoSenha().trim();

    const novosErros: ErrosFormulario = {};

    // 1. Validação de Nome
    if (!nomeVal) {
      novosErros.nome = 'Informe seu nome completo.';
    } else if (nomeVal.length < 3) {
      novosErros.nome = 'O nome deve ter pelo menos 3 caracteres.';
    }

    // 2. Validação de E-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailVal) {
      novosErros.email = 'Informe seu e-mail institucional.';
    } else if (!emailRegex.test(emailVal)) {
      novosErros.email = 'Informe um formato de e-mail válido.';
    } else {
      // Unicidade de e-mail
      const existeEmail = this.store.usuarios().some(
        (u) => u.email.toLowerCase() === emailVal.toLowerCase()
      );
      if (existeEmail) {
        novosErros.email = 'Este e-mail institucional já está em uso.';
      }
    }

    // 3. Validação de Matrícula
    if (!matriculaVal) {
      novosErros.matricula = 'Informe sua matrícula.';
    } else if (matriculaVal.length < 3) {
      novosErros.matricula = 'A matrícula deve ter pelo menos 3 caracteres.';
    } else {
      // Unicidade de matrícula
      const existeMatricula = this.store.usuarios().some(
        (u) => u.matricula.toUpperCase() === matriculaVal
      );
      if (existeMatricula) {
        novosErros.matricula = 'Esta matrícula já está cadastrada no sistema.';
      }
    }

    // 4. Validação de Senha
    if (!senhaVal) {
      novosErros.senha = 'Defina uma senha para sua conta.';
    } else if (senhaVal.length < 6) {
      novosErros.senha = 'A senha deve conter pelo menos 6 caracteres.';
    }

    // 5. Validação de Confirmação de Senha
    if (!confirmacaoVal) {
      novosErros.confirmacaoSenha = 'Confirme sua senha.';
    } else if (senhaVal && senhaVal !== confirmacaoVal) {
      novosErros.confirmacaoSenha = 'As senhas digitadas não coincidem.';
    }

    if (Object.keys(novosErros).length > 0) {
      this.erros.set(novosErros);
      return;
    }

    // Chamada ao Store para registrar e emitir notificação 'nova_conta'
    const resultado = this.store.cadastrarUsuario({
      nome: nomeVal,
      email: emailVal,
      matricula: matriculaVal,
      perfil: perfilVal,
      senha: senhaVal,
    });

    if (resultado.sucesso) {
      // Redireciona para /aguardando (P3)
      this.router.navigate(['/aguardando'], {
        state: {
          nome: nomeVal,
          email: emailVal,
          matricula: matriculaVal,
          perfil: perfilVal,
        },
      });
    } else {
      if (resultado.campo === 'email') {
        this.erros.set({email: resultado.mensagem});
      } else if (resultado.campo === 'matricula') {
        this.erros.set({matricula: resultado.mensagem});
      } else {
        this.erros.set({geral: resultado.mensagem});
      }
    }
  }
}
