# Nexus

Aplicação dividida em duas partes:

| Pasta | Stack | Porta padrão |
|-------|-------|--------------|
| `backend/` | NestJS + TypeORM + MySQL | 3000 (use `3001`, veja abaixo) |
| `frontend/` | Angular 21 + Tailwind | 3000 |

## Pré-requisitos

- [Node.js](https://nodejs.org/) (versão LTS recente)
- npm
- [Docker](https://www.docker.com/) (para o banco MySQL)

## 1. Banco de dados

Na raiz do projeto:

```bash
docker compose up -d
```

Isso sobe um MySQL 8.4 na porta `3306` com o banco `nexus_db` (credenciais em [docker-compose.yml](docker-compose.yml)).

## 2. Backend

```bash
cd backend
npm install
```

Crie o arquivo `backend/.env` (ele não é versionado):

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=<MYSQL_ROOT_PASSWORD do docker-compose.yml>
DB_NAME=nexus_db
PORT=3001
```

> `PORT=3001` evita conflito com o frontend, que usa a porta 3000.

Suba o servidor em modo desenvolvimento:

```bash
npm run start:dev
```

As migrations rodam automaticamente ao iniciar a aplicação.

### Outros comandos do backend

| Comando | O que faz |
|---------|-----------|
| `npm run build` | Compila para `dist/` |
| `npm run start:prod` | Roda a versão compilada |
| `npm test` | Testes unitários (Vitest) |
| `npm run test:e2e` | Testes e2e |
| `npm run lint` | Lint (oxlint) |
| `npm run migration:generate` | Gera migration a partir das entidades |
| `npm run migration:run` | Executa migrations pendentes |
| `npm run migration:revert` | Reverte a última migration |

## 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Acesse em <http://localhost:3000>.

### Outros comandos do frontend

| Comando | O que faz |
|---------|-----------|
| `npm start` | `ng serve` na porta padrão do Angular (4200) |
| `npm run build` | Build de produção |
| `npm test` | Testes |
| `npm run lint` | Lint |

## Problemas comuns

- **`ENOENT ... package.json`**: o `npm install` deve ser executado dentro de `backend/` e `frontend/`, não na raiz.
- **Erro de conexão com o banco**: confirme que o container está rodando (`docker ps`) e que o `backend/.env` bate com o `docker-compose.yml`.
- **Porta 3000 em uso**: o backend e o frontend não podem usar a mesma porta; ajuste `PORT` no `backend/.env`.
- **Avisos de `install-scripts` no npm**: se o build reclamar do `esbuild`, rode `npm install-scripts approve esbuild` dentro de `frontend/`.
