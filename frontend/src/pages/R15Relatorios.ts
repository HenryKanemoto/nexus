import {ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {NexusStore} from '../store/nexus.store';
import {MatIconModule} from '@angular/material/icon';
import {parseDate} from '../lib/date-utils';
import {plural} from '../lib/categoria-utils';

type PeriodoOpcao = '7d' | '30d' | '90d' | 'tudo';

interface ItemRanking {
  id: string;
  nome: string;
  patrimonio: string;
  categoriaNome: string;
  total: number;
}

@Component({
  selector: 'app-r15-relatorios',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatIconModule],
  templateUrl: './R15Relatorios.html',
})
export class R15Relatorios {
  readonly store = inject(NexusStore);
  private readonly router = inject(Router);

  readonly periodoSelecionado = signal<PeriodoOpcao>('30d');

  readonly plural = plural;

  readonly periodos: {valor: PeriodoOpcao; rotulo: string}[] = [
    {valor: '7d', rotulo: '7 dias'},
    {valor: '30d', rotulo: '30 dias'},
    {valor: '90d', rotulo: '90 dias'},
    {valor: 'tudo', rotulo: 'Tudo'},
  ];

  private getFiltroDataMs(): number {
    const agora = this.store.agora().getTime();
    switch (this.periodoSelecionado()) {
      case '7d':
        return agora - 7 * 24 * 60 * 60 * 1000;
      case '30d':
        return agora - 30 * 24 * 60 * 60 * 1000;
      case '90d':
        return agora - 90 * 24 * 60 * 60 * 1000;
      case 'tudo':
      default:
        return 0;
    }
  }

  // Empréstimos filtrados pelo período selecionado
  readonly emprestimosPeriodo = computed(() => {
    const minMs = this.getFiltroDataMs();
    return this.store.emprestimos().filter((e) => {
      const ms = parseDate(e.retiradoEm).getTime();
      return ms >= minMs;
    });
  });

  // Ocorrências filtradas pelo período selecionado
  readonly ocorrenciasPeriodo = computed(() => {
    const minMs = this.getFiltroDataMs();
    return this.store.ocorrencias().filter((o) => {
      const ms = parseDate(o.criadoEm).getTime();
      return ms >= minMs;
    });
  });

  // 1. Ranking dos Itens Mais Emprestados
  readonly rankingMaisEmprestados = computed<ItemRanking[]>(() => {
    const emps = this.emprestimosPeriodo();
    const contagemPorItem = new Map<string, number>();

    emps.forEach((e) => {
      contagemPorItem.set(e.itemId, (contagemPorItem.get(e.itemId) || 0) + 1);
    });

    const resultado: ItemRanking[] = [];
    contagemPorItem.forEach((total, itemId) => {
      const it = this.store.itens().find((i) => i.id === itemId);
      if (it) {
        const cat = this.store.categorias().find((c) => c.id === it.categoriaId);
        resultado.push({
          id: it.id,
          nome: it.nome,
          patrimonio: it.patrimonio,
          categoriaNome: cat?.nome || '—',
          total,
        });
      }
    });

    return resultado.sort((a, b) => b.total - a.total).slice(0, 5);
  });

  readonly maxEmprestimosRanking = computed(() => {
    const r = this.rankingMaisEmprestados();
    return r.length > 0 ? r[0].total : 1;
  });

  getPorcentagemBarra(total: number): number {
    const max = this.maxEmprestimosRanking();
    return Math.max(4, Math.round((total / max) * 100));
  }

  // 2. Atrasos: Agora e No Período
  readonly atrasosAgoraCount = computed(() => {
    return this.store.emprestimos().filter((e) => !e.devolvidoEm && e.diasAtraso > 0).length;
  });

  readonly atrasosNoPeriodoCount = computed(() => {
    return this.emprestimosPeriodo().filter((e) => e.diasAtraso > 0).length;
  });

  readonly listaAtrasos = computed(() => {
    return this.emprestimosPeriodo().filter((e) => e.diasAtraso > 0);
  });

  // 3. Ranking de Itens com Mais Defeitos
  readonly rankingDefeitos = computed<ItemRanking[]>(() => {
    const ocorrs = this.ocorrenciasPeriodo();
    const contagemDefeitos = new Map<string, number>();

    ocorrs.forEach((o) => {
      contagemDefeitos.set(o.itemId, (contagemDefeitos.get(o.itemId) || 0) + 1);
    });

    const resultado: ItemRanking[] = [];
    contagemDefeitos.forEach((total, itemId) => {
      const it = this.store.itens().find((i) => i.id === itemId);
      if (it) {
        const cat = this.store.categorias().find((c) => c.id === it.categoriaId);
        resultado.push({
          id: it.id,
          nome: it.nome,
          patrimonio: it.patrimonio,
          categoriaNome: cat?.nome || '—',
          total,
        });
      }
    });

    return resultado.sort((a, b) => b.total - a.total).slice(0, 5);
  });

  getUsuario(id?: string) {
    if (!id) return undefined;
    return this.store.usuarios().find((u) => u.id === id);
  }

  getItem(id?: string) {
    if (!id) return undefined;
    return this.store.itens().find((i) => i.id === id);
  }

  abrirItem(id: string) {
    this.router.navigate(['/painel/itens', id]);
  }
}
