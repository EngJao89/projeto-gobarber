# GoBarber — Frontend

Frontend da aplicação **GoBarber**: plataforma de agendamento para barbearias. Permite que usuários façam login, criem conta, acessem o dashboard e gerenciem o perfil. O frontend consome a API do backend (REST e WebSocket) para autenticação, dados do usuário e funcionalidades em tempo real.

Este projeto foi iniciado com [Create React App](https://github.com/facebook/create-react-app) e customizado com **react-app-rewired** e **customize-cra**.

---

## Como rodar o projeto

### Pré-requisitos

- **Node.js** (versão LTS recomendada)
- **npm** ou **yarn**
- Backend do GoBarber rodando (por padrão em `http://localhost:3333`)

### Instalação

1. Clone o repositório e entre na pasta do frontend:

   ```bash
   cd frontendgo
   ```

2. Instale as dependências:

   ```bash
   npm install
   # ou
   yarn
   ```

3. (Opcional) Ajuste a URL da API em `src/services/api.js` se o backend estiver em outro host/porta.

### Scripts disponíveis

| Comando           | Descrição |
|------------------|-----------|
| `npm start`      | Sobe a aplicação em modo desenvolvimento em [http://localhost:3000](http://localhost:3000). Hot reload e erros de lint no console. |
| `npm run build`  | Gera o build de produção na pasta `build` (minificado e otimizado). |
| `npm test`       | Executa os testes em modo interativo. |
| `npm run commit` | Abre o Commitizen para criar commits no padrão Conventional Commits. |

No lugar de `npm` você pode usar `yarn` (ex.: `yarn start`, `yarn build`).

### Rodando a aplicação

1. Certifique-se de que o **backend** está rodando (ex.: `http://localhost:3333`).
2. No diretório do frontend, execute:

   ```bash
   npm start
   ```

3. Acesse [http://localhost:3000](http://localhost:3000) no navegador.

---

## Decisões técnicas e arquiteturais

### Stack principal

- **React 16** com Hooks
- **Redux** para estado global
- **Redux Saga** para efeitos assíncronos (login, registro, perfil, etc.)
- **Redux Persist** para persistir parte do estado (ex.: autenticação) no `localStorage`
- **React Router (v5)** com histórico customizado (`history`) para controle de rotas e redirecionamentos
- **Axios** para chamadas HTTP à API
- **Socket.io-client** para comunicação em tempo real com o backend
- **Styled Components** para estilização por componente
- **Unform** (Rocketseat) + **Yup** para formulários e validação
- **React Toastify** para notificações
- **Reactotron** em desenvolvimento para debug de Redux e Redux Saga

### Estrutura de pastas (src)

- **`store/`** — Configuração do Redux (store, middlewares, persist), `rootReducer`, `rootSaga` e módulos por domínio (`auth`, `user`), cada um com `reducer`, `sagas` e `actions`.
- **`pages/`** — Páginas da aplicação: `SignIn`, `SignUp`, `Dashboard`, `Profile`, e layouts `_layouts/auth` e `_layouts/default`.
- **`components/`** — Componentes reutilizáveis (ex.: Header, Notifications).
- **`routes/`** — Definição de rotas e componente `Route` que aplica layouts e proteção de rotas (públicas vs privadas).
- **`services/`** — Instância do Axios (`api.js`) e histórico do React Router (`history.js`).
- **`styles/`** — Estilos globais (ex.: `global.js`).
- **`config/`** — Configuração do Reactotron.
- **`assets/`** — Imagens e ícones (ex.: logos).

### Rotas e autenticação

- Rotas **públicas**: `/` (SignIn) e `/register` (SignUp), com layout de autenticação.
- Rotas **privadas**: `/dashboard` e `/profile`, com layout padrão (header, etc.).
- O componente `Route` em `routes/Route.js` verifica `auth.signed` no Redux: se o usuário não está logado e acessa rota privada, redireciona para `/`; se está logado e acessa rota pública, redireciona para `/dashboard`.

### Customização do Create React App

- **react-app-rewired** + **customize-cra** permitem alterar a configuração do CRA sem eject.
- **config-overrides.js** adiciona o **babel-plugin-root-import** com `rootPathSuffix: 'src'`, permitindo imports com alias `~` (ex.: `~/store`, `~/pages/...`), o que evita caminhos relativos longos e facilita refatoração.

### Ferramentas de desenvolvimento

- **ESLint** com extensões (react-app, Airbnb, Prettier, import resolver para root-import).
- **Prettier** para formatação.
- **Commitizen** + **cz-conventional-changelog** para commits no padrão Conventional Changelog (`npm run commit`).

### API e ambiente

- A base URL da API está definida em `src/services/api.js` (padrão: `http://localhost:3333`). Alterar esse valor conforme o ambiente (dev/staging/produção) ou evoluir para variáveis de ambiente se necessário.

---

## Referências

- [Create React App — documentação](https://facebook.github.io/create-react-app/docs/getting-started)
- [React — documentação](https://reactjs.org/)
