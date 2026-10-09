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
  template: `
    <div class="max-w-7xl space-y-6 font-['Sora',sans-serif]">
      <header class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-[#0E1A3A]">Histórico</h1>
          <p class="text-xs text-slate-500 mt-1">Registro das movimentações do acervo e das atividades do sistema</p>
        </div>
        <div class="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500">
          <mat-icon class="text-base">history</mat-icon>
          {{ registrosFiltrados().length }} registros encontrados
        </div>
      </header>

      <section class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs"><p class="text-xs text-slate-500">Solicitações</p><p class="mt-2 text-2xl font-bold text-[#0E1A3A]">{{ contar('solicitacao') }}</p></div>
        <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs"><p class="text-xs text-slate-500">Empréstimos e devoluções</p><p class="mt-2 text-2xl font-bold text-[#0E1A3A]">{{ contarEmprestimosDevolucoes() }}</p></div>
        <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs"><p class="text-xs text-slate-500">Ocorrências de manutenção</p><p class="mt-2 text-2xl font-bold text-[#0E1A3A]">{{ store.ocorrencias().length }}</p></div>
        <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs"><p class="text-xs text-slate-500">Itens cadastrados</p><p class="mt-2 text-2xl font-bold text-[#0E1A3A]">{{ store.itens().length }}</p></div>
      </section>

      <section class="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-2xs space-y-4">
        <div class="flex items-center gap-2"><mat-icon class="text-[#2F6BFF]">filter_list</mat-icon><h2 class="font-bold text-sm text-[#0E1A3A]">Filtrar movimentações</h2></div>
        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          <label class="text-xs font-semibold text-slate-600">Tipo de movimentação
            <select [value]="tipo()" (change)="tipo.set($any($event.target).value)" class="mt-1.5 block w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-800 focus:border-[#2F6BFF] focus:outline-none">
              <option value="todos">Todos os tipos</option><option value="solicitacao">Solicitações</option><option value="emprestimo">Empréstimos / retiradas</option><option value="devolucao">Devoluções</option><option value="manutencao">Manutenção</option><option value="cadastro">Cadastro de itens (visão atual)</option>
            </select>
          </label>
          <label class="text-xs font-semibold text-slate-600">Buscar pessoa ou item
            <input [value]="busca()" (input)="busca.set($any($event.target).value)" placeholder="Nome, patrimônio ou descrição" class="mt-1.5 block w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800 focus:border-[#2F6BFF] focus:outline-none" />
          </label>
          <label class="text-xs font-semibold text-slate-600">A partir de
            <input type="date" [value]="dataInicio()" (change)="dataInicio.set($any($event.target).value)" class="mt-1.5 block w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800 focus:border-[#2F6BFF] focus:outline-none" />
          </label>
          <label class="text-xs font-semibold text-slate-600">Até
            <input type="date" [value]="dataFim()" (change)="dataFim.set($any($event.target).value)" class="mt-1.5 block w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800 focus:border-[#2F6BFF] focus:outline-none" />
          </label>
        </div>
        <div class="flex justify-end"><button type="button" (click)="limparFiltros()" class="rounded-lg px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100">Limpar filtros</button></div>
      </section>

      <section class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs">
        <div class="flex items-center justify-between border-b border-slate-100 px-4 py-4 sm:px-5"><h2 class="text-sm font-bold text-[#0E1A3A]">Movimentações registradas</h2><span class="text-[11px] text-slate-400">Mais recentes primeiro</span></div>
        <div class="hidden md:block overflow-x-auto">
          <table class="w-full text-left text-xs"><thead class="bg-slate-50 text-slate-600"><tr><th class="p-4">Data e hora</th><th class="p-4">Movimentação</th><th class="p-4">Pessoa</th><th class="p-4">Item</th><th class="p-4">Status</th></tr></thead>
            <tbody class="divide-y divide-slate-100">
              @for (r of registrosFiltrados(); track r.id) {
                <tr class="hover:bg-slate-50/70"><td class="p-4 whitespace-nowrap text-slate-500">{{ formatarData(r.data) }}</td><td class="p-4"><div class="flex items-center gap-2"><span class="flex h-8 w-8 items-center justify-center rounded-lg" [class.bg-blue-50]="r.tipo === 'solicitacao' || r.tipo === 'emprestimo'" [class.text-blue-700]="r.tipo === 'solicitacao' || r.tipo === 'emprestimo'" [class.bg-emerald-50]="r.tipo === 'devolucao'" [class.text-emerald-700]="r.tipo === 'devolucao'" [class.bg-amber-50]="r.tipo === 'manutencao'" [class.text-amber-700]="r.tipo === 'manutencao'" [class.bg-slate-100]="r.tipo === 'cadastro'" [class.text-slate-700]="r.tipo === 'cadastro'"><mat-icon class="text-base">{{ icone(r.tipo) }}</mat-icon></span><div><strong class="block text-slate-800">{{ r.titulo }}</strong><span class="mt-0.5 block text-[10px] text-slate-500">{{ r.detalhe }}</span></div></div></td><td class="p-4 text-slate-700">{{ r.pessoa }}</td><td class="p-4 text-slate-700">{{ r.item }}</td><td class="p-4"><span class="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">{{ r.status }}</span></td></tr>
              } @empty { <tr><td colspan="5" class="p-12 text-center"><mat-icon class="text-3xl text-slate-300">manage_search</mat-icon><p class="mt-2 text-sm font-semibold text-slate-600">Nenhuma movimentação encontrada</p><p class="mt-1 text-xs text-slate-400">Tente alterar os filtros de pesquisa.</p></td></tr> }
            </tbody>
          </table>
        </div>
        <div class="space-y-3 p-3 md:hidden">
          @for (r of registrosFiltrados(); track r.id) {
            <article class="rounded-xl border border-slate-200 p-3"><div class="flex items-start gap-3"><span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700"><mat-icon>{{ icone(r.tipo) }}</mat-icon></span><div class="min-w-0 flex-1"><div class="flex items-start justify-between gap-2"><strong class="text-xs text-[#0E1A3A]">{{ r.titulo }}</strong><span class="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600">{{ r.status }}</span></div><p class="mt-1 text-[11px] text-slate-500">{{ r.detalhe }}</p><p class="mt-2 text-[11px] text-slate-700">{{ r.pessoa }} · {{ r.item }}</p><p class="mt-2 text-[10px] text-slate-400">{{ formatarData(r.data) }}</p></div></div></article>
          } @empty { <p class="p-8 text-center text-xs text-slate-400">Nenhuma movimentação encontrada.</p> }
        </div>
      </section>
      <p class="text-[11px] leading-relaxed text-slate-400">Observação: o histórico é montado a partir dos registros que o sistema já mantém. Alterações antigas de cadastro que não foram registradas previamente não podem ser reconstruídas retroativamente.</p>
    </div>
  `,
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
  rotuloStatusSolicitacao(status: string) { return ({pendente:'Pendente', aprovada:'Aprovada', recusada:'Recusada', expirada:'Expirada', concluida:'Concluída'} as Record<string,string>)[status] || status; }
  limparFiltros() { this.tipo.set('todos'); this.busca.set(''); this.dataInicio.set(''); this.dataFim.set(''); }
}
