import {addDays, calculateDiasAtraso, formatDateShort, parseDate} from '../../lib/date-utils';
import {Emprestimo, Ocorrencia, StatusItem, StatusUsuario, Usuario} from '../../types/models';
import {NexusState, ResultadoAcao, Transicao, novaNotificacao} from '../estado';

export type ResultadoRetirada = ResultadoAcao & {emprestimoId?: string; itemId?: string};

/**
 * RN05: A retirada só é registrada pelo responsável, lendo o QR code do item;
 * o prazo começa a contar nesse momento.
 */
export function registrarRetiradaPorQr(
  s: NexusState,
  codigoQrOuPatrimonio: string,
  responsavelId: string,
): Transicao<ResultadoRetirada> {
  const codigo = codigoQrOuPatrimonio.trim().toUpperCase();
  const item = s.itens.find((i) => i.codigoQr.toUpperCase() === codigo || i.patrimonio.toUpperCase() === codigo);
  if (!item) {
    return {
      estado: s,
      resultado: {sucesso: false, mensagem: `Item não encontrado para o código "${codigoQrOuPatrimonio}".`},
    };
  }
  return registrarRetirada(s, item.id, responsavelId);
}

export function registrarRetirada(s: NexusState, itemId: string, responsavelId: string): Transicao<ResultadoRetirada> {
  const item = s.itens.find((i) => i.id === itemId);
  if (!item) return {estado: s, resultado: {sucesso: false, mensagem: 'Item não encontrado.'}};

  const solic = s.solicitacoes.find((sol) => sol.itemId === itemId && sol.status === 'aprovada');
  if (!solic) {
    return {
      estado: s,
      resultado: {
        sucesso: false,
        mensagem: `Não há pedido aprovado aguardando retirada para o item ${item.nome} (${item.patrimonio}).`,
      },
    };
  }

  const novoEmprestimo: Emprestimo = {
    id: 'emp-' + Date.now(),
    solicitacaoId: solic.id,
    itemId: item.id,
    usuarioId: solic.solicitanteId,
    registradoPor: responsavelId,
    retiradoEm: s.agora,
    devolucaoPrevista: solic.devolucaoDesejada,
    diasAtraso: 0,
  };

  const notif = novaNotificacao(
    solic.solicitanteId,
    'aprovacao',
    `Retirada confirmada para "${item.nome}". Devolução prevista: ${formatDateShort(solic.devolucaoDesejada)}.`,
    s.agora,
    '/meus-emprestimos',
  );

  return {
    estado: {
      ...s,
      itens: s.itens.map((i) => (i.id === itemId ? {...i, status: 'emprestado' as StatusItem} : i)),
      solicitacoes: s.solicitacoes.map((sol) => (sol.id === solic.id ? {...sol, status: 'concluida' as const} : sol)),
      emprestimos: [novoEmprestimo, ...s.emprestimos],
      notificacoes: [notif, ...s.notificacoes],
    },
    resultado: {
      sucesso: true,
      mensagem: `Retirada registrada com sucesso para ${item.nome}!`,
      emprestimoId: novoEmprestimo.id,
      itemId: item.id,
    },
  };
}

/**
 * RN06: Política de atraso configurável (simples, intermediária, rígida).
 * RN07: Item devolvido com defeito vai para manutenção, sai do catálogo e gera ocorrência.
 */
