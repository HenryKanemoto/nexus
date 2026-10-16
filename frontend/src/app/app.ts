import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {MatIconRegistry} from '@angular/material/icon';
import {DomSanitizer} from '@angular/platform-browser';
import {ICONES} from './icones';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
})
export class App {
  constructor() {
    // Ícones em SVG embutidos no app (<mat-icon svgIcon="...">): nada de fonte de ícones
    // nem CDN, então nunca aparecem como texto, mesmo sem internet
    const registro = inject(MatIconRegistry);
    const sanitizer = inject(DomSanitizer);
    for (const [nome, svg] of Object.entries(ICONES)) {
      registro.addSvgIconLiteral(nome, sanitizer.bypassSecurityTrustHtml(svg));
    }
  }
}
