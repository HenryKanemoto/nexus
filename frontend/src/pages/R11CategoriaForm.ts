import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NexusStore } from '../store/nexus.store';
import { MatIconModule } from '@angular/material/icon';
import { Categoria } from '../types/models';

@Component({
  selector: 'app-r11-categoria-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  template: `
    <div class="space-y-6 font-['Sora',sans-serif] max-w-3xl">
      <!-- Cabeçalho (Wireframe R11) -->
      <div class="flex items-center justify-between pb-2 border-b border-slate-200">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-[#0E1A3A]">
            {{ modoEdicao() ? 'Editar categoria' : 'Nova categoria' }}
          </h1>
          <p class="text-xs text-slate-500 mt-1">
            Configuração de limites e prazos de empréstimo (RN02, RN03)
          </p>
        </div>
      </div>

      <!-- Alerta de Erro de Validação -->
      @if (erroValidacao()) {
        <div class="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center justify-between shadow-2xs animate-fadeIn">
          <div class="flex items-center gap-2">
            <mat-icon class="text-rose-600">error_outline</mat-icon>
            <span>{{ erroValidacao() }}</span>
          </div>
          <button
            type="button"
            (click)="erroValidacao.set(null)"
            class="text-rose-600 hover:text-rose-800 cursor-pointer p-1"
          >
            <mat-icon class="text-sm w-4 h-4 flex items-center justify-center">close</mat-icon>
          </button>
        </div>
      }

      <!-- Formulário (Wireframe R11) -->
      <div class="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
        <form (submit)="salvar($event)" class="space-y-5">
          <!-- Campo: Nome da categoria -->
          <div>
            <label for="nome" class="block text-xs font-bold text-slate-700 mb-1">
              Nome da categoria <span class="text-rose-500">*</span>
            </label>
            <input
              id="nome"
              type="text"
              [value]="nome()"
              (input)="nome.set($any($event.target).value)"
              placeholder="ex.: Projetores"
              required
              class="block w-full rounded-xl border border-slate-300 py-2.5 px-3.5 text-xs text-slate-800 focus:border-[#2F6BFF] focus:outline-hidden focus:ring-1 focus:ring-[#2F6BFF]"
            />
          </div>

          <!-- Linha: Prazo máximo (dias) | Limite por pessoa (Wireframe R11) -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Prazo máximo (dias) -->
            <div>
              <label for="prazoMaxDias" class="block text-xs font-bold text-slate-700 mb-1">
                Prazo máximo (dias) <span class="text-rose-500">*</span>
              </label>
              <input
                id="prazoMaxDias"
                type="number"
                min="1"
                step="1"
                [value]="prazoMaxDias()"
                (input)="prazoMaxDias.set($any($event.target).value)"
                placeholder="ex.: 1"
                required
                class="block w-full rounded-xl border border-slate-300 py-2.5 px-3.5 text-xs text-slate-800 font-bold focus:border-[#2F6BFF] focus:outline-hidden focus:ring-1 focus:ring-[#2F6BFF]"
              />
              <span class="text-[10px] text-slate-400 mt-0.5 block">Número inteiro maior que zero (RN02)</span>
            </div>

            <!-- Limite por pessoa -->
            <div>
              <label for="limitePorPessoa" class="block text-xs font-bold text-slate-700 mb-1">
                Limite por pessoa <span class="text-rose-500">*</span>
              </label>
              <input
                id="limitePorPessoa"
                type="number"
                min="1"
                step="1"
                [value]="limitePorPessoa()"
                (input)="limitePorPessoa.set($any($event.target).value)"
                placeholder="ex.: 1"
                required
                class="block w-full rounded-xl border border-slate-300 py-2.5 px-3.5 text-xs text-slate-800 font-bold focus:border-[#2F6BFF] focus:outline-hidden focus:ring-1 focus:ring-[#2F6BFF]"
              />
              <span class="text-[10px] text-slate-400 mt-0.5 block">Número inteiro maior que zero (RN03)</span>
            </div>
          </div>

          <!-- Caixa Explicativa com Borda Tracejada (Wireframe R11) -->
          <div class="p-4 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/70 text-xs text-slate-600 space-y-1.5">
            <p class="leading-relaxed">
              • O solicitante escolhe a devolução até o prazo máximo.
            </p>
            <p class="leading-relaxed">
              • Ninguém pode ter mais itens desta categoria que o limite.
            </p>
            <p class="text-[11px] text-slate-400 pt-1">
              Nota: Alterações valem apenas para novos pedidos solicitados a partir de agora.
            </p>
          </div>

          <!-- Botões de Ação (Wireframe R11: Salvar categoria | Cancelar) -->
          <div class="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-3">
            <button
              type="submit"
              class="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-900 border border-slate-300 font-bold text-xs uppercase tracking-wider transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
            >
              <mat-icon class="text-sm w-4 h-4 flex items-center justify-center">save</mat-icon>
              <span>Salvar categoria</span>
            </button>

            <button
              type="button"
              (click)="cancelar()"
              class="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs uppercase tracking-wider transition-colors text-center cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class R11CategoriaForm {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly store = inject(NexusStore);

  readonly catId = computed(() => this.route.snapshot.paramMap.get('id') || '');
  readonly modoEdicao = computed(() => !!this.catId());

  readonly nome = signal('');
  readonly prazoMaxDias = signal('1');
  readonly limitePorPessoa = signal('1');
  readonly erroValidacao = signal<string | null>(null);

  constructor() {
    const id = this.catId();
    if (id) {
      const cat = this.store.categorias().find((c) => c.id === id);
      if (cat) {
        this.nome.set(cat.nome);
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
      this.erroValidacao.set('O prazo máximo em dias deve ser um número inteiro maior que zero (RN02).');
      return;
    }

    const limite = parseInt(limiteStr, 10);
    if (isNaN(limite) || limite <= 0 || !Number.isInteger(Number(limiteStr))) {
      this.erroValidacao.set('O limite por pessoa deve ser um número inteiro maior que zero (RN03).');
      return;
    }

    const idFinal = this.catId() || 'cat-' + Date.now();
    const catSalva: Categoria = {
      id: idFinal,
      nome,
      prazoMaxDias: prazo,
      limitePorPessoa: limite,
      descricao: `Prazo máx: ${prazo}d · Limite: ${limite}/pessoa`,
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
