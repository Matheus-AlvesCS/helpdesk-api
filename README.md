# Help Desk API

Backend de um sistema de suporte técnico e gerenciamento de chamados. A API controla usuários, técnicos, clientes, serviços e tickets, com autenticação JWT, autorização por perfil, persistência em PostgreSQL e upload de imagens.

**Deploy:** [helpdesk-api-wini.onrender.com](https://helpdesk-api-wini.onrender.com)

![Node.js](https://img.shields.io/badge/Node.js-24%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)

## Sobre o projeto

O Help Desk API representa o backend de uma plataforma de atendimento. Clientes abrem chamados selecionando um técnico e um serviço; técnicos acompanham os chamados, podem iniciar o atendimento e administrar os serviços associados; administradores gerenciam usuários, serviços e todos os tickets.

Cada ticket possui título, descrição, cliente, técnico, status e serviços vinculados. Os serviços são relacionados por uma tabela intermediária (`TicketService`), que também armazena o preço aplicado no momento da associação.

## Funcionalidades

- Cadastro público de clientes
- Cadastro administrativo de clientes, técnicos e administradores
- Login com JWT e senhas protegidas com bcrypt
- Autorização por perfil: `admin`, `technician` e `client`
- Consulta e atualização de usuários
- Alteração de senha com validação da senha atual
- Cadastro, edição, ativação e desativação de serviços
- Criação de tickets com título, descrição, técnico e serviço
- Consulta de tickets por filtros, por ID e por usuário autenticado
- Controle de status: `open`, `in_progress` e `closed`
- Adição e remoção de serviços em tickets ainda não fechados
- Upload de avatar com limite de 3 MB e formatos PNG/JPEG
- CORS habilitado para integração com aplicações frontend

## Tecnologias

- **Node.js 24+** e **TypeScript**
- **Express 5** para a API HTTP
- **Prisma 7** com adapter para **PostgreSQL**
- **JWT** para autenticação e **bcrypt** para hash de senhas
- **Zod** para validação de dados e variáveis de ambiente
- **Multer** para upload de arquivos
- **tsup** para build de produção
- **Vitest** e **Supertest** para testes de integração
- **Docker Compose** para executar o PostgreSQL localmente

## Estrutura principal

```text
src/
  app.ts                         # configuração do Express e CORS
  server.ts                      # inicialização do servidor
  routes/                        # composição das rotas da API
  controllers/                   # regras dos endpoints
  middlewares/                   # autenticação, autorização e erros
  configs/                       # JWT e upload
  database/                      # cliente Prisma
  providers/                     # armazenamento de arquivos
  utils/                         # erros e formatação de tickets
  tests/                         # testes de integração
prisma/
  schema.prisma                  # modelos, enums e relacionamentos
  migrations/                    # histórico do banco
  seed.ts                        # dados iniciais
prisma.config.ts                 # configuração do schema e seed
tmp/uploads/                     # arquivos enviados localmente
```

## Pré-requisitos

- Node.js `24` ou superior
- npm
- Docker e Docker Compose
- PostgreSQL, caso não utilize o container disponibilizado

## Configuração local

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Crie o arquivo de ambiente:

   ```bash
   copy .env-example .env
   ```

   No macOS/Linux, use `cp .env-example .env`.

3. Preencha as variáveis do `.env`.

4. Inicie o PostgreSQL:

   ```bash
   docker compose up -d
   ```

5. Aplique as migrations:

   ```bash
   npx prisma migrate dev
   ```

6. Popule o banco com os dados iniciais:

   ```bash
   npx prisma db seed
   ```

7. Inicie a API:

   ```bash
   npm run dev
   ```

Por padrão, o servidor utiliza a porta `3333`. O seed cria um administrador, três técnicos com disponibilidade e nove serviços.

## Variáveis de ambiente

```env
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=helpdesk
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/helpdesk?schema=public"
JWT_SECRET=uma-chave-secreta
PORT=3333
```

`DB_USERNAME`, `DB_PASSWORD` e `DB_NAME` também são utilizados pelo `docker-compose.yml`. `DATABASE_URL`, `JWT_SECRET` e `PORT` são validados pela aplicação; `PORT` é opcional e assume `3333` quando não informado.

## Scripts

| Comando                  | Descrição                                                       |
| ------------------------ | --------------------------------------------------------------- |
| `npm run dev`            | Executa a API em desenvolvimento com recarregamento automático. |
| `npm run build`          | Gera a aplicação compilada em `dist/` usando tsup.              |
| `npm start`              | Executa `dist/server.js` em modo de produção.                   |
| `npm test`               | Executa os testes com Vitest.                                   |
| `npx prisma migrate dev` | Cria ou aplica migrations no ambiente de desenvolvimento.       |
| `npx prisma db seed`     | Executa `prisma/seed.ts`.                                       |

## Seed do banco

O arquivo `prisma/seed.ts` utiliza a configuração definida em `prisma.config.ts` para inserir dados iniciais no banco:

- 1 usuário administrador
- 3 técnicos com horários de disponibilidade
- 9 serviços de suporte

Execute o seed com:

```bash
npx prisma db seed
```

## Autenticação

As rotas protegidas esperam um token no header:

```http
Authorization: Bearer <token>
```

O token é obtido em `POST /sessions`. A API inclui o papel do usuário no JWT e utiliza os middlewares `ensureAuthenticated` e `verifyAuthorization` para controlar o acesso.

## Endpoints

### Sessões e usuários

| Método   | Rota                  | Acesso                   | Descrição                                                    |
| -------- | --------------------- | ------------------------ | ------------------------------------------------------------ |
| `POST`   | `/users`              | Público                  | Cria um cliente.                                             |
| `POST`   | `/sessions`           | Público                  | Realiza login e retorna o JWT.                               |
| `GET`    | `/users`              | Admin, cliente           | Lista usuários; aceita filtros `role` e `name`.              |
| `GET`    | `/users/:id`          | Admin                    | Consulta um usuário pelo ID.                                 |
| `POST`   | `/users/create`       | Admin                    | Cria cliente, técnico ou administrador.                      |
| `PUT`    | `/users/:id`          | Próprio usuário ou admin | Atualiza dados do perfil.                                    |
| `PATCH`  | `/users/:id/password` | Próprio usuário          | Altera a senha informando `currentPassword` e `newPassword`. |
| `DELETE` | `/users/:id`          | Próprio usuário ou admin | Remove um usuário.                                           |

### Serviços

| Método  | Rota                       | Acesso          | Descrição                                                     |
| ------- | -------------------------- | --------------- | ------------------------------------------------------------- |
| `GET`   | `/services`                | Todos os perfis | Lista serviços; clientes e técnicos visualizam apenas ativos. |
| `POST`  | `/services`                | Admin           | Cria um serviço.                                              |
| `PUT`   | `/services/:id`            | Admin           | Atualiza nome ou preço.                                       |
| `PATCH` | `/services/:id/activate`   | Admin           | Ativa um serviço.                                             |
| `PATCH` | `/services/:id/deactivate` | Admin           | Desativa um serviço.                                          |

### Tickets

| Método   | Rota                          | Acesso                     | Descrição                                                |
| -------- | ----------------------------- | -------------------------- | -------------------------------------------------------- |
| `POST`   | `/tickets`                    | Cliente                    | Cria um ticket com título, descrição, técnico e serviço. |
| `GET`    | `/tickets`                    | Admin                      | Lista tickets; aceita filtros `title` e `status`.        |
| `GET`    | `/tickets/my-tickets`         | Cliente, técnico           | Lista tickets do usuário autenticado.                    |
| `GET`    | `/tickets/:id`                | Cliente, técnico, admin    | Consulta um ticket específico.                           |
| `POST`   | `/tickets/:id/service/add`    | Técnico responsável        | Adiciona um serviço ao ticket.                           |
| `DELETE` | `/tickets/:id/service/remove` | Técnico responsável        | Remove um serviço; exige `serviceId` no body.            |
| `PATCH`  | `/tickets/:id/start`          | Técnico responsável, admin | Altera o status para `in_progress`.                      |
| `PATCH`  | `/tickets/:id/close`          | Técnico responsável, admin | Altera o status para `closed`.                           |

### Uploads

| Método | Rota                 | Acesso              | Descrição                                       |
| ------ | -------------------- | ------------------- | ----------------------------------------------- |
| `POST` | `/uploads`           | Usuário autenticado | Envia um arquivo multipart no campo `avatar`.   |
| `GET`  | `/uploads/:filename` | Público             | Acessa arquivos salvos no diretório de uploads. |

## Exemplos de payloads

### Login

```json
{
  "email": "usuario@email.com",
  "password": "123456"
}
```

### Criação de ticket

```json
{
  "title": "Computador não liga",
  "description": "O equipamento não inicia após a tentativa de ligar.",
  "technicianId": "uuid-do-tecnico",
  "serviceId": "uuid-do-servico"
}
```

### Alteração de senha

```json
{
  "currentPassword": "senha-atual",
  "newPassword": "nova-senha"
}
```

## Testes

Os testes utilizam `Vitest` e `Supertest` para exercitar o comportamento HTTP de usuários, sessões e tickets:

```bash
npm test
```

## Aprendizados e práticas

Este projeto consolidou a criação de uma API REST com separação de responsabilidades, autenticação e autorização por papel, validação de entradas, migrations, seed, relacionamentos no Prisma, transações e testes de integração. O tratamento de erros é centralizado e configurações sensíveis ficam fora do código, em variáveis de ambiente.

## Licença

Este projeto utiliza a licença ISC.
