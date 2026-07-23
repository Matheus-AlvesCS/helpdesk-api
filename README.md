# Help Desk API

Backend da aplicação de suporte e gestão de chamados, construída com Node.js, TypeScript, Express, Prisma e PostgreSQL.

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)

## Visão geral

Esta API serve como backend de um sistema de help desk. Ela gerencia usuários, serviços, tickets e uploads, com autenticação e autorização baseadas em perfis (cliente, técnico e administrador).

## O que o projeto faz

- permite cadastro de clientes e usuários com diferentes papéis;
- autentica usuários via JWT;
- cria tickets vinculados a cliente, técnico e serviço;
- permite técnicos e administradores iniciar e fechar tickets;
- lista tickets por usuário autenticado;
- gerencia serviços com ativação e desativação;
- faz upload de arquivos de avatar;
- mantém validação de dados e tratamento centralizado de erros.

## Tecnologias utilizadas

- Node.js
- TypeScript
- Express
- Prisma ORM
- PostgreSQL
- JWT + bcrypt
- Zod
- Multer
- Vitest + Supertest
- tsup
- tsx

## Principais aprendizados

- organizar uma API REST com rotas, controladores e middlewares;
- aplicar autenticação e autorização segura com JWT;
- modelar relacionamentos complexos no Prisma;
- validar input com Zod;
- fazer testes de integração com Vitest e Supertest;
- usar seed para popular dados iniciais e ambientes de teste.

## Boas práticas aplicadas

- middleware de autenticação (`ensureAuthenticated`);
- verificação de autorização por papel (`verifyAuthorization`);
- validação de entrada com Zod em controladores;
- tratamento de erros centralizado (`errorHandler`);
- configuração por variáveis de ambiente;
- uso de migrations e seed com Prisma;
- separação clara entre camadas de rota, controle e persistência.

## Estrutura do projeto

```text
src/
  app.ts
  server.ts
  routes/                # definição das rotas
  controllers/           # lógica de cada endpoint
  middlewares/           # autenticação, autorização, erros
  configs/               # upload e auth
  database/              # conexão Prisma
  generated/prisma/      # client Prisma gerado
  providers/             # implementação do storage local
  tests/                 # testes de integração
prisma/
  schema.prisma
  migrations/
  seed.ts                # dados iniciais do banco
```

## Setup

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Copie o arquivo de ambiente:
   ```bash
   copy .env-example .env
   ```
3. Preencha as variáveis em `.env`
4. Inicie o banco PostgreSQL:
   ```bash
   docker compose up -d
   ```
5. Execute as migrations:
   ```bash
   npx prisma migrate dev
   ```
6. Rode o seed do banco:
   ```bash
   npx prisma db seed
   ```
7. Inicie o servidor em modo de desenvolvimento:
   ```bash
   npm run dev
   ```

## Scripts disponíveis

- `npm run dev` — inicia o servidor em modo desenvolvimento
- `npm run build` — gera a versão de produção em `dist/`
- `npm start` — executa a build em `dist/`
- `npm test` — executa os testes com Vitest

## Variáveis de ambiente

Defina as variáveis abaixo no `.env`:

- `DB_USERNAME`
- `DB_PASSWORD`
- `DB_NAME`
- `DATABASE_URL`
- `JWT_SECRET`
- `PORT` (opcional, padrão `3333`)

## Seed do banco

O projeto inclui o arquivo `prisma/seed.ts` para criar dados iniciais:

- 1 usuário administrador
- 3 técnicos com disponibilidade
- 9 serviços cadastrados

Rode:

```bash
npx prisma db seed
```

## Endpoints principais

### Autenticação

- `POST /users` — registra um cliente
- `POST /users/create` — registra um usuário (admin)
- `POST /sessions` — gera token JWT para login

### Usuários

- `PUT /users/:id` — atualiza perfil
- `GET /users` — lista usuários
- `DELETE /users/:id` — remove usuário

### Serviços

- `GET /services` — lista serviços
- `POST /services` — cria serviço (admin)
- `PUT /services/:id` — atualiza serviço (admin)
- `PATCH /services/:id/deactivate` — desativa serviço (admin)
- `PATCH /services/:id/activate` — ativa serviço (admin)

### Tickets

- `POST /tickets` — cria ticket (client)
- `GET /tickets` — lista tickets (admin)
- `GET /tickets/my-tickets` — tickets do usuário autenticado
- `PATCH /tickets/:id/start` — inicia atendimento
- `PATCH /tickets/:id/close` — fecha ticket
- `POST /tickets/:id/service` — adiciona serviço a um ticket (technician)

### Uploads

- `POST /uploads` — upload de avatar de usuário

## Observações

Projeto de backend orientado a um fluxo real de suporte com foco em organização, segurança e praticidade para desenvolvimento.
