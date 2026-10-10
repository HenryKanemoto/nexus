import {ChangeDetectionStrategy, Component, effect, input, signal} from '@angular/core';
import QRCode from 'qrcode';

/** QR code real (legível pelo leitor da tela R4) gerado a partir de um texto. */
@Component({
  selector: 'app-qr-code',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {class: 'inline-block'},
  template: `
    @if (url()) {
      <img [src]="url()" [alt]="'QR code ' + valor()" [width]="tamanho()" [height]="tamanho()" class="block" />
    } @else {
      <div class="animate-pulse rounded-md bg-sunken" [style.width.px]="tamanho()" [style.height.px]="tamanho()"></div>
    }
  `,
})
export class QrCode {
  readonly valor = input.required<string>();
  readonly tamanho = input(160);

  readonly url = signal('');

  constructor() {
    effect(() => {
      const valor = this.valor();
      // Gera em resolução dobrada para ficar nítido em telas de alta densidade
      QRCode.toDataURL(valor, {width: this.tamanho() * 2, margin: 1, color: {dark: '#16181d', light: '#ffffff'}})
        .then((url) => this.url.set(url))
        .catch(() => this.url.set(''));
    });
  }
}
