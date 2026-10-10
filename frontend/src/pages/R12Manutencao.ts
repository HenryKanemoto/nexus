import {ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';
import {RouterLink} from '@angular/router';
import {NexusStore} from '../store/nexus.store';
import {MatIconModule} from '@angular/material/icon';
import {formatDateShort} from '../lib/date-utils';
import {Item, Ocorrencia} from '../types/models';
import {ItemThumb} from '../components/item-thumb/item-thumb';

interface ItemManutencaoLinha {
  item: Item;
  ocorrencia?: Ocorrencia;
  devolvidoPorNome: string;
  dataRegistro: string;
}

@Component({
  selector: 'app-r12-manutencao',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatIconModule, ItemThumb],
  templateUrl: './R12Manutencao.html',
})
export class R12Manutencao {
  readonly store = inject(NexusStore);

  readonly mensagemSucesso = signal<string | null>(null);

  readonly itensEmManutencao = computed<ItemManutencaoLinha[]>(() => {
    const todosItens = this.store.itens();
    const todasOcorrencias = this.store.ocorrencias();
    const todosUsuarios = this.store.usuarios();
    const agoraDate = this.store.agora();

    const itensManut = todosItens.filter((i) => i.status === 'manutencao');

    return itensManut.map((item) => {
      const ocorr = todasOcorrencias.find((o) => o.itemId === item.id && o.status === 'aberta');
      let devolvidoPor = '—';
      let dataRegistro = agoraDate.toISOString();

      if (ocorr) {
        dataRegistro = ocorr.criadoEm;
        const user = todosUsuarios.find((u) => u.id === ocorr.usuarioId);
        if (user) {
          devolvidoPor = `${user.nome} (${user.perfil})`;
        }
      }

      return {
        item,
        ocorrencia: ocorr,
        devolvidoPorNome: devolvidoPor,
        dataRegistro,
      };
    });
  });

  formatarData(iso: string): string {
    return formatDateShort(iso);
  }

  marcarConsertado(linha: ItemManutencaoLinha) {
    if (linha.ocorrencia) {
      this.store.resolverOcorrencia(linha.ocorrencia.id, true);
    } else {
      this.store.salvarItem({
        ...linha.item,
        status: 'disponivel',
      });
    }

    this.mensagemSucesso.set(
      `"${linha.item.nome}" (${linha.item.patrimonio}) foi consertado e voltou ao catálogo como disponível.`
    );
  }
}
