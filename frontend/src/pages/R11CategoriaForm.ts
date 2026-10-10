import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NexusStore } from '../store/nexus.store';
import { MatIconModule } from '@angular/material/icon';
import { Categoria } from '../types/models';

@Component({
  selector: 'app-r11-categoria-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule, RouterLink],
  templateUrl: './R11CategoriaForm.html',
})
export class R11CategoriaForm {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly store = inject(NexusStore);

  readonly catId = computed(() => this.route.snapshot.paramMap.get('id') || '');
  readonly modoEdicao = computed(() => !!this.catId());

  readonly nome = signal('');
  readonly descricao = signal('');
  readonly prazoMaxDias = signal('1');
  readonly limitePorPessoa = signal('1');
  readonly erroValidacao = signal<string | null>(null);

  constructor() {
    const id = this.catId();
    if (id) {
      const cat = this.store.categorias().find((c) => c.id === id);
      if (cat) {
        this.nome.set(cat.nome);
        this.descricao.set(cat.descricao || '');
        this.prazoMaxDias.set(String(cat.prazoMaxDias));
        this.limitePorPessoa.set(String(cat.limitePorPessoa));
      }
    }
  }

  salvar(event: Event) {
    event.preventDefault();
    this.erroValidacao.set(null);

    const nome = this.nome().trim();
    const prazoStr = this.prazoMaxDias();
    const limiteStr = this.limitePorPessoa();

    if (!nome) {
      this.erroValidacao.set('Por favor, informe o nome da categoria.');
      return;
    }

    const prazo = parseInt(prazoStr, 10);
    if (isNaN(prazo) || prazo <= 0 || !Number.isInteger(Number(prazoStr))) {
      this.erroValidacao.set('O prazo máximo em dias deve ser um número inteiro maior que zero.');
      return;
    }

    const limite = parseInt(limiteStr, 10);
    if (isNaN(limite) || limite <= 0 || !Number.isInteger(Number(limiteStr))) {
      this.erroValidacao.set('O limite por pessoa deve ser um número inteiro maior que zero.');
      return;
    }

    const idFinal = this.catId() || 'cat-' + Date.now();
    const catSalva: Categoria = {
      id: idFinal,
      nome,
      prazoMaxDias: prazo,
      limitePorPessoa: limite,
      descricao: this.descricao().trim() || undefined,
    };

    this.store.salvarCategoria(catSalva);

    // Salvar e Cancelar voltam a R10
    this.router.navigate(['/painel/categorias']);
  }

  cancelar() {
    // Salvar e Cancelar voltam a R10
    this.router.navigate(['/painel/categorias']);
  }
}
