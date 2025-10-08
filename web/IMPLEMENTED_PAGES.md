# Páginas Implementadas - Vue.js

Este documento lista todas as páginas Vue.js implementadas baseadas nas telas do Expo, com suas respectivas funcionalidades e rotas.

## 📱 Páginas Principais

### 1. **Dashboard** (`/dashboard`)
- **Arquivo**: `web/src/pages/Dashboard.vue`
- **Funcionalidades**:
  - Cards de resumo com gradientes
  - Indicadores de produtos
  - Seção de promoções
  - Gráfico de performance (placeholder)
  - Cálculo de valores pendentes

### 2. **Inventory** (`/inventory`)
- **Arquivo**: `web/src/pages/Inventory.vue`
- **Funcionalidades**:
  - Lista de produtos com filtros
  - Busca por nome/categoria
  - Ordenação por nome, quantidade, preço, lucro
  - Modal para adicionar produtos
  - Cards de produtos com informações detalhadas
  - Estados de loading e erro

### 3. **Sales** (`/sales`)
- **Arquivo**: `web/src/pages/Sales.vue`
- **Funcionalidades**:
  - Lista de vendas com filtros
  - Cards de resumo (vendas hoje, total, média)
  - Modal para nova venda
  - Filtros por data e status
  - Informações detalhadas de cada venda

### 4. **Customers** (`/customers`)
- **Arquivo**: `web/src/pages/Customers.vue`
- **Funcionalidades**:
  - Lista de clientes com filtros
  - Cards de resumo (clientes ativos, total)
  - Modal para adicionar clientes
  - Informações de vendas por cliente
  - Estados de loading e erro

### 5. **Settings** (`/settings`)
- **Arquivo**: `web/src/pages/Settings.vue`
- **Funcionalidades**:
  - Status da API
  - Configurações de notificações
  - Configurações de aparência
  - Configurações de auditoria
  - Backup e dados
  - Informações sobre a aplicação

## 🔧 Páginas de Gerenciamento

### 6. **Profile** (`/profile`)
- **Arquivo**: `web/src/pages/Profile.vue`
- **Funcionalidades**:
  - Edição de perfil do usuário
  - Campos: nome, email, telefone, empresa, endereço
  - Validação de campos obrigatórios
  - Avatar placeholder
  - Salvamento de alterações

### 7. **Users** (`/users`)
- **Arquivo**: `web/src/pages/Users.vue`
- **Funcionalidades**:
  - Lista de usuários do sistema
  - Modal para adicionar usuários
  - Controle de status (ativo/inativo)
  - Controle de permissões (admin/usuário)
  - Exclusão de usuários (exceto admin)

### 8. **Sales History** (`/sales-history`)
- **Arquivo**: `web/src/pages/SalesHistory.vue`
- **Funcionalidades**:
  - Histórico completo de vendas
  - Suporte a vendas simples e múltiplas
  - Modal de detalhes da venda
  - Informações de parcelas
  - Estados de loading e vazio

### 9. **Pending Payments** (`/pending-payments`)
- **Arquivo**: `web/src/pages/PendingPayments.vue`
- **Funcionalidades**:
  - Calendário de pagamentos pendentes
  - Navegação por mês
  - Modal com detalhes do dia
  - Marcar parcelas como pagas
  - Resumo do mês
  - Estados de urgência (vencendo, vencido)

## 🛍️ Páginas de Produtos

### 10. **Product Details** (`/product/:id`)
- **Arquivo**: `web/src/pages/ProductDetails.vue`
- **Funcionalidades**:
  - Detalhes completos do produto
  - Informações financeiras (custo, lucro, margem)
  - Informações de estoque
  - Compartilhamento via WhatsApp
  - Foto do produto
  - Estados de loading e erro

### 11. **Edit Product** (`/product/:id/edit`)
- **Arquivo**: `web/src/pages/EditProduct.vue`
- **Funcionalidades**:
  - Edição completa de produtos
  - Upload de fotos (placeholder)
  - Cálculo automático de lucro e margem
  - Validação de campos
  - Categorias predefinidas
  - Resumo financeiro em tempo real

### 12. **Public Product** (`/public/product/:name`)
- **Arquivo**: `web/src/pages/PublicProduct.vue`
- **Funcionalidades**:
  - Página pública para compartilhamento
  - Informações básicas do produto
  - Contato via WhatsApp
  - Design otimizado para mobile
  - Estados de loading e erro

## 🧩 Componentes Compartilhados

### 1. **Card** (`web/src/components/Card.vue`)
- Componente base para cards com sombras
- Suporte a diferentes níveis de sombra
- Padding customizável

### 2. **Section** (`web/src/components/Section.vue`)
- Componente para seções com título
- Estilo consistente com borda colorida

### 3. **SettingItem** (`web/src/components/SettingItem.vue`)
- Item de configuração com toggle
- Suporte a ícones e ações
- Design responsivo

### 4. **SaleDetailsModal** (`web/src/components/SaleDetailsModal.vue`)
- Modal para detalhes de vendas
- Suporte a vendas simples e múltiplas
- Informações de parcelas
- Compartilhamento via WhatsApp

### 5. **ProductListItem** (`web/src/components/ProductListItem.vue`)
- Item de lista de produtos
- Menu de contexto
- Informações financeiras
- Ações (editar, excluir, compartilhar)

### 6. **NotificationCenter** (`web/src/components/NotificationCenter.vue`)
- Centro de notificações
- Pagamentos pendentes e vencidos
- Marcar como pago
- Estados de urgência

## 🎨 Características do Design

### **Mobile-First**
- Design responsivo otimizado para mobile
- Breakpoints para desktop
- Navegação adaptativa

### **Expo-Inspired**
- Layout baseado nas telas do Expo
- Gradientes e sombras modernas
- Ícones emoji para simplicidade
- Cards com bordas arredondadas

### **Consistência**
- Variáveis CSS para cores e espaçamentos
- Componentes reutilizáveis
- Estados de loading e erro padronizados
- Transições suaves

## 🔗 Rotas Implementadas

```typescript
const routes = [
  { path: '/', redirect: '/dashboard' },
  { path: '/dashboard', component: Dashboard },
  { path: '/inventory', component: Inventory },
  { path: '/sales', component: Sales },
  { path: '/customers', component: Customers },
  { path: '/settings', component: Settings },
  { path: '/profile', component: Profile },
  { path: '/sales-history', component: SalesHistory },
  { path: '/users', component: Users },
  { path: '/pending-payments', component: PendingPayments },
  { path: '/product/:id', component: ProductDetails },
  { path: '/product/:id/edit', component: EditProduct },
  { path: '/public/product/:name', component: PublicProduct }
]
```

## 📱 Navegação

A navegação principal inclui:
- Dashboard
- Inventory
- Sales
- Customers
- Settings
- Profile
- Sales History
- Users
- Pending Payments

## 🚀 Próximos Passos

1. **Integração com API Real**: Conectar com Google Sheets via Netlify Functions
2. **Upload de Imagens**: Implementar upload real de fotos de produtos
3. **Autenticação**: Sistema de login e controle de acesso
4. **Notificações Push**: Sistema de notificações em tempo real
5. **PWA**: Transformar em Progressive Web App
6. **Testes**: Implementar testes unitários e de integração

## 📝 Notas Técnicas

- **Framework**: Vue 3 com Composition API
- **Roteamento**: Vue Router
- **Estado**: Pinia
- **Estilo**: CSS com variáveis customizadas
- **Responsividade**: Mobile-first com breakpoints
- **Acessibilidade**: Semântica HTML e navegação por teclado
- **Performance**: Lazy loading de componentes e otimizações
