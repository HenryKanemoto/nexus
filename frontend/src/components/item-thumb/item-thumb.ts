import {ChangeDetectionStrategy, Component, computed, input} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {iconeCategoria} from '../../lib/categoria-utils';
import {Item} from '../../types/models';

/** Foto do item ou, se não houver, o ícone da categoria sobre um fundo neutro. */
@Component({
  selector: 'app-item-thumb',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  host: {class: 'flex items-center justify-center overflow-hidden bg-sunken text-ink-soft'},
  template: `
    @if (item().foto; as foto) {
      <img [src]="foto" [alt]="item().nome" class="size-full object-cover" loading="lazy" />
    } @else {
      <mat-icon [style.font-size.px]="tamanhoIcone()" [style.width.px]="tamanhoIcone()" [style.height.px]="tamanhoIcone()">
        {{ icone() }}
      </mat-icon>
    }
  `,
})
export class ItemThumb {
  readonly item = input.required<Pick<Item, 'nome' | 'categoriaId' | 'foto'>>();
  readonly tamanhoIcone = input(28);

  readonly icone = computed(() => iconeCategoria(this.item().categoriaId));
}
