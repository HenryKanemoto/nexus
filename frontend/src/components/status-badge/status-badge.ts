import {ChangeDetectionStrategy, Component, computed, input} from '@angular/core';
import {StatusItem, StatusUsuario} from '../../types/models';

type Tom = 'ok' | 'warn' | 'info' | 'danger' | 'maint' | 'neutro';

const STATUS: Record<string, {label: string; tom: Tom}> = {
  // Itens
  disponivel: {label: 'Disponível', tom: 'ok'},
  solicitado: {label: 'Solicitado', tom: 'warn'},
  reservado: {label: 'Reservado', tom: 'warn'},
  emprestado: {label: 'Emprestado', tom: 'info'},
  atrasado: {label: 'Atrasado', tom: 'danger'},
  manutencao: {label: 'Manutenção', tom: 'maint'},
  // Usuários
  ativa: {label: 'Ativa', tom: 'ok'},
  pendente: {label: 'Pendente', tom: 'warn'},
  bloqueada: {label: 'Bloqueada', tom: 'danger'},
  suspensa: {label: 'Suspensa', tom: 'maint'},
  recusada: {label: 'Recusada', tom: 'neutro'},
};

const CLASSES: Record<Tom, string> = {
  ok: 'bg-ok-soft text-ok',
  warn: 'bg-warn-soft text-warn',
  info: 'bg-info-soft text-info',
  danger: 'bg-danger-soft text-danger',
  maint: 'bg-maint-soft text-maint',
  neutro: 'bg-sunken text-ink-soft',
};

@Component({
  selector: 'app-status-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span
      class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap {{ classes() }}"
    >
      <span class="size-1.5 rounded-full bg-current"></span>
      {{ config().label }}
    </span>
  `,
})
export class StatusBadge {
  readonly status = input.required<StatusItem | StatusUsuario | string>();

  readonly config = computed(() => STATUS[this.status()] ?? {label: this.status(), tom: 'neutro' as Tom});
  readonly classes = computed(() => CLASSES[this.config().tom]);
}
