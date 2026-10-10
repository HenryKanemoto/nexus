import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {NexusStore} from '../../store/nexus.store';

/** Faixa que avisa quando o backend está fora do ar ou recusou uma alteração de item. */
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
        <mat-icon class="icon-sm">{{ store.conexao() === 'offline' ? 'cloud_off' : 'error' }}</mat-icon>
        <p class="flex-1">{{ erro }}</p>
        @if (store.conexao() === 'offline') {
          <button type="button" class="btn btn-sm btn-secondary" (click)="store.reconectar()">Tentar de novo</button>
        }
        <button type="button" class="btn-icon size-8" (click)="store.dispensarErroApi()" aria-label="Fechar aviso">
          <mat-icon class="icon-sm">close</mat-icon>
        </button>
      </div>
    }
  `,
})
export class AvisoApi {
  readonly store = inject(NexusStore);
}
