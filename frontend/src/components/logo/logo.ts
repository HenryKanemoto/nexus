import {ChangeDetectionStrategy, Component, input} from '@angular/core';

/**
 * Logotipo do Protem: o ícone quadrado da marca (public/brand/protem_logos/protem_3_prazo_icone.svg,
 * desenhado aqui inline para não depender de requisição) com o nome ao lado.
 */
@Component({
  selector: 'app-logo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {class: 'inline-flex items-center gap-2.5'},
  template: `
    <svg
      viewBox="0 0 512 512"
      [attr.width]="tamanho()"
      [attr.height]="tamanho()"
      aria-hidden="true"
      class="shrink-0"
    >
      <rect width="512" height="512" rx="116" fill="#EAF1FE" />
      <path
        d="M171,400 L171,108 L242,108 A100,100 0 0 1 242,308 L171,308"
        fill="none"
        stroke="#2F6BFF"
        stroke-width="54"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M256,160 L256,208 L292,208"
        fill="none"
        stroke="#F2B705"
        stroke-width="17"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
    @if (comNome()) {
      <span class="flex flex-col gap-1">
        <span class="font-display text-lg font-semibold tracking-tight text-ink leading-none">Protem</span>
        @if (comSubtitulo()) {
          <span class="text-xs leading-none text-ink-muted">Plataforma Web de Empréstimos</span>
        }
      </span>
    }
  `,
})
export class Logo {
  readonly tamanho = input(32);
  readonly comNome = input(true);
  readonly comSubtitulo = input(false);
}
