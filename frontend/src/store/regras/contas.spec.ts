import {aprovarUsuario, bloquearUsuario, cadastrarUsuario, desbloquearUsuario, login, recusarUsuario} from './contas';
import {buscar, estadoDeTeste, usuario} from './estado-de-teste';

describe('regras de conta', () => {
  describe('RN08: cadastro', () => {
    const dados = {nome: 'Rafa Nunes', email: 'rafa@escola.edu.br', matricula: 'alu-9', perfil: 'aluno' as const};

    it('cria conta pendente e avisa os responsáveis', () => {
      const {estado, resultado} = cadastrarUsuario(estadoDeTeste(), dados);
      expect(resultado.sucesso).toBe(true);
      expect(buscar.usuario(estado, resultado.usuarioId!)).toMatchObject({status: 'pendente', perfil: 'aluno'});
      expect(estado.notificacoes[0]).toMatchObject({usuarioId: 'resp', tipo: 'nova_conta'});
    });

    it('recusa e-mail ou matrícula repetidos, sem diferenciar maiúsculas', () => {
      const s = cadastrarUsuario(estadoDeTeste(), dados).estado;
      expect(cadastrarUsuario(s, {...dados, matricula: 'X'}).resultado).toMatchObject({sucesso: false, campo: 'email'});
      expect(cadastrarUsuario(s, {...dados, email: 'outro@escola.edu.br', matricula: 'ALU-9'}).resultado).toMatchObject({
        sucesso: false,
        campo: 'matricula',
      });
    });

    it('aprovar ativa a conta; recusar marca como recusada; ambos notificam', () => {
      const {estado, resultado} = cadastrarUsuario(estadoDeTeste(), dados);
      const id = resultado.usuarioId!;
      expect(buscar.usuario(aprovarUsuario(estado, id), id).status).toBe('ativa');
      expect(buscar.usuario(recusarUsuario(estado, id, 'Matrícula inválida'), id).status).toBe('recusada');
      expect(recusarUsuario(estado, id, 'Matrícula inválida').notificacoes[0].mensagem).toContain('Matrícula inválida');
    });
  });

  it('bloquear e desbloquear (desbloqueio também encerra suspensão)', () => {
    const s = estadoDeTeste({usuarios: [usuario('aluna', {status: 'suspensa', suspensoAte: '2026-10-20T00:00:00.000Z'})]});
    expect(buscar.usuario(bloquearUsuario(s, 'aluna'), 'aluna').status).toBe('bloqueada');
    expect(buscar.usuario(desbloquearUsuario(s, 'aluna'), 'aluna')).toMatchObject({status: 'ativa', suspensoAte: undefined});
  });

  describe('login simulado', () => {
    it('entra por e-mail ou matrícula, sem diferenciar maiúsculas', () => {
      expect(login(estadoDeTeste(), 'ALUNA@escola.edu.br', '123456').estado.usuarioLogadoId).toBe('aluna');
      expect(login(estadoDeTeste(), 'aluna', '123456').estado.usuarioLogadoId).toBe('aluna');
    });

    it('recusa usuário desconhecido e senha errada', () => {
      expect(login(estadoDeTeste(), 'ninguem@escola.edu.br', '123456').resultado.sucesso).toBe(false);
      expect(login(estadoDeTeste(), 'aluna', 'errada').resultado.sucesso).toBe(false);
    });
  });
});
