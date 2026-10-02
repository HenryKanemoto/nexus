import {ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {NexusStore} from '../store/nexus.store';
import {formatDateShort, parseDate, toDateInputValue} from '../lib/date-utils';
import {Item, Usuario} from '../types/models';

type TipoMovimentacao =
  | 'todos'
  | 'solicitacao'
  | 'aprovacao'
  | 'retirada'
  | 'devolucao'
  | 'ocorrencia'
  | 'cadastro';

  interface MovimentoHistorico {
  id: string;
  dataHora: string;
  tipo: Exclude<TipoMovimentacao, 'todos'>;
  titulo: string;
  pessoaId?: string;
  pessoaNome: string;
  itemId?: string;
  itemNome: string;
  responsavelNome: string;
  detalhe: string;
}

@Component({
  selector: 'app-r18-historico',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  template: `
    <div class="space-y-6 font-['Sora',sans-serif] max-w-[1500px]">
      <!-- Cabeçalho -->
      <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 mb-2">
            <span class="w-2.5 h-2.5 rounded-full bg-[#2F6BFF]"></span>
            <span class="text-[11px] font-bold uppercase tracking-wider text-[#2F6BFF]">Auditoria</span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-[#0E1A3A]">Histórico</h1>
          <p class="text-xs sm:text-sm text-slate-500 mt-1">
            Consulte as movimentações do acervo, empréstimos e usuários em um único lugar.
          </p>
        </div>

        <div class="flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-3 py-2 shadow-xs">
          <mat-icon class="text-[#2F6BFF] text-lg w-5 h-5">history</mat-icon>
          <span class="text-xs font-semibold text-slate-600">
            {{ historicoFiltrado().length }} {{ historicoFiltrado().length === 1 ? 'registro' : 'registros' }} encontrados
          </span>
        </div>
      </div>

      
      <!-- Filtros -->
      <section class="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5">
        <div class="flex items-center justify-between gap-3 mb-4">
          <div class="flex items-center gap-2">
            <mat-icon class="text-[#0E1A3A] text-lg w-5 h-5">filter_alt</mat-icon>
            <h2 class="text-sm font-bold text-[#0E1A3A]">Filtros do histórico</h2>
          </div>
          <button
            type="button"
            (click)="limparFiltros()"
            class="text-[11px] font-bold text-[#2F6BFF] hover:underline cursor-pointer"
          >
            Limpar filtros
          </button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          <label class="block">
            <span class="block text-[11px] font-semibold text-slate-500 mb-1.5">Período inicial</span>
            <input
              type="date"
              [value]="dataInicial()"
              (input)="dataInicial.set($any($event.target).value)"
              class="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs text-[#0E1A3A] font-medium focus:bg-white focus:border-[#2F6BFF] focus:ring-2 focus:ring-[#2F6BFF]/15 outline-none"
            />
          </label>

           <label class="block">
            <span class="block text-[11px] font-semibold text-slate-500 mb-1.5">Período final</span>
            <input
              type="date"
              [value]="dataFinal()"
              (input)="dataFinal.set($any($event.target).value)"
              class="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs text-[#0E1A3A] font-medium focus:bg-white focus:border-[#2F6BFF] focus:ring-2 focus:ring-[#2F6BFF]/15 outline-none"
            />
          </label>

           <label class="block">
            <span class="block text-[11px] font-semibold text-slate-500 mb-1.5">Tipo de movimentação</span>
            <select
              [value]="tipoSelecionado()"
              (change)="tipoSelecionado.set($any($event.target).value)"
              class="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs text-[#0E1A3A] font-semibold focus:bg-white focus:border-[#2F6BFF] focus:ring-2 focus:ring-[#2F6FF]/15 outline-none"
            >
              <option value="todos">Todas</option>
              <option value="solicitacao">Solicitação</option>
              <option value="aprovacao">Aprovação / recusa</option>
              <option value="retirada">Retirada</option>
              <option value="devolucao">Devolução</option>
              <option value="ocorrencia">Ocorrência</option>
              <option value="cadastro">Cadastro de pessoa</option>
            </select>
          </label>

          <label class="block">
            <span class="block text-[11px] font-semibold text-slate-500 mb-1.5">Pessoa</span>
            <select
              [value]="pessoaSelecionada()"
              (change)="pessoaSelecionada.set($any($event.target).value)"
              class="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs text-[#0E1A3A] font-semibold focus:bg-white focus:border-[#2F6BFF] focus:ring-2 focus:ring-[#2F6BFF]/15 outline-none"
            >
              <option value="todos">Todas as pessoas</option>
              @for (pessoa of pessoas(); track pessoa.id) {
                <option [value]="pessoa.id">{{ pessoa.nome }}</option>
              }
            </select>
          </label>

           <label class="block">
            <span class="block text-[11px] font-semibold text-slate-500 mb-1.5">Item</span>
            <select
              [value]="itemSelecionado()"
              (change)="itemSelecionado.set($any($event.target).value)"
              class="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs text-[#0E1A3A] font-semibold focus:bg-white focus:border-[#2F6BFF] focus:ring-2 focus:ring-[#2F6BFF]/15 outline-none"
            >
              <option value="todos">Todos os itens</option>
              @for (item of itens(); track item.id) {
                <option [value]="item.id">{{ item.nome }}</option>
              }
            </select>
          </label>

          <div class="grid grid-cols-2 gap-2">
            <label class="block">
              <span class="block text-[11px] font-semibold text-slate-500 mb-1.5">De</span>
              <input
                type="time"
                [value]="horaInicial()"
                (input)="horaInicial.set($any($event.target).value)"
                class="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-2.5 text-xs text-[#0E1A3A] font-semibold focus:bg-white focus:border-[#2F6BFF] outline-none"
              />
            </label>
            <label class="block">
              <span class="block text-[11px] font-semibold text-slate-500 mb-1.5">Até</span>
              <input
                type="time"
                [value]="horaFinal()"
                (input)="horaFinal.set($any($event.target).value)"
                class="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-2.5 text-xs text-[#0E1A3A] font-semibold focus:bg-white focus:border-[#2F6BFF] outline-none"
              />
            </label>
          </div>
        </div>
      </section>

      <!-- Tabela -->
      <section class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="px-4 sm:px-5 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 class="text-sm font-bold text-[#0E1A3A]">Movimentações registradas</h2>
            <p class="text-[11px] text-slate-400 mt-0.5">Mais recentes primeiro</p>
          </div>
          <span class="text-[11px] text-slate-500 font-medium">
            Período: {{ periodoTexto() }}
          </span>
        </div>

         <!-- Desktop -->
        <div class="hidden md:block overflow-x-auto">
          <table class="w-full text-xs text-left">
            <thead class="bg-slate-50 border-b border-slate-200 text-slate-600">
              <tr>
                <th class="px-5 py-3 font-bold whitespace-nowrap">Data e horário</th>
                <th class="px-4 py-3 font-bold">Movimentação</th>
                <th class="px-4 py-3 font-bold">Pessoa</th>
                <th class="px-4 py-3 font-bold">Item</th>
                <th class="px-4 py-3 font-bold">Responsável</th>
                <th class="px-5 py-3 font-bold">Detalhes</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @for (mov of historicoFiltrado(); track mov.id) {
                <tr class="hover:bg-slate-50/70 transition-colors">
                  <td class="px-5 py-4 whitespace-nowrap">
                    <span class="block font-bold text-[#0E1A3A]">{{ formatarData(mov.dataHora) }}</span>
                    <span class="text-[11px] text-slate-400">{{ formatarHora(mov.dataHora) }}</span>
                  </td>
                  <td class="px-4 py-4">
                    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap {{ classeTipo(mov.tipo) }}">
                      <span class="w-1.5 h-1.5 rounded-full bg-current"></span>
                      {{ rotuloTipo(mov.tipo) }}
                    </span>
                    <strong class="block mt-1 text-[11px] text-[#0E1A3A]">{{ mov.titulo }}</strong>
                  </td>
                  <td class="px-4 py-4">
                    <span class="font-semibold text-slate-700">{{ mov.pessoaNome }}</span>
                  </td>
                  <td class="px-4 py-4 min-w-[210px]">
                    <span class="font-semibold text-slate-700">{{ mov.itemNome }}</span>
                  </td>
                  <td class="px-4 py-4 text-slate-500">{{ mov.responsavelNome }}</td>
                  <td class="px-5 py-4 text-slate-500 max-w-[320px]">{{ mov.detalhe }}</td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="6" class="px-5 py-14 text-center">
                    <mat-icon class="text-4xl text-slate-300 w-10 h-10">manage_search</mat-icon>
                    <p class="text-sm font-bold text-slate-600 mt-2">Nenhuma movimentação encontrada</p>
                    <p class="text-xs text-slate-400 mt-1">Tente ajustar os filtros de período, pessoa, item ou horário.</p>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Mobile -->
        <div class="md:hidden divide-y divide-slate-100">
          @for (mov of historicoFiltrado(); track mov.id) {
            <article class="p-4 space-y-3">
              <div class="flex items-start justify-between gap-3">
                <div>
                  <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold {{ classeTipo(mov.tipo) }}">
                    <span class="w-1.5 h-1.5 rounded-full bg-current"></span>
                    {{ rotuloTipo(mov.tipo) }}
                  </span>
                  <h3 class="text-xs font-bold text-[#0E1A3A] mt-2">{{ mov.titulo }}</h3>
                </div>
                <div class="text-right shrink-0">
                  <strong class="block text-xs text-[#0E1A3A]">{{ formatarData(mov.dataHora) }}</strong>
                  <span class="text-[11px] text-slate-400">{{ formatarHora(mov.dataHora) }}</span>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-3 text-[11px]">
                <div>
                  <span class="block text-slate-400 mb-0.5">Pessoa</span>
                  <strong class="text-slate-700">{{ mov.pessoaNome }}</strong>
                </div>
                <div>
                  <span class="block text-slate-400 mb-0.5">Item</span>
                  <strong class="text-slate-700">{{ mov.itemNome }}</strong>
                </div>
                <div>
                  <span class="block text-slate-400 mb-0.5">Responsável</span>
                  <strong class="text-slate-700">{{ mov.responsavelNome }}</strong>
                </div>
                <div>
                  <span class="block text-slate-400 mb-0.5">Detalhes</span>
                  <strong class="text-slate-700 font-medium">{{ mov.detalhe }}</strong>
                </div>
              </div>
            </article>
          } @empty {
            <div class="px-5 py-14 text-center">
              <mat-icon class="text-4xl text-slate-300 w-10 h-10">manage_search</mat-icon>
              <p class="text-sm font-bold text-slate-600 mt-2">Nenhuma movimentação encontrada</p>
              <p class="text-xs text-slate-400 mt-1">Ajuste os filtros e tente novamente.</p>
            </div>
          }
        </div>
      </section>
    </div>
  `,
})
export class R18Historico {
  readonly store = inject(NexusStore);

  readonly dataInicial = signal(this.dataInicialPadrao());
  readonly dataFinal = signal(toDateInputValue(this.store.agora()));
  readonly tipoSelecionado = signal<TipoMovimentacao>('todos');
  readonly pessoaSelecionada = signal('todos');
  readonly itemSelecionado = signal('todos');
  readonly horaInicial = signal('');
  readonly horaFinal = signal('');

  readonly pessoas = computed(() =>
    [...this.store.usuarios()].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
  );

  readonly itens = computed(() =>
    [...this.store.itens()].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
  );

  readonly historico = computed<MovimentoHistorico[]>(() => {
    const usuarios = this.store.usuarios();
    const itens = this.store.itens();
    const usuario = (id?: string): Usuario | undefined => usuarios.find((u) => u.id === id);
    const item = (id?: string): Item | undefined => itens.find((i) => i.id === id);
    const eventos: MovimentoHistorico[] = [];

    for (const u of usuarios) {
      eventos.push({
        id: `cadastro-${u.id}`,
        dataHora: u.criadoEm,
        tipo: 'cadastro',
        titulo: 'Pessoa cadastrada',
        pessoaId: u.id,
        pessoaNome: u.nome,
        itemNome: '—',
        responsavelNome: '—',
        detalhe: `${this.rotuloPerfil(u.perfil)} • matrícula ${u.matricula}`,
      });
    }

    for (const sol of this.store.solicitacoes()) {
      const pessoa = usuario(sol.solicitanteId);
      const equipamento = item(sol.itemId);
      if (!pessoa || !equipamento) continue;

      eventos.push({
        id: `solicitacao-${sol.id}`,
        dataHora: sol.criadoEm,
        tipo: 'solicitacao',
        titulo: 'Solicitação criada',
        pessoaId: pessoa.id,
        pessoaNome: pessoa.nome,
        itemId: equipamento.id,
        itemNome: equipamento.nome,
        responsavelNome: '—',
        detalhe: `Devolução desejada: ${formatDateShort(sol.devolucaoDesejada)}`,
      });

      if (sol.avaliadoEm) {
        const responsavel = usuario(sol.avaliadoPor);
        const aprovada = sol.status !== 'recusada';
        eventos.push({
          id: `avaliacao-${sol.id}`,
          dataHora: sol.avaliadoEm,
          tipo: 'aprovacao',
          titulo: aprovada ? 'Solicitação aprovada' : 'Solicitação recusada',
          pessoaId: pessoa.id,
          pessoaNome: pessoa.nome,
          itemId: equipamento.id,
          itemNome: equipamento.nome,
          responsavelNome: responsavel?.nome || '—',
          detalhe: aprovada ? 'Pedido liberado para retirada.' : 'Pedido não aprovado.',
        });
      }
    }

    for (const emp of this.store.emprestimos()) {
      const pessoa = usuario(emp.usuarioId);
      const equipamento = item(emp.itemId);
      if (!pessoa || !equipamento) continue;

      const responsavel = usuario(emp.registradoPor);
      eventos.push({
        id: `retirada-${emp.id}`,
        dataHora: emp.retiradoEm,
        tipo: 'retirada',
        titulo: 'Retirada registrada',
        pessoaId: pessoa.id,
        pessoaNome: pessoa.nome,
        itemId: equipamento.id,
        itemNome: equipamento.nome,
        responsavelNome: responsavel?.nome || '—',
        detalhe: `Devolução prevista: ${formatDateShort(emp.devolucaoPrevista)}`,
      });

      if (emp.devolvidoEm) {
        eventos.push({
          id: `devolucao-${emp.id}`,
          dataHora: emp.devolvidoEm,
          tipo: 'devolucao',
          titulo: 'Devolução registrada',
          pessoaId: pessoa.id,
          pessoaNome: pessoa.nome,
          itemId: equipamento.id,
          itemNome: equipamento.nome,
          responsavelNome: '—',
          detalhe: emp.diasAtraso > 0 ? `Devolvido com ${emp.diasAtraso} dia(s) de atraso.` : 'Devolução realizada dentro do prazo.',
        });
      }
    }

    for (const ocorrencia of this.store.ocorrencias()) {
      const pessoa = usuario(ocorrencia.usuarioId);
      const equipamento = item(ocorrencia.itemId);
      if (!equipamento) continue;

      eventos.push({
        id: `ocorrencia-${ocorrencia.id}`,
        dataHora: ocorrencia.criadoEm,
        tipo: 'ocorrencia',
        titulo: 'Ocorrência registrada',
        pessoaId: pessoa?.id,
        pessoaNome: pessoa?.nome || '—',
        itemId: equipamento.id,
        itemNome: equipamento.nome,
        responsavelNome: '—',
        detalhe: ocorrencia.descricao,
      });
    }

    return eventos.sort((a, b) => parseDate(b.dataHora).getTime() - parseDate(a.dataHora).getTime());
  });

  readonly historicoFiltrado = computed(() => {
    const inicio = this.dataInicial() ? this.inicioDoDia(this.dataInicial()) : null;
    const fim = this.dataFinal() ? this.fimDoDia(this.dataFinal()) : null;
    const tipo = this.tipoSelecionado();
    const pessoaId = this.pessoaSelecionada();
    const itemId = this.itemSelecionado();
    const horaInicial = this.horaInicial();
    const horaFinal = this.horaFinal();

    return this.historico().filter((mov) => {
      const data = parseDate(mov.dataHora);
      const minutos = data.getHours() * 60 + data.getMinutes();

      if (inicio && data < inicio) return false;
      if (fim && data > fim) return false;
      if (tipo !== 'todos' && mov.tipo !== tipo) return false;
      if (pessoaId !== 'todos' && mov.pessoaId !== pessoaId) return false;
      if (itemId !== 'todos' && mov.itemId !== itemId) return false;

      if (horaInicial && minutos < this.horaParaMinutos(horaInicial)) return false;
      if (horaFinal && minutos > this.horaParaMinutos(horaFinal)) return false;

      return true;
    });
  });

  formatarData(data: string) {
    return formatDateShort(data);
  }

  formatarHora(data: string) {
    const d = parseDate(data);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }

  rotuloTipo(tipo: Exclude<TipoMovimentacao, 'todos'>) {
    const rotulos: Record<Exclude<TipoMovimentacao, 'todos'>, string> = {
      solicitacao: 'Solicitação',
      aprovacao: 'Aprovação',
      retirada: 'Retirada',
      devolucao: 'Devolução',
      ocorrencia: 'Ocorrência',
      cadastro: 'Cadastro',
    };
    return rotulos[tipo];
  }

  classeTipo(tipo: Exclude<TipoMovimentacao, 'todos'>) {
    const classes: Record<Exclude<TipoMovimentacao, 'todos'>, string> = {
      solicitacao: 'bg-amber-50 text-amber-700 border border-amber-200',
      aprovacao: 'bg-blue-50 text-blue-700 border border-blue-200',
      retirada: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
      devolucao: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      ocorrencia: 'bg-rose-50 text-rose-700 border border-rose-200',
      cadastro: 'bg-slate-100 text-slate-600 border border-slate-200',
    };
    return classes[tipo];
  }

  periodoTexto() {
    const inicio = this.dataInicial();
    const fim = this.dataFinal();
    if (!inicio && !fim) return 'Todo o período';
    if (inicio && fim) return `${formatDateShort(this.inicioDoDia(inicio))} – ${formatDateShort(this.fimDoDia(fim))}`;
    if (inicio) return `A partir de ${formatDateShort(this.inicioDoDia(inicio))}`;
    return `Até ${formatDateShort(this.fimDoDia(fim))}`;
  }

  limparFiltros() {
    this.dataInicial.set(this.dataInicialPadrao());
    this.dataFinal.set(toDateInputValue(this.store.agora()));
    this.tipoSelecionado.set('todos');
    this.pessoaSelecionada.set('todos');
    this.itemSelecionado.set('todos');
    this.horaInicial.set('');
    this.horaFinal.set('');
  }

  private dataInicialPadrao() {
    const data = this.store.agora();
    data.setDate(data.getDate() - 30);
    return toDateInputValue(data);
  }

  private inicioDoDia(valor: string) {
    const [ano, mes, dia] = valor.split('-').map(Number);
    return new Date(ano, mes - 1, dia, 0, 0, 0, 0);
  }

  private fimDoDia(valor: string) {
    const [ano, mes, dia] = valor.split('-').map(Number);
    return new Date(ano, mes - 1, dia, 23, 59, 59, 999);
  }

  private horaParaMinutos(valor: string) {
    const [hora, minuto] = valor.split(':').map(Number);
    return hora * 60 + minuto;
  }

  private rotuloPerfil(perfil: string) {
    const perfis: Record<string, string> = {
      aluno: 'Aluno',
      professor: 'Professor',
      responsavel: 'Responsável',
    };
    return perfis[perfil] || perfil;
  }
}
