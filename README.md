# Nexus

Sistema de empréstimo de equipamentos escolares: alunos e professores pedem itens pelo catálogo, e o responsável pelo acervo aprova, registra a retirada e a devolução pelo QR code de cada item.

| Pasta | Stack | Porta |
|-------|-------|-------|
| `backend/` | NestJS + TypeORM + MySQL | 3001 |
| `frontend/` | Angular 21 + Tailwind 4 | 3000 |

## Como funciona hoje

- **Itens do acervo → banco de dados.** O backend guarda os itens (nome, categoria, patrimônio, QR, foto e situação) no MySQL. Toda mudança num item, seja cadastro, edição ou troca de situação por empréstimo, é enviada para a API.
- **O resto → navegador.** Usuários, login, categorias, pedidos, empréstimos, notificações e o relógio de demonstração ficam no `localStorage`. O login é de demonstração, sem segurança.
- O frontend chama a API em `/api/...`. Em desenvolvimento, o Angular repassa essas chamadas para `http://localhost:3001` ([frontend/proxy.conf.json](frontend/proxy.conf.json)), sem precisar de CORS.
- Se o backend estiver desligado, o app continua funcionando só no navegador e mostra um aviso no topo com o botão "Tentar de novo".

## Pré-requisitos

- [Node.js](https://nodejs.org/) LTS recente (testado com 24) e npm
- [Docker](https://www.docker.com/) para o MySQL

## Primeira vez

**1. Banco de dados** (na raiz do projeto):

```bash
docker compose up -d
```

Sobe um MySQL 8.4 na porta `3306` com o banco `nexus_db`.

**2. Backend:** instale as dependências e crie o `backend/.env`, que não é versionado.

```bash
cd backend
npm install
```

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=<MYSQL_ROOT_PASSWORD do docker-compose.yml>
DB_NAME=nexus_db
PORT=3001
```

**3. Frontend:**

```bash
cd frontend
npm install
```

## Rodando os dois ao mesmo tempo

Abra **dois terminais**:

```bash
cd backend
npm run start:dev
```

```bash
cd frontend
npm run dev
```

Acesse **<http://localhost:3000>**.

Na primeira subida, o backend roda as migrations sozinho: cria a tabela `itens` e cadastra os 15 equipamentos de demonstração. Para conferir a API direto: <http://localhost:3001/api/item>.

> Usa o Claude Code no app desktop? O arquivo [.claude/launch.json](.claude/launch.json) já tem as duas configurações (`frontend` e `backend`).

## Usando a aplicação

Na tela de login, o bloco **"Acesso rápido de demonstração"** entra com um clique. Todas as contas usam a senha `123456`.

| Perfil | Conta | O que faz |
|--------|-------|-----------|
| Aluno | camila@escola.edu.br | Vê o catálogo, pede itens, acompanha os empréstimos |
| Professor | gustavo@escola.edu.br | Igual ao aluno |
| Responsável | enzo@escola.edu.br | Painel de gestão: aprova pedidos e contas, registra retiradas e devoluções, cadastra itens |

### Ciclo de um empréstimo

1. **Aluno** → *Catálogo* → escolhe um item → *Pedir emprestado* → escolhe a data de devolução (limitada pelo prazo da categoria).
2. **Responsável** → *Solicitações* → *Aprovar*. O item fica **reservado** e precisa ser retirado no mesmo dia.
3. **Responsável** → *Leitor de QR code* (ou *Registrar retirada* no painel). Escanear o QR do item leva à confirmação da retirada.
4. Na devolução, o mesmo leitor leva à tela *Registrar devolução*. Ali dá para marcar **"voltou com defeito"**, e o item vai para *Manutenção*.

### Painel de demonstração (relógio)

O botão escuro no canto inferior direito abre o **modo demonstração**:

- **+1 hora / +1 dia / +3 dias:** avança o relógio do sistema e dispara as rotinas automáticas, como pedidos aprovados que expiram, atrasos, bloqueios e lembretes.
- **Entrar como:** troca de usuário sem fazer login.
- **Reiniciar dados de demonstração:** volta tudo ao estado inicial, inclusive os itens no banco.

### Regras de negócio

| Regra | Onde |
|-------|------|
| RN01: todo pedido precisa de aprovação | Solicitações |
| RN02: devolução dentro do prazo máximo da categoria | Pedir emprestado |
| RN03: limite de itens por pessoa em cada categoria | Catálogo / Pedir emprestado |
| RN04: pedido aprovado expira se não for retirado no mesmo dia | Rotina automática |
| RN05: retirada registrada pelo QR code; o prazo começa aí | Leitor de QR |
| RN06: política de atraso (simples, intermediária ou rígida) | Configurações |
| RN07: devolução com defeito vai para manutenção e gera ocorrência | Registrar devolução |
| RN08: conta nova nasce pendente e precisa de aprovação | Cadastro / Contas |
| RN09: só itens disponíveis aparecem no catálogo | Catálogo |
| RN10: lembrete ao responsável liberado 2 h depois do pedido, uma vez | Meus empréstimos |

## API de itens

Todas as rotas ficam sob `/api`.

| Método | Rota | O que faz |
|--------|------|-----------|
| GET | `/api/item` | Lista os itens |
| GET | `/api/item/:id` | Busca um item |
| POST | `/api/item` | Cria (o `id` é opcional; se faltar, o servidor gera) |
| PUT | `/api/item/:id` | Cria ou atualiza com esse id |
| PATCH | `/api/item/:id/status` | Muda só a situação: `{"status": "manutencao"}` |
| DELETE | `/api/item/:id` | Remove |

Patrimônio e código QR são únicos (`409` se repetirem). Campos obrigatórios: `nome`, `categoriaId`, `patrimonio`, `codigoQr`.

## Estrutura do frontend

```
frontend/src/
├── app/            rotas e configuração
├── layouts/        layout do responsável (menu lateral) e do solicitante (barra superior)
├── pages/          uma tela por arquivo: P* acesso, S* solicitante, R* responsável (.ts + .html)
├── components/     peças reutilizáveis: modal, status-badge, item-thumb, qr-code, logo...
├── store/
│   ├── nexus.store.ts   fachada usada pelas telas (estado + sincronização com a API)
│   ├── regras/          regras de negócio em funções puras, por assunto
│   ├── demo-data.ts     dados iniciais de demonstração
│   └── persistencia.ts  leitura e gravação no localStorage
├── services/       chamadas HTTP (itens-api.service.ts)
├── lib/            utilitários de data, texto, imagem e categoria
└── styles.css      sistema visual: cores, fontes e classes (.btn, .card, .input, .table...)
```

## Comandos

| Backend (`backend/`) | |
|---|---|
| `npm run start:dev` | Sobe com recarga automática |
| `npm test` | Testes (Vitest) |
| `npm run lint` | Lint (oxlint) |
| `npm run migration:generate` | Gera migration a partir das entidades (renomeie o arquivo gerado) |
| `npm run migration:run` / `migration:revert` | Aplica / desfaz migrations |

| Frontend (`frontend/`) | |
|---|---|
| `npm run dev` | Sobe em <http://localhost:3000> |
| `npm run build` | Build de produção |
| `npm test` | Testes |
| `npm run lint` | Lint |

## Problemas comuns

- **`ENOENT ... package.json`**: o `npm install` deve ser rodado dentro de `backend/` e `frontend/`, não na raiz.
- **Aviso "Sem conexão com o backend"**: o backend não está rodando na porta 3001. Suba com `npm run start:dev` e clique em "Tentar de novo".
- **`EADDRINUSE` no backend**: já existe algo na porta 3001, provavelmente um backend antigo aberto. Feche esse processo ou mude o `PORT` no `.env`.
- **Erro de conexão com o banco**: confira se o container está rodando (`docker ps`) e se o `backend/.env` bate com o `docker-compose.yml`.
- **Câmera do leitor de QR não abre**: o navegador precisa de permissão e só libera câmera em `localhost` ou HTTPS. Sem câmera, digite o código no campo abaixo dela.
- **Avisos de `install-scripts` no npm**: se o build reclamar do `esbuild`, rode `npm install-scripts approve esbuild` dentro de `frontend/`.
