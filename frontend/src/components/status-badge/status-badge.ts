import {ChangeDetectionStrategy, Component, computed, input} from '@angular/core';
import {StatusItem, StatusUsuario} from '../../types/models';

@Component({
  selector: 'app-status-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span
      class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold tracking-wide border shadow-2xs {{ badgeClass() }}"
    >
      <span class="w-1.5 h-1.5 rounded-full {{ dotClass() }}"></span>
      {{ label() }}
    </span>
  `,
})
export class StatusBadge {
  readonly status = input.required<StatusItem | StatusUsuario | string>();

  readonly config = computed(() => {
    const s = this.status();
    switch (s) {
      // Itens:
      case 'disponivel':
        return {
          label: 'Disponível',
          badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          dot: 'bg-emerald-500',
        };
      case 'solicitado':
        return {
          label: 'Solicitado',
          badge: 'bg-amber-50 text-amber-800 border-amber-200',
          dot: 'bg-amber-500',
        };
      case 'reservado':
        return {
          label: 'Reservado',
          badge: 'bg-yellow-50 text-yellow-800 border-yellow-200',
          dot: 'bg-yellow-500',
        };
      case 'emprestado':
        return {
          label: 'Emprestado',
          badge: 'bg-blue-50 text-blue-800 border-blue-200',
          dot: 'bg-blue-500',
        };
      case 'atrasado':
        return {
          label: 'Atrasado',
          badge: 'bg-rose-50 text-rose-800 border-rose-200',
          dot: 'bg-rose-500',
        };
      case 'manutencao':
        return {
          label: 'Manutenção',
          badge: 'bg-purple-50 text-purple-800 border-purple-200',
          dot: 'bg-purple-500',
        };
      // Usuários:
      case 'ativa':
        return {
          label: 'Ativa',
          badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          dot: 'bg-emerald-500',
        };
      case 'pendente':
        return {
          label: 'Pendente',
          badge: 'bg-amber-50 text-amber-800 border-amber-200',
          dot: 'bg-amber-500',
        };
      case 'bloqueada':
        return {
          label: 'Bloqueada',
          badge: 'bg-rose-50 text-rose-800 border-rose-200',
          dot: 'bg-rose-500',
        };
      case 'suspensa':
        return {
          label: 'Suspensa',
          badge: 'bg-purple-50 text-purple-800 border-purple-200',
          dot: 'bg-purple-500',
        };
      default:
        return {
          label: s,
          badge: 'bg-slate-50 text-slate-700 border-slate-200',
          dot: 'bg-slate-400',
        };
    }
  });

  readonly label = computed(() => this.config().label);
  readonly badgeClass = computed(() => this.config().badge);
  readonly dotClass = computed(() => this.config().dot);
}