export function registrarDevolucao(
  s: NexusState,
  emprestimoId: string,
  comDefeito: boolean,
  descricaoDefeito?: string,
): Transicao<ResultadoAcao> {
  const emp = s.emprestimos.find((e) => e.id === emprestimoId);
  if (!emp) return {estado: s, resultado: {sucesso: false, mensagem: 'Empréstimo não encontrado.'}};
  if (emp.devolvidoEm) return {estado: s, resultado: {sucesso: false, mensagem: 'Item já consta como devolvido.'}};

  const item = s.itens.find((i) => i.id === emp.itemId);
  const usuario = s.usuarios.find((u) => u.id === emp.usuarioId);
  const clockNow = parseDate(s.agora);
  const diasAtraso = calculateDiasAtraso(emp.devolucaoPrevista, clockNow);

  const emprestimos = s.emprestimos.map((e) => (e.id === emprestimoId ? {...e, devolvidoEm: s.agora, diasAtraso} : e));

  const ocorrencias = [...s.ocorrencias];
  if (comDefeito) {
    const novaOcorrencia: Ocorrencia = {
      id: 'ocorr-' + Date.now(),
      emprestimoId: emp.id,
      itemId: emp.itemId,
      usuarioId: emp.usuarioId,
      descricao: descricaoDefeito || 'Defeito relatado na devolução do item.',
      status: 'aberta',
      criadoEm: s.agora,
    };
    ocorrencias.unshift(novaOcorrencia);
  }
  // RN07: item com defeito vai para manutenção
  const novoStatusItem: StatusItem = comDefeito ? 'manutencao' : 'disponivel';
  const itens = s.itens.map((i) => (i.id === emp.itemId ? {...i, status: novoStatusItem} : i));

  const {usuarios, mensagem} = aplicarPoliticaAtraso(s, usuario, emprestimos, diasAtraso, clockNow);

  const notif = novaNotificacao(
    emp.usuarioId,
    'aprovacao',
    `A devolução de "${item?.nome || 'item'}" foi confirmada pelo responsável.${comDefeito ? ' O item foi encaminhado para manutenção com registro de ocorrência.' : ''}`,
    s.agora,
    '/meus-emprestimos',
  );

  return {
    estado: {...s, emprestimos, itens, ocorrencias, usuarios, notificacoes: [notif, ...s.notificacoes]},
    resultado: {sucesso: true, mensagem},
  };
}

/** RN06: decide o que acontece com a conta de quem devolveu, conforme a política configurada. */
function aplicarPoliticaAtraso(
  s: NexusState,
  usuario: Usuario | undefined,
  emprestimos: Emprestimo[],
  diasAtraso: number,
  clockNow: Date,
): {usuarios: Usuario[]; mensagem: string} {
  const padrao = 'Devolução registrada com sucesso!';
  if (!usuario) return {usuarios: s.usuarios, mensagem: padrao};

  const mudar = (mudanca: Partial<Usuario>) =>
    s.usuarios.map((u) => (u.id === usuario.id ? {...u, ...mudanca} : u));
  const temOutroAtraso = emprestimos.some((e) => e.usuarioId === usuario.id && !e.devolvidoEm && e.diasAtraso > 0);

  if (diasAtraso <= 0) {
    // Devolvido no prazo: se estava bloqueado e não há outros atrasos, volta a ativa
    if (!temOutroAtraso && usuario.status === 'bloqueada') {
      return {usuarios: mudar({status: 'ativa'}), mensagem: padrao};
    }
    return {usuarios: s.usuarios, mensagem: padrao};
  }

  const politica = s.configuracao.politicaAtraso;
  if (politica === 'rigida') {
    // Suspende a pessoa pelo mesmo número de dias de atraso após a devolução
    const suspensoAte = addDays(clockNow, diasAtraso);
    return {
      usuarios: mudar({status: 'suspensa' as StatusUsuario, suspensoAte: suspensoAte.toISOString()}),
      mensagem: `Devolução registrada com atraso de ${diasAtraso} dia(s). Pela política rígida, a conta foi suspensa por ${diasAtraso} dia(s) (até ${formatDateShort(suspensoAte)}).`,
    };
  }
  if (politica === 'intermediaria') {
    // Desbloqueia após a devolução, desde que não tenha outros atrasos
    return {
      usuarios: temOutroAtraso ? s.usuarios : mudar({status: 'ativa'}),
      mensagem: 'Devolução registrada. Como o item atrasado foi devolvido, a conta foi desbloqueada.',
    };
  }
  // Simples: não suspende
  return {
    usuarios: s.usuarios,
    mensagem: `Devolução registrada com ${diasAtraso} dia(s) de atraso (política simples).`,
  };
}
