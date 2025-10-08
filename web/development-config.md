# Configuração de Desenvolvimento

## Sincronização com Google Sheets

### 🏠 Desenvolvimento Local
**Automaticamente detectado**: A aplicação detecta que está rodando localmente e usa dados mockados automaticamente.

### 🌐 Produção (Netlify)
**Sincronização real**: Quando deployado no Netlify, a aplicação se conecta automaticamente ao Google Sheets.

### ⚙️ Configuração Manual (Opcional)
Se quiser forçar o comportamento, crie um arquivo `.env` na pasta `web/`:

```env
# Forçar uso de dados mockados (mesmo em produção)
VITE_USE_MOCK_DATA=true

# Forçar tentativa de conexão real (mesmo em desenvolvimento local)
VITE_USE_MOCK_DATA=false
```

## Status da API

O componente `ApiStatus` na página de Configurações mostra:
- ✅ **Conectado**: Usando Google Sheets real (produção)
- ❌ **Desconectado**: Usando dados mockados (desenvolvimento local)
- 🔄 **Testando**: Verificando conexão

## Como funciona

### Desenvolvimento Local (`npm run dev`)
1. **Detecção automática**: A aplicação detecta que as Netlify Functions não estão disponíveis
2. **Fallback inteligente**: Usa dados mockados automaticamente
3. **Sem erros**: Não mostra erros no console, apenas informa que está usando dados locais

### Produção (Netlify)
1. **Conexão real**: As Netlify Functions estão disponíveis
2. **Sincronização**: Conecta diretamente ao Google Sheets
3. **Dados em tempo real**: Todas as mudanças aparecem instantaneamente

## Netlify Functions

As funções estão em `netlify/functions/sheets.ts` e `netlify/functions/test.ts`. Elas só funcionam quando deployadas no Netlify.

## Debugging

Para verificar o comportamento:
1. Abra o DevTools (F12) → Console
2. Procure por mensagens:
   - `🔧 Local development detected` = Usando dados mockados
   - `✅ Netlify functions are working` = Conectado ao Google Sheets
   - `Using mock data for [endpoint]` = Dados simulados

## Resumo

- **Desenvolvimento**: Dados mockados (automático)
- **Produção**: Google Sheets real (automático)
- **Configuração**: Opcional via `.env`
