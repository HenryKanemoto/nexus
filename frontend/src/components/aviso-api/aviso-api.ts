import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {NexusStore} from '../../store/nexus.store';

/**
 * Faixa que avisa quando algo não foi salvo: no modo api, backend fora do ar ou alteração
 * de item recusada; no modo local, espaço do navegador esgotado.
 */
@Component({
  selector: 'app-aviso-api',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  template: `
    @if (store.erroApi(); as erro) {
      <div
        role="status"
        class="alert rounded-none border-x-0 border-t-0 items-center {{
          store.conexao() === 'offline' ? 'alert-warn' : 'alert-danger'
        }}"
      >
        <mat-icon class="icon-sm" [svgIcon]="store.conexao() === 'offline' ? 'cloud_off' : 'error'" />
        <p class="flex-1">{{ erro }}</p>
        @if (store.conexao() === 'offline') {
          <button type="button" class="btn btn-sm btn-secondary" (click)="store.reconectar()">Tentar de novo</button>
        }
        <button type="button" class="btn-icon size-8" (click)="store.dispensarErroApi()" aria-label="Fechar aviso">
          <mat-icon class="icon-sm" svgIcon="close" />
        </button>
      </div>
    }
  `,
})
export class AvisoApi {
  readonly store = inject(NexusStore);
}
