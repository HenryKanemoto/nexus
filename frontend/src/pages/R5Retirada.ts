import {ChangeDetectionStrategy, Component, computed, inject} from '@angular/core';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {NexusStore} from '../store/nexus.store';
import {MatIconModule} from '@angular/material/icon';
import {formatDateShort} from '../lib/date-utils';

@Component({
  selector: 'app-r5-retirada',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatIconModule],
  template: `
    <div class="space-y-6 font-['Sora',sans-serif] max-w-4xl">
      <!-- Cabeçalho (Wireframe R5) -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-[#0E1A3A]">
            Confirmar retirada
          </h1>
          <p class="text-xs text-slate-500 mt-1">
            Entrega do equipamento ao solicitante. O prazo oficial inicia neste momento (RN05)
          </p>
        </div>

        <!-- Sininho -> R17 -->
        <a
          routerLink="/painel/notificacoes"
          class="relative p-2 rounded-xl text-slate-600 hover:text-[#0E1A3A] hover:bg-slate-100 transition-colors"
          title="Notificações do Sistema (R17)"
        >
          <mat-icon class="text-2xl">notifications</mat-icon>
          @if (store.totalNaoLidas() > 0) {
            <span class="absolute top-1 right-1 flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold tabular-nums ring-2 ring-white">
              {{ store.totalNaoLidas() }}
            </span>
          }
        </a>
      </div>

      @if (item(); as i) {
        @if (solicitacao(); as solic) {
          @let user = getUsuario(solic.solicitanteId);

          <!-- Cartão Principal de Retirada (Wireframe R5) -->
          <div class="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <!-- Área Visual / Foto do Item (Quadrado com X / Ícone) -->
              <div class="md:col-span-4 flex items-center justify-center">
                <div class="w-full aspect-square rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center p-6 text-[#0E1A3A]">
                  <div class="w-20 h-20 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-center mb-3">
                    <mat-icon class="text-4xl text-[#2F6BFF]">{{ getIconeCategoria(i.categoriaId) }}</mat-icon>
                  </div>
                  <span class="font-mono text-xs font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {{ i.patrimonio }}
                  </span>
                </div>
              </div>

              <!-- Informações Textuais (Wireframe R5) -->
              <div class="md:col-span-8 space-y-4">
                <div>
                  <span class="text-[11px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                    Pedido Aprovado · Aguardando Retirada
                  </span>
                  <h2 class="text-2xl font-extrabold text-[#0E1A3A] mt-2">
                    {{ i.nome }}
                  </h2>
                </div>

                <div class="space-y-2.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                  <div class="flex items-center gap-2">
                    <span class="text-slate-500 font-medium w-28">Patrimônio:</span>
                    <strong class="font-mono text-slate-900 font-bold text-sm">{{ i.patrimonio }}</strong>
                  </div>

                  <div class="flex items-center gap-2">
                    <span class="text-slate-500 font-medium w-28">Solicitante:</span>
                    <strong class="text-slate-900 text-sm">{{ user?.nome }}</strong>
                    <span class="text-slate-400 capitalize">({{ user?.perfil }} · {{ user?.matricula }})</span>
                  </div>

                  <div class="flex items-center gap-2">
                    <span class="text-slate-500 font-medium w-28">Devolver até:</span>
                    <strong class="text-[#2F6BFF] font-bold text-sm">{{ formatarData(solic.devolucaoDesejada) }}</strong>
                  </div>
                </div>

                <div class="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 flex items-start gap-2.5">
                  <mat-icon class="text-base text-[#2F6BFF] shrink-0 mt-0.5">info</mat-icon>
                  <p class="leading-relaxed">
                    Ao confirmar a retirada, o empréstimo entra em curso oficial (<strong>RN05</strong>) e a contagem do prazo passa a valer a partir deste momento no relógio virtual.
                  </p>
                </div>
              </div>
            </div>

            <!-- Botões de Ação (Wireframe R5) -->
            <div class="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                (click)="executarConfirmacaoRetirada()"
                class="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#2F6BFF] hover:bg-blue-600 active:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <mat-icon class="text-sm w-4 h-4 flex items-center justify-center">check</mat-icon>
                <span>Confirmar retirada</span>
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
          <!-- Não há pedido aprovado aguardando retirada para este item -->
          <div class="bg-white rounded-3xl border border-amber-200 p-8 text-center space-y-3 shadow-sm">
            <mat-icon class="text-4xl text-amber-500">warning_amber</mat-icon>
            <h2 class="text-lg font-bold text-slate-800">Sem Solicitação Aprovada</h2>
            <p class="text-xs text-slate-600 max-w-md mx-auto">
              O equipamento "{{ i.nome }}" ({{ i.patrimonio }}) não possui solicitação aprovada aguardando retirada no momento.
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
          <p class="text-xs text-slate-500">
            O equipamento com o identificador informado não consta no acervo.
          </p>
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
export class R5Retirada {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly store = inject(NexusStore);

  readonly itemId = computed(() => this.route.snapshot.paramMap.get('itemId') || '');

  readonly item = computed(() => {
    const id = this.itemId();
    return this.store.itens().find((i) => i.id === id) || null;
  });

  readonly solicitacao = computed(() => {
    const it = this.item();
    if (!it) return null;
    return (
      this.store.solicitacoes().find(
        (s) => s.itemId === it.id && s.status === 'aprovada'
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

  executarConfirmacaoRetirada() {
    const it = this.item();
    const resp = this.store.usuarioLogado();
    if (!it) return;

    const res = this.store.registrarRetirada(it.id, resp?.id || 'user-marta');
    if (res.sucesso) {
      // Volta ao painel com mensagem de sucesso
      this.router.navigate(['/painel'], {
        state: { sucesso: `Retirada registrada com sucesso para "${it.nome}". O prazo oficial começou a contar agora (RN05).` },
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
