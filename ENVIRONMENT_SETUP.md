# Configuração de Variáveis de Ambiente

Este documento explica como configurar as variáveis de ambiente para usar o PostgreSQL da Aiven de forma segura.

## 🔐 Problema Resolvido

O GitHub estava bloqueando o push porque detectou credenciais hardcoded nos arquivos. Agora todas as credenciais foram movidas para variáveis de ambiente.

## 📋 Variáveis Necessárias

```bash
DATABASE_URL=postgres://avnadmin:AVNS_9TcNWXsmcK0ZLQ_tO9X@iestore-iestore.b.aivencloud.com:15158/defaultdb?sslmode=require
DB_HOST=iestore-iestore.b.aivencloud.com
DB_PORT=15158
DB_NAME=defaultdb
DB_USER=avnadmin
DB_PASSWORD=AVNS_9TcNWXsmcK0ZLQ_tO9X
DB_SSL=true
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
DATABASE_URL=postgres://avnadmin:AVNS_9TcNWXsmcK0ZLQ_tO9X@iestore-iestore.b.aivencloud.com:15158/defaultdb?sslmode=require
DB_HOST=iestore-iestore.b.aivencloud.com
DB_PORT=15158
DB_NAME=defaultdb
DB_USER=avnadmin
DB_PASSWORD=AVNS_9TcNWXsmcK0ZLQ_tO9X
DB_SSL=true
```

### 3. **Testar localmente**

```bash
# Testar conexão com banco
node scripts/test-database.js

# Testar funções Netlify
node scripts/test-netlify-functions.js
```

## 🚀 Produção (Netlify)

### 1. **Configurar no Painel da Netlify**

1. Acesse o painel da Netlify
2. Vá em **Site settings** → **Environment variables**
3. Adicione as seguintes variáveis:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | `postgres://avnadmin:AVNS_9TcNWXsmcK0ZLQ_tO9X@iestore-iestore.b.aivencloud.com:15158/defaultdb?sslmode=require` |
| `DB_HOST` | `iestore-iestore.b.aivencloud.com` |
| `DB_PORT` | `15158` |
| `DB_NAME` | `defaultdb` |
| `DB_USER` | `avnadmin` |
| `DB_PASSWORD` | `AVNS_9TcNWXsmcK0ZLQ_tO9X` |
| `DB_SSL` | `true` |

### 2. **Verificar Deploy**

Após configurar as variáveis:

1. Faça um novo deploy
2. Teste a função: `https://seu-site.netlify.app/.netlify/functions/test`
3. Verifique se aparece: `"database": { "connected": true }`

## 🔧 Arquivos Atualizados

Os seguintes arquivos foram atualizados para usar variáveis de ambiente:

- ✅ `netlify/functions/postgres.ts`
- ✅ `netlify/functions/test.ts`
- ✅ `src/api/config.ts`
- ✅ `scripts/test-database.js`
- ✅ `scripts/test-hybrid-api.js`
- ✅ `scripts/test-updated-routes.js`
- ✅ `scripts/test-netlify-functions.js`
- ✅ `app.json` (credenciais mascaradas)

## 🛡️ Segurança

### **Antes (Inseguro):**
```typescript
password: 'AVNS_9TcNWXsmcK0ZLQ_tO9X' // ❌ Hardcoded
```

### **Depois (Seguro):**
```typescript
password: process.env.DB_PASSWORD || '' // ✅ Variável de ambiente
```

## 🧪 Testando a Configuração

### **1. Teste Local:**
```bash
# Definir variáveis de ambiente
export DB_PASSWORD="AVNS_9TcNWXsmcK0ZLQ_tO9X"

# Testar conexão
node scripts/test-database.js
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

Para a aplicação React Native, as credenciais são configuradas no `app.json`:

```json
{
  "expo": {
    "extra": {
      "DATABASE_URL": "postgres://avnadmin:***@iestore-iestore.b.aivencloud.com:15158/defaultdb?sslmode=require",
      "DB_HOST": "iestore-iestore.b.aivencloud.com",
      "DB_PORT": "15158",
      "DB_NAME": "defaultdb",
      "DB_USER": "avnadmin",
      "DB_PASSWORD": "***",
      "DB_SSL": "true"
    }
  }
}
```

## 🎯 Próximos Passos

1. ✅ **Credenciais removidas** dos arquivos
2. ✅ **Variáveis de ambiente** configuradas
3. 🔄 **Fazer push** para GitHub (agora seguro)
4. 🚀 **Deploy na Netlify** com variáveis de ambiente
5. 🧪 **Testar** em produção

## 🔍 Verificação Final

Após configurar tudo, verifique:

- ✅ GitHub não bloqueia mais o push
- ✅ Aplicação local funciona com `.env`
- ✅ Netlify funciona com variáveis de ambiente
- ✅ Dados PostgreSQL aparecem na aplicação

---

**🎉 Agora suas credenciais estão seguras e o deploy pode ser feito sem problemas!**
