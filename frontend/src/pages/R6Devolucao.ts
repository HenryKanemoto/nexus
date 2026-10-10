import {ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';
import {iconeCategoria, plural} from '../lib/categoria-utils';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {NexusStore} from '../store/nexus.store';
import {MatIconModule} from '@angular/material/icon';
import {calculateDiasAtraso, formatDateShort} from '../lib/date-utils';
import {ItemThumb} from '../components/item-thumb/item-thumb';

@Component({
  selector: 'app-r6-devolucao',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatIconModule, ItemThumb],
  templateUrl: './R6Devolucao.html',
})
export class R6Devolucao {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly store = inject(NexusStore);

  readonly comDefeito = signal(false);
  readonly descricaoDefeito = signal('');
  readonly erroValidacao = signal<string | null>(null);

  readonly plural = plural;

  readonly itemId = computed(() => this.route.snapshot.paramMap.get('itemId') || '');

  readonly item = computed(() => {
    const id = this.itemId();
    return this.store.itens().find((i) => i.id === id) || null;
  });

  readonly emprestimo = computed(() => {
    const it = this.item();
    if (!it) return null;
    return (
      this.store.emprestimos().find(
        (e) => e.itemId === it.id && !e.devolvidoEm
      ) || null
    );
  });

  getUsuario(id?: string) {
    if (!id) return undefined;
    return this.store.usuarios().find((u) => u.id === id);
  }

  formatarData(iso?: string) {
    if (!iso) return '—';
    return formatDateShort(iso);
  }

  getDiasAtraso(devolucaoPrevista: string): number {
    return calculateDiasAtraso(devolucaoPrevista, this.store.agora());
  }

  executarConfirmacaoDevolucao() {
    const emp = this.emprestimo();
    const resp = this.store.usuarioLogado();
    const it = this.item();
    if (!emp) return;

    this.erroValidacao.set(null);
    if (this.comDefeito() && !this.descricaoDefeito().trim()) {
      this.erroValidacao.set('Por favor, informe a descrição do defeito identificado no equipamento.');
      return;
    }

    const res = this.store.registrarDevolucao(
      emp.id,
      resp?.id || 'user-marta',
      this.comDefeito(),
      this.comDefeito() ? this.descricaoDefeito().trim() : undefined
    );

    if (res.sucesso) {
      // Volta ao painel com mensagem de sucesso
      this.router.navigate(['/painel'], {
        state: { sucesso: `Devolução registrada com sucesso para "${it?.nome}". ${res.mensagem}` },
      });
    }
  }

  getIconeCategoria(categoriaId: string): string {
    return iconeCategoria(categoriaId);
  }
}
