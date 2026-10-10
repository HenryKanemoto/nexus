import {ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';
import {NexusStore} from '../store/nexus.store';
import {MatIconModule} from '@angular/material/icon';
import {PoliticaAtraso} from '../types/models';

@Component({
  selector: 'app-r16-configuracoes',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  templateUrl: './R16Configuracoes.html',
})
export class R16Configuracoes {
  readonly store = inject(NexusStore);

  readonly politicaAtual = computed(() => this.store.configuracao().politicaAtraso);
  readonly politicaSelecionada = signal<PoliticaAtraso>('rigida');
  readonly mensagemSucesso = signal<string | null>(null);

  readonly opcoes: {valor: PoliticaAtraso; titulo: string; descricao: string}[] = [
    {valor: 'simples', titulo: 'Só marcar o atraso', descricao: 'O empréstimo aparece como atrasado no painel. Ninguém é bloqueado.'},
    {valor: 'intermediaria', titulo: 'Bloquear até devolver', descricao: 'A pessoa não faz novos pedidos enquanto estiver com um item atrasado.'},
    {valor: 'rigida', titulo: 'Bloquear e suspender', descricao: 'Bloqueia até devolver e depois suspende pelo mesmo número de dias de atraso.'},
  ];

  constructor() {
    this.politicaSelecionada.set(this.politicaAtual());
  }

  selecionar(pol: PoliticaAtraso) {
    this.politicaSelecionada.set(pol);
  }

  salvar() {
    const novaPolitica = this.politicaSelecionada();
    this.store.alterarPoliticaAtraso(novaPolitica);
    this.mensagemSucesso.set(
      'Política de atraso atualizada.'
    );
  }
}
