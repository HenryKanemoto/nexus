import {HttpErrorResponse} from '@angular/common/http';
import {Injectable, computed, inject, signal} from '@angular/core';
import {Observable} from 'rxjs';
import {addHours, parseDate} from '../lib/date-utils';
import {ItensApi} from '../services/itens-api.service';
import {Categoria, Item, PoliticaAtraso, Solicitacao} from '../types/models';
import {getInitialDemoState} from './demo-data';
import {NexusState, Transicao} from './estado';
import {carregarEstado, salvarEstado} from './persistencia';
import * as acervo from './regras/acervo';
import * as contas from './regras/contas';
import * as emprestimos from './regras/emprestimos';
import {executarRotinaAutomatica} from './regras/rotina';
import * as solicitacoes from './regras/solicitacoes';

export type {NexusState} from './estado';

export type StatusConexao = 'conectando' | 'online' | 'offline';

/**
 * Fachada única usada pelas telas. Guarda o estado em um signal, persiste no
 * localStorage e delega as regras de negócio para as funções em ./regras.
 *
 * Os itens do acervo também são sincronizados com o backend (/api/item):
 * ao iniciar, o backend é a fonte da verdade; depois, toda mudança em um item
 * (cadastro, edição ou troca de status por empréstimo) é enviada para a API.
 */
@Injectable({
  providedIn: 'root',
})
export class NexusStore {
  private readonly itensApi = inject(ItensApi);
  private readonly state = signal<NexusState>(carregarEstado());

  // Conexão com o backend
  readonly conexao = signal<StatusConexao>('conectando');
  readonly erroApi = signal<string | null>(null);

  // Seletores públicos
  readonly agora = computed(() => parseDate(this.state().agora));
  readonly agoraIso = computed(() => this.state().agora);
  readonly configuracao = computed(() => this.state().configuracao);
  readonly usuarios = computed(() => this.state().usuarios);
  readonly categorias = computed(() => this.state().categorias);
  readonly itens = computed(() => this.state().itens);
  readonly solicitacoes = computed(() => this.state().solicitacoes);
  readonly emprestimos = computed(() => this.state().emprestimos);
  readonly ocorrencias = computed(() => this.state().ocorrencias);
  readonly notificacoes = computed(() => this.state().notificacoes);

  readonly usuarioLogado = computed(() => {
    const id = this.state().usuarioLogadoId;
    return this.state().usuarios.find((u) => u.id === id) || null;
  });

  // Notificações não lidas do usuário logado
  readonly notificacoesNaoLidas = computed(() => {
    const user = this.usuarioLogado();
    if (!user) return [];
    return this.state().notificacoes.filter((n) => n.usuarioId === user.id && !n.lida);
  });

  readonly totalNaoLidas = computed(() => this.notificacoesNaoLidas().length);

  // Itens do catálogo público (RN09: só "disponivel" no catálogo)
  readonly itensCatalogo = computed(() => this.state().itens.filter((item) => item.status === 'disponivel'));

  readonly solicitacoesPendentesCount = computed(
    () => this.state().solicitacoes.filter((s) => s.status === 'pendente').length,
  );

  readonly contasPendentesCount = computed(() => this.state().usuarios.filter((u) => u.status === 'pendente').length);

  readonly emprestimosAtrasadosCount = computed(
    () => this.state().emprestimos.filter((e) => !e.devolvidoEm && e.diasAtraso > 0).length,
  );

  readonly ocorrenciasAbertasCount = computed(
    () => this.state().ocorrencias.filter((o) => o.status === 'aberta').length,
  );

  constructor() {
    // Garante consistência com o relógio virtual antes de qualquer tela ler o estado
    this.atualizar((s) => executarRotinaAutomatica(s, parseDate(s.agora)));
    this.carregarItensDaApi();
  }

  // ==========================================
  // ESTADO E SINCRONIZAÇÃO
  // ==========================================

  /** Aplica uma mudança de estado, salva no navegador e envia itens alterados para a API. */
  private atualizar(fn: (s: NexusState) => NexusState) {
    const antes = this.state();
    const depois = fn(antes);
    if (depois === antes) return;
    this.state.set(depois);
    salvarEstado(depois);
    this.sincronizarItens(antes.itens, depois.itens);
  }

