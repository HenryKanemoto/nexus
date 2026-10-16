# Medições

Medido no build de produção (`npm run build` + `npm run servir`) de um clone limpo da branch, no Edge headless, com o seed de demonstração e os domínios externos bloqueados. "Antes" é o estado depois das Fases 1 a 4 e antes do enxugamento (Fase 5); "depois" é o final (Fases 5 e 6).

## Elementos interativos visíveis por tela

Conta links, botões e campos visíveis na tela, sem o painel de demonstração. O primeiro número inclui menu e cabeçalho; entre parênteses, só a área de conteúdo.

| Tela | 1366×768 antes → depois | 390×844 antes → depois |
|---|---|---|
| Painel do responsável | 22 (6) → 20 (6) | 9 (6) → 9 (6) |
| Catálogo | 21 (16) → 16 (11) | 20 (14) → 17 (11) |
| Solicitações | 21 (5) → 19 (5) | 8 (5) → 8 (5) |
| Meus empréstimos | 9 (4) → 9 (4) | 10 (4) → 10 (4) |
| Itens | 35 (19) → 32 (18) | 22 (19) → 21 (18) |
| Registrar devolução | 20 (4) → 18 (4) | 7 (4) → 7 (4) |
| Relatórios | 28 (12) → 27 (13) | 15 (12) → 16 (13) |
| Histórico | 21 (5) → 17 (3) | 8 (5) → 6 (3) |
| Leitor de QR code | 22 (6) → 16 (2) | 9 (6) → 5 (2) |
| Ficha do item | 20 (4) → 18 (4) | 7 (4) → 7 (4) |
| Usuários | 23 (7) → 22 (8) | 10 (7) → 11 (8) |
| Item (solicitante) | 7 (2) → 7 (2) | 8 (2) → 8 (2) |

Textos visíveis nas 25 rotas medidas × 2 tamanhos: 2.468 antes → 2.140 depois (−13%).

O número de elementos clicáveis caiu pouco porque a Fase 5 não removeu funcionalidades: a redução maior está no ruído visual (etiquetas coloridas, metadados, explicações, filtros sempre abertos e botões preenchidos repetidos), que essa contagem não captura. Compare as capturas em `antes/` e `depois/`.

## Contraste (WCAG AA)

Todo texto visível de 25 rotas, nos dois tamanhos, com as transparências combinadas até o fundo real. Controles desabilitados são isentos.

- Com o tema da Fase 4 recém-aplicado: 267 textos abaixo do AA. O botão primário `#2F6BFF` com texto branco dá 4,499:1 (a tabela do CLAUDE.md arredonda para 4,5:1); também falhavam os chips com opacidade e os dias do calendário.
- Final, com o primary `#2F6AFE` (4,55:1): **0 abaixo do AA em 2.140 textos**.
- Rolagem horizontal: nenhuma em 1366×768 e 390×844 (33 rotas).
- Foco visível: anel de 2 px `focus-ring` com 2 px de afastamento em todos os elementos focáveis.
