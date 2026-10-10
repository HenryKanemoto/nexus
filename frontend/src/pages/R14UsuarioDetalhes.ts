import {ChangeDetectionStrategy, Component, computed, inject} from '@angular/core';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {NexusStore} from '../store/nexus.store';
import {MatIconModule} from '@angular/material/icon';
import {StatusBadge} from '../components/status-badge/status-badge';
import {formatDateShort} from '../lib/date-utils';
import {Emprestimo} from '../types/models';
import {iniciais, rotuloPerfil} from '../lib/texto-utils';
import {plural} from '../lib/categoria-utils';

@Component({
  selector: 'app-r14-usuario-detalhes',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatIconModule, StatusBadge],
  templateUrl: './R14UsuarioDetalhes.html',
})
export class R14UsuarioDetalhes {
  private readonly route = inject(ActivatedRoute);
  readonly store = inject(NexusStore);

  readonly rotuloPerfil = rotuloPerfil;

  readonly usuarioId = computed(() => this.route.snapshot.paramMap.get('id') || '');

  readonly usuario = computed(() => {
    const id = this.usuarioId();
    return this.store.usuarios().find((u) => u.id === id) || null;
  });

  readonly emprestimosUsuario = computed(() => {
    const id = this.usuarioId();
    return this.store.emprestimos().filter((e) => e.usuarioId === id);
  });

  // Contador 1: total de empréstimos
  readonly totalEmprestimos = computed(() => {
    return this.emprestimosUsuario().length;
  });

  // Contador 2: total de empréstimos com atraso
  readonly totalAtrasos = computed(() => {
    return this.emprestimosUsuario().filter((e) => e.diasAtraso > 0).length;
  });

  // Contador 3: total de ocorrências do usuário
  readonly totalOcorrencias = computed(() => {
    const id = this.usuarioId();
    return this.store.ocorrencias().filter((o) => o.usuarioId === id).length;
  });

  getItem(id: string) {
    return this.store.itens().find((i) => i.id === id);
  }

  formatarData(iso?: string): string {
    if (!iso) return '—';
    return formatDateShort(iso);
  }

  getIniciais(nome: string): string {
    return iniciais(nome);
  }

  getSituacaoFinal(emp: Emprestimo): { texto: string; classeCss: string } {
    if (!emp.devolvidoEm) {
      if (emp.diasAtraso > 0) {
        return {
          texto: `Atrasado há ${plural(emp.diasAtraso, 'dia')}`,
          classeCss: 'bg-danger-soft text-danger',
        };
      }
      return {
        texto: 'Em andamento',
        classeCss: 'bg-info-soft text-info',
      };
    }

    // Se devolvido, verifica se gerou ocorrência de defeito
    const teveDefeito = this.store.ocorrencias().some((o) => o.emprestimoId === emp.id);
    if (teveDefeito) {
      return {
        texto: 'Devolvido com defeito',
        classeCss: 'bg-maint-soft text-maint',
      };
    }

    if (emp.diasAtraso > 0) {
      return {
        texto: `Devolvido com ${plural(emp.diasAtraso, 'dia')} de atraso`,
        classeCss: 'bg-warn-soft text-warn',
      };
    }

    return {
      texto: 'Devolvido no prazo',
      classeCss: 'bg-ok-soft text-ok',
    };
  }
}
