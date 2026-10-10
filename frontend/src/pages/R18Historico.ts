import {ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {NexusStore} from '../store/nexus.store';
import {formatDateShort} from '../lib/date-utils';

type TipoHistorico = 'todos' | 'solicitacao' | 'emprestimo' | 'devolucao' | 'manutencao' | 'cadastro';
interface RegistroHistorico {
  id: string;
  tipo: Exclude<TipoHistorico, 'todos'>;
  titulo: string;
  detalhe: string;
  pessoa: string;
  item: string;
  data: string;
  status: string;
}

@Component({
  selector: 'app-r18-historico',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  templateUrl: './R18Historico.html',
})
export class R18Historico {
  readonly store = inject(NexusStore);
  readonly tipo = signal<TipoHistorico>('todos');
  readonly busca = signal('');
  readonly dataInicio = signal('');
  readonly dataFim = signal('');

  readonly registros = computed<RegistroHistorico[]>(() => {
    const usuarios = this.store.usuarios();
    const itens = this.store.itens();
    const solicitacoes = this.store.solicitacoes();
    const emprestimos = this.store.emprestimos();
    const ocorrencias = this.store.ocorrencias();
    const registros: RegistroHistorico[] = [];
    const nomeUsuario = (id?: string) => usuarios.find(u => u.id === id)?.nome || 'Pessoa não identificada';
    const nomeItem = (id?: string) => { const i = itens.find(x => x.id === id); return i ? `${i.nome} (${i.patrimonio})` : 'Item não identificado'; };

    for (const s of solicitacoes) {
      const item = nomeItem(s.itemId); const pessoa = nomeUsuario(s.solicitanteId);
      registros.push({ id: `sol-${s.id}`, tipo: 'solicitacao', titulo: `Solicitação ${this.rotuloStatusSolicitacao(s.status).toLowerCase()}`, detalhe: `Pedido criado em ${this.formatarData(s.criadoEm)}`, pessoa, item, data: s.avaliadoEm || s.criadoEm, status: this.rotuloStatusSolicitacao(s.status) });
    }

    if (solicitacoes.length === 0) {
      const amostras = [
        ['2026-10-09T08:30:00', 'Prof. Carlos Mendes', 1, 'Aprovada'],
        ['2026-10-08T14:10:00', 'Ana Souza', 5, 'Pendente'],
        ['2026-10-07T10:20:00', 'Bruno Lima', 3, 'Recusada'],
        ['2026-10-05T09:15:00', 'Prof. Carlos Mendes', 7, 'Aprovada'],
      ] as const;
      amostras.forEach(([data, pessoa, indiceItem, status], indice) => {
        const item = itens[indiceItem] ? `${itens[indiceItem].nome} (${itens[indiceItem].patrimonio})` : 'Item do catálogo';
        registros.push({
          id: `demo-sol-${indice}`,
          tipo: 'solicitacao',
          titulo: `Solicitação ${status.toLocaleLowerCase('pt-BR')}`,
          detalhe: 'Registro demonstrativo',
          pessoa,
          item,
          data,
          status,
        });
      });
    }

    for (const e of emprestimos) {
      const pessoa = nomeUsuario(e.usuarioId); const item = nomeItem(e.itemId);
      registros.push({ id: `emp-${e.id}`, tipo: 'emprestimo', titulo: 'Retirada registrada', detalhe: `Responsável pelo registro: ${nomeUsuario(e.registradoPor)}`, pessoa, item, data: e.retiradoEm, status: e.devolvidoEm ? 'Devolvido' : (e.diasAtraso > 0 ? 'Atrasado' : 'Empréstimo ativo') });
      if (e.devolvidoEm) registros.push({ id: `dev-${e.id}`, tipo: 'devolucao', titulo: 'Devolução registrada', detalhe: `Empréstimo ${e.id}`, pessoa, item, data: e.devolvidoEm, status: 'Concluído' });
    }
    for (const o of ocorrencias) {
      registros.push({ id: `oc-${o.id}`, tipo: 'manutencao', titulo: o.status === 'resolvida' ? 'Ocorrência resolvida' : 'Ocorrência de manutenção aberta', detalhe: o.descricao || 'Registro de manutenção', pessoa: nomeUsuario(o.usuarioId), item: nomeItem(o.itemId), data: o.resolvidoEm || o.criadoEm, status: o.status === 'resolvida' ? 'Resolvida' : 'Em aberto' });
    }
    for (const i of itens) {
      registros.push({ id: `item-${i.id}`, tipo: 'cadastro', titulo: 'Item presente no catálogo', detalhe: `Situação atual: ${i.status}`, pessoa: '—', item: `${i.nome} (${i.patrimonio})`, data: '', status: i.status });
    }
    return registros;
  });

  readonly registrosFiltrados = computed(() => {
    const tipo = this.tipo(); const busca = this.busca().trim().toLocaleLowerCase('pt-BR');
    const inicio = this.dataInicio(); const fim = this.dataFim();
    return this.registros().filter(r => {
      if (tipo !== 'todos' && r.tipo !== tipo) return false;
      if (busca && !`${r.titulo} ${r.detalhe} ${r.pessoa} ${r.item} ${r.status}`.toLocaleLowerCase('pt-BR').includes(busca)) return false;
      const dia = r.data ? r.data.slice(0, 10) : '';
      if ((inicio || fim) && !dia) return false;
      if (inicio && dia < inicio) return false;
      if (fim && dia > fim) return false;
      return true;
    }).sort((a,b) => (b.data || '').localeCompare(a.data || ''));
  });

  contar(tipo: TipoHistorico) { return this.registros().filter(r => r.tipo === tipo).length; }
  contarEmprestimosDevolucoes() { return this.registros().filter(r => r.tipo === 'emprestimo' || r.tipo === 'devolucao').length; }
  formatarData(iso: string) { return iso ? formatDateShort(iso) : 'Data não registrada'; }
  icone(tipo: Exclude<TipoHistorico, 'todos'>) { return ({solicitacao:'assignment', emprestimo:'outbox', devolucao:'move_to_inbox', manutencao:'build', cadastro:'inventory_2'})[tipo]; }
  classeIcone(tipo: Exclude<TipoHistorico, 'todos'>) { return ({solicitacao:'bg-info-soft text-info', emprestimo:'bg-accent-soft text-warn', devolucao:'bg-ok-soft text-ok', manutencao:'bg-maint-soft text-maint', cadastro:'bg-sunken text-ink-soft'})[tipo]; }
  rotuloStatusSolicitacao(status: string) { return ({pendente:'Pendente', aprovada:'Aprovada', recusada:'Recusada', expirada:'Expirada', concluida:'Concluída'} as Record<string,string>)[status] || status; }
  limparFiltros() { this.tipo.set('todos'); this.busca.set(''); this.dataInicio.set(''); this.dataFim.set(''); }
}
