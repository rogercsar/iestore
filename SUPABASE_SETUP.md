# Supabase Setup (via supabase-js)

Este guia descreve como conectar o projeto ao Supabase usando o cliente oficial `@supabase/supabase-js` e como criar as tabelas necessárias.

## 1) Credenciais e variáveis de ambiente

Pegue as credenciais em: Supabase → Project Settings → API.

Adicione no `.env` (ou no painel da Netlify, em Site settings → Environment variables):

```
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
# Use a Service Role key nas funções serverless (acesso completo somente no backend)
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
# Opcional: ANON KEY como fallback (menos permissões)
SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

> Importante: nunca exponha a `SERVICE_ROLE_KEY` no front-end. Use-a apenas em funções serverless.

## 2) Atualizar exemplo de ambiente

O arquivo `env.example` contém os campos `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` e `SUPABASE_ANON_KEY`. Copie-o para `.env` e ajuste.

## 3) Criar o schema no Supabase

No painel do Supabase, abra SQL → Editor, cole e execute o conteúdo de `scripts/create_supabase_schema.sql`:

- Cria as tabelas: `products`, `customers`, `sales`, `users`, `promotions`, `campaigns`.
- Adiciona índices e triggers para `updated_at`.

## 4) Conexão nas funções (Netlify)

As funções em `netlify/functions/postgres.ts` e `netlify/functions/test.ts` usam `@supabase/supabase-js`.

Exemplo de configuração (já existente no projeto):

```ts
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL || ''
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || ''
export const supabase = SUPABASE_URL && SUPABASE_KEY ? createClient(SUPABASE_URL, SUPABASE_KEY) : null
```

Observações:
- O cliente Supabase gerencia conexões de forma eficiente para ambientes serverless.
- Se você ainda usa scripts legados com `pg`, mantenha `DATABASE_URL/DB_*` no `.env` somente para esses scripts.

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

- Rode a função de teste: `/.netlify/functions/test` no seu deploy Netlify. Deve retornar contagens de tabelas.
- No front web (Vue), o `environment.apiBaseUrl` já aponta para `/.netlify/functions/postgres`.

---

Com isso, o projeto estará pronto para usar o Supabase com segurança e o schema consistente.