  /** Igual a atualizar(), para regras que também devolvem um resultado para a tela. */
  private executar<R>(fn: (s: NexusState) => Transicao<R>): R {
    let resultado!: R;
    this.atualizar((s) => {
      const transicao = fn(s);
      resultado = transicao.resultado;
      return transicao.estado;
    });
    return resultado;
  }

  /** Busca os itens do backend e passa a usá-los como fonte da verdade. */
  reconectar() {
    this.carregarItensDaApi();
  }

  private carregarItensDaApi() {
    this.conexao.set('conectando');
    this.itensApi.listar().subscribe({
      next: (itens) => {
        this.conexao.set('online');
        this.erroApi.set(null);

        if (itens.length === 0) {
          // Banco vazio: envia o acervo que está no navegador
          this.state().itens.forEach((item) => this.enviar(this.itensApi.salvar(item)));
          return;
        }

        // Troca os itens locais pelos do banco sem reenviá-los, depois roda a rotina
        // (que pode marcar atrasos e, aí sim, sincroniza o que mudou)
        const estado = {...this.state(), itens};
        this.state.set(estado);
        salvarEstado(estado);
        this.atualizar((s) => executarRotinaAutomatica(s, parseDate(s.agora)));
      },
      error: (erro: HttpErrorResponse) => {
        this.conexao.set('offline');
        this.erroApi.set(mensagemDeErro(erro));
      },
    });
  }

  private sincronizarItens(antes: Item[], depois: Item[]) {
    if (antes === depois || this.conexao() !== 'online') return;

    // As regras sempre criam um objeto novo para o item que mudou,
    // então comparar referências basta para achar o que enviar
    const anteriores = new Map(antes.map((i) => [i.id, i]));
    depois
      .filter((item) => anteriores.get(item.id) !== item)
      .forEach((item) => this.enviar(this.itensApi.salvar(item)));

    const atuais = new Set(depois.map((i) => i.id));
    antes.filter((item) => !atuais.has(item.id)).forEach((item) => this.enviar(this.itensApi.remover(item.id)));
  }

  private enviar(requisicao: Observable<unknown>) {
    requisicao.subscribe({
      error: (erro: HttpErrorResponse) => {
        if (semConexao(erro)) this.conexao.set('offline');
        this.erroApi.set(mensagemDeErro(erro));
      },
    });
  }

  dispensarErroApi() {
    this.erroApi.set(null);
  }

  // ==========================================
  // RELÓGIO VIRTUAL & ROTINA AUTOMÁTICA
  // ==========================================

  avancarRelogio(horas: number) {
    this.atualizar((s) => {
      const novoAgora = addHours(parseDate(s.agora), horas);
      return executarRotinaAutomatica({...s, agora: novoAgora.toISOString()}, novoAgora);
    });
  }

  avancarDias(dias: number) {
    this.avancarRelogio(dias * 24);
  }

  reiniciarDados() {
    this.atualizar(() => {
      const fresh = getInitialDemoState();
      return executarRotinaAutomatica(fresh, parseDate(fresh.agora));
    });
  }

  // ==========================================
  // AUTENTICAÇÃO E CONTAS (RN08)
  // ==========================================

  login(identificador: string, senha?: string) {
    return this.executar((s) => contas.login(s, identificador, senha));
  }

  logout() {
    this.atualizar((s) => ({...s, usuarioLogadoId: null}));
  }

  trocarUsuarioDemo(usuarioId: string) {
    this.atualizar((s) => ({...s, usuarioLogadoId: usuarioId}));
  }

  cadastrarUsuario(dados: contas.DadosCadastro) {
    return this.executar((s) => contas.cadastrarUsuario(s, dados));
  }

  aprovarUsuario(usuarioId: string) {
    this.atualizar((s) => contas.aprovarUsuario(s, usuarioId));
  }

  recusarUsuario(usuarioId: string, motivo?: string) {
    this.atualizar((s) => contas.recusarUsuario(s, usuarioId, motivo));
  }

  bloquearUsuario(usuarioId: string) {
    this.atualizar((s) => contas.bloquearUsuario(s, usuarioId));
  }

  desbloquearUsuario(usuarioId: string) {
    this.atualizar((s) => contas.desbloquearUsuario(s, usuarioId));
  }

