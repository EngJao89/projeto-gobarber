# GoBarber — Backend

API REST do **GoBarber**: sistema de agendamento entre clientes e prestadores de serviço (barbearia). Permite cadastro de usuários, login, listagem de prestadores, agendamento e cancelamento de horários, notificações em tempo real e envio de e-mails (ex.: cancelamento).

---

## Como rodar o projeto

### Pré-requisitos

- **Node.js** (versão LTS recomendada)
- **PostgreSQL**
- **MongoDB**
- **Redis**

### 1. Clonar e instalar dependências

```bash
cd backend
npm install
```

### 2. Variáveis de ambiente

Crie um arquivo `.env` na raiz do backend com as variáveis necessárias:

```env
# Aplicação
APP_SECRET=sua_chave_secreta_jwt
APP_URL=http://localhost:3333
NODE_ENV=development

# Banco PostgreSQL (gobarber)
# Se não definir, o padrão está em src/config/database.js
# DB_HOST=localhost
# DB_USER=postgres
# DB_PASS=docker
# DB_NAME=gobarber

# MongoDB (notificações)
MONGO_URL=mongodb://localhost:27017/gobarber

# Redis (filas)
REDIS_HOST=localhost
REDIS_PORT=6379

# Sentry (opcional, monitoramento de erros)
# SENTRY_DSN=
```

Ajuste usuário/senha/banco do PostgreSQL conforme seu ambiente. O arquivo `src/config/database.js` usa valores padrão (host local, usuário `postgres`, senha `docker`, banco `gobarber`) quando variáveis de ambiente não estão definidas.

### 3. Banco de dados

Crie o banco `gobarber` no PostgreSQL e rode as migrations:

```bash
npx sequelize-cli db:migrate
```

### 4. Subir a API

```bash
npm run dev
```

A API sobe em **http://localhost:3333**.

### 5. Documentação da API (Swagger)

Com a API rodando, a documentação interativa está disponível em:

**http://localhost:3333/api-docs**

Lá você pode ver todos os endpoints, schemas de request/response e testar as rotas. Para rotas protegidas, faça login em `POST /sessions`, copie o `token` e use **Authorize** (cadeado) informando `Bearer <seu_token>`.

### 6. Processar filas (e-mails, jobs)

Em outro terminal, rode o worker das filas (ex.: envio de e-mail de cancelamento):

```bash
npm run queue
```

Mantenha `npm run dev` e `npm run queue` rodando para uso completo (API + jobs).

### 7. Produção (build)

```bash
npm run build
npm start
```

O worker de filas continua sendo iniciado com `node src/queue.js` (ou equivalente no seu processo de deploy).

---

## Scripts disponíveis

| Script       | Descrição                          |
| ------------ | ---------------------------------- |
| `npm run dev` | Sobe a API em desenvolvimento (nodemon, porta 3333) |
| `npm run queue` | Processa jobs da fila (Bee Queue + Redis) |
| `npm run build` | Compila com Sucrase para `./dist`  |
| `npm start`  | Roda a API a partir de `./dist`    |
| `npm run commit` | Abre o Commitizen para commits padronizados |

**URLs úteis (com a API rodando):**

| URL | Descrição |
| ----- | --------- |
| http://localhost:3333 | Health check (`GET /` retorna `ok`) |
| http://localhost:3333/api-docs | Documentação Swagger (OpenAPI) |

---

## Descrição do projeto

O backend do GoBarber expõe uma API que atende um frontend (web/mobile) com:

- **Autenticação**: registro e login com JWT (token válido por 7 dias).
- **Usuários**: atualização de perfil e avatar (upload de arquivo).
- **Prestadores**: listagem de provedores de serviço e horários disponíveis.
- **Agendamentos**: criar, listar e cancelar agendamentos (com regra de cancelamento até 2h antes).
- **Agenda**: lista de agendamentos do prestador logado.
- **Notificações**: listagem e marcação de leitura (dados em MongoDB, atualização em tempo real via Socket.io).
- **Arquivos**: upload de avatar; arquivos servidos em `/files`.

Fluxos assíncronos (ex.: envio de e-mail ao cancelar agendamento) são feitos com **filas** (Bee Queue + Redis), garantindo que a resposta HTTP não dependa do envio do e-mail.

---

## Decisões técnicas e arquiteturais

### Stack principal

- **Node.js + Express**: API REST.
- **Sucrase**: permite usar `import/export` (ES modules) sem transpilar para CommonJS em dev.
- **Sequelize**: ORM para **PostgreSQL** (usuários, arquivos, agendamentos).
- **Mongoose**: conexão com **MongoDB** para o módulo de notificações (esquema flexível, leitura/escrita simples).
- **Redis + Bee Queue**: filas para jobs em background (ex.: envio de e-mail de cancelamento).
- **Socket.io**: notificações em tempo real para o cliente conectado.
- **JWT**: autenticação stateless (middleware em rotas protegidas).
- **Multer**: upload de arquivos (avatar); arquivos em disco em `tmp/uploads`.
- **Yup**: validação de dados nas requisições (nos controllers).
- **Youch**: formato de erro detalhado em desenvolvimento.
- **Sentry**: envio de erros para monitoramento (quando `SENTRY_DSN` está configurado).
- **Swagger (OpenAPI 3)**: documentação da API em `src/config/swagger.js`; UI servida em `/api-docs` via `swagger-ui-express`.

### Uso de dois bancos (PostgreSQL + MongoDB)

- **PostgreSQL**: dados relacionais (usuários, arquivos, agendamentos), integridade e migrations controladas pelo Sequelize.
- **MongoDB**: notificações (documentos por usuário, alto volume de leitura/escrita e formato que pode evoluir sem migrations rígidas). A escolha separa responsabilidades e permite escalar/otimizar cada parte conforme o uso.

### Filas (Bee Queue + Redis)

- Operações que não precisam ser síncronas (ex.: envio de e-mail) são enfileiradas.
- A API responde rápido e o worker (`npm run queue`) processa os jobs em outro processo, evitando bloqueio e permitindo retentativas em caso de falha.
- Redis é usado apenas como broker da fila; os dados de negócio continuam em PostgreSQL/MongoDB.

### Estrutura de pastas

- **`src/app/`**: controllers, models, middlewares, jobs, schemas (Mongo), views de e-mail.
- **`src/config/`**: configurações (auth, database, mail, multer, redis, sentry, swagger).
- **`src/database/`**: inicialização Sequelize/Mongoose e migrations.
- **`src/lib/`**: utilitários (Queue, Mail).
- **`src/`**: `app.js` (configuração Express + Socket.io + Sentry + rotas), `routes.js`, `server.js`, `queue.js`.

### Segurança e boas práticas

- Senhas hasheadas com **bcrypt** (nunca armazenadas em texto plano).
- Chave JWT e dados sensíveis via variáveis de ambiente (`.env` não versionado).
- CORS habilitado; em produção convém restringir origem.
- Tratamento global de exceções (desenvolvimento com Youch, produção com mensagem genérica e envio ao Sentry quando configurado).

---

## Licença

ISC
