# iestore - Sistema de Gestão de Estoque

Sistema completo de gestão de estoque e vendas desenvolvido com React Native e Expo.

## Funcionalidades

- 📊 Dashboard com métricas e gráficos
- 📦 Gestão de estoque com categorias
- 💰 Sistema de vendas com múltiplas formas de pagamento
- 👥 Gestão de clientes
- 📱 Interface responsiva para web e mobile
- 🔔 Sistema de notificações
- 📈 Relatórios de vendas e lucros

## Tecnologias

- React Native
- Expo
- TypeScript
- AsyncStorage
- Victory Charts
- React Navigation

## Desenvolvimento

```bash
# Instalar dependências
npm install

# Iniciar em modo desenvolvimento
npm start

# Iniciar para web
npm run web
```

## Build para Produção

```bash
# Build para web
npm run build:web
```

## Deploy na Netlify

1. **Preparar o repositório:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Fazer push para GitHub:**
   ```bash
   git remote add origin https://github.com/seu-usuario/iestore.git
   git push -u origin main
   ```

3. **Conectar na Netlify:**
   - Acesse [netlify.com](https://netlify.com)
   - Clique em "New site from Git"
   - Conecte seu repositório GitHub
   - Configure:
     - Build command: `npm run build:web`
     - Publish directory: `dist`
   - Clique em "Deploy site"

## Configuração Automática

O arquivo `netlify.toml` já está configurado com:
- Comando de build: `npm run build:web`
- Diretório de publicação: `dist`
- Redirects para SPA (Single Page Application)

## Estrutura do Projeto

```
src/
├── components/     # Componentes reutilizáveis
├── screens/        # Telas da aplicação
├── api/           # Gerenciamento de dados local
├── hooks/         # Custom hooks
├── services/      # Serviços (notificações, etc.)
├── types/         # Definições TypeScript
├── utils/         # Funções utilitárias
└── theme/         # Configuração de tema
```

## Funcionalidades Principais

### Dashboard
- Resumo de vendas e lucros
- Indicadores de estoque
- Gráficos de performance
- Valores a receber

### Estoque
- Listagem de produtos
- Busca e filtros
- Gestão de categorias
- Upload de fotos

### Vendas
- Registro de vendas
- Múltiplas formas de pagamento
- Vendas parceladas
- Histórico completo

### Clientes
- Cadastro de clientes
- Histórico de compras
- Controle de pendências
- Estatísticas de consumo

## Licença

MIT