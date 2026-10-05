import {ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {NexusStore} from '../store/nexus.store';
import {MatIconModule} from '@angular/material/icon';
import {addDays, formatDateShort, toDateInputValue} from '../lib/date-utils';

interface DiaCalendario {
  dataIso: string;
  numeroDia: number;
  mesmoMes: boolean;
  habilitado: boolean;
  selecionado: boolean;
  hoje: boolean;
}

@Component({
  selector: 'app-s3-solicitar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatIconModule],
  template: `
    <div class="space-y-6 font-['Sora',sans-serif] max-w-4xl">
      <!-- Título da Tela (Wireframe S3) -->
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-[#0E1A3A]">
          Solicitar empréstimo
        </h1>
        <p class="text-xs text-slate-500 mt-1">
          Defina o prazo de devolução de acordo com as regras da categoria
        </p>
      </div>

      @if (item(); as i) {
        @let cat = categoria();

        @if (mensagemErro()) {
          <div role="alert" class="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
            <mat-icon class="text-rose-600 shrink-0">error</mat-icon>
            <span>{{ mensagemErro() }}</span>
          </div>
        }

        <!-- Resumo do Item (Wireframe S3) -->
        <div class="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center gap-4">
          <!-- Thumbnail / Miniatura -->
          <div class="w-16 h-16 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-[#0E1A3A] shrink-0">
            <mat-icon class="text-2xl">{{ getIconeCategoria(i.categoriaId) }}</mat-icon>
          </div>

          <!-- Dados do Item -->
          <div class="flex-1 min-w-0">
            <h2 class="font-bold text-base text-[#0E1A3A] truncate">
              {{ i.nome }}
            </h2>
            <div class="flex items-center gap-2 text-xs text-slate-500 mt-1">
              <span>{{ cat?.nome || 'Geral' }}</span>
              <span>·</span>
              <span>prazo máx. {{ cat?.prazoMaxDias }} {{ cat?.prazoMaxDias === 1 ? 'dia' : 'dias' }}</span>
            </div>
          </div>
        </div>

        <!-- Seção: "Quando você vai devolver?" (Wireframe S3) -->
        <div class="space-y-3">
          <h3 class="text-base font-bold text-[#0E1A3A]">
            Quando você vai devolver?
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            <!-- Calendário Interativo Estilizado (Wireframe S3) -->
            <div class="md:col-span-6 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5">
              <!-- Cabeçalho do Mês -->
              <div class="flex items-center justify-between mb-4">
                <button
                  type="button"
                  (click)="mesAnterior()"
                  class="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                  [disabled]="!podeVoltarMes()"
                  [class.opacity-30]="!podeVoltarMes()"
                >
                  <mat-icon class="text-sm w-4 h-4 flex items-center justify-center">chevron_left</mat-icon>
                </button>

                <span class="text-xs font-bold text-slate-800 capitalize">
                  {{ nomeMesAno() }}
                </span>

                <button
                  type="button"
                  (click)="proximoMes()"
                  class="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <mat-icon class="text-sm w-4 h-4 flex items-center justify-center">chevron_right</mat-icon>
                </button>
              </div>

              <!-- Cabeçalho dos Dias da Semana -->
              <div class="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 mb-2">
                <span>D</span>
                <span>S</span>
                <span>T</span>
                <span>Q</span>
                <span>Q</span>
                <span>S</span>
                <span>S</span>
              </div>

              <!-- Grade de Dias -->
              <div class="grid grid-cols-7 gap-1 text-center">
                @for (dia of diasDoCalendario(); track dia.dataIso) {
                  @if (dia.habilitado) {
                    <!-- Dia Selecionável -->
                    <button
                      type="button"
                      (click)="selecionarData(dia.dataIso)"
                      class="h-9 w-9 mx-auto rounded-xl flex items-center justify-center text-xs font-semibold transition-all cursor-pointer"
                      [class.bg-[#F2B705]]="dia.selecionado"
                      [class.text-[#0E1A3A]]="dia.selecionado"
                      [class.font-bold]="dia.selecionado"
                      [class.shadow-2xs]="dia.selecionado"
                      [class.ring-2]="dia.selecionado"
                      [class.ring-[#0E1A3A]]="dia.selecionado"
                      [class.hover:bg-blue-50]="!dia.selecionado"
                      [class.text-slate-800]="!dia.selecionado"
                    >
                      {{ dia.numeroDia }}
                    </button>
                  } @else {
                    <!-- Dia Desabilitado (Passado ou após prazoMaxDias - RN02) -->
                    <div
                      class="h-9 w-9 mx-auto flex items-center justify-center text-xs font-medium text-slate-300 cursor-not-allowed select-none"
                    >
                      {{ dia.numeroDia }}
                    </div>
                  }
                }
              </div>

              <!-- Legenda explicativa sob o calendário -->
              <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span class="flex items-center gap-1.5">
                  <span class="w-3 h-3 rounded bg-[#F2B705] border border-[#0E1A3A]"></span>
                  Data selecionada: <strong class="text-slate-800">{{ dataDevolucaoFormatada() }}</strong>
                </span>
                <span class="text-slate-400">RN02</span>
              </div>
            </div>

            <!-- Coluna Direita: Caixa de Aviso & Ações (Wireframe S3) -->
            <div class="md:col-span-6 space-y-4">
              <!-- Caixa Pontilhada de Aviso (Wireframe S3: RN04) -->
              <div class="p-4 sm:p-5 rounded-2xl border-2 border-dashed border-slate-300 bg-white/70 space-y-2">
                <div class="flex items-center gap-2 text-xs font-bold text-[#0E1A3A]">
                  <mat-icon class="text-base text-[#2F6BFF]">warning_amber</mat-icon>
                  <span>Atenção: Retirada no mesmo dia</span>
                </div>
                <p class="text-xs text-slate-600 leading-relaxed">
                  Se aprovado, retire o item no <strong>MESMO DIA</strong>. Senão o pedido expira automaticamente ao fim do expediente e o equipamento retorna para o acervo.
                </p>
              </div>

              <!-- Informações do Pedido -->
              <div class="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1.5">
                <div class="flex justify-between">
                  <span class="text-slate-500">Data do pedido:</span>
                  <span class="font-medium text-slate-800">{{ dataHojeFormatada() }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-500">Prazo máximo desta categoria:</span>
                  <span class="font-medium text-slate-800">{{ cat?.prazoMaxDias }} dia(s)</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-500">Devolver até:</span>
                  <strong class="font-bold text-[#2F6BFF]">{{ dataDevolucaoFormatada() }}</strong>
                </div>
              </div>

              <!-- Botões de Ação (Wireframe S3) -->
              <div class="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <!-- Enviar Pedido (Leva a S4 aba Pendentes) -->
                <button
                  type="button"
                  (click)="submeterPedido()"
                  class="w-full sm:flex-1 py-3 px-4 rounded-xl bg-[#2F6BFF] hover:bg-blue-600 active:bg-blue-700 text-white font-semibold text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <mat-icon class="text-base w-4 h-4 flex items-center justify-center">send</mat-icon>
                  <span>Enviar pedido</span>
                </button>

                <!-- Cancelar (Volta a S2) -->
                <a
                  [routerLink]="['/item', i.id]"
                  class="w-full sm:w-auto py-3 px-5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-colors flex items-center justify-center cursor-pointer text-center"
                >
                  Cancelar
                </a>
              </div>
            </div>
          </div>
        </div>
      } @else {
        <div class="py-16 text-center bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
          <mat-icon class="text-4xl text-slate-400">help_outline</mat-icon>
          <h2 class="text-lg font-bold text-slate-800">Equipamento não encontrado</h2>
          <a
            routerLink="/catalogo"
            class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2F6BFF] text-white text-xs font-semibold"
          >
            Voltar ao Catálogo
          </a>
        </div>
      }
    </div>
  `,
})
export class S3Solicitar {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly store = inject(NexusStore);

  readonly itemId = computed(() => this.route.snapshot.paramMap.get('id') || '');

  readonly item = computed(() => {
    const id = this.itemId();
    return this.store.itens().find((i) => i.id === id) || null;
  });

  readonly categoria = computed(() => {
    const it = this.item();
    if (!it) return null;
    return this.store.categorias().find((c) => c.id === it.categoriaId) || null;
  });

  readonly mensagemErro = signal<string | null>(null);

  // Controle de Mês Exibido no Calendário
  readonly dataReferencia = signal<Date>(new Date());
  readonly dataDevolucaoSelecionada = signal<string>('');

  constructor() {
    // Inicializa a data de referência no relógio do sistema
    const agoraDate = this.store.agora();
    this.dataReferencia.set(new Date(agoraDate.getFullYear(), agoraDate.getMonth(), 1));

    // Inicializa data de devolução padrão no prazo máximo da categoria
    const it = this.item();
    const cat = it ? this.store.categorias().find((c) => c.id === it.categoriaId) : null;
    const dias = cat ? cat.prazoMaxDias : 1;
    const defaultDev = addDays(agoraDate, dias);
    this.dataDevolucaoSelecionada.set(toDateInputValue(defaultDev));
  }

  readonly dataHojeFormatada = computed(() => {
    return formatDateShort(this.store.agora().toISOString());
  });

  readonly dataDevolucaoFormatada = computed(() => {
    const d = this.dataDevolucaoSelecionada();
    return d ? formatDateShort(d) : '—';
  });

  readonly nomeMesAno = computed(() => {
    const ref = this.dataReferencia();
    return ref.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  });

  podeVoltarMes(): boolean {
    const ref = this.dataReferencia();
    const agora = this.store.agora();
    // Não permite retroceder antes do mês atual do relógio
    return (
      ref.getFullYear() > agora.getFullYear() ||
      (ref.getFullYear() === agora.getFullYear() && ref.getMonth() > agora.getMonth())
    );
  }

  mesAnterior() {
    if (!this.podeVoltarMes()) return;
    const ref = this.dataReferencia();
    this.dataReferencia.set(new Date(ref.getFullYear(), ref.getMonth() - 1, 1));
  }

  proximoMes() {
    const ref = this.dataReferencia();
    this.dataReferencia.set(new Date(ref.getFullYear(), ref.getMonth() + 1, 1));
  }

  selecionarData(dataIso: string) {
    this.dataDevolucaoSelecionada.set(dataIso);
    this.mensagemErro.set(null);
  }

  /**
   * Constrói a matriz do calendário para o mês de dataReferencia.
   * Aplica a RN02:
   * - Datas passadas (< hoje) e datas > (hoje + prazoMaxDias) ficam DESABILITADAS (cinza).
   */
  readonly diasDoCalendario = computed<DiaCalendario[]>(() => {
    const ref = this.dataReferencia();
    const agora = this.store.agora();
    const cat = this.categoria();
    const prazoDias = cat ? cat.prazoMaxDias : 1;

    const hojeZero = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate(), 0, 0, 0);
    const maxZero = addDays(hojeZero, prazoDias);

    const ano = ref.getFullYear();
    const mes = ref.getMonth();

    const primeiroDiaSemana = new Date(ano, mes, 1).getDay(); // 0 = Domingo
    const totalDiasNoMes = new Date(ano, mes + 1, 0).getDate();

    const dias: DiaCalendario[] = [];

    // Dias do mês anterior para preencher a primeira semana
    const mesAnteriorTotal = new Date(ano, mes, 0).getDate();
    for (let i = primeiroDiaSemana - 1; i >= 0; i--) {
      const num = mesAnteriorTotal - i;
      const data = new Date(ano, mes - 1, num);
      const dataIso = toDateInputValue(data);
      dias.push({
        dataIso,
        numeroDia: num,
        mesmoMes: false,
        habilitado: false,
        selecionado: false,
        hoje: false,
      });
    }

    // Dias do mês atual
    const selecionadaIso = this.dataDevolucaoSelecionada();
    for (let num = 1; num <= totalDiasNoMes; num++) {
      const data = new Date(ano, mes, num);
      const dataIso = toDateInputValue(data);

      const ehPassado = data.getTime() < hojeZero.getTime();
      const excedePrazo = data.getTime() > maxZero.getTime();
      const habilitado = !ehPassado && !excedePrazo;

      const selecionado = dataIso === selecionadaIso;
      const hoje = data.getTime() === hojeZero.getTime();

      dias.push({
        dataIso,
        numeroDia: num,
        mesmoMes: true,
        habilitado,
        selecionado,
        hoje,
      });
    }

    // Preenche até múltiplo de 7 (fim da última semana)
    const restante = 7 - (dias.length % 7);
    if (restante < 7) {
      for (let num = 1; num <= restante; num++) {
        const data = new Date(ano, mes + 1, num);
        const dataIso = toDateInputValue(data);
        dias.push({
          dataIso,
          numeroDia: num,
          mesmoMes: false,
          habilitado: false,
          selecionado: false,
          hoje: false,
        });
      }
    }

    return dias;
  });

  submeterPedido() {
    const it = this.item();
    const user = this.store.usuarioLogado();
    const devolucao = this.dataDevolucaoSelecionada();

    if (!it) {
      this.mensagemErro.set('Item não localizado.');
      return;
    }

    if (!user) {
      this.mensagemErro.set('Você precisa estar logado para enviar um pedido.');
      return;
    }

    if (!devolucao) {
      this.mensagemErro.set('Por favor, selecione a data de devolução no calendário.');
      return;
    }

    const resultado = this.store.solicitarEmprestimo(it.id, user.id, devolucao);

    if (resultado.sucesso) {
      // Redireciona para /meus-emprestimos com a aba 'pendentes' ativa e mensagem de sucesso
      this.router.navigate(['/meus-emprestimos'], {
        queryParams: { aba: 'pendentes' },
        state: { sucesso: 'Solicitação enviada com sucesso! Aguarde a aprovação do responsável.' },
      });
    } else {
      this.mensagemErro.set(resultado.mensagem);
    }
  }

  getIconeCategoria(categoriaId: string): string {
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
