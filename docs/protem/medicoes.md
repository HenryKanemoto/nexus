# Medições (Fases 4 e 5)

Medido no build de produção (`npm run build` + `npm run servir`), Edge headless, com o seed de demonstração e domínios externos bloqueados.

## Elementos interativos visíveis por tela

Conta links, botões e campos visíveis na tela, sem o painel de demonstração. "Total" inclui menu e cabeçalho; "conteúdo" é só a área da tela.

| Tela | 1366×768 antes → depois (conteúdo) | 390×844 antes → depois (conteúdo) |
|---|---|---|
| Painel do responsável | 22 (6) → 20 (6) | 9 (6) → 9 (6) |
| Catálogo | 21 (16) → 16 (11) | 20 (14) → 17 (11) |
| Solicitações | 21 (5) → 19 (5) | 8 (5) → 8 (5) |
| Meus empréstimos | 9 (4) → 9 (4) | 10 (4) → 10 (4) |
| Itens | 35 (19) → 32 (18) | 22 (19) → 21 (18) |
| Registrar devolução | 20 (4) → 18 (4) | 7 (4) → 7 (4) |
| Relatórios | 28 (12) → 27 (13) | 15 (12) → 16 (13) |
| Histórico | 21 (5) → 17 (3) | 8 (5) → 6 (3) |
| Leitor de QR code | 22 (6) → 20 (6) | 9 (6) → 9 (6) |
| Ficha do item | 20 (4) → 18 (4) | 7 (4) → 7 (4) |
| Usuários | 23 (7) → 22 (8) | 10 (7) → 11 (8) |
| Item (solicitante) | 7 (2) → 7 (2) | 8 (2) → 8 (2) |

Textos visíveis medidos nas 25 telas × 2 tamanhos: 2.468 antes → 2.178 depois.

## Contraste (WCAG AA)

Todo texto visível de 25 rotas, nos dois tamanhos, com transparências combinadas até o fundo real (controles desabilitados são isentos).

- Antes dos ajustes da Fase 4: 267 textos abaixo do AA (botão primário #2F6BFF com branco dá 4,499:1; chips com opacidade; dias do calendário).
- Depois (primary #2F6AFE, 4,55:1): **0 abaixo do AA** em 2.178 textos.
- Rolagem horizontal: nenhuma em 1366×768 e 390×844 (33 rotas).
