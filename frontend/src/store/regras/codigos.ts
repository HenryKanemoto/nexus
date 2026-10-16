import {Solicitacao} from '../../types/models';
import {ProtemState} from '../estado';

/**
 * Código de retirada: quem pediu recebe na aprovação e mostra ao responsável na hora de
 * retirar, para ninguém retirar no nome de outra pessoa. O responsável não vê o código em
 * nenhuma tela; ele só digita o que a pessoa mostrar.
 *
 * - Vale só enquanto o pedido está "aprovado": depois da retirada (concluída) ou da
 *   expiração no fim do dia (RN04), deixa de valer. Por isso é de uso único.
 * - Sem caracteres que se confundem ao ler em voz alta ou na tela (0/O, 1/I/L).
 */
export const ALFABETO_CODIGO = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
export const TAMANHO_CODIGO = 6;

/** Aceita o código digitado com espaços, hífen ou em minúsculas. */
export function normalizarCodigo(codigo: string): string {
  return codigo.toUpperCase().replace(/[\s-]/g, '');
}

/** Códigos de pedidos aprovados (os únicos que ainda podem ser usados). */
export function codigosEmUso(s: ProtemState): Set<string> {
  return new Set(
    s.solicitacoes.filter((sol) => sol.status === 'aprovada' && sol.codigoRetirada).map((sol) => sol.codigoRetirada!),
  );
}

/** Gera um código que não está em uso por outro pedido aprovado. */
export function gerarCodigoRetirada(emUso: Set<string>, aleatorio: () => number = Math.random): string {
  for (;;) {
    let codigo = '';
    for (let i = 0; i < TAMANHO_CODIGO; i++) {
      codigo += ALFABETO_CODIGO[Math.floor(aleatorio() * ALFABETO_CODIGO.length)];
    }
    if (!emUso.has(codigo)) return codigo;
  }
}

/** O código digitado libera a retirada deste pedido? */
export function codigoConfere(solicitacao: Solicitacao, digitado: string): boolean {
  return (
    solicitacao.status === 'aprovada' &&
    !!solicitacao.codigoRetirada &&
    normalizarCodigo(digitado) === solicitacao.codigoRetirada
  );
}

/**
 * Pedidos aprovados antes de existir o código (dados salvos no navegador) recebem um,
 * para a retirada não ficar travada. Devolve o mesmo estado se nada faltar.
 */
export function garantirCodigosDeRetirada(s: ProtemState): ProtemState {
  if (!s.solicitacoes.some((sol) => sol.status === 'aprovada' && !sol.codigoRetirada)) return s;
  const emUso = codigosEmUso(s);
  return {
    ...s,
    solicitacoes: s.solicitacoes.map((sol) => {
      if (sol.status !== 'aprovada' || sol.codigoRetirada) return sol;
      const codigoRetirada = gerarCodigoRetirada(emUso);
      emUso.add(codigoRetirada);
      return {...sol, codigoRetirada};
    }),
  };
}
