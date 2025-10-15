# Configuração de Variáveis de Ambiente (Supabase)

Este documento explica como configurar as variáveis de ambiente para usar o Supabase com segurança nas funções Netlify.

## 🔐 Problema Resolvido

O GitHub estava bloqueando o push porque detectou credenciais hardcoded nos arquivos. Agora todas as credenciais foram movidas para variáveis de ambiente.

## 📋 Variáveis Necessárias

```bash
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
# Opcional: fallback com ANON KEY (menos permissões)
SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

## 🏠 Desenvolvimento Local

### 1. **Criar arquivo .env**

Crie um arquivo `.env` na raiz do projeto:

```bash
# Copie o arquivo de exemplo
cp env.example .env

# Edite o arquivo .env com suas credenciais reais
```

### 2. **Conteúdo do .env**

```bash
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

### 3. **Testar localmente**

```bash
# Testar função de saúde
curl http://localhost:8888/.netlify/functions/test

# Testar endpoints
curl "http://localhost:8888/.netlify/functions/postgres?table=products"
```

## 🚀 Produção (Netlify)

### 1. **Configurar no Painel da Netlify**

1. Acesse o painel da Netlify
2. Vá em **Site settings** → **Environment variables**
3. Adicione as seguintes variáveis:

| Variable | Value |
|----------|-------|
| `SUPABASE_URL` | `https://YOUR_PROJECT_REF.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | `YOUR_SERVICE_ROLE_KEY` |
| `SUPABASE_ANON_KEY` | `YOUR_ANON_KEY` (opcional) |

### 2. **Verificar Deploy**

Após configurar as variáveis:

1. Faça um novo deploy
2. Teste a função: `https://seu-site.netlify.app/.netlify/functions/test`
3. Verifique se a resposta JSON contém contagens de tabelas sem erro.

## 🔧 Arquivos Atualizados

Os seguintes arquivos usam as variáveis do Supabase:

- ✅ `netlify/functions/postgres.ts`
- ✅ `netlify/functions/test.ts`
- ✅ `web/src/config/environment.ts` (apenas base URL do endpoint)

## 🛡️ Segurança

### **Antes (Inseguro):**
```typescript
password: 'YOUR_PASSWORD' // ❌ Hardcoded
```

### **Depois (Seguro):**
```typescript
const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY // ✅ Variável de ambiente (apenas no backend)
```

## 🧪 Testando a Configuração

### **1. Teste Local:**
```bash
# Definir variáveis de ambiente
export SUPABASE_URL="https://YOUR_PROJECT_REF.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="YOUR_SERVICE_ROLE_KEY"

# Testar função
curl http://localhost:8888/.netlify/functions/test
```

### **2. Teste Netlify:**
```bash
# Fazer deploy
git add .
git commit -m "feat: Use environment variables for database credentials"
git push origin main

# Testar em produção
curl https://seu-site.netlify.app/.netlify/functions/test
```

## 📱 Aplicação React Native

Para a aplicação React Native, não defina `SERVICE_ROLE_KEY`. Use o endpoint `/.netlify/functions/postgres` para acessar dados com segurança.

## 🎯 Próximos Passos

1. ✅ **Credenciais adicionadas** ao `.env` ou Netlify
2. ✅ **Deploy** na Netlify com variáveis `SUPABASE_*`
3. 🧪 **Testar** endpoints de produtos/clientes/vendas

## 🔍 Verificação Final

Após configurar tudo, verifique:

- ✅ Aplicação local funciona com `.env`
- ✅ Netlify funciona com variáveis de ambiente
- ✅ Dados do Supabase aparecem na aplicação

---

**🎉 Agora suas credenciais estão seguras e o deploy pode ser feito sem problemas!**
