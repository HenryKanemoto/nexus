import {ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {NexusStore} from '../store/nexus.store';
import {MatIconModule} from '@angular/material/icon';
import {Item} from '../types/models';

@Component({
  selector: 'app-r8-item-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatIconModule],
  template: `
    <div class="space-y-6 font-['Sora',sans-serif] max-w-5xl">
      <!-- Cabeçalho (Wireframe R8) -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-[#0E1A3A]">
            {{ modoEdicao() ? 'Editar item' : 'Novo item' }}
          </h1>
          <p class="text-xs text-slate-500 mt-1">
            {{ modoEdicao() ? 'Atualize as informações do equipamento' : 'Cadastre um novo equipamento no acervo escolar' }}
          </p>
        </div>

        <!-- Sininho -> R17 -->
        <a
          routerLink="/painel/notificacoes"
          class="relative p-2 rounded-xl text-slate-600 hover:text-[#0E1A3A] hover:bg-slate-100 transition-colors"
          title="Notificações"
        >
          <mat-icon class="text-2xl">notifications</mat-icon>
          @if (store.totalNaoLidas() > 0) {
            <span class="absolute top-1 right-1 flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold tabular-nums ring-2 ring-white">
              {{ store.totalNaoLidas() }}
            </span>
          }
        </a>
      </div>

      <!-- Alerta de Erro de Validação -->
      @if (erroValidacao()) {
        <div class="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center justify-between shadow-2xs">
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

      <!-- Formulário com Layout Lado a Lado (Wireframe R8) -->
      <div class="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
        <form (submit)="salvar($event)" class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <!-- Coluna Esquerda: Campos Textuais (Wireframe R8) -->
          <div class="lg:col-span-8 space-y-4">
            <!-- Campo Nome -->
            <div>
              <label for="nome" class="block text-xs font-bold text-slate-700 mb-1">
                Nome <span class="text-rose-500">*</span>
              </label>
              <input
                id="nome"
                type="text"
                [value]="nome()"
                (input)="nome.set($any($event.target).value)"
                placeholder="Ex.: Projetor Epson PowerLite X49"
                required
                class="block w-full rounded-xl border border-slate-300 py-2.5 px-3.5 text-xs text-slate-800 focus:border-[#2F6BFF] focus:outline-hidden focus:ring-1 focus:ring-[#2F6BFF]"
              />
            </div>

            <!-- Campo Descrição -->
            <div>
              <label for="descricao" class="block text-xs font-bold text-slate-700 mb-1">
                Descrição
              </label>
              <textarea
                id="descricao"
                rows="4"
                [value]="descricao()"
                (input)="descricao.set($any($event.target).value)"
                placeholder="Detalhes técnicos, acessórios inclusos, recomendações de uso..."
                class="block w-full rounded-xl border border-slate-300 py-2.5 px-3.5 text-xs text-slate-800 focus:border-[#2F6BFF] focus:outline-hidden focus:ring-1 focus:ring-[#2F6BFF]"
              ></textarea>
            </div>

            <!-- Linha: Categoria e Patrimônio (Wireframe R8) -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <!-- Campo Categoria -->
              <div>
                <label for="categoria" class="block text-xs font-bold text-slate-700 mb-1">
                  Categoria <span class="text-rose-500">*</span>
                </label>
                <select
                  id="categoria"
                  [value]="categoriaId()"
                  (change)="categoriaId.set($any($event.target).value)"
                  required
                  class="block w-full rounded-xl border border-slate-300 py-2.5 px-3 text-xs text-slate-800 focus:border-[#2F6BFF] focus:outline-hidden focus:ring-1 focus:ring-[#2F6BFF] cursor-pointer"
                >
                  @for (cat of store.categorias(); track cat.id) {
                    <option [value]="cat.id">
                      {{ cat.nome }} ({{ cat.prazoMaxDias }}d máx)
                    </option>
                  }
                </select>
              </div>

              <!-- Campo Patrimônio (Único) -->
              <div>
                <label for="patrimonio" class="block text-xs font-bold text-slate-700 mb-1">
                  Patrimônio <span class="text-rose-500">*</span> (único)
                </label>
                <input
                  id="patrimonio"
                  type="text"
                  [value]="patrimonio()"
                  (input)="patrimonio.set($any($event.target).value)"
                  placeholder="Ex.: NX-PROJ-004 ou NX-0016"
                  required
                  class="block w-full rounded-xl border border-slate-300 py-2.5 px-3.5 text-xs font-mono font-semibold uppercase text-slate-800 focus:border-[#2F6BFF] focus:outline-hidden focus:ring-1 focus:ring-[#2F6BFF]"
                />
              </div>
            </div>

            <!-- Botões de Ação (Wireframe R8: Salvar item | Cancelar) -->
            <div class="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="submit"
                class="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-900 border border-slate-300 font-bold text-xs uppercase tracking-wider transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
              >
                <mat-icon class="text-sm w-4 h-4 flex items-center justify-center">save</mat-icon>
                <span>Salvar item</span>
              </button>

              <button
                type="button"
                (click)="cancelar()"
                class="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs uppercase tracking-wider transition-colors text-center cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>

          <!-- Coluna Direita: Foto (Wireframe R8) -->
          <div class="lg:col-span-4 space-y-3">
            <span class="block text-xs font-bold text-slate-700">
              Foto
            </span>

            <!-- Caixa de Foto com X / Imagem carregada (Wireframe R8) -->
            <div class="relative w-full aspect-square rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 overflow-hidden flex flex-col items-center justify-center p-4">
              @if (fotoDataUrl()) {
                <img
                  [src]="fotoDataUrl()"
                  alt="Foto do item"
                  class="w-full h-full object-contain rounded-xl"
                />
                <button
                  type="button"
                  (click)="fotoDataUrl.set(null)"
                  class="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white hover:bg-rose-600 transition-colors cursor-pointer"
                  title="Remover foto"
                >
                  <mat-icon class="text-xs w-4 h-4 flex items-center justify-center">close</mat-icon>
                </button>
              } @else {
                <!-- Placeholder visual (quadrado com linhas em X e ícone de câmera) -->
                <div class="text-center space-y-2 text-slate-400 select-none">
                  <mat-icon class="text-5xl text-slate-300">add_photo_alternate</mat-icon>
                  <p class="text-[11px] font-medium text-slate-400">
                    Nenhuma foto selecionada
                  </p>
                </div>
              }
            </div>

            <!-- Botão "Escolher foto" (Wireframe R8) -->
            <div>
              <input
                type="file"
                #fileInput
                accept="image/*"
                (change)="onFotoSelecionada($event)"
                class="hidden"
              />
              <button
                type="button"
                (click)="fileInput.click()"
                class="w-full py-2.5 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
              >
                <mat-icon class="text-sm w-4 h-4 flex items-center justify-center">upload</mat-icon>
                <span>Escolher foto</span>
              </button>
              <p class="text-[10px] text-slate-400 text-center mt-1">
                Upload local armazenado no navegador (Data URL)
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class R8ItemForm {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly store = inject(NexusStore);

  readonly itemId = computed(() => this.route.snapshot.paramMap.get('id') || '');
  readonly modoEdicao = computed(() => !!this.itemId());

  readonly nome = signal('');
  readonly descricao = signal('');
  readonly categoriaId = signal('');
  readonly patrimonio = signal('');
  readonly fotoDataUrl = signal<string | null>(null);
  readonly erroValidacao = signal<string | null>(null);

  constructor() {
    const id = this.itemId();
    if (id) {
      const item = this.store.itens().find((i) => i.id === id);
      if (item) {
        this.nome.set(item.nome);
        this.descricao.set(item.descricao || '');
        this.categoriaId.set(item.categoriaId);
        this.patrimonio.set(item.patrimonio);
        this.fotoDataUrl.set(item.foto || null);
      }
    } else {
      // Inicia com a primeira categoria disponível
      const cats = this.store.categorias();
      if (cats.length > 0) {
        this.categoriaId.set(cats[0].id);
      }
      // Sugere patrimônio sequencial
      const proximoNum = this.store.itens().length + 1;
      this.patrimonio.set(`NX-${String(proximoNum).padStart(4, '0')}`);
    }
  }

  onFotoSelecionada(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        this.fotoDataUrl.set(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  salvar(event: Event) {
    event.preventDefault();
    this.erroValidacao.set(null);

    const nome = this.nome().trim();
    const catId = this.categoriaId();
    const patri = this.patrimonio().trim().toUpperCase();
    const desc = this.descricao().trim();

    if (!nome) {
      this.erroValidacao.set('Por favor, informe o nome do equipamento.');
      return;
    }
    if (!patri) {
      this.erroValidacao.set('Por favor, informe o patrimônio.');
      return;
    }

    const idAtual = this.itemId();

    // Validação de unicidade do patrimônio (único)
    const patriDuplicado = this.store.itens().find(
      (i) => i.patrimonio.toUpperCase() === patri && i.id !== idAtual
    );
    if (patriDuplicado) {
      this.erroValidacao.set(`O patrimônio "${patri}" já está cadastrado para o item "${patriDuplicado.nome}". Informe um código único.`);
      return;
    }

    let idFinal = idAtual;
    let codigoQr = '';
    const statusItem = this.store.itens().find((i) => i.id === idAtual)?.status || 'disponivel';

    if (!idAtual) {
      // Criando novo item
      idFinal = 'item-' + Date.now();
      // Geração de codigoQr único automático
      const cat = this.store.categorias().find((c) => c.id === catId);
      const prefix = cat ? cat.nome.slice(0, 4).toUpperCase().replace(/[^A-Z]/g, 'ITM') : 'ITM';
      const randomSuf = Math.floor(100 + Math.random() * 900);
      codigoQr = `NX-${prefix}-${randomSuf}`;
    } else {
      // Editando: preserva o código QR existente
      const itemExistente = this.store.itens().find((i) => i.id === idAtual);
      codigoQr = itemExistente?.codigoQr || patri;
    }

    const itemParaSalvar: Item = {
      id: idFinal,
      nome,
      categoriaId: catId,
      patrimonio: patri,
      codigoQr,
      descricao: desc,
      foto: this.fotoDataUrl() || undefined,
      status: statusItem,
    };

    this.store.salvarItem(itemParaSalvar);

    // Conforme Wireframe R8: Salvar -> R9
    this.router.navigate(['/painel/itens', idFinal]);
  }

  cancelar() {
    // Conforme Wireframe R8: Cancelar -> R7
    this.router.navigate(['/painel/itens']);
  }
}
