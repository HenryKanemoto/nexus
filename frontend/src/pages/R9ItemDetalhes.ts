import {
  ChangeDetectionStrategy,
  Component,
  afterNextRender,
  computed,
  inject,
  signal,
} from '@angular/core';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {NexusStore} from '../store/nexus.store';
import {MatIconModule} from '@angular/material/icon';
import {StatusBadge} from '../components/status-badge/status-badge';
import {formatDateShort} from '../lib/date-utils';
import QRCode from 'qrcode';

@Component({
  selector: 'app-r9-item-detalhes',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatIconModule, StatusBadge],
  template: `
    <div class="space-y-8 font-['Sora',sans-serif] max-w-7xl">
      @if (item(); as i) {
        @let cat = categoria();

        <!-- Topo da Ficha: Nome do Item + Selo de Situação + Ações (Wireframe R9) -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div class="flex flex-wrap items-center gap-3">
            <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0E1A3A]">
              {{ i.nome }}
            </h1>
            <!-- Selo de Situação (Wireframe R9) -->
            <app-status-badge [status]="i.status"></app-status-badge>
          </div>

          <div class="flex items-center gap-3">
            <!-- Botão Editar (Wireframe R9 -> R8) -->
            <a
              [routerLink]="['/painel/itens', i.id, 'editar']"
              class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-bold text-xs flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
            >
              <mat-icon class="text-sm w-4 h-4 flex items-center justify-center">edit</mat-icon>
              <span>Editar</span>
            </a>

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
        </div>

        <!-- Bloco Superior: Dados do Item + QR Code Grande (Wireframe R9) -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <!-- Esquerda/Centro: Foto e Metadados (Wireframe R9) -->
          <div class="lg:col-span-8 bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
            <div class="flex flex-col sm:flex-row gap-6 items-start">
              <!-- Foto / Ilustração do Item (Quadrado) -->
              <div class="w-full sm:w-48 aspect-square rounded-2xl border-2 border-slate-200 bg-slate-50 flex flex-col items-center justify-center shrink-0 overflow-hidden relative shadow-2xs">
                @if (i.foto) {
                  <img [src]="i.foto" [alt]="i.nome" class="w-full h-full object-cover" />
                } @else {
                  <div class="w-20 h-20 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-[#2F6BFF] mb-2 shadow-2xs">
                    <mat-icon class="text-4xl">{{ getIconeCategoria(i.categoriaId) }}</mat-icon>
                  </div>
                  <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sem foto</span>
                }
              </div>

              <!-- Metadados Textuais: Categoria | Patrimônio | Descrição (Wireframe R9) -->
              <div class="space-y-4 flex-1 text-xs sm:text-sm">
                <div>
                  <span class="text-slate-500 text-xs block font-medium">Categoria:</span>
                  <strong class="text-slate-800 font-bold text-base sm:text-lg">
                    {{ cat?.nome || '—' }}
                  </strong>
                  <span class="block text-[11px] text-slate-500 mt-0.5">
                    Prazo máximo de {{ cat?.prazoMaxDias }} dias · Limite de {{ cat?.limitePorPessoa }} por pessoa
                  </span>
                </div>

                <div>
                  <span class="text-slate-500 text-xs block font-medium">Patrimônio:</span>
                  <strong class="font-mono text-slate-900 font-extrabold text-sm sm:text-base">
                    {{ i.patrimonio }}
                  </strong>
                </div>

                <div>
                  <span class="text-slate-500 text-xs block font-medium">Descrição:</span>
                  <p class="text-slate-700 leading-relaxed mt-1 text-xs">
                    {{ i.descricao || 'Nenhuma descrição técnica informada para este equipamento.' }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Direita: QR Code Grande + Botão "Imprimir etiqueta" (Wireframe R9) -->
          <div class="lg:col-span-4 bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 text-center space-y-4 flex flex-col items-center">
            <!-- Moldura do QR Code -->
            <div class="p-3 bg-white rounded-2xl border-2 border-slate-800 shadow-sm inline-block">
              @if (qrCodeUrl()) {
                <img
                  [src]="qrCodeUrl()"
                  [alt]="'QR Code de ' + i.patrimonio"
                  class="w-48 h-48 sm:w-52 sm:h-52 object-contain"
                />
              } @else {
                <div class="w-48 h-48 flex items-center justify-center text-slate-400">
                  <mat-icon class="text-4xl animate-spin">sync</mat-icon>
                </div>
              }
            </div>

            <!-- Dados da Etiqueta -->
            <div class="space-y-1">
              <span class="font-mono font-black text-sm text-[#0E1A3A] tracking-wider block">
                {{ i.patrimonio }}
              </span>
              <span class="text-[11px] font-mono text-slate-500 block">
                Código: {{ i.codigoQr }}
              </span>
            </div>

            <!-- Botão "Imprimir etiqueta" (Wireframe R9) -->
            <button
              type="button"
              (click)="abrirModalEtiqueta()"
              class="w-full py-2.5 px-4 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold text-xs uppercase tracking-wider transition-colors shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <mat-icon class="text-sm w-4 h-4 flex items-center justify-center">print</mat-icon>
              <span>Imprimir etiqueta</span>
            </button>
          </div>
        </div>

        <!-- Bloco Inferior: Histórico de Empréstimos & Ocorrências (Wireframe R9) -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <!-- Coluna Esquerda: Histórico de Empréstimos do Item (Wireframe R9) -->
          <div class="lg:col-span-8 bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-4">
            <div class="flex items-center justify-between">
              <h2 class="text-base font-bold text-[#0E1A3A]">
                Histórico de empréstimos
              </h2>
              <span class="text-xs text-slate-500 font-medium">
                {{ historicoEmprestimos().length }} registro(s)
              </span>
            </div>

            <div class="overflow-x-auto rounded-xl border border-slate-200">
              <table class="w-full text-xs text-left">
                <thead class="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th class="p-3 w-1/4">Pessoa</th>
                    <th class="p-3 w-28">Retirada</th>
                    <th class="p-3 w-28">Devolução</th>
                    <th class="p-3">Como voltou</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  @for (emp of historicoEmprestimos(); track emp.id) {
                    @let user = getUsuario(emp.usuarioId);
                    @let statusVolta = getStatusComoVoltou(emp);
                    <tr class="hover:bg-slate-50/60">
                      <!-- Pessoa -->
                      <td class="p-3">
                        <strong class="font-bold text-slate-800 block">{{ user?.nome || 'Usuário' }}</strong>
                        <span class="text-[10px] text-slate-400 capitalize">{{ user?.perfil }} · {{ user?.matricula }}</span>
                      </td>

                      <!-- Retirada -->
                      <td class="p-3 tabular-nums text-slate-600">
                        {{ formatarData(emp.retiradoEm) }}
                      </td>

                      <!-- Devolução -->
                      <td class="p-3 tabular-nums text-slate-600">
                        {{ emp.devolvidoEm ? formatarData(emp.devolvidoEm) : 'Em andamento' }}
                      </td>

                      <!-- Como voltou (Wireframe R9) -->
                      <td class="p-3">
                        <span class="px-2 py-0.5 rounded text-[11px] font-semibold {{ statusVolta.classeCss }}">
                          {{ statusVolta.texto }}
                        </span>
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="4" class="p-8 text-center text-xs text-slate-400 italic">
                        Nenhum empréstimo registrado para este equipamento até o momento.
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>

          <!-- Coluna Direita: Ocorrências (Wireframe R9) -->
          <div class="lg:col-span-4 bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-4">
            <div class="flex items-center justify-between">
              <h2 class="text-base font-bold text-[#0E1A3A]">
                Ocorrências
              </h2>
              <span class="text-xs text-slate-500 font-medium">
                {{ ocorrenciasItem().length }}
              </span>
            </div>

            <div class="space-y-3">
              @for (oc of ocorrenciasItem(); track oc.id) {
                <div class="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 space-y-1.5 text-xs">
                  <div class="flex items-center justify-between">
                    <span class="font-mono text-[10px] text-slate-500">{{ formatarData(oc.criadoEm) }}</span>
                    <span
                      class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider {{
                        oc.status === 'aberta' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-emerald-100 text-emerald-900'
                      }}"
                    >
                      {{ oc.status }}
                    </span>
                  </div>
                  <p class="text-slate-800 leading-relaxed font-medium">
                    {{ oc.descricao }}
                  </p>
                </div>
              } @empty {
                <div class="p-8 rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-400 italic">
                  Nenhuma ocorrência registrada para este item.
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Modal Versão de Impressão de Etiqueta (Wireframe R9: só com QR, nome e patrimônio) -->
        @if (modalEtiquetaAberta()) {
          <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-2xs p-4 animate-fadeIn">
            <div class="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-sm w-full p-6 text-center space-y-6">
              <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                <span class="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Etiqueta de Impressão
                </span>
                <button
                  type="button"
                  (click)="modalEtiquetaAberta.set(false)"
                  class="text-slate-400 hover:text-slate-700 cursor-pointer p-1"
                >
                  <mat-icon class="text-sm w-4 h-4 flex items-center justify-center">close</mat-icon>
                </button>
              </div>

              <!-- Cartão de Etiqueta Limpo (Próprio para Impressão) -->
              <div id="etiqueta-impressao" class="p-6 rounded-2xl border-2 border-black bg-white space-y-3 mx-auto">
                <div class="font-black text-xs uppercase tracking-widest text-slate-900 border-b border-black pb-1">
                  NEXUS ACERVO ESCOLAR
                </div>

                @if (qrCodeUrl()) {
                  <img
                    [src]="qrCodeUrl()"
                    alt="QR Code"
                    class="w-40 h-40 mx-auto object-contain"
                  />
                }

                <div class="space-y-0.5">
                  <h3 class="font-extrabold text-sm text-black leading-tight">
                    {{ i.nome }}
                  </h3>
                  <p class="font-mono font-bold text-xs text-black">
                    {{ i.patrimonio }}
                  </p>
                </div>
              </div>

              <!-- Botões do Diálogo -->
              <div class="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  (click)="executarImpressao()"
                  class="px-5 py-2.5 rounded-xl bg-[#2F6BFF] hover:bg-blue-600 text-white font-bold text-xs uppercase tracking-wider shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <mat-icon class="text-xs w-4 h-4 flex items-center justify-center">print</mat-icon>
                  <span>Imprimir</span>
                </button>

                <button
                  type="button"
                  (click)="modalEtiquetaAberta.set(false)"
                  class="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        }
      } @else {
        <div class="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <mat-icon class="text-4xl text-slate-400">help_outline</mat-icon>
          <h2 class="text-lg font-bold text-slate-800">Equipamento Não Encontrado</h2>
          <p class="text-xs text-slate-500">
            O item solicitado não existe no inventário escolar.
          </p>
          <a
            routerLink="/painel/itens"
            class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2F6BFF] text-white text-xs font-semibold"
          >
            Voltar para Itens
          </a>
        </div>
      }
    </div>
  `,
})
export class R9ItemDetalhes {
  private readonly route = inject(ActivatedRoute);
  readonly store = inject(NexusStore);

