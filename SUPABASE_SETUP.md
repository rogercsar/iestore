# Supabase Setup (PostgreSQL)

Este guia descreve como conectar o projeto ao banco de dados do Supabase e como criar as tabelas necessárias.

## 1) Credenciais e variáveis de ambiente

Pegue as credenciais em: Supabase → Project Settings → Database → Connection string.

Adicione no `.env` (ou no painel da Netlify, em Site settings → Environment variables):

```
DATABASE_URL=postgres://postgres:YOUR_PASSWORD@YOUR_PROJECT_HOST:5432/postgres?sslmode=require
DB_HOST=YOUR_PROJECT_HOST
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=YOUR_PASSWORD
DB_SSL=true
```

- `YOUR_PROJECT_HOST` costuma ter o formato `db.<hash>.supabase.co`.
- `DB_SSL=true` é obrigatório para Supabase.

## 2) Atualizar exemplo de ambiente

O arquivo `env.example` já contém um bloco com valores para Supabase. Copie-o para `.env` e ajuste.

## 3) Criar o schema no Supabase

No painel do Supabase, abra SQL → Editor, cole e execute o conteúdo de `scripts/create_supabase_schema.sql`:

- Cria as tabelas: `products`, `customers`, `sales`, `users`, `promotions`, `campaigns`.
- Adiciona índices e triggers para `updated_at`.

## 4) Conexão nas funções (Netlify)

As funções em `netlify/functions/postgres.ts` e `netlify/functions/test.ts` usam o pacote `pg` e lerão as variáveis acima automaticamente.

Exemplo de configuração (já existente no projeto):

```ts
import { Pool } from 'pg'

const dbConfig = {
  host: process.env.DB_HOST, // ex.: db.<hash>.supabase.co
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'postgres',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  ssl: { rejectUnauthorized: false }, // Supabase exige SSL
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
}

export const pool = new Pool(dbConfig)
```

Observações:
- No Supabase, o certificado SSL é gerenciado pelo serviço. `rejectUnauthorized: false` é suficiente.
- Se preferir, use `DATABASE_URL` diretamente com `pg`.

## 5) Segurança recomendada

- Não exponha credenciais no front. Guarde-as apenas nas funções serverless.
- Evite senhas em texto plano na tabela `users`. Considere usar Supabase Auth ou armazenar hash (bcrypt) e remover o campo `password` das respostas.
- Restrinja o acesso aos endpoints (`/.netlify/functions/postgres`) para evitar uso externo não autorizado.

## 6) Migração de dados existentes

Caso já tenha dados em outra instância:
- Exporte e importe via CSV ou use o editor SQL do Supabase para `INSERT`/`COPY`.
- Você pode usar o arquivo `assets/products.seed.json` como base para popular `products`.
- Para clientes, verifique scripts úteis em `scripts/` (ex.: `check-customers-data.js`) e adapte para apontar ao Supabase.

## 7) Validação

- Rode a função de teste: `/.netlify/functions/test` no seu deploy Netlify. Deve retornar `database.connected: true`.
- No front web (Vue), o `environment.apiBaseUrl` já aponta para `/.netlify/functions/postgres`.

---

Com isso, o projeto estará pronto para usar o banco de dados do Supabase com segurança e o schema consistente.