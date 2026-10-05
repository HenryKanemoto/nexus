import {ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {NexusStore} from '../store/nexus.store';
import {MatIconModule} from '@angular/material/icon';
import {Item} from '../types/models';
import {
  differenceInHours,
  formatDateShort,
  parseDate,
} from '../lib/date-utils';

type AbaEmprestimos = 'pendentes' | 'ativos' | 'historico';

interface ItemHistorico {
  tipo: 'emprestimo' | 'solicitacao';
  id: string;
  itemId: string;
  item?: Item;
  situacaoFinal: 'devolvido' | 'devolvido_defeito' | 'recusado' | 'expirado';
  rotuloSituacao: string;
  dataEvento: string;
  detalhe?: string;
}

@Component({
  selector: 'app-s4-meus-emprestimos',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatIconModule],
  template: `
    <div class="space-y-6 font-['Sora',sans-serif] max-w-5xl">
      <!-- Mensagem de Sucesso (vindo de S3 Solicitar ou Ações) -->
      @if (mensagemSucesso()) {
        <div
          role="status"
          class="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between gap-3 shadow-2xs animate-fadeIn"
        >
          <div class="flex items-center gap-2.5">
            <mat-icon class="text-emerald-600 shrink-0">check_circle</mat-icon>
            <span class="font-medium leading-relaxed">{{ mensagemSucesso() }}</span>
          </div>
          <button
            type="button"
            (click)="mensagemSucesso.set(null)"
            class="text-emerald-600 hover:text-emerald-800 cursor-pointer p-1"
          >
            <mat-icon class="text-base w-4 h-4 flex items-center justify-center">close</mat-icon>
          </button>
        </div>
      }

      <!-- Título da Tela (Wireframe S4) -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-[#0E1A3A]">
            Meus empréstimos
          </h1>
          <p class="text-xs text-slate-500 mt-1">
            Gerencie seus pedidos em análise, empréstimos em andamento e histórico
          </p>
        </div>

        <a
          routerLink="/catalogo"
          class="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#2F6BFF] hover:bg-blue-600 text-white text-xs font-semibold transition-colors shadow-2xs cursor-pointer self-start sm:self-auto"
        >
          <mat-icon class="text-sm w-4 h-4 flex items-center justify-center">add_circle</mat-icon>
          <span>Novo Pedido no Catálogo</span>
        </a>
      </div>

      <!-- Abas de Navegação (Wireframe S4) -->
      <div class="flex items-center gap-2 border-b border-slate-200/90 pb-px">
        <button
          type="button"
          (click)="mudarAba('pendentes')"
          class="py-2.5 px-4 rounded-t-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border-b-2 -mb-px"
          [class.border-[#2F6BFF]]="abaAtiva() === 'pendentes'"
          [class.text-[#2F6BFF]]="abaAtiva() === 'pendentes'"
          [class.bg-white]="abaAtiva() === 'pendentes'"
          [class.border-transparent]="abaAtiva() !== 'pendentes'"
          [class.text-slate-600]="abaAtiva() !== 'pendentes'"
          [class.hover:text-slate-900]="abaAtiva() !== 'pendentes'"
        >
          <span>Pendentes</span>
          <span
            class="px-2 py-0.5 rounded-full text-[11px] font-bold"
            [class.bg-blue-100]="abaAtiva() === 'pendentes'"
            [class.text-blue-700]="abaAtiva() === 'pendentes'"
            [class.bg-slate-100]="abaAtiva() !== 'pendentes'"
            [class.text-slate-600]="abaAtiva() !== 'pendentes'"
          >
            {{ totalPendentes() }}
          </span>
        </button>

        <button
          type="button"
          (click)="mudarAba('ativos')"
          class="py-2.5 px-4 rounded-t-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border-b-2 -mb-px"
          [class.border-[#2F6BFF]]="abaAtiva() === 'ativos'"
          [class.text-[#2F6BFF]]="abaAtiva() === 'ativos'"
          [class.bg-white]="abaAtiva() === 'ativos'"
          [class.border-transparent]="abaAtiva() !== 'ativos'"
          [class.text-slate-600]="abaAtiva() !== 'ativos'"
          [class.hover:text-slate-900]="abaAtiva() !== 'ativos'"
        >
          <span>Ativos</span>
          <span
            class="px-2 py-0.5 rounded-full text-[11px] font-bold"
            [class.bg-blue-100]="abaAtiva() === 'ativos'"
            [class.text-blue-700]="abaAtiva() === 'ativos'"
            [class.bg-slate-100]="abaAtiva() !== 'ativos'"
            [class.text-slate-600]="abaAtiva() !== 'ativos'"
          >
            {{ totalAtivos() }}
          </span>
        </button>

        <button
          type="button"
          (click)="mudarAba('historico')"
          class="py-2.5 px-4 rounded-t-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border-b-2 -mb-px"
          [class.border-[#2F6BFF]]="abaAtiva() === 'historico'"
          [class.text-[#2F6BFF]]="abaAtiva() === 'historico'"
          [class.bg-white]="abaAtiva() === 'historico'"
          [class.border-transparent]="abaAtiva() !== 'historico'"
          [class.text-slate-600]="abaAtiva() !== 'historico'"
          [class.hover:text-slate-900]="abaAtiva() !== 'historico'"
        >
          <span>Histórico</span>
          <span class="text-[11px] font-normal text-slate-400">
            ({{ listaHistorico().length }})
          </span>
        </button>
      </div>

      <!-- CONTEÚDO DAS ABAS (Wireframe S4) -->

      <!-- 1. ABA PENDENTES (Pedidos aguardando análise e aprovados aguardando retirada) -->
      @if (abaAtiva() === 'pendentes') {
        <div class="space-y-4">
          <!-- A) Pedidos Aprovados Aguardando Retirada HOJE (RN04) -->
          @for (solic of pedidosAprovados(); track solic.id) {
            @let item = getItem(solic.itemId);
            <div class="p-5 rounded-2xl bg-white border border-amber-300 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <!-- Esquerda: Thumbnail e Informações -->
              <div class="flex items-start sm:items-center gap-4">
                <div class="w-14 h-14 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
                  <mat-icon class="text-2xl">{{ getIconeCategoria(item?.categoriaId) }}</mat-icon>
                </div>
                <div>
                  <h3 class="font-bold text-sm text-[#0E1A3A]">
                    {{ item?.nome }}
                  </h3>
                  <div class="flex flex-wrap items-center gap-2 mt-1">
                    <span class="px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold text-xs border border-amber-200/80">
                      Aprovado — retire HOJE
                    </span>
                    <span class="text-xs text-slate-500">
                      aprovado {{ formatarHora(solic.avaliadoEm || solic.criadoEm) }}
                    </span>
                  </div>
                  <p class="text-[11px] text-amber-700 font-medium mt-1">
                    Aviso: retire no setor de materiais hoje antes que o pedido expire.
                  </p>
                </div>
              </div>

              <!-- Direita: Destino / Retirada -->
              <div class="text-right sm:text-right shrink-0">
                <span class="inline-flex items-center gap-1 text-xs font-semibold text-amber-800 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
                  <mat-icon class="text-xs w-3.5 h-3.5 flex items-center justify-center">store</mat-icon>
                  Retirar com QR do Item
                </span>
              </div>
            </div>
          }

          <!-- B) Pedidos Aguardando Análise (com Botão Lembrar Responsável RN10) -->
          @for (solic of pedidosAguardandoAnalise(); track solic.id) {
            @let item = getItem(solic.itemId);
            @let podeLembrar = store.podeEnviarLembrete(solic);
            @let tempoDecorrido = getTempoDecorrido(solic.criadoEm);

            <div class="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <!-- Esquerda: Thumbnail e Informações -->
              <div class="flex items-start sm:items-center gap-4">
                <div class="w-14 h-14 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-[#0E1A3A] shrink-0">
                  <mat-icon class="text-2xl">{{ getIconeCategoria(item?.categoriaId) }}</mat-icon>
                </div>
                <div>
                  <h3 class="font-bold text-sm text-[#0E1A3A]">
                    {{ item?.nome }}
                  </h3>
                  <div class="flex flex-wrap items-center gap-2 mt-1">
                    <span class="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200">
                      Aguardando análise
                    </span>
                    <span class="text-xs text-slate-500">
                      {{ tempoDecorrido }}
                    </span>
                  </div>
                  <div class="text-[11px] text-slate-400 mt-1">
                    Devolução pretendida: {{ formatarData(solic.devolucaoDesejada) }}
                  </div>
                </div>
              </div>

              <!-- Direita: Botão "Lembrar responsável" (Wireframe S4 / RN10) -->
              <div class="flex items-center gap-2 shrink-0">
                @if (solic.lembreteEnviadoEm) {
                  <span class="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 text-xs font-medium flex items-center gap-1.5">
                    <mat-icon class="text-xs w-3.5 h-3.5 flex items-center justify-center text-emerald-600">done</mat-icon>
                    <span>Lembrete já enviado</span>
                  </span>
                } @else if (podeLembrar) {
                  <!-- Botão ativo após 2h sem análise (RN10) -->
                  <button
                    type="button"
                    (click)="lembrarResponsavel(solic.id)"
                    class="px-4 py-2 rounded-xl border border-[#2F6BFF] bg-blue-50/60 hover:bg-[#2F6BFF] text-[#2F6BFF] hover:text-white text-xs font-semibold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <mat-icon class="text-xs w-3.5 h-3.5 flex items-center justify-center">notifications_active</mat-icon>
                    <span>Lembrar responsável</span>
                  </button>
                } @else {
                  <span
                    class="text-[11px] text-slate-400 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200"
                    title="O botão ficará disponível após 2 horas no relógio virtual"
                  >
                    Lembrete em {{ getHorasRestantesParaLembrete(solic.criadoEm) }}
                  </span>
                }
              </div>
            </div>
          } @empty {
            @if (pedidosAprovados().length === 0) {
              <div class="py-16 px-4 rounded-2xl border border-dashed border-slate-300 bg-white text-center space-y-2">
                <mat-icon class="text-3xl text-slate-400">inventory_2</mat-icon>
                <h3 class="text-sm font-semibold text-slate-700">
                  Nenhum pedido pendente
                </h3>
                <p class="text-xs text-slate-500">
                  Você não tem solicitações em análise nem retiradas pendentes para hoje.
                </p>
              </div>
            }
          }
        </div>
      }

      <!-- 2. ABA ATIVOS (Empréstimos em andamento com retirada realizada) -->
      @if (abaAtiva() === 'ativos') {
        <div class="space-y-4">
          @for (emp of listaEmprestimosAtivos(); track emp.id) {
            @let item = getItem(emp.itemId);
            @let estaAtrasado = emp.diasAtraso > 0;
            @let diasRestantes = getDiasRestantes(emp.devolucaoPrevista);

            <div
              class="p-5 rounded-2xl bg-white border shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
              [class.border-rose-300]="estaAtrasado"
              [class.bg-rose-50/30]="estaAtrasado"
              [class.border-slate-200/90]="!estaAtrasado"
            >
              <!-- Esquerda: Thumbnail e Informações -->
              <div class="flex items-start sm:items-center gap-4">
                <div
                  class="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 border"
                  [class.bg-rose-100]="estaAtrasado"
                  [class.text-rose-700]="estaAtrasado"
                  [class.border-rose-200]="estaAtrasado"
                  [class.bg-blue-50]="!estaAtrasado"
                  [class.text-[#2F6BFF]]="!estaAtrasado"
                  [class.border-blue-100]="!estaAtrasado"
                >
                  <mat-icon class="text-2xl">{{ getIconeCategoria(item?.categoriaId) }}</mat-icon>
                </div>

                <div>
                  <div class="flex items-center gap-2">
                    <h3 class="font-bold text-sm text-[#0E1A3A]">
                      {{ item?.nome }}
                    </h3>
                    <span class="font-mono text-[10px] text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                      {{ item?.patrimonio }}
                    </span>
                  </div>

                  <div class="flex flex-wrap items-center gap-3 text-xs text-slate-600 mt-1.5">
                    <span>Retirado em: <strong class="text-slate-800">{{ formatarData(emp.retiradoEm) }}</strong></span>
                    <span>·</span>
                    <span>Devolver até: <strong class="text-slate-800">{{ formatarData(emp.devolucaoPrevista) }}</strong></span>
                  </div>

                  <div class="text-[11px] text-slate-500 mt-1">
                    Prazo: {{ diasRestantes }}
                  </div>
                </div>
              </div>

              <!-- Direita: Selo de Situação (Wireframe S4: Selo vermelho ATRASADO quando aplicável) -->
              <div class="shrink-0 flex items-center gap-2">
                @if (estaAtrasado) {
                  <!-- Selo Vermelho ATRASADO -->
                  <div class="px-3.5 py-1.5 rounded-xl bg-rose-600 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-xs animate-pulse">
                    <mat-icon class="text-sm w-4 h-4 flex items-center justify-center">warning</mat-icon>
                    <span>ATRASADO ({{ emp.diasAtraso }} {{ emp.diasAtraso === 1 ? 'dia' : 'dias' }})</span>
                  </div>
                } @else {
                  <span class="px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 font-semibold text-xs flex items-center gap-1.5">
                    <mat-icon class="text-xs w-3.5 h-3.5 flex items-center justify-center">sync</mat-icon>
                    <span>Em empréstimo</span>
                  </span>
                }
              </div>
            </div>
          } @empty {
            <div class="py-16 px-4 rounded-2xl border border-dashed border-slate-300 bg-white text-center space-y-2">
              <mat-icon class="text-3xl text-slate-400">check_circle_outline</mat-icon>
              <h3 class="text-sm font-semibold text-slate-700">
                Nenhum empréstimo ativo no momento
              </h3>
              <p class="text-xs text-slate-500">
                Você não possui nenhum material ou equipamento em mãos atualmente.
              </p>
            </div>
          }
        </div>
      }

      <!-- 3. ABA HISTÓRICO (Pedidos e empréstimos encerrados com situação final) -->
      @if (abaAtiva() === 'historico') {
        <div class="space-y-3">
          @for (hist of listaHistorico(); track hist.id) {
            <div class="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 shrink-0">
                  <mat-icon class="text-lg">{{ getIconeCategoria(hist.item?.categoriaId) }}</mat-icon>
                </div>
                <div>
                  <h4 class="font-bold text-sm text-[#0E1A3A]">
                    {{ hist.item?.nome || 'Equipamento' }}
                  </h4>
                  <div class="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                    <span class="font-mono">{{ hist.item?.patrimonio }}</span>
                    <span>·</span>
                    <span>Data: {{ formatarData(hist.dataEvento) }}</span>
                    @if (hist.detalhe) {
                      <span>·</span>
                      <span class="text-slate-600 italic">{{ hist.detalhe }}</span>
                    }
                  </div>
                </div>
              </div>

              <!-- Selo de Situação Final (Wireframe S4) -->
              <div class="shrink-0">
                @switch (hist.situacaoFinal) {
                  @case ('devolvido') {
                    <span class="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold text-xs flex items-center gap-1">
                      <mat-icon class="text-xs w-3.5 h-3.5 flex items-center justify-center">done_all</mat-icon>
                      Devolvido
                    </span>
                  }
                  @case ('devolvido_defeito') {
                    <span class="px-2.5 py-1 rounded-lg bg-purple-50 border border-purple-200 text-purple-700 font-semibold text-xs flex items-center gap-1">
                      <mat-icon class="text-xs w-3.5 h-3.5 flex items-center justify-center">build</mat-icon>
                      Devolvido com defeito
                    </span>
                  }
                  @case ('recusado') {
                    <span class="px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-semibold text-xs flex items-center gap-1">
                      <mat-icon class="text-xs w-3.5 h-3.5 flex items-center justify-center">cancel</mat-icon>
                      Recusado
                    </span>
                  }
                  @case ('expirado') {
                    <span class="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 font-semibold text-xs flex items-center gap-1">
                      <mat-icon class="text-xs w-3.5 h-3.5 flex items-center justify-center">timer_off</mat-icon>
                      Expirado
                    </span>
                  }
                }
              </div>
            </div>
          } @empty {
            <div class="py-16 px-4 rounded-2xl border border-dashed border-slate-300 bg-white text-center space-y-2">
              <mat-icon class="text-3xl text-slate-400">history</mat-icon>
              <h3 class="text-sm font-semibold text-slate-700">
                Nenhum registro no histórico
              </h3>
              <p class="text-xs text-slate-500">
                Você ainda não possui empréstimos devolvidos ou solicitações concluídas.
              </p>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class S4MeusEmprestimos {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly store = inject(NexusStore);

  readonly abaAtiva = signal<AbaEmprestimos>('pendentes');
  readonly mensagemSucesso = signal<string | null>(null);

  constructor() {
    // Ler aba da query string (?aba=pendentes | ativos | historico)
    this.route.queryParamMap.subscribe((params) => {
      const aba = params.get('aba');
      if (aba === 'ativos' || aba === 'historico' || aba === 'pendentes') {
        this.abaAtiva.set(aba);
      }
    });

    // Ler mensagem de sucesso enviada via navigation state
    const nav = this.router.getCurrentNavigation();
    if (nav?.extras?.state && (nav.extras.state as { sucesso?: string }).sucesso) {
      this.mensagemSucesso.set((nav.extras.state as { sucesso: string }).sucesso);
    } else if (typeof history !== 'undefined' && history.state && history.state.sucesso) {
      this.mensagemSucesso.set(history.state.sucesso);
    }
  }

  readonly usuario = computed(() => this.store.usuarioLogado());

  mudarAba(aba: AbaEmprestimos) {
    this.abaAtiva.set(aba);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { aba },
      queryParamsHandling: 'merge',
    });
  }

  // 1. Pedidos Aprovados (Aguardando retirada hoje - RN04)
  readonly pedidosAprovados = computed(() => {
    const u = this.usuario();
    if (!u) return [];
    return this.store
      .solicitacoes()
      .filter((s) => s.solicitanteId === u.id && s.status === 'aprovada');
  });

  // 2. Pedidos Aguardando Análise
  readonly pedidosAguardandoAnalise = computed(() => {
    const u = this.usuario();
    if (!u) return [];
    return this.store
      .solicitacoes()
      .filter((s) => s.solicitanteId === u.id && s.status === 'pendente');
  });

  readonly totalPendentes = computed(() => {
    return this.pedidosAprovados().length + this.pedidosAguardandoAnalise().length;
  });

  // 3. Empréstimos Ativos
  readonly listaEmprestimosAtivos = computed(() => {
    const u = this.usuario();
    if (!u) return [];
    return this.store
      .emprestimos()
      .filter((e) => e.usuarioId === u.id && !e.devolvidoEm);
  });

  readonly totalAtivos = computed(() => this.listaEmprestimosAtivos().length);

  // 4. Histórico Encerrado
  readonly listaHistorico = computed<ItemHistorico[]>(() => {
    const u = this.usuario();
    if (!u) return [];

    const lista: ItemHistorico[] = [];

    // Empréstimos devolvidos
    const dev = this.store
      .emprestimos()
      .filter((e) => e.usuarioId === u.id && !!e.devolvidoEm);

    dev.forEach((emp) => {
      const item = this.getItem(emp.itemId);
      const temOcorrencia = this.store
        .ocorrencias()
        .some((o) => o.emprestimoId === emp.id || (o.itemId === emp.itemId && o.usuarioId === u.id));

      lista.push({
        tipo: 'emprestimo',
        id: emp.id,
        itemId: emp.itemId,
        item,
        situacaoFinal: temOcorrencia ? 'devolvido_defeito' : 'devolvido',
        rotuloSituacao: temOcorrencia ? 'Devolvido com defeito' : 'Devolvido',
        dataEvento: emp.devolvidoEm || emp.retiradoEm,
        detalhe: emp.diasAtraso > 0 ? `Devolvido com ${emp.diasAtraso} dia(s) de atraso` : undefined,
      });
    });

    // Solicitações recusadas ou expiradas
    const solicEncerradas = this.store
      .solicitacoes()
      .filter((s) => s.solicitanteId === u.id && (s.status === 'recusada' || s.status === 'expirada'));

    solicEncerradas.forEach((sol) => {
      const item = this.getItem(sol.itemId);
      lista.push({
        tipo: 'solicitacao',
        id: sol.id,
        itemId: sol.itemId,
        item,
        situacaoFinal: sol.status === 'recusada' ? 'recusado' : 'expirado',
        rotuloSituacao: sol.status === 'recusada' ? 'Recusado' : 'Expirado',
        dataEvento: sol.avaliadoEm || sol.criadoEm,
        detalhe: sol.status === 'expirada' ? 'Não retirado no dia da aprovação' : undefined,
      });
    });

    // Ordenar pelo evento mais recente primeiro
    return lista.sort((a, b) => new Date(b.dataEvento).getTime() - new Date(a.dataEvento).getTime());
  });

  getItem(itemId?: string) {
    if (!itemId) return undefined;
    return this.store.itens().find((i) => i.id === itemId);
  }

  formatarData(iso?: string) {
    if (!iso) return '—';
    return formatDateShort(iso);
  }

  formatarHora(iso?: string) {
    if (!iso) return '—';
    const d = parseDate(iso);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  }

  getTempoDecorrido(criadoEm: string): string {
    const agora = this.store.agora();
    const criado = parseDate(criadoEm);
    const diffH = Math.floor(differenceInHours(agora, criado));
    if (diffH <= 0) {
      const diffMin = Math.max(1, Math.floor((agora.getTime() - criado.getTime()) / (1000 * 60)));
      return `pedido há ${diffMin} min`;
    }
    return `pedido há ${diffH} h`;
  }

  getHorasRestantesParaLembrete(criadoEm: string): string {
    const agora = this.store.agora();
    const criado = parseDate(criadoEm);
    const diffH = differenceInHours(agora, criado);
    const rest = 2 - diffH;
    if (rest <= 0) return 'agora';
    const minutos = Math.ceil(rest * 60);
    if (minutos < 60) return `${minutos} min`;
    return `${Math.ceil(rest)} h`;
  }

  getDiasRestantes(devolucaoPrevista: string): string {
    const agora = this.store.agora();
    const devDate = parseDate(devolucaoPrevista);
    const diffMs = devDate.getTime() - agora.getTime();
    const diffDias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDias < 0) {
      return `Venceu há ${Math.abs(diffDias)} dia(s)`;
    }
    if (diffDias === 0) {
      return 'Vence hoje!';
    }
    return `${diffDias} dia(s) restante(s)`;
  }

  lembrarResponsavel(solicitacaoId: string) {
    const res = this.store.enviarLembrete(solicitacaoId);
    if (res.sucesso) {
      this.mensagemSucesso.set('Lembrete enviado ao responsável com sucesso!');
    }
  }

  getIconeCategoria(categoriaId?: string): string {
    switch (categoriaId) {
      case 'cat-projetores':
        return 'videocam';
      case 'cat-notebooks':
        return 'laptop_chromebook';
      case 'cat-eletronica':
        return 'developer_board';
      case 'cat-ferramentas':
        return 'handyman';
      case 'cat-laboratorio':
        return 'biotech';
      default:
        return 'inventory_2';
    }
  }
}
