import {ProtemState} from './estado';
import {getInitialDemoState} from './demo-data';

const CHAVE = 'protem:v1';
/** Chaves de antes da troca de nome. Só são lidas se ainda não houver dados na chave nova. */
const CHAVES_ANTIGAS = ['nexus_app_state_v2', 'nexus_app_state_v1'];

const LISTAS = ['usuarios', 'categorias', 'itens', 'solicitacoes', 'emprestimos', 'ocorrencias', 'notificacoes'];
const POLITICAS = ['simples', 'intermediaria', 'rigida'];

export interface EstadoCarregado {
  estado: ProtemState;
  /** true quando não havia dados válidos salvos e o estado veio do seed de demonstração. */
  doSeed: boolean;
}

export type ResultadoGravacao = 'ok' | 'cota' | 'indisponivel';

export function carregarEstado(): EstadoCarregado {
  for (const chave of [CHAVE, ...CHAVES_ANTIGAS]) {
    const texto = ler(chave);
    if (texto === null) continue;
    // Dados corrompidos na chave mais recente: volta para o seed em vez de tentar as antigas
    const estado = validar(texto);
    return estado ? {estado, doSeed: false} : {estado: getInitialDemoState(), doSeed: true};
  }
  return {estado: getInitialDemoState(), doSeed: true};
}

export function salvarEstado(estado: ProtemState): ResultadoGravacao {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(estado));
    return 'ok';
  } catch (erro) {
    return erro instanceof DOMException && erro.name === 'QuotaExceededError' ? 'cota' : 'indisponivel';
  }
}

function ler(chave: string): string | null {
  try {
    return localStorage.getItem(chave);
  } catch {
    // localStorage bloqueado (modo privado, política do navegador)
    return null;
  }
}

/** Confere a forma do estado salvo; qualquer coisa estranha é tratada como corrompida. */
function validar(texto: string): ProtemState | null {
  try {
    const salvo = JSON.parse(texto) as Record<string, unknown> | null;
    if (!salvo || typeof salvo !== 'object') return null;
    if (LISTAS.some((lista) => !Array.isArray(salvo[lista]))) return null;
    if (typeof salvo['agora'] !== 'string' || isNaN(new Date(salvo['agora']).getTime())) return null;
    const configuracao = salvo['configuracao'] as {politicaAtraso?: string} | undefined;
    if (!POLITICAS.includes(configuracao?.politicaAtraso ?? '')) return null;

    const estado = salvo as unknown as ProtemState;
    // Garante que todos os usuários tenham a senha padrão '123456'
    estado.usuarios = estado.usuarios.map((u) => ({
      ...u,
      senha: !u.senha || u.senha === '123' ? '123456' : u.senha,
    }));
    return estado;
  } catch {
    return null;
  }
}
