import {ChangeDetectionStrategy, Component, input} from '@angular/core';
import {RouterLink} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';

export interface BreadcrumbItem {
  label: string;
  url?: string;
}

export interface NavAction {
  label: string;
  url: string;
  icon?: string;
  primary?: boolean;
}

@Component({
  selector: 'app-provisional-screen',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatIconModule],
  template: `
    <div class="space-y-6">
      <!-- Breadcrumb e Metadados do Esqueleto -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <div class="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span class="font-bold text-[#2F6BFF] uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
              Bloco 1 · Esqueleto de Navegação
            </span>
            <span>·</span>
            <span class="font-mono font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
              Código: {{ codigo() }}
            </span>
          </div>

          <h2 class="text-2xl font-bold text-[#0E1A3A] tracking-tight">
            {{ titulo() }}
          </h2>
          <p class="text-sm text-slate-600 mt-1 max-w-2xl">
            {{ descricao() }}
          </p>
        </div>

        @if (acoes().length > 0) {
          <div class="flex flex-wrap items-center gap-2">
            @for (acao of acoes(); track acao.url) {
              <a
                [routerLink]="acao.url"
                class="px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all {{
                  acao.primary
                    ? 'bg-[#2F6BFF] hover:bg-blue-600 text-white shadow-xs'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs'
                }}"
              >
                @if (acao.icon) {
                  <mat-icon class="text-sm w-4 h-4 flex items-center justify-center">{{ acao.icon }}</mat-icon>
                }
                {{ acao.label }}
              </a>
            }
          </div>
        }
      </div>

      <!-- Área de Conteúdo da Tela Provisória -->
      <div class="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
        <ng-content></ng-content>
      </div>
    </div>
  `,
})
export class ProvisionalScreen {
  readonly codigo = input.required<string>();
  readonly titulo = input.required<string>();
  readonly descricao = input<string>('Esta tela faz parte da arquitetura inicial e receberá o wireframe detalhado nos próximos blocos.');
  readonly acoes = input<NavAction[]>([]);
}
