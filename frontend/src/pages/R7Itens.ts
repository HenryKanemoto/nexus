import {ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';
import {iconeCategoria} from '../lib/categoria-utils';
import {Router, RouterLink} from '@angular/router';
import {NexusStore} from '../store/nexus.store';
import {MatIconModule} from '@angular/material/icon';
import {StatusBadge} from '../components/status-badge/status-badge';
import {ItemThumb} from '../components/item-thumb/item-thumb';

@Component({
  selector: 'app-r7-itens',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatIconModule, StatusBadge, ItemThumb],
  templateUrl: './R7Itens.html',
})
export class R7Itens {
  readonly store = inject(NexusStore);
  private readonly router = inject(Router);

  readonly termoBusca = signal('');
  readonly categoriaSelecionada = signal('todas');
  readonly situacaoSelecionada = signal('todas');

  readonly situacoes = [
    {valor: 'disponivel', rotulo: 'Disponível'},
    {valor: 'solicitado', rotulo: 'Solicitado'},
    {valor: 'reservado', rotulo: 'Reservado'},
    {valor: 'emprestado', rotulo: 'Emprestado'},
    {valor: 'atrasado', rotulo: 'Atrasado'},
    {valor: 'manutencao', rotulo: 'Manutenção'},
  ];

  readonly itensFiltrados = computed(() => {
    const termo = this.termoBusca().trim().toLowerCase();
    const catId = this.categoriaSelecionada();
    const situacao = this.situacaoSelecionada();

    return this.store.itens().filter((item) => {
      // Filtro de texto por nome ou patrimônio
      if (termo) {
        const nomeMatch = item.nome.toLowerCase().includes(termo);
        const patriMatch = item.patrimonio.toLowerCase().includes(termo);
        const qrMatch = item.codigoQr.toLowerCase().includes(termo);
        if (!nomeMatch && !patriMatch && !qrMatch) {
          return false;
        }
      }

      // Filtro por categoria
      if (catId !== 'todas' && item.categoriaId !== catId) {
        return false;
      }

      // Filtro por situação
      if (situacao !== 'todas' && item.status !== situacao) {
        return false;
      }

      return true;
    });
  });

  getCategoria(id: string) {
    return this.store.categorias().find((c) => c.id === id);
  }

  abrirItem(id: string) {
    // Redireciona para R9 Detalhes do item
    this.router.navigate(['/painel/itens', id]);
  }

  getIconeCategoria(categoriaId: string): string {
    return iconeCategoria(categoriaId);
  }
}
