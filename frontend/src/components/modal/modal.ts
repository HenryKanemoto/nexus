import {ChangeDetectionStrategy, Component, ElementRef, inject, input, output} from '@angular/core';
import {A11yModule} from '@angular/cdk/a11y';

/**
 * Diálogo com fundo escurecido. Fecha com Esc ou clicando fora;
 * o foco fica preso dentro dele enquanto estiver aberto.
 *
 * Uso: @if (aberto()) { <app-modal rotulo="titulo-x" (fechar)="aberto.set(false)">...</app-modal> }
 */
@Component({
  selector: 'app-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [A11yModule],
  host: {
    class: 'modal-backdrop',
    '(click)': 'cliqueNoFundo($event)',
    '(document:keydown.escape)': 'fechar.emit()',
  },
  template: `
    <div
      class="modal {{ classe() }}"
      role="dialog"
      aria-modal="true"
      [attr.aria-labelledby]="rotulo() || null"
      [attr.aria-label]="ariaLabel() || null"
      cdkTrapFocus
      [cdkTrapFocusAutoCapture]="true"
    >
      <ng-content />
    </div>
  `,
})
export class Modal {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /** id do título dentro do diálogo (aria-labelledby). */
  readonly rotulo = input('');
  /** Nome acessível quando não há título visível. */
  readonly ariaLabel = input('');
  /** Classes extras para a caixa do diálogo. */
  readonly classe = input('');

  readonly fechar = output<void>();

  cliqueNoFundo(evento: MouseEvent) {
    if (evento.target === this.host.nativeElement) {
      this.fechar.emit();
    }
  }
}
