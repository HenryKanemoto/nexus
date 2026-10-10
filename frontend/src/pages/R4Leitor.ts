import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  afterNextRender,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { NexusStore } from '../store/nexus.store';
import { MatIconModule } from '@angular/material/icon';
import { Html5Qrcode } from 'html5-qrcode';
import { StatusBadge } from '../components/status-badge/status-badge';
import { StatusItem } from '../types/models';

@Component({
  selector: 'app-r4-leitor',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule, StatusBadge],
  templateUrl: './R4Leitor.html',
})
export class R4Leitor {
  readonly store = inject(NexusStore);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly codigoDigitado = signal('');
  readonly mensagemAviso = signal<string | null>(null);
  readonly cameraAtiva = signal(false);
  readonly cameraStatusTexto = signal('Aguardando a câmera...');

  private html5QrCode: Html5Qrcode | null = null;

  /**
   * Atalhos para testar sem câmera: um item de cada situação que o leitor trata
   * (reservado → retirada, emprestado/atrasado → devolução, disponível → aviso).
   */
  readonly itensExemplo = computed(() => {
    const ordem: StatusItem[] = ['reservado', 'emprestado', 'atrasado', 'disponivel'];
    return ordem
      .map((status) => this.store.itens().find((i) => i.status === status))
      .filter((i) => !!i)
      .map((i) => ({ codigo: i.codigoQr, status: i.status }));
  });

  constructor() {
    afterNextRender(() => {
      this.iniciarCamera();
    });

    this.destroyRef.onDestroy(() => {
      this.pararCamera();
    });
  }

  private async iniciarCamera() {
    try {
      this.cameraStatusTexto.set('Ligando a câmera...');
      const scanner = new Html5Qrcode('qr-camera-stream');
      this.html5QrCode = scanner;

      const devices = await Html5Qrcode.getCameras().catch(() => []);
      if (!devices || devices.length === 0) {
        this.cameraStatusTexto.set('Nenhuma câmera encontrada. Digite o código abaixo.');
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
      this.cameraStatusTexto.set('Câmera bloqueada ou indisponível. Digite o código abaixo.');
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
      this.mensagemAviso.set('Informe um código QR ou patrimônio válido.');
      return;
    }

    const item = this.store.itens().find(
      (i) => i.codigoQr.toUpperCase() === trimmed || i.patrimonio.toUpperCase() === trimmed
    );

    if (!item) {
      this.mensagemAviso.set(
        `Nenhum equipamento cadastrado com o código "${codigo}". Confira o patrimônio impresso no item.`
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
        `"${item.nome}" (${item.patrimonio}) está disponível no catálogo. Não há retirada marcada nem empréstimo para devolver.`
      );
    } else if (item.status === 'solicitado') {
      this.mensagemAviso.set(
        `"${item.nome}" (${item.patrimonio}) tem um pedido ainda em análise. Aprove-o primeiro em Solicitações.`
      );
    } else if (item.status === 'manutencao') {
      this.mensagemAviso.set(
        `"${item.nome}" (${item.patrimonio}) está em manutenção e não pode ser retirado.`
      );
    } else {
      this.mensagemAviso.set(
        `"${item.nome}" (${item.patrimonio}) está com status "${item.status}".`
      );
    }
  }
}
