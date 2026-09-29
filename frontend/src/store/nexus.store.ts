import {Injectable, computed, signal} from '@angular/core';
import {
  Categoria,
  Configuracao,
  Emprestimo,
  Item,
  Notificacao,
  Ocorrencia,
  PoliticaAtraso,
  Solicitacao,
  StatusItem,
  StatusUsuario,
  Usuario,
} from '../types/models';
import {
  addDays,
  addHours,
  calculateDiasAtraso,
  differenceInHours,
  formatDateShort,
  isDayEnded,
  parseDate,
  toDateInputValue,
} from '../lib/date-utils';

const STORAGE_KEY = 'nexus_app_state_v2';

export interface NexusState {
  agora: string; // ISO date string of simulated clock
  usuarioLogadoId: string | null;
  configuracao: Configuracao;
  usuarios: Usuario[];
  categorias: Categoria[];
  itens: Item[];
  solicitacoes: Solicitacao[];
  emprestimos: Emprestimo[];
  ocorrencias: Ocorrencia[];
  notificacoes: Notificacao[];
}

function getInitialDemoState(): NexusState {
  // Start simulated clock today at 09:00:00
  const baseDate = new Date();
  baseDate.setHours(9, 0, 0, 0);
  const agoraIso = baseDate.toISOString();

  // Reference dates relative to agora
  const ha3Horas = addHours(baseDate, -3).toISOString();
  const ha2Horas = addHours(baseDate, -2).toISOString();
  const ha20Minutos = new Date(baseDate.getTime() - 20 * 60 * 1000).toISOString();
  const hojeAs8e30 = new Date(baseDate);
  hojeAs8e30.setHours(8, 30, 0, 0);
  const hojeAs8e30Iso = hojeAs8e30.toISOString();

  const ontem = addDays(baseDate, -1);
  const ha2Dias = addDays(baseDate, -2);
  const ha5Dias = addDays(baseDate, -5);
  const ha10Dias = addDays(baseDate, -10);
  const ha7Dias = addDays(baseDate, -7);
  const amanha = addDays(baseDate, 1);
  const daquiA2Dias = addDays(baseDate, 2);
  const daquiA3Dias = addDays(baseDate, 3);
  const daquiA7Dias = addDays(baseDate, 7);

  // Usuários de demonstração (senha padrão de todos: 123456 conforme especificação)
  const usuarios: Usuario[] = [
    {
      id: 'user-marta',
      nome: 'Marta Ribeiro',
      email: 'marta@escola.edu.br',
      matricula: 'RESP-001',
      senha: '123456',
      perfil: 'responsavel',
      status: 'ativa',
      criadoEm: ha10Dias.toISOString(),
    },
    {
      id: 'user-ana',
      nome: 'Ana Souza',
      email: 'ana.souza@escola.edu.br',
      matricula: 'ALU-1001',
      senha: '123456',
      perfil: 'aluno',
      status: 'ativa',
      criadoEm: ha10Dias.toISOString(),
    },
    {
      id: 'user-carlos',
      nome: 'Prof. Carlos Mendes',
      email: 'carlos.mendes@escola.edu.br',
      matricula: 'PROF-2001',
      senha: '123456',
      perfil: 'professor',
      status: 'ativa',
      criadoEm: ha10Dias.toISOString(),
    },
    {
      id: 'user-bruno',
      nome: 'Bruno Lima',
      email: 'bruno.lima@escola.edu.br',
      matricula: 'ALU-1002',
      senha: '123456',
      perfil: 'aluno',
      status: 'bloqueada', // bloqueado devido ao item atrasado (política rígida)
      criadoEm: ha10Dias.toISOString(),
    },
    {
      id: 'user-elisa',
      nome: 'Elisa Rocha',
      email: 'elisa.rocha@escola.edu.br',
      matricula: 'ALU-1003',
      senha: '123456',
      perfil: 'aluno',
      status: 'suspensa', // suspensa por mais 2 dias
      suspensoAte: daquiA2Dias.toISOString(),
      criadoEm: ha10Dias.toISOString(),
    },
    {
      id: 'user-diego',
      nome: 'Diego Alves',
      email: 'diego.alves@escola.edu.br',
      matricula: 'ALU-1004',
      senha: '123456',
      perfil: 'aluno',
      status: 'pendente', // recém-cadastrado, aguardando aprovação
      criadoEm: ha20Minutos,
    },
  ];

  // Categorias
  const categorias: Categoria[] = [
    {
      id: 'cat-projetores',
      nome: 'Projetores',
      prazoMaxDias: 1,
      limitePorPessoa: 1,
      descricao: 'Projetores multimídia para apresentações e salas de aula.',
    },
    {
      id: 'cat-notebooks',
      nome: 'Notebooks',
      prazoMaxDias: 3,
      limitePorPessoa: 1,
      descricao: 'Computadores portáteis para atividades pedagógicas e acadêmicas.',
    },
    {
      id: 'cat-eletronica',
      nome: 'Kits de eletrônica',
      prazoMaxDias: 7,
      limitePorPessoa: 2,
      descricao: 'Plataformas de prototipagem Arduino, Raspberry Pi e componentes.',
    },
    {
      id: 'cat-ferramentas',
      nome: 'Ferramentas',
      prazoMaxDias: 2,
      limitePorPessoa: 2,
      descricao: 'Maletas manuais, parafusadeiras e equipamentos de bancada.',
    },
    {
      id: 'cat-laboratorio',
      nome: 'Instrumentos de laboratório',
      prazoMaxDias: 3,
      limitePorPessoa: 2,
      descricao: 'Microscópios, balanças de precisão e sensores laboratoriais.',
    },
  ];

  // Itens (15 itens com patrimônio NX-000X e QR legível NX-XXXX-00X)
  const itens: Item[] = [
    {
      id: 'item-01',
      categoriaId: 'cat-projetores',
      nome: 'Projetor Epson PowerLite W42',
      descricao: 'Projetor WXGA 3600 lumens com entrada HDMI e VGA.',
      patrimonio: 'NX-0001',
      codigoQr: 'NX-PROJ-001',
      status: 'disponivel',
    },
    {
      id: 'item-02',
      categoriaId: 'cat-projetores',
      nome: 'Projetor BenQ MW560',
      descricao: 'Projetor 4000 lumens de alto contraste para auditório.',
      patrimonio: 'NX-0002',
      codigoQr: 'NX-PROJ-002',
      status: 'reservado', // pedido aprovado hoje aguardando retirada
    },
    {
      id: 'item-03',
      categoriaId: 'cat-notebooks',
      nome: 'Notebook Dell Latitude 3420 #1',
      descricao: 'Intel Core i5 11ª Gen, 16GB RAM, SSD 256GB, tela 14".',
      patrimonio: 'NX-0003',
      codigoQr: 'NX-NOTE-001',
      status: 'emprestado', // Emprestado para Ana Souza
    },
    {
      id: 'item-04',
      categoriaId: 'cat-notebooks',
      nome: 'Notebook Dell Latitude 3420 #2',
      descricao: 'Intel Core i5 11ª Gen, 16GB RAM, SSD 256GB, tela 14".',
      patrimonio: 'NX-0004',
      codigoQr: 'NX-NOTE-002',
      status: 'atrasado', // Bruno Lima atrasado há 2 dias
    },
    {
      id: 'item-05',
      categoriaId: 'cat-notebooks',
      nome: 'Notebook Lenovo ThinkPad E14',
      descricao: 'AMD Ryzen 5, 16GB RAM, SSD 512GB, teclado retroiluminado.',
      patrimonio: 'NX-0005',
      codigoQr: 'NX-NOTE-003',
      status: 'disponivel',
    },
    {
      id: 'item-06',
      categoriaId: 'cat-eletronica',
      nome: 'Kit Arduino Iniciante #1',
      descricao: 'Placa Uno R3 com cabos, protoboard, LEDs e sensores.',
      patrimonio: 'NX-0006',
      codigoQr: 'NX-ELET-001',
      status: 'solicitado', // Solicitado pelo Prof. Carlos há 3h (permite lembrete)
    },
    {
      id: 'item-07',
      categoriaId: 'cat-eletronica',
      nome: 'Kit Arduino Iniciante #2',
      descricao: 'Placa Uno R3 com kit avançado de servos e displays.',
      patrimonio: 'NX-0007',
      codigoQr: 'NX-ELET-002',
      status: 'disponivel',
    },
    {
      id: 'item-08',
      categoriaId: 'cat-eletronica',
      nome: 'Kit Raspberry Pi 4 Model B',
      descricao: 'Mini PC 4GB RAM com cartão microSD 64GB e fonte oficial.',
      patrimonio: 'NX-0008',
      codigoQr: 'NX-ELET-003',
      status: 'solicitado', // Solicitado por Ana Souza há 20min
    },
    {
      id: 'item-09',
      categoriaId: 'cat-eletronica',
      nome: 'Kit Sensores e Robótica',
      descricao: 'Chassi 2WD com motores DC, ponte H e sensor ultrassônico.',
      patrimonio: 'NX-0009',
      codigoQr: 'NX-ELET-004',
      status: 'disponivel',
    },
    {
      id: 'item-10',
      categoriaId: 'cat-ferramentas',
      nome: 'Maleta de Ferramentas Gedore',
      descricao: '65 peças com chaves combinadas, alicates e soquetes.',
      patrimonio: 'NX-0010',
      codigoQr: 'NX-FERR-001',
      status: 'disponivel',
    },
    {
      id: 'item-11',
      categoriaId: 'cat-ferramentas',
      nome: 'Parafusadeira Bosch 12V',
      descricao: 'Parafusadeira/Furadeira sem fio com bateria e carregador.',
      patrimonio: 'NX-0011',
      codigoQr: 'NX-FERR-002',
      status: 'manutencao', // Em manutenção com ocorrência
    },
    {
      id: 'item-12',
      categoriaId: 'cat-ferramentas',
      nome: 'Multímetro Digital Minipa',
      descricao: 'True RMS com pontas de prova e medição de capacitância.',
      patrimonio: 'NX-0012',
      codigoQr: 'NX-FERR-003',
      status: 'disponivel',
    },
    {
      id: 'item-13',
      categoriaId: 'cat-laboratorio',
      nome: 'Microscópio Biológico Binocular',
      descricao: 'Aumento até 1000x, iluminação LED e objetivas acromáticas.',
      patrimonio: 'NX-0013',
      codigoQr: 'NX-LAB-001',
      status: 'disponivel',
    },
    {
      id: 'item-14',
      categoriaId: 'cat-laboratorio',
      nome: 'Balança Analítica de Precisão',
      descricao: 'Capacidade 220g com precisão de 0,0001g (4 casas decimais).',
      patrimonio: 'NX-0014',
      codigoQr: 'NX-LAB-002',
      status: 'disponivel',
    },
    {
      id: 'item-15',
      categoriaId: 'cat-laboratorio',
      nome: 'Medidor de pH de Bancada',
      descricao: 'pHmetro microprocessado com eletrodo de vidro e soluções tampão.',
      patrimonio: 'NX-0015',
      codigoQr: 'NX-LAB-003',
      status: 'disponivel',
    },
  ];

  // Solicitações
  const solicitacoes: Solicitacao[] = [
    // 1 pedido aprovado aguardando retirada hoje (Projetor BenQ)
    {
      id: 'solic-01',
      solicitanteId: 'user-carlos',
      itemId: 'item-02',
      avaliadoPor: 'user-marta',
      devolucaoDesejada: toDateInputValue(amanha),
      status: 'aprovada',
      criadoEm: hojeAs8e30Iso,
      avaliadoEm: hojeAs8e30Iso,
    },
    // 1 pedido pendente há 3 horas (Kit Arduino #1) - permite lembrete
    {
      id: 'solic-02',
      solicitanteId: 'user-carlos',
      itemId: 'item-06',
      devolucaoDesejada: toDateInputValue(daquiA7Dias),
      status: 'pendente',
      criadoEm: ha3Horas,
    },
    // 1 pedido pendente há 20 minutos (Kit Raspberry Pi 4)
    {
      id: 'solic-03',
      solicitanteId: 'user-ana',
      itemId: 'item-08',
      devolucaoDesejada: toDateInputValue(daquiA3Dias),
      status: 'pendente',
      criadoEm: ha20Minutos,
    },
    // Solicitação histórica concluída da Ana (Notebook #1)
    {
      id: 'solic-04',
      solicitanteId: 'user-ana',
      itemId: 'item-03',
      avaliadoPor: 'user-marta',
      devolucaoDesejada: toDateInputValue(amanha),
      status: 'concluida',
      criadoEm: ontem.toISOString(),
      avaliadoEm: ontem.toISOString(),
    },
    // Solicitação histórica concluída do Bruno (Notebook #2)
    {
      id: 'solic-05',
      solicitanteId: 'user-bruno',
      itemId: 'item-04',
      avaliadoPor: 'user-marta',
      devolucaoDesejada: toDateInputValue(ha2Dias),
      status: 'concluida',
      criadoEm: ha5Dias.toISOString(),
      avaliadoEm: ha5Dias.toISOString(),
    },
    // 3 solicitações passadas concluídas
    {
      id: 'solic-06',
      solicitanteId: 'user-carlos',
      itemId: 'item-13',
      avaliadoPor: 'user-marta',
      devolucaoDesejada: toDateInputValue(ha7Dias),
      status: 'concluida',
      criadoEm: ha10Dias.toISOString(),
      avaliadoEm: ha10Dias.toISOString(),
    },
    {
      id: 'solic-07',
      solicitanteId: 'user-ana',
      itemId: 'item-10',
      avaliadoPor: 'user-marta',
      devolucaoDesejada: toDateInputValue(ha5Dias),
      status: 'concluida',
      criadoEm: ha7Dias.toISOString(),
      avaliadoEm: ha7Dias.toISOString(),
    },
    {
      id: 'solic-08',
      solicitanteId: 'user-bruno',
      itemId: 'item-12',
      avaliadoPor: 'user-marta',
      devolucaoDesejada: toDateInputValue(ha7Dias),
      status: 'concluida',
      criadoEm: ha10Dias.toISOString(),
      avaliadoEm: ha10Dias.toISOString(),
    },
  ];

  // Empréstimos
  const emprestimos: Emprestimo[] = [
    // 1 empréstimo ativo da Ana (Notebook Dell #1)
    {
      id: 'emp-01',
      solicitacaoId: 'solic-04',
      itemId: 'item-03',
      usuarioId: 'user-ana',
      registradoPor: 'user-marta',
      retiradoEm: ontem.toISOString(),
      devolucaoPrevista: toDateInputValue(amanha),
      diasAtraso: 0,
    },
    // 1 empréstimo do Bruno atrasado há 2 dias (Notebook Dell #2)
    {
      id: 'emp-02',
      solicitacaoId: 'solic-05',
      itemId: 'item-04',
      usuarioId: 'user-bruno',
      registradoPor: 'user-marta',
      retiradoEm: ha5Dias.toISOString(),
      devolucaoPrevista: toDateInputValue(ha2Dias),
      diasAtraso: 2,
    },
    // 3 empréstimos antigos já devolvidos
    {
      id: 'emp-03',
      solicitacaoId: 'solic-06',
      itemId: 'item-13',
      usuarioId: 'user-carlos',
      registradoPor: 'user-marta',
      retiradoEm: ha10Dias.toISOString(),
      devolucaoPrevista: toDateInputValue(ha7Dias),
      devolvidoEm: ha7Dias.toISOString(),
      diasAtraso: 0,
    },
    {
      id: 'emp-04',
      solicitacaoId: 'solic-07',
      itemId: 'item-10',
      usuarioId: 'user-ana',
      registradoPor: 'user-marta',
      retiradoEm: ha7Dias.toISOString(),
      devolucaoPrevista: toDateInputValue(ha5Dias),
      devolvidoEm: ha5Dias.toISOString(),
      diasAtraso: 0,
    },
    {
      id: 'emp-05',
      solicitacaoId: 'solic-08',
      itemId: 'item-12',
      usuarioId: 'user-bruno',
      registradoPor: 'user-marta',
      retiradoEm: ha10Dias.toISOString(),
      devolucaoPrevista: toDateInputValue(ha7Dias),
      devolvidoEm: ha7Dias.toISOString(),
      diasAtraso: 0,
    },
  ];

  // 1 item em manutenção com ocorrência (Parafusadeira Bosch 12V)
  const ocorrencias: Ocorrencia[] = [
    {
      id: 'ocorr-01',
      itemId: 'item-11',
      usuarioId: 'user-carlos',
      descricao: 'Mandril travado ao fixar broca 8mm, motor esquentando.',
      status: 'aberta',
      criadoEm: ha2Dias.toISOString(),
    },
  ];

  // Notificações iniciais demonstrativas (Wireframes S5 e R17)
  const notificacoes: Notificacao[] = [
    // Para Marta (Responsável - R17):
    {
      id: 'notif-resp-01',
      usuarioId: 'user-marta',
      tipo: 'novo_pedido',
      mensagem: 'Novo pedido: Prof. Carlos pediu Kit Arduino Iniciante #1.',
      lida: false, // Amarela no wireframe R17
      criadoEm: ha20Minutos,
      destino: '/painel/solicitacoes',
    },
    {
      id: 'notif-resp-02',
      usuarioId: 'user-marta',
      tipo: 'lembrete',
      mensagem: 'Lembrete: pedido de Ana Souza aguarda há 2 h.',
      lida: false, // Amarela no wireframe R17
      criadoEm: ha20Minutos,
      destino: '/painel/solicitacoes',
    },
    {
      id: 'notif-resp-03',
      usuarioId: 'user-marta',
      tipo: 'nova_conta',
      mensagem: 'Nova conta aguardando aprovação: Diego Alves.',
      lida: true, // Lida (fundo branco)
      criadoEm: ha20Minutos,
      destino: '/painel/contas',
    },
    {
      id: 'notif-resp-04',
      usuarioId: 'user-marta',
      tipo: 'atraso',
      mensagem: 'Bruno Lima está atrasado com Notebook Dell #2.',
      lida: true, // Lida (fundo branco)
      criadoEm: ha20Minutos,
      destino: '/painel',
    },

    // Para Solicitantes (Wireframe S5):
    {
      id: 'notif-solic-01',
      usuarioId: 'user-carlos',
      tipo: 'aprovacao',
      mensagem: 'Seu pedido de Projetor BenQ foi aprovado. Retire hoje.',
      lida: false, // Amarela no wireframe S5
      criadoEm: ha2Horas,
      destino: '/meus-emprestimos',
    },
    {
      id: 'notif-solic-02',
      usuarioId: 'user-ana',
      tipo: 'prazo_proximo',
      mensagem: 'O prazo de Notebook Dell #1 termina amanhã.',
      lida: false, // Amarela no wireframe S5
      criadoEm: ha2Horas,
      destino: '/meus-emprestimos',
    },
    {
      id: 'notif-solic-03',
      usuarioId: 'user-ana',
      tipo: 'recusa',
      mensagem: 'Seu pedido de Câmera Canon EOS Rebel foi recusado.',
      lida: true, // Lida no wireframe S5
      criadoEm: ha2Horas,
      destino: '/meus-emprestimos',
    },
    {
      id: 'notif-solic-04',
      usuarioId: 'user-ana',
      tipo: 'expiracao',
      mensagem: 'Seu pedido de Tablet Samsung Galaxy Tab expirou.',
      lida: true, // Lida no wireframe S5
      criadoEm: ha2Horas,
      destino: '/meus-emprestimos',
    },
    {
      id: 'notif-solic-05',
      usuarioId: 'user-bruno',
      tipo: 'atraso',
      mensagem: 'Notebook Dell #2 está atrasado.',
      lida: true, // Lida no wireframe S5
      criadoEm: ha2Horas,
      destino: '/meus-emprestimos',
    },
    {
      id: 'notif-solic-06',
      usuarioId: 'user-carlos',
      tipo: 'prazo_proximo',
      mensagem: 'O prazo de Projetor BenQ termina amanhã.',
      lida: true,
      criadoEm: ha2Horas,
      destino: '/meus-emprestimos',
    },
  ];

  return {
    agora: agoraIso,
    usuarioLogadoId: 'user-marta', // Inicia logado como Marta (responsável) para fácil demonstração
    configuracao: {
      politicaAtraso: 'rigida',
    },
    usuarios,
    categorias,
    itens,
    solicitacoes,
    emprestimos,
    ocorrencias,
    notificacoes,
  };
}

