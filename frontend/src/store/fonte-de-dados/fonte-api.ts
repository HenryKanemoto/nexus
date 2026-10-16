import {HttpErrorResponse} from '@angular/common/http';
import {Injectable, inject, signal} from '@angular/core';
import {Observable} from 'rxjs';
import {ItensApi} from '../../services/itens-api.service';
import {Item} from '../../types/models';
import {ProtemState} from '../estado';
import {carregarEstado, salvarEstado} from '../persistencia';
import {DonoDoEstado, FonteDeDados, StatusConexao} from './fonte-de-dados';

/**
 * Modo api: o estado fica no navegador como no modo local, e os itens do acervo também
 * são sincronizados com o back-end (/api/item):
 * - ao iniciar, o banco é a fonte da verdade dos itens. Exceção: se este navegador
 *   começou agora do seed, se o banco está vazio ou depois de "Reiniciar dados", o seed é
 *   enviado ao banco, para os itens ficarem coerentes com os empréstimos de demonstração.
 *   As fotos são do banco: o item do seed sem foto fica com a foto que já estava lá;
 * - depois, toda mudança em um item (cadastro, edição ou troca de situação) vai para a API.
 */
@Injectable({providedIn: 'root'})
export class FonteApi implements FonteDeDados {
  readonly modo = 'api' as const;
  private readonly itensApi = inject(ItensApi);

  private readonly _conexao = signal<StatusConexao>('conectando');
  readonly conexao = this._conexao.asReadonly();
  private readonly _erro = signal<string | null>(null);
  readonly erro = this._erro.asReadonly();

  private dono: DonoDoEstado | null = null;
  private enviarSeed = false;

  carregar(): ProtemState {
    const {estado, doSeed} = carregarEstado();
    this.enviarSeed = doSeed;
    return estado;
  }

  conectar(dono: DonoDoEstado) {
    this.dono = dono;
    this.carregarItensDaApi();
  }

  salvar(antes: ProtemState, depois: ProtemState) {
    salvarEstado(depois);
    this.sincronizarItens(antes.itens, depois.itens);
  }

  /** Busca os itens do backend e passa a usá-los como fonte da verdade. */
  reconectar() {
    this.carregarItensDaApi();
  }

  /** "Reiniciar dados": o seed volta e vai para o banco, preservando as fotos que estão lá. */
  reiniciar(aplicar: () => void) {
    // Enquanto o seed não for enviado, nada vai item a item (senão as fotos iriam como null)
    this.enviarSeed = true;
    aplicar();
    this.carregarItensDaApi();
  }

  dispensarErro() {
    this._erro.set(null);
  }

  private carregarItensDaApi() {
    const dono = this.dono;
    if (!dono) return;

    this._conexao.set('conectando');
    this.itensApi.listar().subscribe({
      next: (itens) => {
        this._conexao.set('online');
        this._erro.set(null);

        if (itens.length === 0 || this.enviarSeed) {
          // Banco vazio, navegador recém-iniciado ou "Reiniciar dados": o seed do navegador vale,
          // mas as fotos ficam no banco (o seed do navegador não tem fotos)
          dono.receberItens(completarFotos(dono.estado().itens, itens));
          this.enviarSeed = false;
          dono.estado().itens.forEach((item) => this.enviar(this.itensApi.salvar(item)));
          return;
        }
        dono.receberItens(itens);
      },
      error: (erro: HttpErrorResponse) => {
        this._conexao.set('offline');
        this._erro.set(mensagemDeErro(erro));
      },
    });
  }

  private sincronizarItens(antes: Item[], depois: Item[]) {
    if (antes === depois || this._conexao() !== 'online' || this.enviarSeed) return;

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
        if (semConexao(erro)) this._conexao.set('offline');
        this._erro.set(mensagemDeErro(erro));
      },
    });
  }
}

/**
 * Itens do navegador com a foto do banco quando não tiverem uma própria.
 * O seed de demonstração do navegador não tem fotos; as do banco são mantidas.
 */
export function completarFotos(locais: Item[], doBanco: Item[]): Item[] {
  const fotos = new Map(doBanco.filter((i) => i.foto).map((i) => [i.id, i.foto]));
  return locais.map((item) => (!item.foto && fotos.has(item.id) ? {...item, foto: fotos.get(item.id)} : item));
}

/** Status 0: backend inacessível. 500-504: o proxy do Angular não alcançou o backend. */
function semConexao(erro: HttpErrorResponse): boolean {
  return erro.status === 0 || (erro.status >= 500 && erro.status <= 504 && !erro.error?.message);
}

function mensagemDeErro(erro: HttpErrorResponse): string {
  if (semConexao(erro)) {
    return 'Sem conexão com o backend. Os itens estão sendo salvos só neste navegador.';
  }
  const mensagem = erro.error?.message;
  return Array.isArray(mensagem) ? mensagem.join(' ') : mensagem || `Erro ${erro.status} ao falar com o backend.`;
}