  readonly itemId = computed(() => this.route.snapshot.paramMap.get('id') || '');
  readonly modalEtiquetaAberta = signal(false);
  readonly qrCodeUrl = signal<string>('');

  readonly item = computed(() => {
    const id = this.itemId();
    return this.store.itens().find((i) => i.id === id) || null;
  });

  readonly categoria = computed(() => {
    const it = this.item();
    if (!it) return null;
    return this.store.categorias().find((c) => c.id === it.categoriaId) || null;
  });

  readonly historicoEmprestimos = computed(() => {
    const it = this.item();
    if (!it) return [];
    return this.store.emprestimos().filter((e) => e.itemId === it.id);
  });

  readonly ocorrenciasItem = computed(() => {
    const it = this.item();
    if (!it) return [];
    return this.store.ocorrencias().filter((o) => o.itemId === it.id);
  });

  constructor() {
    afterNextRender(() => {
      this.gerarQrCode();
    });
  }

  private async gerarQrCode() {
    const it = this.item();
    if (it) {
      try {
        const codigo = it.codigoQr || it.patrimonio;
        const url = await QRCode.toDataURL(codigo, {
          width: 240,
          margin: 1,
          color: {
            dark: '#0E1A3A',
            light: '#FFFFFF',
          },
        });
        this.qrCodeUrl.set(url);
      } catch (err) {
        console.error('Falha ao gerar QR Code:', err);
      }
    }
  }