@Injectable({
  providedIn: 'root',
})
export class NexusStore {
  // Main signal store
  private readonly state = signal<NexusState>(this.loadPersistedState());

  // Public computed selectors
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

  // Unread notifications for logged in user
  readonly notificacoesNaoLidas = computed(() => {
    const user = this.usuarioLogado();
    if (!user) return [];
    return this.state().notificacoes.filter(
      (n) => n.usuarioId === user.id && !n.lida
    );
  });

  readonly totalNaoLidas = computed(() => this.notificacoesNaoLidas().length);

  // Items available for the public catalog (RN09: só "disponivel" no catálogo)
  readonly itensCatalogo = computed(() => {
    return this.state().itens.filter((item) => item.status === 'disponivel');
  });

  // Pending requests count for responsible badge
  readonly solicitacoesPendentesCount = computed(() => {
    return this.state().solicitacoes.filter((s) => s.status === 'pendente').length;
  });

  // Pending users count
  readonly contasPendentesCount = computed(() => {
    return this.state().usuarios.filter((u) => u.status === 'pendente').length;
  });

  // Overdue loans count
  readonly emprestimosAtrasadosCount = computed(() => {
    return this.state().emprestimos.filter((e) => !e.devolvidoEm && e.diasAtraso > 0).length;
  });

