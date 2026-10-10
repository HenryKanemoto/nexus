import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NexusStore } from '../store/nexus.store';
import { MatIconModule } from '@angular/material/icon';
import { StatusBadge } from '../components/status-badge/status-badge';
import { iniciais, rotuloPerfil } from '../lib/texto-utils';

@Component({
  selector: 'app-r13-usuarios',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule, StatusBadge, RouterLink],
  templateUrl: './R13Usuarios.html',
})
export class R13Usuarios {
  readonly store = inject(NexusStore);
  private readonly router = inject(Router);

  readonly termoBusca = signal('');

  readonly rotuloPerfil = rotuloPerfil;

  readonly usuariosFiltrados = computed(() => {
    const termo = this.termoBusca().trim().toLowerCase();
    const todos = this.store.usuarios();

    if (!termo) {
      return todos;
    }

    return todos.filter(
      (u) =>
        u.nome.toLowerCase().includes(termo) ||
        u.matricula.toLowerCase().includes(termo) ||
        u.email.toLowerCase().includes(termo)
    );
  });

  abrirUsuario(id: string) {
    this.router.navigate(['/painel/usuarios', id]);
  }

  getIniciais(nome: string): string {
    return iniciais(nome);
  }
}