  getUsuario(id?: string) {
    if (!id) return undefined;
    return this.store.usuarios().find((u) => u.id === id);
  }

  formatarData(iso?: string) {
    if (!iso) return '—';
    return formatDateShort(iso);
  }

  getStatusComoVoltou(emp: { devolvidoEm?: string; diasAtraso: number; id: string }): { texto: string; classeCss: string } {
    if (!emp.devolvidoEm) {
      return { texto: 'Em andamento', classeCss: 'bg-blue-50 text-blue-700 border border-blue-200' };
    }
    // Verifica se houve ocorrência com defeito para este empréstimo
    const temOcorrencia = this.store.ocorrencias().some((o) => o.emprestimoId === emp.id);
    if (temOcorrencia) {
      return { texto: 'Com defeito (avaria)', classeCss: 'bg-purple-50 text-purple-800 border border-purple-200' };
    }
    if (emp.diasAtraso > 0) {
      return { texto: `${emp.diasAtraso} d de atraso`, classeCss: 'bg-rose-50 text-rose-700 border border-rose-200' };
    }
    return { texto: 'No prazo', classeCss: 'bg-emerald-50 text-emerald-700 border border-emerald-200' };
  }

  abrirModalEtiqueta() {
    this.modalEtiquetaAberta.set(true);
  }

  executarImpressao() {
    if (typeof window !== 'undefined') {
      window.print();
    }
  }

  getIconeCategoria(categoriaId?: string): string {
    switch (categoriaId) {
      case 'cat-projetores':
        return 'videocam';
      case 'cat-notebooks':
        return 'laptop_chromebook';
      case 'cat-eletronica':
        return 'developer_board';
      case 'cat-ferramentas':
        return 'handyman';
      case 'cat-laboratorio':
        return 'biotech';
      default:
        return 'inventory_2';
    }
  }
}
