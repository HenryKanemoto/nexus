import {ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {NexusStore} from '../store/nexus.store';
import {MatIconModule} from '@angular/material/icon';
import {RelogioFlutuante} from '../components/relogio-flutuante/relogio-flutuante';
import {StatusBadge} from '../components/status-badge/status-badge';

@Component({
  selector: 'app-p3-aguardando',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatIconModule, RelogioFlutuante, StatusBadge],
  template: `
    <div class="min-h-screen bg-[#F6F7FB] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 font-['Sora',sans-serif]">
      <!-- Container Central (Wireframe P3) -->
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white py-9 px-6 sm:px-9 shadow-sm rounded-2xl border border-slate-200/90 text-center space-y-6">

          <!-- Ícone de Espera / Sucesso -->
          @if (estaAprovada()) {
            <div class="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-2xs">
              <mat-icon class="text-3xl">verified</mat-icon>
            </div>
          } @else {
            <div class="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-2xs">
              <mat-icon class="text-3xl">hourglass_top</mat-icon>
            </div>
          }

          <!-- Título e Mensagem Principal -->
          <div>
            @if (estaAprovada()) {
              <h1 class="text-2xl font-bold text-[#0E1A3A]">
                Conta Aprovada!
              </h1>
              <p class="text-xs text-slate-600 mt-2 leading-relaxed">
                Parabéns! Sua conta foi aprovada pelo responsável. Você já pode solicitar materiais e equipamentos no catálogo.
              </p>
            } @else {
              <h1 class="text-2xl font-bold text-[#0E1A3A]">
                Cadastro recebido!
              </h1>
              <p class="text-xs text-slate-600 mt-2 leading-relaxed">
                Sua conta foi criada e está aguardando a aprovação de um responsável para que você possa realizar solicitações de empréstimo.
              </p>
            }
          </div>

          <!-- Caixa de Dados do Usuário Cadastrado -->
          <div class="bg-slate-50/80 rounded-xl p-4 border border-slate-200/80 text-left text-xs space-y-2.5">
            <div class="flex justify-between items-center pb-2 border-b border-slate-200/60">
              <span class="text-slate-500 font-medium">Nome completo:</span>
              <strong class="text-slate-800 font-semibold">{{ nomeExibido() }}</strong>
            </div>

            <div class="flex justify-between items-center pb-2 border-b border-slate-200/60">
              <span class="text-slate-500 font-medium">E-mail:</span>
              <span class="text-slate-800 font-medium select-all">{{ emailExibido() }}</span>
            </div>

            @if (matriculaExibida()) {
              <div class="flex justify-between items-center pb-2 border-b border-slate-200/60">
                <span class="text-slate-500 font-medium">Matrícula:</span>
                <span class="text-slate-800 font-mono text-[11px] bg-white px-2 py-0.5 rounded border border-slate-200">
                  {{ matriculaExibida() }}
                </span>
              </div>
            }

            <div class="flex justify-between items-center">
              <span class="text-slate-500 font-medium">Status da conta:</span>
              @if (estaAprovada()) {
                <app-status-badge status="disponivel"></app-status-badge>
              } @else {
                <app-status-badge status="solicitado"></app-status-badge>
              }
            </div>
          </div>

          <!-- Botões de Ação -->
          <div class="space-y-3 pt-2">
            @if (estaAprovada()) {
              <a
                routerLink="/catalogo"
                class="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Acessar Catálogo de Itens</span>
                <mat-icon class="text-base w-4 h-4 flex items-center justify-center">arrow_forward</mat-icon>
              </a>
            }

            <!-- Botão Principal exigido pelo Wireframe P3: Voltar ao Login -->
            <button
              type="button"
              (click)="voltarAoLogin()"
              class="w-full py-2.5 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-colors shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <mat-icon class="text-base w-4 h-4 flex items-center justify-center">arrow_back</mat-icon>
              <span>Voltar ao Login</span>
            </button>
          </div>

          <!-- Painel de Demonstração (Simular Aprovação) -->
          @if (!estaAprovada()) {
            <div class="pt-4 border-t border-dashed border-slate-200 text-left">
              <div class="p-3 rounded-xl bg-blue-50/80 border border-blue-200/70 text-xs">
                <div class="flex items-center gap-1.5 text-[#2F6BFF] font-bold mb-1">
                  <mat-icon class="text-sm w-4 h-4">smart_toy</mat-icon>
                  <span>Atalho de Demonstração</span>
                </div>
                <p class="text-[11px] text-slate-600 mb-2.5 leading-relaxed">
                  Para testar o fluxo de aprovação sem precisar trocar para o login da responsável Enzo, você pode aprovar imediatamente:
                </p>
                <button
                  type="button"
                  (click)="simularAprovacao()"
                  class="w-full py-2 px-3 rounded-lg bg-[#2F6BFF] hover:bg-blue-600 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <mat-icon class="text-xs w-4 h-4 flex items-center justify-center">check_circle</mat-icon>
                  <span>Simular Aprovação Imediata</span>
                </button>
              </div>
            </div>
          }

        </div>
      </div>

      <!-- Relógio Simulado Nexus -->
      <app-relogio-flutuante></app-relogio-flutuante>
    </div>
  `,
})
export class P3Aguardando {
  private readonly store = inject(NexusStore);
  private readonly router = inject(Router);

  // Recupera dados passados pela navegação de P2 caso existam
  private readonly estadoNavegacao = signal<{
    nome?: string;
    email?: string;
    matricula?: string;
    perfil?: string;
  } | null>(null);

  constructor() {
    const nav = this.router.getCurrentNavigation();
    if (nav?.extras?.state) {
      this.estadoNavegacao.set(nav.extras.state as {
        nome?: string;
        email?: string;
        matricula?: string;
        perfil?: string;
      });
    } else if (typeof history !== 'undefined' && history.state && history.state.nome) {
      this.estadoNavegacao.set(history.state);
    }
  }

  readonly usuarioAtual = computed(() => this.store.usuarioLogado());

  readonly nomeExibido = computed(() => {
    return (
      this.usuarioAtual()?.nome ||
      this.estadoNavegacao()?.nome ||
      'Diego Alves'
    );
  });

  readonly emailExibido = computed(() => {
    return (
      this.usuarioAtual()?.email ||
      this.estadoNavegacao()?.email ||
      'diego.alves@escola.edu.br'
    );
  });

  readonly matriculaExibida = computed(() => {
    return (
      this.usuarioAtual()?.matricula ||
      this.estadoNavegacao()?.matricula ||
      'ALU-1004'
    );
  });

  readonly estaAprovada = computed(() => {
    const u = this.usuarioAtual();
    return u ? u.status === 'ativa' : false;
  });

  voltarAoLogin() {
    this.store.logout();
    this.router.navigate(['/login']);
  }

  simularAprovacao() {
    const u = this.usuarioAtual();
    if (u) {
      this.store.aprovarUsuario(u.id);
    } else {
      // Se não havia logado, procura pelo usuário com o e-mail exibido
      const userFound = this.store
        .usuarios()
        .find((usr) => usr.email.toLowerCase() === this.emailExibido().toLowerCase());
      if (userFound) {
        this.store.aprovarUsuario(userFound.id);
        this.store.trocarUsuarioDemo(userFound.id);
      }
    }
  }
}
