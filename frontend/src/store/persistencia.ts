import {Usuario} from '../types/models';
import {getInitialDemoState} from './demo-data';
import {NexusState} from './estado';

const STORAGE_KEY = 'nexus_app_state_v2';
const STORAGE_KEY_ANTIGA = 'nexus_app_state_v1';

export function carregarEstado(): NexusState {
  try {
    // Fallback: se não tiver v2, verifica v1 para não perder dados criados
    const saved = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(STORAGE_KEY_ANTIGA);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.usuarios && parsed.itens) {
        // Garante que todos os usuários tenham a senha padrão '123456'
        parsed.usuarios = parsed.usuarios.map((u: Usuario) => ({
          ...u,
          senha: !u.senha || u.senha === '123' ? '123456' : u.senha,
        }));
        return parsed;
      }
    }
  } catch {
    // localStorage indisponível ou corrompido: volta para a demonstração
  }
  return getInitialDemoState();
}

export function salvarEstado(estado: NexusState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(estado));
  } catch {
    // Ignora cota de armazenamento cheia
  }
}
