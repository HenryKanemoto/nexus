import {Signal} from '@angular/core';
import {Item} from '../../types/models';
import {ProtemState} from '../estado';

/**
 * De onde vêm e para onde vão os dados do app.
 *
 * - local (padrão): tudo fica no navegador (localStorage). Nenhuma requisição de rede.
 * - api: igual ao local, mas os itens do acervo também são gravados no back-end (/api/item).
 *
 * As regras de negócio rodam no navegador nos dois modos (store/regras); a fonte só
 * carrega, grava e sincroniza. As telas falam apenas com o ProtemStore e não sabem qual
 * fonte está em uso.
 */
export type ModoDados = 'local' | 'api';

/** "local" quando não há servidor envolvido; os demais só aparecem no modo api. */
export type StatusConexao = 'local' | 'conectando' | 'online' | 'offline';

/** O que a fonte precisa do store para sincronizar. */
export interface DonoDoEstado {
  estado(): ProtemState;
  /** Troca os itens pelos que vieram do servidor, sem reenviá-los. */
  receberItens(itens: Item[]): void;
}

export interface FonteDeDados {
  readonly modo: ModoDados;
  readonly conexao: Signal<StatusConexao>;
  /** Mensagem curta para o usuário quando algo não pôde ser salvo ou enviado. */
  readonly erro: Signal<string | null>;

  /** Estado inicial: o que estava salvo, ou o seed de demonstração. */
  carregar(): ProtemState;
  /** Chamado uma vez pelo store, depois que o estado inicial já passou pela rotina automática. */
  conectar(dono: DonoDoEstado): void;
  /** Grava o novo estado. Recebe o anterior para saber o que mudou. */
  salvar(antes: ProtemState, depois: ProtemState): void;
  reconectar(): void;
  /** "Reiniciar dados": a fonte roda `aplicar` (que troca o estado pelo seed) e grava do jeito dela. */
  reiniciar(aplicar: () => void): void;
  dispensarErro(): void;
}
