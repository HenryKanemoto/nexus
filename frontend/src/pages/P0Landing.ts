import {ChangeDetectionStrategy, Component} from '@angular/core';
import {RouterLink} from '@angular/router';
import {BrandLogo} from '../components/brand-logo/brand-logo';

interface Pacote {
  nome: string;
  preco: string;
  cobranca: string;
  detalhe: string;
}

/** Página de entrada pública: o que é o Protem, os pacotes e o acesso à plataforma. */
@Component({
  selector: 'app-p0-landing',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, BrandLogo],
  templateUrl: './P0Landing.html',
})
export class P0Landing {
  readonly ano = new Date().getFullYear();

  // Pacotes do pitch (valores de exemplo)
  readonly pacotes: Pacote[] = [
    {nome: 'Essencial', preco: 'R$ 2.000', cobranca: 'pagamento único', detalhe: 'Até 100 itens no acervo'},
    {nome: 'Completa', preco: 'R$ 3.600', cobranca: 'pagamento único', detalhe: 'Até 500 itens no acervo'},
    {nome: 'Suporte mensal', preco: 'R$ 150', cobranca: 'por mês', detalhe: 'Ou R$ 1.500 por ano'},
  ];
}
