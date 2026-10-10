import {ChangeDetectionStrategy, Component, input} from '@angular/core';

/** Emblema do Nexus (mesmo desenho do favicon) com o nome ao lado. */
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
      <rect width="512" height="512" rx="116" fill="#16181d" />
      <g
        transform="translate(256, 256) scale(1.68)"
        fill="none"
        stroke-width="28"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M -54,25 C -110,-5 -106,-78 -46,-96 C 10,-112 50,-75 50,-32 L 50,68 L -24,-42" stroke="#ffffff" />
        <path d="M -24,-42 L -24,68 C -24,118 48,126 76,78 C 98,42 88,-2 54,-25" stroke="#ffc83d" />
      </g>
    </svg>
    @if (comNome()) {
      <span class="font-display text-lg font-semibold tracking-tight text-ink leading-none">nexus</span>
    }
  `,
})
export class Logo {
  readonly tamanho = input(32);
  readonly comNome = input(true);
}