  // ==========================================
  // SOLICITAÇÕES (RN01, RN02, RN03, RN09, RN10)
  // ==========================================

  solicitarEmprestimo(itemId: string, solicitanteId: string, devolucaoDesejada: string) {
    return this.executar((s) => solicitacoes.solicitarEmprestimo(s, itemId, solicitanteId, devolucaoDesejada));
  }

  aprovarPedido(solicitacaoId: string, responsavelId: string) {
    return this.executar((s) => solicitacoes.aprovarPedido(s, solicitacaoId, responsavelId));
  }

  recusarPedido(solicitacaoId: string, responsavelId: string, motivo?: string) {
    return this.executar((s) => solicitacoes.recusarPedido(s, solicitacaoId, responsavelId, motivo));
  }

  podeEnviarLembrete(solicitacao: Solicitacao): boolean {
    return solicitacoes.podeEnviarLembrete(this.state(), solicitacao);
  }

  enviarLembrete(solicitacaoId: string) {
    return this.executar((s) => solicitacoes.enviarLembrete(s, solicitacaoId));
  }

  contarItensAtivosDoUsuarioNaCategoria(categoriaId: string, usuarioId?: string | null): number {
    const s = this.state();
    return solicitacoes.contarItensAtivosDoUsuarioNaCategoria(s, categoriaId, usuarioId !== undefined ? usuarioId : s.usuarioLogadoId);
  }

  verificarPermissaoSolicitacao(categoriaId: string, usuarioId?: string | null) {
    const s = this.state();
    return solicitacoes.verificarPermissaoSolicitacao(s, categoriaId, usuarioId !== undefined ? usuarioId : s.usuarioLogadoId);
  }

  // ==========================================
  // RETIRADA E DEVOLUÇÃO (RN05, RN06, RN07)
  // ==========================================

  registrarRetiradaPorQr(codigoQrOuPatrimonio: string, responsavelId: string) {
    return this.executar((s) => emprestimos.registrarRetiradaPorQr(s, codigoQrOuPatrimonio, responsavelId));
  }

  registrarRetirada(itemId: string, responsavelId: string) {
    return this.executar((s) => emprestimos.registrarRetirada(s, itemId, responsavelId));
  }

  registrarDevolucao(emprestimoId: string, _responsavelId: string, comDefeito: boolean, descricaoDefeito?: string) {
    return this.executar((s) => emprestimos.registrarDevolucao(s, emprestimoId, comDefeito, descricaoDefeito));
  }

  // ==========================================
  // ACERVO, CONFIGURAÇÕES E NOTIFICAÇÕES
  // ==========================================

  salvarItem(item: Item) {
    this.atualizar((s) => acervo.salvarItem(s, item));
  }

  removerItem(itemId: string) {
    this.atualizar((s) => acervo.removerItem(s, itemId));
  }

  salvarCategoria(cat: Categoria) {
    this.atualizar((s) => acervo.salvarCategoria(s, cat));
  }

  resolverOcorrencia(ocorrenciaId: string, itemRetornarDisponivel = true) {
    this.atualizar((s) => acervo.resolverOcorrencia(s, ocorrenciaId, itemRetornarDisponivel));
  }

  alterarPoliticaAtraso(novaPolitica: PoliticaAtraso) {
    this.atualizar((s) => acervo.alterarPoliticaAtraso(s, novaPolitica));
  }

  marcarNotificacaoComoLida(notificacaoId: string) {
    this.atualizar((s) => acervo.marcarNotificacaoComoLida(s, notificacaoId));
  }

  marcarTodasNotificacoesComoLidas(usuarioId: string) {
    this.atualizar((s) => acervo.marcarTodasNotificacoesComoLidas(s, usuarioId));
  }
}

/** Status 0: backend inacessível. 502-504: o proxy do Angular não alcançou o backend. */
function semConexao(erro: HttpErrorResponse): boolean {
  return erro.status === 0 || (erro.status >= 502 && erro.status <= 504);
}

function mensagemDeErro(erro: HttpErrorResponse): string {
  if (semConexao(erro)) {
    return 'Sem conexão com o backend. Os itens estão sendo salvos só neste navegador.';
  }
  const mensagem = erro.error?.message;
  return Array.isArray(mensagem) ? mensagem.join(' ') : mensagem || `Erro ${erro.status} ao falar com o backend.`;
}
