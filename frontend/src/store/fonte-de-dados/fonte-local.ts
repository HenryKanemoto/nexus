import {Injectable, signal} from '@angular/core';
import {ProtemState} from '../estado';
import {carregarEstado, salvarEstado} from '../persistencia';
import {FonteDeDados, StatusConexao} from './fonte-de-dados';

const AVISO_COTA =
  'O espaço deste navegador acabou e as últimas mudanças não foram salvas. Remova fotos grandes ou use "Reiniciar dados".';

/** Tudo no navegador: estado em memória, gravado no localStorage. Não faz nenhuma requisição. */
@Injectable({providedIn: 'root'})
export class FonteLocal implements FonteDeDados {
  readonly modo = 'local' as const;
  readonly conexao = signal<StatusConexao>('local').asReadonly();
  private readonly _erro = signal<string | null>(null);
  readonly erro = this._erro.asReadonly();

  /** Evita repetir o aviso de cota a cada clique depois que a pessoa fechou. */
  private avisouCota = false;

  carregar(): ProtemState {
    return carregarEstado().estado;
  }

  conectar() {
    // Nada a sincronizar
  }

  salvar(_antes: ProtemState, depois: ProtemState) {
    const resultado = salvarEstado(depois);
    if (resultado === 'ok') {
      this.avisouCota = false;
    } else if (resultado === 'cota' && !this.avisouCota) {
      this.avisouCota = true;
      this._erro.set(AVISO_COTA);
    }
    // 'indisponivel' (localStorage bloqueado): segue só em memória, sem incomodar
  }

  reconectar() {
    // Nada a reconectar
  }

  dispensarErro() {
    this._erro.set(null);
  }
}
