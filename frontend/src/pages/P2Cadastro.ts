import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {NexusStore} from '../store/nexus.store';
import {MatIconModule} from '@angular/material/icon';
import {RelogioFlutuante} from '../components/relogio-flutuante/relogio-flutuante';
import {Logo} from '../components/logo/logo';

interface ErrosFormulario {
  nome?: string;
  email?: string;
  matricula?: string;
  perfil?: string;
  senha?: string;
  confirmacaoSenha?: string;
  geral?: string;
}

@Component({
  selector: 'app-p2-cadastro',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatIconModule, RelogioFlutuante, Logo],
  templateUrl: './P2Cadastro.html',
})
export class P2Cadastro {
  private readonly store = inject(NexusStore);
  private readonly router = inject(Router);

  readonly nome = signal('');
  readonly email = signal('');
  readonly matricula = signal('');
  readonly perfil = signal<'aluno' | 'professor'>('aluno');
  readonly senha = signal('');
  readonly confirmacaoSenha = signal('');
  readonly mostrarSenha = signal(false);

  readonly erros = signal<ErrosFormulario>({});

  readonly perfis = [
    {valor: 'aluno' as const, rotulo: 'Aluno', icone: 'school'},
    {valor: 'professor' as const, rotulo: 'Professor', icone: 'co_present'},
  ];

  alternarMostrarSenha() {
    this.mostrarSenha.update((v) => !v);
  }

  limparErro(campo: keyof ErrosFormulario) {
    this.erros.update((atual) => {
      const novo = {...atual};
      delete novo[campo];
      delete novo.geral;
      return novo;
    });
  }

  submeterCadastro(event: Event) {
    event.preventDefault();

    const nomeVal = this.nome().trim();
    const emailVal = this.email().trim();
    const matriculaVal = this.matricula().trim().toUpperCase();
    const perfilVal = this.perfil();
    const senhaVal = this.senha().trim();
    const confirmacaoVal = this.confirmacaoSenha().trim();

    const novosErros: ErrosFormulario = {};

    // 1. Validação de Nome
    if (!nomeVal) {
      novosErros.nome = 'Informe seu nome completo.';
    } else if (nomeVal.length < 3) {
      novosErros.nome = 'O nome deve ter pelo menos 3 caracteres.';
    }

    // 2. Validação de E-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailVal) {
      novosErros.email = 'Informe seu e-mail institucional.';
    } else if (!emailRegex.test(emailVal)) {
      novosErros.email = 'Informe um formato de e-mail válido.';
    } else {
      // Unicidade de e-mail
      const existeEmail = this.store.usuarios().some(
        (u) => u.email.toLowerCase() === emailVal.toLowerCase()
      );
      if (existeEmail) {
        novosErros.email = 'Este e-mail institucional já está em uso.';
      }
    }

    // 3. Validação de Matrícula
    if (!matriculaVal) {
      novosErros.matricula = 'Informe sua matrícula.';
    } else if (matriculaVal.length < 3) {
      novosErros.matricula = 'A matrícula deve ter pelo menos 3 caracteres.';
    } else {
      // Unicidade de matrícula
      const existeMatricula = this.store.usuarios().some(
        (u) => u.matricula.toUpperCase() === matriculaVal
      );
      if (existeMatricula) {
        novosErros.matricula = 'Esta matrícula já está cadastrada no sistema.';
      }
    }

    // 4. Validação de Senha
    if (!senhaVal) {
      novosErros.senha = 'Defina uma senha para sua conta.';
    } else if (senhaVal.length < 6) {
      novosErros.senha = 'A senha deve conter pelo menos 6 caracteres.';
    }

    // 5. Validação de Confirmação de Senha
    if (!confirmacaoVal) {
      novosErros.confirmacaoSenha = 'Confirme sua senha.';
    } else if (senhaVal && senhaVal !== confirmacaoVal) {
      novosErros.confirmacaoSenha = 'As senhas digitadas não coincidem.';
    }

    if (Object.keys(novosErros).length > 0) {
      this.erros.set(novosErros);
      return;
    }

    // Chamada ao Store para registrar e emitir notificação 'nova_conta'
    const resultado = this.store.cadastrarUsuario({
      nome: nomeVal,
      email: emailVal,
      matricula: matriculaVal,
      perfil: perfilVal,
      senha: senhaVal,
    });

    if (resultado.sucesso) {
      // Redireciona para /aguardando (P3)
      this.router.navigate(['/aguardando'], {
        state: {
          nome: nomeVal,
          email: emailVal,
          matricula: matriculaVal,
          perfil: perfilVal,
        },
      });
    } else {
      if (resultado.campo === 'email') {
        this.erros.set({email: resultado.mensagem});
      } else if (resultado.campo === 'matricula') {
        this.erros.set({matricula: resultado.mensagem});
      } else {
        this.erros.set({geral: resultado.mensagem});
      }
    }
  }
}
