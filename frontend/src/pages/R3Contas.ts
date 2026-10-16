import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProtemStore } from '../store/protem.store';
import { MatIconModule } from '@angular/material/icon';
import { Usuario } from '../types/models';
import { formatDateShort } from '../lib/date-utils';
import { iniciais } from '../lib/texto-utils';
import {Modal} from '../components/modal/modal';
@Component({
  selector: 'app-r3-contas',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule, Modal, RouterLink],
  templateUrl: './R3Contas.html',
})
export class R3Contas {
  readonly store = inject(ProtemStore);

  readonly feedbackMensagem = signal<string | null>(null);
  readonly usuarioParaRecusar = signal<Usuario | null>(null);

  readonly iniciais = iniciais;

  readonly contasPendentes = computed(() => {
    return this.store.usuarios().filter((u) => u.status === 'pendente');
  });

  formatarData(iso?: string) {
    if (!iso) return '—';
    return formatDateShort(iso);
  }

  aprovarConta(u: Usuario) {
    this.store.aprovarUsuario(u.id);
    this.feedbackMensagem.set(`Conta de ${u.nome} foi aprovada com sucesso! O solicitante foi notificado.`);
  }

  abrirModalRecusa(u: Usuario) {
    this.usuarioParaRecusar.set(u);
  }

  confirmarRecusaConta(usuarioId: string, motivo: string) {
    this.store.recusarUsuario(usuarioId, motivo);
    this.usuarioParaRecusar.set(null);
    this.feedbackMensagem.set('Cadastro recusado e usuário notificado.');
  }
}
