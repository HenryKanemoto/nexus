import {ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';
import {RouterLink} from '@angular/router';
import {NexusStore} from '../store/nexus.store';
import {MatIconModule} from '@angular/material/icon';
import {formatDateShort} from '../lib/date-utils';
import {Item, Ocorrencia} from '../types/models';

interface ItemManutencaoLinha {
  item: Item;
  ocorrencia?: Ocorrencia;
  devolvidoPorNome: string;
  dataRegistro: string;
}

@Component({
  selector: 'app-r12-manutencao',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatIconModule],
  template: `
    <div class="space-y-6 font-['Sora',sans-serif] max-w-7xl">
      <!-- Cabeçalho (Wireframe R12) -->
      <div class="flex items-center justify-between pb-2 border-b border-slate-200">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-[#0E1A3A]">
            Manutenção
          </h1>
          <p class="text-xs text-slate-500 mt-1">
            Equipamentos fora de catálogo aguardando reparo técnico
          </p>
        </div>
      </div>

      <!-- Alerta de Sucesso após reparo -->
      @if (mensagemSucesso()) {
        <div class="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between shadow-2xs animate-fadeIn">
          <div class="flex items-center gap-2">
            <mat-icon class="text-emerald-600">check_circle</mat-icon>
            <span>{{ mensagemSucesso() }}</span>
          </div>
          <button
            type="button"
            (click)="mensagemSucesso.set(null)"
            class="text-emerald-600 hover:text-emerald-800 cursor-pointer p-1"
          >
            <mat-icon class="text-sm w-4 h-4 flex items-center justify-center">close</mat-icon>
          </button>
        </div>
      }

      <!-- Tabela Desktop (hidden sm:block) -->
      <div class="hidden sm:block bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-xs text-left">
            <thead class="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold select-none">
              <tr>
                <th class="p-4 w-1/4">Item</th>
                <th class="p-4 w-2/5">Defeito</th>
                <th class="p-4 w-1/5">Devolvido por</th>
                <th class="p-4 w-28">Data</th>
                <th class="p-4 text-right w-28">Ação</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @for (linha of itensEmManutencao(); track linha.item.id) {
                <tr class="hover:bg-slate-50/70 transition-colors">
                  <td class="p-4">
                    <a
                      [routerLink]="['/painel/itens', linha.item.id]"
                      class="group block"
                      title="Ver detalhes do equipamento"
                    >
                      <strong class="font-bold text-[#0E1A3A] group-hover:text-[#2F6BFF] transition-colors block text-xs sm:text-sm">
                        {{ linha.item.nome }}
                      </strong>
                      <span class="font-mono text-[10px] text-slate-400 font-semibold block mt-0.5">
                        {{ linha.item.patrimonio }}
                      </span>
                    </a>
                  </td>
                  <td class="p-4 text-slate-700 leading-relaxed font-medium">
                    {{ linha.ocorrencia?.descricao || 'Defeito reportado na devolução do equipamento.' }}
                  </td>
                  <td class="p-4 text-slate-800 font-medium">
                    {{ linha.devolvidoPorNome }}
                  </td>
                  <td class="p-4 tabular-nums text-slate-500 font-medium">
                    {{ formatarData(linha.dataRegistro) }}
                  </td>
                  <td class="p-4 text-right">
                    <button
                      type="button"
                      (click)="marcarConsertado(linha)"
                      class="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 text-slate-700 font-bold text-xs transition-colors shadow-2xs inline-flex items-center gap-1 cursor-pointer"
                    >
                      <mat-icon class="text-xs w-3.5 h-3.5 flex items-center justify-center">build</mat-icon>
                      <span>Consertado</span>
                    </button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="5" class="p-12 text-center text-xs text-slate-400 italic">
                    Nenhum equipamento em manutenção no momento. Todos os itens estão operacionais.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Lista de Cartões para Mobile (sm:hidden) -->
      <div class="sm:hidden space-y-3">
        @for (linha of itensEmManutencao(); track linha.item.id) {
          <div class="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
            <div class="flex items-start justify-between gap-2">
              <a [routerLink]="['/painel/itens', linha.item.id]" class="group block">
                <strong class="font-bold text-[#0E1A3A] group-hover:text-[#2F6BFF] text-sm block">
                  {{ linha.item.nome }}
                </strong>
                <span class="font-mono text-[10px] text-slate-400 font-semibold block mt-0.5">
                  {{ linha.item.patrimonio }}
                </span>
              </a>
              <span class="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold shrink-0">
                Manutenção
              </span>
            </div>

            <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed">
              <span class="block text-[10px] uppercase font-bold text-slate-400 mb-0.5">Defeito Reportado</span>
              {{ linha.ocorrencia?.descricao || 'Defeito reportado na devolução do equipamento.' }}
            </div>

            <div class="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <span>Devolvido por: <strong class="text-slate-700">{{ linha.devolvidoPorNome }}</strong></span>
              <span class="font-mono">{{ formatarData(linha.dataRegistro) }}</span>
            </div>

            <div class="pt-2 border-t border-slate-100">
              <button
                type="button"
                (click)="marcarConsertado(linha)"
                class="w-full py-2.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <mat-icon class="text-sm w-4 h-4 flex items-center justify-center">build</mat-icon>
                <span>Consertado · Liberar para Catálogo</span>
              </button>
            </div>
          </div>
        } @empty {
          <div class="p-8 rounded-2xl bg-white border border-slate-200 text-center text-xs text-slate-400 italic">
            Nenhum equipamento em manutenção no momento. Todos os itens estão operacionais.
          </div>
        }
      </div>

      <div class="p-3.5 bg-white sm:bg-slate-50/50 rounded-xl sm:rounded-2xl border border-slate-200 text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-1 text-center sm:text-left">
        <span>Itens em manutenção: <strong>{{ itensEmManutencao().length }}</strong></span>
        <span class="text-[10px] text-slate-400">Consertado: o item volta ao catálogo como "disponível"</span>
      </div>
    </div>
  `,
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
      `O equipamento "${linha.item.nome}" (${linha.item.patrimonio}) foi consertado e retornou como DISPONÍVEL ao catálogo escolar.`
    );
  }
}
