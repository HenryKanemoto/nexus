import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  PLATFORM_ID,
  afterNextRender,
  computed,
  inject,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { NexusStore } from '../store/nexus.store';
import { MatIconModule } from '@angular/material/icon';
import { Html5Qrcode } from 'html5-qrcode';

@Component({
  selector: 'app-r4-leitor',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  template: `
    <div class="space-y-4 sm:space-y-6 font-['Sora',sans-serif] max-w-3xl mx-auto">
      <!-- Cabeçalho (Wireframe R4) -->
      <div class="flex items-center justify-between pb-2 border-b border-slate-200">
        <div>
          <h1 class="text-xl sm:text-3xl font-bold tracking-tight text-[#0E1A3A]">
            Leitor de QR code
          </h1>
          <p class="text-xs text-slate-500 mt-0.5 sm:mt-1">
            Escaneie o código do item para registrar retiradas ou devoluções
          </p>
        </div>
      </div>

      <!-- Aviso Explicativo de Estado ou Erro (Wireframe R4) -->
      @if (mensagemAviso()) {
        <div
          role="alert"
          class="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3 shadow-2xs animate-fadeIn"
        >
          <mat-icon class="text-amber-600 shrink-0 mt-0.5 text-base">info</mat-icon>
          <div class="flex-1">
            <strong class="font-bold block mb-0.5">Identificação do Item:</strong>
            <p class="leading-relaxed">{{ mensagemAviso() }}</p>
          </div>
          <button
            type="button"
            (click)="mensagemAviso.set(null)"
            class="text-amber-600 hover:text-amber-800 cursor-pointer p-1"
          >
            <mat-icon class="text-sm w-4 h-4 flex items-center justify-center">close</mat-icon>
          </button>
        </div>
      }

      <!-- Moldura da Câmera (Mobile-First: Ocupa a largura toda no celular) -->
      <div class="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-4 sm:p-8 space-y-5">
        <!-- Container de Câmera com Largura Total no Mobile -->
        <div class="relative w-full aspect-square sm:aspect-4/3 rounded-2xl bg-slate-950 overflow-hidden flex flex-col items-center justify-center text-white border-2 border-slate-800 shadow-inner">
          <!-- Elemento de Vídeo para o html5-qrcode -->
          <div id="qr-camera-stream" class="w-full h-full object-cover"></div>

          <!-- Moldura Visual de Leitura com Cantoneiras (Wireframe R4: ┌ ┐ e └ ┘) -->
          <div class="pointer-events-none absolute inset-4 sm:inset-8 border border-white/20 rounded-xl flex flex-col justify-between p-2">
            <!-- Cantoneiras Superiores -->
            <div class="flex justify-between">
              <span class="w-7 h-7 sm:w-8 sm:h-8 border-t-4 border-l-4 border-[#2F6BFF] rounded-tl-lg"></span>
              <span class="w-7 h-7 sm:w-8 sm:h-8 border-t-4 border-r-4 border-[#2F6BFF] rounded-tr-lg"></span>
            </div>

            <!-- Centro: Linha de Scanner Laser Suave -->
            <div class="w-full flex flex-col items-center">
              <div class="w-4/5 h-0.5 bg-rose-500 shadow-[0_0_12px_#f43f5e] animate-pulse"></div>
              @if (!cameraAtiva()) {
                <span class="text-[11px] text-slate-300 font-medium mt-2 bg-black/70 px-3 py-1 rounded-full backdrop-blur-xs text-center max-w-[90%]">
                  {{ cameraStatusTexto() }}
                </span>
              }
            </div>

            <!-- Cantoneiras Inferiores -->
            <div class="flex justify-between">
              <span class="w-7 h-7 sm:w-8 sm:h-8 border-b-4 border-l-4 border-[#2F6BFF] rounded-bl-lg"></span>
              <span class="w-7 h-7 sm:w-8 sm:h-8 border-b-4 border-r-4 border-[#2F6BFF] rounded-br-lg"></span>
            </div>
          </div>
        </div>

        <!-- Seção: "Câmera não funcionou? Digite o código:" (Wireframe R4) -->
        <div class="pt-2 border-t border-slate-100 space-y-3">
          <label for="codigoInput" class="block text-xs font-bold text-slate-700">
            Câmera não funcionou? Digite o código:
          </label>

          <form (submit)="processarBuscaManual($event)" class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div class="relative flex-1">
              <input
                id="codigoInput"
                type="text"
                [value]="codigoDigitado()"
                (input)="codigoDigitado.set($any($event.target).value)"
                placeholder="Ex.: NX-PROJ-002 ou NX-0001"
                class="block w-full rounded-xl border border-slate-300 bg-white py-3 px-3.5 text-xs uppercase font-mono tracking-wider text-slate-800 placeholder:text-slate-400 focus:border-[#2F6BFF] focus:outline-hidden focus:ring-1 focus:ring-[#2F6BFF]"
                required
              />
            </div>

            <button
              type="submit"
              class="px-5 py-3 rounded-xl bg-[#2F6BFF] hover:bg-blue-600 active:bg-blue-700 text-white text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
            >
              <mat-icon class="text-xs w-3.5 h-3.5 flex items-center justify-center">search</mat-icon>
              <span>Buscar código</span>
            </button>
          </form>

          <!-- Atalhos rápidos de demonstração para facilitar testes no mobile -->
          <div class="pt-2 text-[11px] text-slate-500 space-y-1.5">
            <span class="font-medium text-slate-600 block">Atalhos rápidos para teste:</span>
            <div class="grid grid-cols-2 sm:flex sm:flex-wrap gap-1.5">
              @for (amostra of itensExemplo(); track amostra.codigo) {
                <button
                  type="button"
                  (click)="testarCodigo(amostra.codigo)"
                  class="p-2 sm:px-2.5 sm:py-1 rounded-lg border text-[10px] font-mono font-semibold transition-colors cursor-pointer text-left sm:text-center truncate {{ amostra.classeCss }}"
                >
                  {{ amostra.codigo }}
                  <span class="block sm:inline text-[9px] opacity-80">({{ amostra.rotulo }})</span>
                </button>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class R4Leitor {
  readonly store = inject(NexusStore);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly codigoDigitado = signal('');
  readonly mensagemAviso = signal<string | null>(null);
  readonly cameraAtiva = signal(false);
  readonly cameraStatusTexto = signal('Aguardando sensor de câmera...');

  private readonly platformId = inject(PLATFORM_ID);
  private html5QrCode: Html5Qrcode | null = null;

  readonly itensExemplo = computed(() => {
    return [
      { codigo: 'NX-PROJ-002', rotulo: 'Reservado -> R5', classeCss: 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100' },
      { codigo: 'NX-NOTE-001', rotulo: 'Emprestado -> R6', classeCss: 'bg-blue-50 border-blue-300 text-blue-900 hover:bg-blue-100' },
      { codigo: 'NX-NOTE-002', rotulo: 'Atrasado -> R6', classeCss: 'bg-rose-50 border-rose-300 text-rose-900 hover:bg-rose-100' },
      { codigo: 'NX-PROJ-001', rotulo: 'Disponível', classeCss: 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100' },
    ];
  });

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      afterNextRender(() => {
        this.iniciarCamera();
      });
    }

    this.destroyRef.onDestroy(() => {
      this.pararCamera();
    });
  }

  private async iniciarCamera() {
    try {
      this.cameraStatusTexto.set('Iniciando sensor de câmera...');
      const scanner = new Html5Qrcode('qr-camera-stream');
      this.html5QrCode = scanner;

      const devices = await Html5Qrcode.getCameras().catch(() => []);
      if (!devices || devices.length === 0) {
        this.cameraStatusTexto.set('Câmera indisponível no ambiente. Digite o código manual abaixo.');
        return;
      }

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            return {
              width: Math.floor(minEdge * 0.75),
              height: Math.floor(minEdge * 0.75),
            };
          },
        },
        (decodedText) => {
          this.rotearCodigo(decodedText);
        },
        () => {
          // Frame sem leitura
        }
      );

      this.cameraAtiva.set(true);
      this.cameraStatusTexto.set('Câmera ativa');
    } catch {
      this.cameraAtiva.set(false);
      this.cameraStatusTexto.set('Câmera bloqueada ou indisponível. Digite o código manual abaixo.');
    }
  }

  private async pararCamera() {
    if (this.html5QrCode) {
      try {
        if (this.html5QrCode.isScanning) {
          await this.html5QrCode.stop();
        }
        this.html5QrCode.clear();
      } catch {
        // Ignora erros ao parar câmera
      }
      this.html5QrCode = null;
    }
  }

  processarBuscaManual(event: Event) {
    event.preventDefault();
    this.rotearCodigo(this.codigoDigitado());
  }

  testarCodigo(codigo: string) {
    this.codigoDigitado.set(codigo);
    this.rotearCodigo(codigo);
  }

  /**
   * Regra de Roteamento do Wireframe R4:
   * - item "reservado" -> leva a /painel/retirada/:itemId (R5)
   * - item "emprestado" ou "atrasado" -> leva a /painel/devolucao/:itemId (R6)
   * - qualquer outro estado, ou código inexistente -> mostra um aviso claro
   */
  private rotearCodigo(codigo: string) {
    const trimmed = (codigo || '').trim().toUpperCase();
    if (!trimmed) {
      this.mensagemAviso.set('Por favor, informe um código QR ou patrimônio válido.');
      return;
    }

    const item = this.store.itens().find(
      (i) => i.codigoQr.toUpperCase() === trimmed || i.patrimonio.toUpperCase() === trimmed
    );

    if (!item) {
      this.mensagemAviso.set(
        `Nenhum equipamento cadastrado com o código "${codigo}". Verifique o patrimônio impresso no item.`
      );
      return;
    }

    if (item.status === 'reservado') {
      // Item reservado por pedido aprovado -> Confirmação de Retirada (R5)
      this.pararCamera();
      this.router.navigate(['/painel/retirada', item.id]);
    } else if (item.status === 'emprestado' || item.status === 'atrasado') {
      // Item em posse de usuário -> Registro de Devolução (R6)
      this.pararCamera();
      this.router.navigate(['/painel/devolucao', item.id]);
    } else if (item.status === 'disponivel') {
      this.mensagemAviso.set(
        `O item "${item.nome}" (${item.patrimonio}) está DISPONÍVEL no catálogo. Não há retirada agendada nem empréstimo pendente de devolução para este item.`
      );
    } else if (item.status === 'solicitado') {
      this.mensagemAviso.set(
        `O item "${item.nome}" (${item.patrimonio}) possui uma solicitação ainda pendente de análise. O responsável deve aprová-la primeiro em "Solicitações pendentes".`
      );
    } else if (item.status === 'manutencao') {
      this.mensagemAviso.set(
        `O item "${item.nome}" (${item.patrimonio}) está em MANUTENÇÃO no momento e não pode ser retirado.`
      );
    } else {
      this.mensagemAviso.set(
        `O item "${item.nome}" (${item.patrimonio}) encontra-se com status "${item.status}".`
      );
    }
  }
}
