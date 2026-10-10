import {ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {NexusStore} from '../store/nexus.store';
import {MatIconModule} from '@angular/material/icon';
import {addDays, formatDateShort, toDateInputValue} from '../lib/date-utils';
import {iconeCategoria, plural} from '../lib/categoria-utils';
import {ItemThumb} from '../components/item-thumb/item-thumb';

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
  imports: [RouterLink, MatIconModule, ItemThumb],
  templateUrl: './S3Solicitar.html',
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

  readonly plural = plural;
  readonly diasSemana = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

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
    return iconeCategoria(categoriaId);
  }
}
