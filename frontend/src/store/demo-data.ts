import {NexusState} from './estado';
import {Categoria, Emprestimo, Item, Notificacao, Ocorrencia, Solicitacao, Usuario} from '../types/models';

/**
 * Estado inicial de demonstração: 3 usuários, 5 categorias e 15 itens.
 * Os mesmos itens são semeados no banco pela migration SeedItensDemonstracao do backend.
 */
export function getInitialDemoState(): NexusState {
  // Relógio simulado começa hoje às 06:00
  const baseDate = new Date();
  baseDate.setHours(6, 0, 0, 0);
  const agoraIso = baseDate.toISOString();

  // Usuários
  const usuarios: Usuario[] = [
    {
      id: 'user-enzo',
      nome: 'Enzo Capiel',
      email: 'enzo@escola.edu.br',
      matricula: 'RESP-001',
      senha: '123456',
      perfil: 'responsavel',
      status: 'ativa',
      criadoEm: agoraIso,
    },
    {
      id: 'user-gusta',
      nome: 'Gustavo Machado',
      email: 'gustavo@escola.edu.br',
      matricula: 'PROF-001',
      senha: '123456',
      perfil: 'professor',
      status: 'ativa',
      criadoEm: agoraIso,
    },
    {
      id: 'user-camila',
      nome: 'Camila Cristina',
      email: 'camila@escola.edu.br',
      matricula: 'ALU-0001',
      senha: '123456',
      perfil: 'aluno',
      status: 'ativa',
      criadoEm: agoraIso,
    }
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
      prazoMaxDias: 2,
      limitePorPessoa: 1,
      descricao: 'Computadores portáteis para atividades pedagógicas e acadêmicas.',
    },
    {
      id: 'cat-eletronica',
      nome: 'Kits de eletrônica',
      prazoMaxDias: 7,
      limitePorPessoa: 3,
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
      prazoMaxDias: 2,
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
      status: 'disponivel',
    },
    {
      id: 'item-03',
      categoriaId: 'cat-notebooks',
      nome: 'Notebook Dell Latitude 3420 #1',
      descricao: 'Intel Core i5 11ª Gen, 16GB RAM, SSD 256GB, tela 14".',
      patrimonio: 'NX-0003',
      codigoQr: 'NX-NOTE-001',
      status: 'disponivel', // Emprestado para Ana Souza
    },
    {
      id: 'item-04',
      categoriaId: 'cat-notebooks',
      nome: 'Notebook Dell Latitude 3420 #2',
      descricao: 'Intel Core i5 11ª Gen, 16GB RAM, SSD 256GB, tela 14".',
      patrimonio: 'NX-0004',
      codigoQr: 'NX-NOTE-002',
      status: 'disponivel', // Bruno Lima atrasado há 2 dias
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
      status: 'disponivel', // Solicitado pelo Prof. Carlos há 3h (permite lembrete)
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
      status: 'disponivel',
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
      status: 'disponivel',
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
  const solicitacoes: Solicitacao[] = [];

  // Empréstimos
  const emprestimos: Emprestimo[] = [];

  // Ocorrências
  const ocorrencias: Ocorrencia[] = [];

  // Notificações
  const notificacoes: Notificacao[] = [];

  return {
    agora: agoraIso,
    usuarioLogadoId: '',
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