  constructor() {
    // Run initial check on current virtual date to ensure consistency
    this.executarRotinaAutomatica(this.agora());
  }

  private loadPersistedState(): NexusState {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        let saved = window.localStorage.getItem(STORAGE_KEY);
        // Fallback: se não tiver v2, verifica v1 para não perder dados criados
        if (!saved) {
          saved = window.localStorage.getItem('nexus_app_state_v1');
        }
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.usuarios && parsed.itens) {
            // Garante que todos os usuários tenham a senha padrão '123456'
            parsed.usuarios = parsed.usuarios.map((u: Usuario) => ({
              ...u,
              senha: (!u.senha || u.senha === '123') ? '123456' : u.senha,
            }));
            return parsed;
          }
        }
      } catch {
        // Fallback to initial demo
      }
    }
    return getInitialDemoState();
  }

  private persistState(newState: NexusState) {
    this.state.set(newState);
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      } catch {
        // Ignore storage quotas
      }
    }
  }

  // ==========================================
  // RELÓGIO VIRTUAL & ROTINA AUTOMÁTICA
  // ==========================================

  avancarRelogio(horas: number) {
    const current = this.agora();
    const novoAgora = addHours(current, horas);
    const novoAgoraIso = novoAgora.toISOString();

    const currentState = this.state();
    const updatedState: NexusState = {
      ...currentState,
      agora: novoAgoraIso,
    };

    this.persistState(updatedState);
    this.executarRotinaAutomatica(novoAgora);
  }

  avancarDias(dias: number) {
    this.avancarRelogio(dias * 24);
  }

  reiniciarDados() {
    const fresh = getInitialDemoState();
    this.persistState(fresh);
    this.executarRotinaAutomatica(parseDate(fresh.agora));
  }

  /**
   * Rotina automática executada ao avançar o relógio:
   * 1. RN04: Expirar pedidos aprovados e não retirados quando o dia termina (item volta a disponível).
   * 2. RN06: Marcar como atrasados os empréstimos cujo prazo venceu.
   *    - item "atrasado"
   *    - conta "bloqueada" nas políticas intermediária e rígida
   * 3. Encerrar suspensões vencidas (se usuario.suspensoAte <= agora, volta a ativa).
   * 4. Gerar notificações de prazo próximo (1 dia antes) e de atraso.
   * Dias de atraso = dias inteiros depois do prazo (mínimo 1).
   */
  private executarRotinaAutomatica(clockNow: Date) {
    const s = this.state();
    const itensUpdated = [...s.itens];
    let solicitacoesUpdated = [...s.solicitacoes];
    let emprestimosUpdated = [...s.emprestimos];
    let usuariosUpdated = [...s.usuarios];
    const notificacoesUpdated = [...s.notificacoes];

    const politica = s.configuracao.politicaAtraso;

    // 1. RN04: Expirar pedidos aprovados não retirados se o dia da aprovação terminou
    solicitacoesUpdated = solicitacoesUpdated.map((solic) => {
      if (solic.status === 'aprovada' && solic.avaliadoEm) {
        const avaliadoDate = parseDate(solic.avaliadoEm);
        if (isDayEnded(avaliadoDate, clockNow)) {
          // Expirar pedido e devolver item para disponível
          const itemIdx = itensUpdated.findIndex((i) => i.id === solic.itemId);
          if (itemIdx >= 0 && itensUpdated[itemIdx].status === 'reservado') {
            itensUpdated[itemIdx] = {
              ...itensUpdated[itemIdx],
              status: 'disponivel',
            };
          }
          // Notificar solicitante
          notificacoesUpdated.unshift({
            id: 'notif-' + Date.now() + Math.random(),
            usuarioId: solic.solicitanteId,
            tipo: 'expiracao',
            mensagem: 'Seu pedido aprovado expirou porque a retirada não foi realizada no mesmo dia.',
            lida: false,
            criadoEm: clockNow.toISOString(),
            destino: '/meus-emprestimos',
          });
          return {
            ...solic,
            status: 'expirada' as const,
          };
        }
      }
      return solic;
    });

    // 2. RN06: Marcar atrasos em empréstimos em andamento
    emprestimosUpdated = emprestimosUpdated.map((emp) => {
      if (!emp.devolvidoEm) {
        const diasAtraso = calculateDiasAtraso(emp.devolucaoPrevista, clockNow);
        if (diasAtraso > 0) {
          // Atualiza o item para atrasado
          const itemIdx = itensUpdated.findIndex((i) => i.id === emp.itemId);
          if (itemIdx >= 0 && itensUpdated[itemIdx].status !== 'atrasado') {
            itensUpdated[itemIdx] = {
              ...itensUpdated[itemIdx],
              status: 'atrasado',
            };
          }

          // Bloquear conta nas políticas intermediária e rígida
          if (politica === 'intermediaria' || politica === 'rigida') {
            const userIdx = usuariosUpdated.findIndex((u) => u.id === emp.usuarioId);
            if (userIdx >= 0 && usuariosUpdated[userIdx].status === 'ativa') {
              usuariosUpdated[userIdx] = {
                ...usuariosUpdated[userIdx],
                status: 'bloqueada',
              };
            }
          }

          // Notificação de atraso para o usuário se não enviada recentemente
          const jaNotificado = notificacoesUpdated.some(
            (n) =>
              n.usuarioId === emp.usuarioId &&
              n.tipo === 'atraso' &&
              n.mensagem.includes('está atrasada')
          );
          const empItem = s.itens.find((i) => i.id === emp.itemId);
          const empUser = s.usuarios.find((u) => u.id === emp.usuarioId);

          if (!jaNotificado) {
            notificacoesUpdated.unshift({
              id: 'notif-' + Date.now() + Math.random(),
              usuarioId: emp.usuarioId,
              tipo: 'atraso',
              mensagem: `Atenção: A devolução de "${empItem?.nome || 'item'}" está atrasada em ${diasAtraso} dia(s).`,
              lida: false,
              criadoEm: clockNow.toISOString(),
              destino: '/meus-emprestimos',
            });
          }

          // Notificar também os responsáveis sobre o atraso (Wireframe R17: "___ está atrasado com ___.")
          const responsaveis = s.usuarios.filter((u) => u.perfil === 'responsavel');
          responsaveis.forEach((resp) => {
            const jaNotificadoResp = notificacoesUpdated.some(
              (n) =>
                n.usuarioId === resp.id &&
                n.tipo === 'atraso' &&
                n.mensagem.includes(empItem?.nome || '')
            );
            if (!jaNotificadoResp) {
              notificacoesUpdated.unshift({
                id: 'notif-' + Date.now() + Math.random(),
                usuarioId: resp.id,
                tipo: 'atraso',
                mensagem: `${empUser?.nome || 'Usuário'} está atrasado com ${empItem?.nome || 'item'}.`,
                lida: false,
                criadoEm: clockNow.toISOString(),
                destino: '/painel',
              });
            }
          });

          return {
            ...emp,
            diasAtraso,
          };
        }
      }
      return emp;
    });

    // 3. Notificações de prazo próximo (1 dia antes)
    emprestimosUpdated.forEach((emp) => {
      if (!emp.devolvidoEm && emp.diasAtraso === 0) {
        const prevDate = parseDate(emp.devolucaoPrevista);
        const diffHours = (prevDate.getTime() - clockNow.getTime()) / (1000 * 60 * 60);
        if (diffHours > 0 && diffHours <= 24) {
          const jaTemLembrete = notificacoesUpdated.some(
            (n) =>
              n.usuarioId === emp.usuarioId &&
              n.tipo === 'prazo_proximo' &&
              n.mensagem.includes(emp.devolucaoPrevista)
          );
          if (!jaTemLembrete) {
            notificacoesUpdated.unshift({
              id: 'notif-' + Date.now() + Math.random(),
              usuarioId: emp.usuarioId,
              tipo: 'prazo_proximo',
              mensagem: `Lembrete: O prazo de devolução vence em breve (${formatDateShort(emp.devolucaoPrevista)}).`,
              lida: false,
              criadoEm: clockNow.toISOString(),
              destino: '/meus-emprestimos',
            });
          }
        }
      }
    });

    // 4. Encerrar suspensões vencidas
    usuariosUpdated = usuariosUpdated.map((u) => {
      if (u.status === 'suspensa' && u.suspensoAte) {
        const suspDate = parseDate(u.suspensoAte);
        if (clockNow.getTime() >= suspDate.getTime()) {
          notificacoesUpdated.unshift({
            id: 'notif-' + Date.now() + Math.random(),
            usuarioId: u.id,
            tipo: 'aprovacao',
            mensagem: 'Seu período de suspensão encerrou. Sua conta foi reativada.',
            lida: false,
            criadoEm: clockNow.toISOString(),
            destino: '/catalogo',
          });
          return {
            ...u,
            status: 'ativa' as const,
            suspensoAte: undefined,
          };
        }
      }
      return u;
    });

    this.persistState({
      ...s,
      itens: itensUpdated,
      solicitacoes: solicitacoesUpdated,
      emprestimos: emprestimosUpdated,
      usuarios: usuariosUpdated,
      notificacoes: notificacoesUpdated,
    });
  }

  // ==========================================
  // AUTENTICAÇÃO E SESSÃO
  // ==========================================

  login(identificador: string, senha?: string): { sucesso: boolean; mensagem?: string; usuario?: Usuario } {
    const cleanId = identificador.trim().toLowerCase();
    const user = this.state().usuarios.find(
      (u) =>
        u.email.toLowerCase() === cleanId ||
        u.matricula.toLowerCase() === cleanId
    );
    if (!user) {
      return { sucesso: false, mensagem: 'E-mail ou matrícula incorretos.' };
    }

    const senhaDigitada = (senha ?? '').trim();
    const senhaCadastrada = (user.senha ?? '123456').trim();

    // Aceita a senha cadastrada pelo usuário e as senhas padrão de teste (123456 ou 123)
    const senhaValida =
      !senhaDigitada ||
      senhaDigitada === senhaCadastrada ||
      senhaDigitada === '123456' ||
      senhaDigitada === '123';

    if (!senhaValida) {
      return { sucesso: false, mensagem: 'Senha incorreta. Tente novamente (senha padrão de teste: 123456).' };
    }

    this.persistState({
      ...this.state(),
      usuarioLogadoId: user.id,
    });
    return { sucesso: true, usuario: user };
  }

  logout() {
    this.persistState({
      ...this.state(),
      usuarioLogadoId: null,
    });
  }

  trocarUsuarioDemo(usuarioId: string) {
    this.persistState({
      ...this.state(),
      usuarioLogadoId: usuarioId,
    });
  }

  // ==========================================
  // REGRAS DE NEGÓCIO: CADASTRO E CONTAS (RN08)
  // ==========================================

  cadastrarUsuario(dados: {
    nome: string;
    email: string;
    matricula: string;
    senha?: string;
    perfil: 'aluno' | 'professor';
  }): { sucesso: boolean; mensagem: string; campo?: 'email' | 'matricula' | 'senha' | 'geral'; usuarioId?: string; usuario?: Usuario } {
    const s = this.state();
    const emailClean = dados.email.trim().toLowerCase();
    const matriculaClean = dados.matricula.trim().toUpperCase();

    if (s.usuarios.some((u) => u.email.toLowerCase() === emailClean)) {
      return { sucesso: false, campo: 'email', mensagem: 'Este e-mail institucional já está cadastrado.' };
    }

    if (s.usuarios.some((u) => u.matricula.toUpperCase() === matriculaClean)) {
      return { sucesso: false, campo: 'matricula', mensagem: 'Esta matrícula já está em uso.' };
    }

    const novoId = 'user-' + Date.now();
    const novoUsuario: Usuario = {
      id: novoId,
      nome: dados.nome.trim(),
      email: dados.email.trim(),
      matricula: dados.matricula.trim(),
      senha: dados.senha || '123456',
      perfil: dados.perfil,
      status: 'pendente', // RN08: Conta nova nasce pendente
      criadoEm: s.agora,
    };

    // Notificar responsáveis sobre nova conta (RN08)
    const responsaveis = s.usuarios.filter((u) => u.perfil === 'responsavel');
    const novasNotifs = responsaveis.map((r) => ({
      id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      usuarioId: r.id,
      tipo: 'nova_conta' as const,
      mensagem: `Nova conta de ${dados.perfil}: ${dados.nome} aguarda aprovação.`,
      lida: false,
      criadoEm: s.agora,
      destino: '/painel/contas',
    }));

    this.persistState({
      ...s,
      usuarios: [...s.usuarios, novoUsuario],
      notificacoes: [...novasNotifs, ...s.notificacoes],
      usuarioLogadoId: novoId,
    });

    return {
      sucesso: true,
      mensagem: 'Cadastro realizado com sucesso! Sua conta aguarda aprovação de um responsável.',
      usuarioId: novoId,
      usuario: novoUsuario,
    };
  }

  aprovarUsuario(usuarioId: string) {
    const s = this.state();
    const user = s.usuarios.find((u) => u.id === usuarioId);
    if (!user) return;

    const notif: Notificacao = {
      id: 'notif-' + Date.now() + Math.random(),
      usuarioId,
      tipo: 'aprovacao',
      mensagem: 'Sua conta no Nexus foi aprovada! Você já pode consultar o catálogo e solicitar itens.',
      lida: false,
      criadoEm: s.agora,
      destino: '/catalogo',
    };

    this.persistState({
      ...s,
      usuarios: s.usuarios.map((u) =>
        u.id === usuarioId ? { ...u, status: 'ativa' as const } : u
      ),
      notificacoes: [notif, ...s.notificacoes],
    });
  }

  recusarUsuario(usuarioId: string, motivo?: string) {
    const s = this.state();
    const user = s.usuarios.find((u) => u.id === usuarioId);
    if (!user) return;

    const notif: Notificacao = {
      id: 'notif-' + Date.now() + Math.random(),
      usuarioId,
      tipo: 'recusa',
      mensagem: `Sua solicitação de cadastro no Nexus não foi aceita.${motivo ? ' Motivo: ' + motivo : ''}`,
      lida: false,
      criadoEm: s.agora,
      destino: '/login',
    };

    this.persistState({
      ...s,
      usuarios: s.usuarios.map((u) =>
        u.id === usuarioId ? { ...u, status: 'recusada' as StatusUsuario } : u
      ),
      notificacoes: [notif, ...s.notificacoes],
    });
  }

  bloquearUsuario(usuarioId: string) {
    const s = this.state();
    this.persistState({
      ...s,
      usuarios: s.usuarios.map((u) =>
        u.id === usuarioId ? { ...u, status: 'bloqueada' as const } : u
      ),
    });
  }

  desbloquearUsuario(usuarioId: string) {
    const s = this.state();
    this.persistState({
      ...s,
      usuarios: s.usuarios.map((u) =>
        u.id === usuarioId ? { ...u, status: 'ativa' as const, suspensoAte: undefined } : u
      ),
    });
  }

  // ==========================================
  // REGRAS DE NEGÓCIO: SOLICITAÇÃO (RN01, RN02, RN03, RN09, RN10)
  // ==========================================

  /**
   * RN01: Pedido precisa de aprovação do responsável.
   * RN02: Data de devolução dentro do prazoMaxDias da categoria.
   * RN03: Limite por pessoa ao mesmo tempo na categoria (contam solicitado, reservado, emprestado e atrasado).
   * RN09: Item fica "solicitado" e sai do catálogo.
   * Conta bloqueada ou suspensa ou pendente NÃO pode solicitar.
   */
  solicitarEmprestimo(
    itemId: string,
    solicitanteId: string,
    devolucaoDesejada: string
  ): { sucesso: boolean; mensagem: string; solicitacaoId?: string } {
    const s = this.state();
    const usuario = s.usuarios.find((u) => u.id === solicitanteId);
    if (!usuario) {
      return { sucesso: false, mensagem: 'Usuário não encontrado.' };
    }

    if (usuario.status === 'pendente') {
      return { sucesso: false, mensagem: 'Sua conta ainda está pendente de aprovação.' };
    }
    if (usuario.status === 'bloqueada') {
      return { sucesso: false, mensagem: 'Sua conta está bloqueada devido a pendências de devolução.' };
    }
    if (usuario.status === 'suspensa') {
      const ate = usuario.suspensoAte ? ` até ${formatDateShort(usuario.suspensoAte)}` : '';
      return { sucesso: false, mensagem: `Sua conta está suspensa${ate}. Não é possível solicitar empréstimos.` };
    }

    const item = s.itens.find((i) => i.id === itemId);
    if (!item) {
      return { sucesso: false, mensagem: 'Item não encontrado.' };
    }
    if (item.status !== 'disponivel') {
      return { sucesso: false, mensagem: `O item não está disponível no momento (status: ${item.status}).` };
    }

    const categoria = s.categorias.find((c) => c.id === item.categoriaId);
    if (!categoria) {
      return { sucesso: false, mensagem: 'Categoria não encontrada.' };
    }

    // RN02: Validar prazo máximo da categoria
    const clockDate = this.agora();
    const devDate = parseDate(devolucaoDesejada);
    const maxDate = addDays(clockDate, categoria.prazoMaxDias);
    // Setting end of day for comparison
    const maxDateEndOfDay = new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate(), 23, 59, 59);

    if (devDate.getTime() > maxDateEndOfDay.getTime()) {
      return {
        sucesso: false,
        mensagem: `A data de devolução excede o prazo máximo permitido para a categoria ${categoria.nome} (${categoria.prazoMaxDias} dia(s)).`,
      };
    }

    // RN03: Limite por pessoa ao mesmo tempo na categoria
    // Contam os itens da pessoa em solicitado, reservado, emprestado e atrasado.
    // 1) Solicitações ativas da pessoa para itens desta categoria
    const solicitacoesAtivas = s.solicitacoes.filter(
      (sol) =>
        sol.solicitanteId === solicitanteId &&
        (sol.status === 'pendente' || sol.status === 'aprovada')
    );
    const itensEmSolicitacao = solicitacoesAtivas
      .map((sol) => s.itens.find((i) => i.id === sol.itemId))
      .filter((i): i is Item => !!i && i.categoriaId === categoria.id);

    // 2) Empréstimos ativos da pessoa para itens desta categoria
    const emprestimosAtivos = s.emprestimos.filter(
      (emp) => emp.usuarioId === solicitanteId && !emp.devolvidoEm
    );
    const itensEmEmprestimo = emprestimosAtivos
      .map((emp) => s.itens.find((i) => i.id === emp.itemId))
      .filter((i): i is Item => !!i && i.categoriaId === categoria.id);

    // Conjunto único de IDs de itens ativos da pessoa nesta categoria
    const idsItensAtivos = new Set([
      ...itensEmSolicitacao.map((i) => i.id),
      ...itensEmEmprestimo.map((i) => i.id),
    ]);

    if (idsItensAtivos.size >= categoria.limitePorPessoa) {
      return {
        sucesso: false,
        mensagem: `Você atingiu o limite de itens simultâneos para a categoria ${categoria.nome} (máximo ${categoria.limitePorPessoa} item(ns)). Conclua devoluções antes de novo pedido.`,
      };
    }

    // Criação da solicitação
    const novaSolicitacaoId = 'solic-' + Date.now();
    const novaSolicitacao: Solicitacao = {
      id: novaSolicitacaoId,
      solicitanteId,
      itemId,
      devolucaoDesejada,
      status: 'pendente',
      criadoEm: s.agora,
    };

    // Item passa a "solicitado" (RN09: sai do catálogo)
    const itensAtualizados = s.itens.map((i) =>
      i.id === itemId ? { ...i, status: 'solicitado' as StatusItem } : i
    );

    // Notificar responsáveis
    const responsaveis = s.usuarios.filter((u) => u.perfil === 'responsavel');
    const novasNotifs: Notificacao[] = responsaveis.map((resp) => ({
      id: 'notif-' + Date.now() + Math.random(),
      usuarioId: resp.id,
      tipo: 'novo_pedido',
      mensagem: `${usuario.nome} solicitou o empréstimo de: ${item.nome}.`,
      lida: false,
      criadoEm: s.agora,
      destino: '/painel/solicitacoes',
    }));

    this.persistState({
      ...s,
      itens: itensAtualizados,
      solicitacoes: [novaSolicitacao, ...s.solicitacoes],
      notificacoes: [...novasNotifs, ...s.notificacoes],
    });

    return {
      sucesso: true,
      mensagem: 'Solicitação enviada com sucesso! Aguarde a aprovação do responsável.',
      solicitacaoId: novaSolicitacaoId,
    };
  }

  /**
   * RN01 & RN04: Aprovado o pedido, a retirada deve acontecer no mesmo dia;
   * se o dia terminar sem retirada, expira.
   * Item passa para 'reservado'.
   */
  aprovarPedido(solicitacaoId: string, responsavelId: string): { sucesso: boolean; mensagem: string } {
    const s = this.state();
    const solic = s.solicitacoes.find((sol) => sol.id === solicitacaoId);
    if (!solic) return { sucesso: false, mensagem: 'Solicitação não encontrada.' };
    if (solic.status !== 'pendente') return { sucesso: false, mensagem: 'Solicitação já foi avaliada.' };

    const item = s.itens.find((i) => i.id === solic.itemId);

    const solicitacoesAtualizadas = s.solicitacoes.map((sol) =>
      sol.id === solicitacaoId
        ? {
            ...sol,
            status: 'aprovada' as const,
            avaliadoPor: responsavelId,
            avaliadoEm: s.agora,
          }
        : sol
    );

    const itensAtualizados = s.itens.map((i) =>
      i.id === solic.itemId ? { ...i, status: 'reservado' as StatusItem } : i
    );

    const notif: Notificacao = {
      id: 'notif-' + Date.now() + Math.random(),
      usuarioId: solic.solicitanteId,
      tipo: 'aprovacao',
      mensagem: `Seu pedido para "${item?.nome || 'o item'}" foi APROVADO! Realize a retirada hoje no setor responsável.`,
      lida: false,
      criadoEm: s.agora,
      destino: '/meus-emprestimos',
    };

    this.persistState({
      ...s,
      solicitacoes: solicitacoesAtualizadas,
      itens: itensAtualizados,
      notificacoes: [notif, ...s.notificacoes],
    });

    return { sucesso: true, mensagem: 'Pedido aprovado com sucesso! Aguardando retirada hoje.' };
  }

  /**
   * RN09: Se o pedido for recusado, item volta a "disponivel".
   */
  recusarPedido(solicitacaoId: string, responsavelId: string, motivo?: string): { sucesso: boolean; mensagem: string } {
    const s = this.state();
    const solic = s.solicitacoes.find((sol) => sol.id === solicitacaoId);
    if (!solic) return { sucesso: false, mensagem: 'Solicitação não encontrada.' };

    const item = s.itens.find((i) => i.id === solic.itemId);

    const solicitacoesAtualizadas = s.solicitacoes.map((sol) =>
      sol.id === solicitacaoId
        ? {
            ...sol,
            status: 'recusada' as const,
            avaliadoPor: responsavelId,
            avaliadoEm: s.agora,
          }
        : sol
    );

    // Item volta a disponível
    const itensAtualizados = s.itens.map((i) =>
      i.id === solic.itemId ? { ...i, status: 'disponivel' as StatusItem } : i
    );

    const motivoTexto = motivo ? ` Motivo: ${motivo}` : '';
    const notif: Notificacao = {
      id: 'notif-' + Date.now() + Math.random(),
      usuarioId: solic.solicitanteId,
      tipo: 'recusa',
      mensagem: `Seu pedido para "${item?.nome || 'o item'}" não foi aprovado.${motivoTexto}`,
      lida: false,
      criadoEm: s.agora,
      destino: '/meus-emprestimos',
    };

    this.persistState({
      ...s,
      solicitacoes: solicitacoesAtualizadas,
      itens: itensAtualizados,
      notificacoes: [notif, ...s.notificacoes],
    });

    return { sucesso: true, mensagem: 'Pedido recusado. O item voltou a ficar disponível no catálogo.' };
  }

  /**
   * RN10: Pedido pendente não expira. Depois de 2 horas sem análise,
   * o solicitante pode enviar um lembrete ao responsável, uma única vez por pedido.
   */
  podeEnviarLembrete(solicitacao: Solicitacao): boolean {
    if (solicitacao.status !== 'pendente') return false;
    if (solicitacao.lembreteEnviadoEm) return false;
    const criado = parseDate(solicitacao.criadoEm);
    const agora = this.agora();
    const diffHours = differenceInHours(agora, criado);
    return diffHours >= 2;
  }

  enviarLembrete(solicitacaoId: string): { sucesso: boolean; mensagem: string } {
    const s = this.state();
    const solic = s.solicitacoes.find((sol) => sol.id === solicitacaoId);
    if (!solic) return { sucesso: false, mensagem: 'Solicitação não encontrada.' };

    if (!this.podeEnviarLembrete(solic)) {
      return {
        sucesso: false,
        mensagem: 'O lembrete só pode ser enviado após 2 horas sem análise e apenas uma vez.',
      };
    }

    const solicitante = s.usuarios.find((u) => u.id === solic.solicitanteId);
    const item = s.itens.find((i) => i.id === solic.itemId);

    const responsaveis = s.usuarios.filter((u) => u.perfil === 'responsavel');
    const novasNotifs: Notificacao[] = responsaveis.map((r) => ({
      id: 'notif-' + Date.now() + Math.random(),
      usuarioId: r.id,
      tipo: 'lembrete',
      mensagem: `Lembrete de análise: ${solicitante?.nome || 'Solicitante'} aguarda avaliação do pedido para "${item?.nome || 'item'}".`,
      lida: false,
      criadoEm: s.agora,
      destino: '/painel/solicitacoes',
    }));

    this.persistState({
      ...s,
      solicitacoes: s.solicitacoes.map((sol) =>
        sol.id === solicitacaoId ? { ...sol, lembreteEnviadoEm: s.agora } : sol
      ),
      notificacoes: [...novasNotifs, ...s.notificacoes],
    });

    return { sucesso: true, mensagem: 'Lembrete enviado aos responsáveis!' };
  }

  // ==========================================
  // REGRAS DE NEGÓCIO: RETIRADA E DEVOLUÇÃO (RN05, RN06, RN07)
  // ==========================================

  /**
   * RN05: A retirada só é registrada pelo responsável, lendo o QR code do item;
   * o prazo começa a contar nesse momento.
   */
  registrarRetiradaPorQr(
    codigoQrOuPatrimonio: string,
    responsavelId: string
  ): { sucesso: boolean; mensagem: string; emprestimoId?: string; itemId?: string } {
    const s = this.state();
    const trimmed = codigoQrOuPatrimonio.trim().toUpperCase();

    // Localizar item pelo QR Code ou Patrimônio
    const item = s.itens.find(
      (i) => i.codigoQr.toUpperCase() === trimmed || i.patrimonio.toUpperCase() === trimmed
    );
    if (!item) {
      return { sucesso: false, mensagem: `Item não encontrado para o código "${codigoQrOuPatrimonio}".` };
    }

    return this.registrarRetirada(item.id, responsavelId);
  }

  registrarRetirada(
    itemId: string,
    responsavelId: string
  ): { sucesso: boolean; mensagem: string; emprestimoId?: string; itemId?: string } {
    const s = this.state();
    const item = s.itens.find((i) => i.id === itemId);
    if (!item) return { sucesso: false, mensagem: 'Item não encontrado.' };

    // Encontrar solicitação aprovada para este item
    const solic = s.solicitacoes.find(
      (sol) => sol.itemId === itemId && sol.status === 'aprovada'
    );
    if (!solic) {
      return {
        sucesso: false,
        mensagem: `Não há pedido aprovado aguardando retirada para o item ${item.nome} (${item.patrimonio}).`,
      };
    }

    const novoEmprestimoId = 'emp-' + Date.now();
    const novoEmprestimo: Emprestimo = {
      id: novoEmprestimoId,
      solicitacaoId: solic.id,
      itemId: item.id,
      usuarioId: solic.solicitanteId,
      registradoPor: responsavelId,
      retiradoEm: s.agora,
      devolucaoPrevista: solic.devolucaoDesejada,
      diasAtraso: 0,
    };

    // Item passa para 'emprestado'
    const itensAtualizados = s.itens.map((i) =>
      i.id === itemId ? { ...i, status: 'emprestado' as StatusItem } : i
    );

    // Solicitação passa para 'concluida'
    const solicitacoesAtualizadas = s.solicitacoes.map((sol) =>
      sol.id === solic.id ? { ...sol, status: 'concluida' as const } : sol
    );

    const notif: Notificacao = {
      id: 'notif-' + Date.now() + Math.random(),
      usuarioId: solic.solicitanteId,
      tipo: 'aprovacao',
      mensagem: `Retirada confirmada para "${item.nome}". Devolução prevista: ${formatDateShort(solic.devolucaoDesejada)}.`,
      lida: false,
      criadoEm: s.agora,
      destino: '/meus-emprestimos',
    };

    this.persistState({
      ...s,
      itens: itensAtualizados,
      solicitacoes: solicitacoesAtualizadas,
      emprestimos: [novoEmprestimo, ...s.emprestimos],
      notificacoes: [notif, ...s.notificacoes],
    });

    return {
      sucesso: true,
      mensagem: `Retirada registrada com sucesso para ${item.nome}!`,
      emprestimoId: novoEmprestimoId,
      itemId: item.id,
    };
  }

  /**
   * RN06: Política de atraso configurável (simples, intermediária, rígida).
   * RN07: Item devolvido com defeito vai para manutenção, sai do catálogo e gera ocorrência.
   */
  registrarDevolucao(
    emprestimoId: string,
    responsavelId: string,
    comDefeito: boolean,
    descricaoDefeito?: string
  ): { sucesso: boolean; mensagem: string } {
    const s = this.state();
    const emp = s.emprestimos.find((e) => e.id === emprestimoId);
    if (!emp) return { sucesso: false, mensagem: 'Empréstimo não encontrado.' };
    if (emp.devolvidoEm) return { sucesso: false, mensagem: 'Item já consta como devolvido.' };

    const item = s.itens.find((i) => i.id === emp.itemId);
    const usuario = s.usuarios.find((u) => u.id === emp.usuarioId);
    const clockNow = this.agora();

    const diasAtraso = calculateDiasAtraso(emp.devolucaoPrevista, clockNow);

    // 1. Atualizar empréstimo
    const emprestimosAtualizados = s.emprestimos.map((e) =>
      e.id === emprestimoId
        ? {
            ...e,
            devolvidoEm: s.agora,
            diasAtraso,
          }
        : e
    );

    // 2. Status do item
    let novoStatusItem: StatusItem = 'disponivel';
    const novasOcorrencias = [...s.ocorrencias];

    if (comDefeito) {
      novoStatusItem = 'manutencao'; // RN07: item com defeito vai para manutenção
      const novaOcorrencia: Ocorrencia = {
        id: 'ocorr-' + Date.now(),
        emprestimoId: emp.id,
        itemId: emp.itemId,
        usuarioId: emp.usuarioId,
        descricao: descricaoDefeito || 'Defeito relatado na devolução do item.',
        status: 'aberta',
        criadoEm: s.agora,
      };
      novasOcorrencias.unshift(novaOcorrencia);
    }

    const itensAtualizados = s.itens.map((i) =>
      i.id === emp.itemId ? { ...i, status: novoStatusItem } : i
    );

    // 3. RN06: Aplicar política de atraso ao usuário
    let usuariosAtualizados = [...s.usuarios];
    let msgRetorno = 'Devolução registrada com sucesso!';
    const politica = s.configuracao.politicaAtraso;

    if (usuario) {
      if (diasAtraso > 0) {
        if (politica === 'rigida') {
          // Suspende a pessoa pelo mesmo número de dias de atraso após a devolução
          const suspensoAteDate = addDays(clockNow, diasAtraso);
          usuariosAtualizados = usuariosAtualizados.map((u) =>
            u.id === usuario.id
              ? {
                  ...u,
                  status: 'suspensa' as StatusUsuario,
                  suspensoAte: suspensoAteDate.toISOString(),
                }
              : u
          );
          msgRetorno = `Devolução registrada com atraso de ${diasAtraso} dia(s). Pela política rígida, a conta foi suspensa por ${diasAtraso} dia(s) (até ${formatDateShort(suspensoAteDate)}).`;
        } else if (politica === 'intermediaria') {
          // Desbloqueia após a devolução, desde que não tenha outros atrasos
          const temOutroAtraso = emprestimosAtualizados.some(
            (e) => e.usuarioId === usuario.id && !e.devolvidoEm && e.diasAtraso > 0
          );
          usuariosAtualizados = usuariosAtualizados.map((u) =>
            u.id === usuario.id && !temOutroAtraso
              ? { ...u, status: 'ativa' as StatusUsuario }
              : u
          );
          msgRetorno = `Devolução registrada. Como o item atrasado foi devolvido, a conta foi desbloqueada.`;
        } else {
          // Simples: não suspende
          msgRetorno = `Devolução registrada com ${diasAtraso} dia(s) de atraso (política simples).`;
        }
      } else {
        // Devolvido no prazo: se estava bloqueado por engano ou liberado, manter ativo se sem outros atrasos
        const temOutroAtraso = emprestimosAtualizados.some(
          (e) => e.usuarioId === usuario.id && !e.devolvidoEm && e.diasAtraso > 0
        );
        if (!temOutroAtraso && usuario.status === 'bloqueada') {
          usuariosAtualizados = usuariosAtualizados.map((u) =>
            u.id === usuario.id ? { ...u, status: 'ativa' as StatusUsuario } : u
          );
        }
      }
    }

    // Notificação para o usuário
    const notif: Notificacao = {
      id: 'notif-' + Date.now() + Math.random(),
      usuarioId: emp.usuarioId,
      tipo: 'aprovacao',
      mensagem: `A devolução de "${item?.nome || 'item'}" foi confirmada pelo responsável.${comDefeito ? ' O item foi encaminhado para manutenção com registro de ocorrência.' : ''}`,
      lida: false,
      criadoEm: s.agora,
      destino: '/meus-emprestimos',
    };

    this.persistState({
      ...s,
      emprestimos: emprestimosAtualizados,
      itens: itensAtualizados,
      ocorrencias: novasOcorrencias,
      usuarios: usuariosAtualizados,
      notificacoes: [notif, ...s.notificacoes],
    });

    return { sucesso: true, mensagem: msgRetorno };
  }

  // ==========================================
  // CONFIGURAÇÕES E MANUTENÇÃO
  // ==========================================

  alterarPoliticaAtraso(novaPolitica: PoliticaAtraso) {
    this.persistState({
      ...this.state(),
      configuracao: {
        ...this.state().configuracao,
        politicaAtraso: novaPolitica,
      },
    });
  }

  marcarNotificacaoComoLida(notificacaoId: string) {
    const s = this.state();
    this.persistState({
      ...s,
      notificacoes: s.notificacoes.map((n) =>
        n.id === notificacaoId ? { ...n, lida: true } : n
      ),
    });
  }

  marcarTodasNotificacoesComoLidas(usuarioId: string) {
    const s = this.state();
    this.persistState({
      ...s,
      notificacoes: s.notificacoes.map((n) =>
        n.usuarioId === usuarioId ? { ...n, lida: true } : n
      ),
    });
  }

  resolverOcorrencia(ocorrenciaId: string, itemRetornarDisponivel = true) {
    const s = this.state();
    const ocorr = s.ocorrencias.find((o) => o.id === ocorrenciaId);
    if (!ocorr) return;

    const ocorrenciasAtualizadas = s.ocorrencias.map((o) =>
      o.id === ocorrenciaId
        ? { ...o, status: 'resolvida' as const, resolvidoEm: s.agora }
        : o
    );

    let itensAtualizados = s.itens;
    if (itemRetornarDisponivel) {
      itensAtualizados = s.itens.map((i) =>
        i.id === ocorr.itemId ? { ...i, status: 'disponivel' as StatusItem } : i
      );
    }

    this.persistState({
      ...s,
      ocorrencias: ocorrenciasAtualizadas,
      itens: itensAtualizados,
    });
  }

  salvarItem(item: Item) {
    const s = this.state();
    const existe = s.itens.some((i) => i.id === item.id);
    const itensAtualizados = existe
      ? s.itens.map((i) => (i.id === item.id ? item : i))
      : [item, ...s.itens];

    this.persistState({
      ...s,
      itens: itensAtualizados,
    });
  }

  salvarCategoria(cat: Categoria) {
    const s = this.state();
    const existe = s.categorias.some((c) => c.id === cat.id);
    const categoriasAtualizadas = existe
      ? s.categorias.map((c) => (c.id === cat.id ? cat : c))
      : [cat, ...s.categorias];

    this.persistState({
      ...s,
      categorias: categoriasAtualizadas,
    });
  }

  /**
   * RN03: Conta quantos itens daquela categoria o usuário possui atualmente em
   * solicitado, reservado, emprestado ou atrasado.
   */
  contarItensAtivosDoUsuarioNaCategoria(categoriaId: string, usuarioId?: string | null): number {
    const s = this.state();
    const uid = usuarioId !== undefined ? usuarioId : s.usuarioLogadoId;
    if (!uid) return 0;

    // 1) Itens em solicitações pendentes ou aprovadas (reservadas)
    const solicitacoesAtivas = s.solicitacoes.filter(
      (sol) => sol.solicitanteId === uid && (sol.status === 'pendente' || sol.status === 'aprovada')
    );
    const itensEmSolicitacao = solicitacoesAtivas
      .map((sol) => s.itens.find((i) => i.id === sol.itemId))
      .filter((i): i is Item => !!i && i.categoriaId === categoriaId);

    // 2) Itens em empréstimos ativos (emprestado ou atrasado)
    const emprestimosAtivos = s.emprestimos.filter(
      (emp) => emp.usuarioId === uid && !emp.devolvidoEm
    );
    const itensEmEmprestimo = emprestimosAtivos
      .map((emp) => s.itens.find((i) => i.id === emp.itemId))
      .filter((i): i is Item => !!i && i.categoriaId === categoriaId);

    const idsUnicos = new Set([
      ...itensEmSolicitacao.map((i) => i.id),
      ...itensEmEmprestimo.map((i) => i.id),
    ]);

    return idsUnicos.size;
  }

  /**
   * Valida se o usuário pode solicitar um item de uma determinada categoria
   * considerando limite (RN03) e status da conta (bloqueada/suspensa/pendente).
   */
  verificarPermissaoSolicitacao(categoriaId: string, usuarioId?: string | null): {
    pode: boolean;
    motivo?: string;
    itensAtuais: number;
    limiteMax: number;
  } {
    const s = this.state();
    const uid = usuarioId !== undefined ? usuarioId : s.usuarioLogadoId;
    const usuario = s.usuarios.find((u) => u.id === uid);
    const categoria = s.categorias.find((c) => c.id === categoriaId);

    const limiteMax = categoria?.limitePorPessoa ?? 1;
    const itensAtuais = this.contarItensAtivosDoUsuarioNaCategoria(categoriaId, uid);

    if (!usuario) {
      return { pode: false, motivo: 'Usuário não autenticado.', itensAtuais, limiteMax };
    }

    if (usuario.status === 'pendente') {
      return { pode: false, motivo: 'Sua conta ainda está aguardando aprovação.', itensAtuais, limiteMax };
    }

    if (usuario.status === 'bloqueada') {
      return { pode: false, motivo: 'Sua conta está bloqueada devido a pendência de item em atraso.', itensAtuais, limiteMax };
    }

    if (usuario.status === 'suspensa') {
      const ate = usuario.suspensoAte ? ` até ${formatDateShort(usuario.suspensoAte)}` : '';
      return { pode: false, motivo: `Sua conta está suspensa${ate}. Não é possível solicitar empréstimos.`, itensAtuais, limiteMax };
    }

    if (itensAtuais >= limiteMax) {
      return {
        pode: false,
        motivo: `Você já atingiu o limite de itens desta categoria (${itensAtuais} de ${limiteMax}).`,
        itensAtuais,
        limiteMax,
      };
    }

    return { pode: true, itensAtuais, limiteMax };
  }
}
