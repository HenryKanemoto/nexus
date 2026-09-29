import {ChangeDetectionStrategy, Component, computed, inject} from '@angular/core';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {NexusStore} from '../store/nexus.store';
import {MatIconModule} from '@angular/material/icon';
import {generateSvgQrCode} from '../lib/qr-utils';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: 'app-s2-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatIconModule],
  template: `
    <div class="space-y-6 font-['Sora',sans-serif] max-w-5xl">
      <!-- Link de Retorno (Wireframe S2) -->
      <div>
        <a
          routerLink="/catalogo"
          class="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#2F6BFF] transition-colors group cursor-pointer"
        >
          <mat-icon class="text-sm w-4 h-4 flex items-center justify-center group-hover:-translate-x-0.5 transition-transform">
            arrow_back
          </mat-icon>
          <span>Voltar ao catálogo</span>
        </a>
      </div>

      @if (item(); as i) {
        @let cat = categoria();
        @let perm = permissao();

        <!-- Grid de Detalhe do Item (Wireframe S2) -->
        <div class="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-8">

          <!-- Coluna Esquerda: Foto / Ilustração do Item -->
          <div class="md:col-span-5 flex flex-col items-center justify-center">
            <div class="w-full aspect-square rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col items-center justify-center p-6 relative">
              <!-- Ícone Gigante da Categoria -->
              <div class="w-24 h-24 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-center text-[#0E1A3A] mb-4">
                <mat-icon class="text-5xl">{{ getIconeCategoria(i.categoriaId) }}</mat-icon>
              </div>

              <!-- Identificador Patrimonial -->
              <div class="text-center">
                <span class="font-mono text-xs font-bold text-slate-700 bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-2xs">
                  {{ i.patrimonio }}
                </span>
                <p class="text-[11px] text-slate-400 mt-1.5 font-mono">
                  QR: {{ i.codigoQr }}
                </p>
              </div>

              <!-- Miniatura QR Code para verificação -->
              <div
                class="absolute bottom-3 right-3 p-1.5 bg-white rounded-lg border border-slate-200 shadow-2xs opacity-80 hover:opacity-100 transition-opacity"
                title="Código QR do Equipamento"
                [innerHTML]="qrCodeSvg()"
              ></div>
            </div>
          </div>

          <!-- Coluna Direita: Informações e Ação de Solicitação -->
          <div class="md:col-span-7 flex flex-col justify-between space-y-6">
            <div class="space-y-4">
              <!-- Categoria -->
              <div>
                <span class="inline-block px-3 py-1 rounded-lg bg-slate-100 border border-slate-200/90 text-xs font-bold text-slate-700">
                  {{ cat?.nome || 'Geral' }}
                </span>
              </div>

              <!-- Nome do Item -->
              <h1 class="text-2xl sm:text-3xl font-extrabold text-[#0E1A3A] tracking-tight leading-tight">
                {{ i.nome }}
              </h1>

              <!-- Descrição -->
              <p class="text-sm text-slate-600 leading-relaxed">
                {{ i.descricao }}
              </p>

              <!-- Metadados em Lista Limpa (Wireframe S2) -->
              <div class="space-y-2 pt-2 border-t border-slate-100 text-xs">
                <div class="flex items-center gap-2">
                  <span class="text-slate-500 font-medium">Patrimônio:</span>
                  <span class="font-mono font-bold text-slate-800">{{ i.patrimonio }}</span>
                </div>

                <div class="flex items-center gap-2">
                  <span class="text-slate-500 font-medium">Prazo máximo:</span>
                  <span class="font-bold text-slate-800">
                    {{ cat?.prazoMaxDias }} {{ cat?.prazoMaxDias === 1 ? 'dia' : 'dias' }}
                  </span>
                </div>

                <!-- Limite da Categoria (RN03) -->
                <div class="flex items-center gap-2">
                  <span class="text-slate-500 font-medium">Limite da categoria:</span>
                  <span
                    class="font-semibold"
                    [class.text-rose-600]="perm.itensAtuais >= perm.limiteMax"
                    [class.text-slate-800]="perm.itensAtuais < perm.limiteMax"
                  >
                    você tem {{ perm.itensAtuais }} de {{ perm.limiteMax }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Área de Ação: Botão e Avisos de Restrição -->
            <div class="space-y-3 pt-4 border-t border-slate-100">
              @if (perm.pode) {
                <!-- Botão Ativo -> Leva a S3 -->
                <a
                  [routerLink]="['/solicitar', i.id]"
                  class="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#2F6BFF] hover:bg-blue-600 active:bg-blue-700 text-white font-semibold text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Solicitar empréstimo</span>
                  <mat-icon class="text-base w-4 h-4 flex items-center justify-center">arrow_forward</mat-icon>
                </a>
              } @else {
                <!-- Botão Desativado (Wireframe S2: Limite atingido ou conta restrita) -->
                <button
                  type="button"
                  disabled
                  class="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-200 text-slate-400 font-semibold text-sm cursor-not-allowed flex items-center justify-center gap-2 shadow-none"
                >
                  <mat-icon class="text-base w-4 h-4 flex items-center justify-center">lock</mat-icon>
                  <span>Solicitar empréstimo</span>
                </button>

                <!-- Aviso Explicativo da Restrição (RN03 / RN06) -->
                <div class="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5">
                  <mat-icon class="text-base text-rose-600 shrink-0 mt-0.5">info</mat-icon>
                  <div class="leading-relaxed">
                    <strong class="font-bold">Solicitação Indisponível:</strong>
                    {{ perm.motivo }}
                  </div>
                </div>
              }
            </div>

          </div>
        </div>
      } @else {
        <!-- Item não encontrado -->
        <div class="py-16 text-center bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
          <mat-icon class="text-4xl text-slate-400">help_outline</mat-icon>
          <h2 class="text-lg font-bold text-slate-800">Item não encontrado</h2>
          <p class="text-xs text-slate-500">
            O equipamento solicitado não existe ou foi removido do acervo.
          </p>
          <a
            routerLink="/catalogo"
            class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2F6BFF] text-white text-xs font-semibold"
          >
            Voltar ao Catálogo
          </a>
        </div>
      }
    </div>
  `,
})
export class S2Item {
  private readonly route = inject(ActivatedRoute);
  readonly store = inject(NexusStore);
  private readonly sanitizer = inject(DomSanitizer);

  readonly itemId = computed(() => this.route.snapshot.paramMap.get('id') || '');

  readonly item = computed(() => {
    const id = this.itemId();
    return this.store.itens().find((i) => i.id === id) || null;
  });

  readonly categoria = computed(() => {
    const it = this.item();
    if (!it) return null;
    return this.store.categorias().find((c) => c.id === it.categoriaId) || null;
  });

  /**
   * Verifica se o usuário atual pode solicitar o item desta categoria (RN03 e RN06).
   */
  readonly permissao = computed(() => {
    const it = this.item();
    if (!it) {
      return { pode: false, motivo: 'Item inexistente.', itensAtuais: 0, limiteMax: 1 };
    }
    return this.store.verificarPermissaoSolicitacao(it.categoriaId);
  });

  readonly qrCodeSvg = computed(() => {
    const it = this.item();
    const code = it ? it.codigoQr : 'NX-ITEM';
    const svgStr = generateSvgQrCode(code, 48);
    return this.sanitizer.bypassSecurityTrustHtml(svgStr);
  });

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
