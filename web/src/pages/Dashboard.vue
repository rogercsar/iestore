<template>
  <div class="dashboard-container">
    <!-- Header -->
    <div class="dashboard-header">
      <h1 class="dashboard-title">Dashboard</h1>
      <div class="header-actions">
        <button class="notification-btn" @click="showNotifications = true">
          <span class="notification-icon">🔔</span>
          <span v-if="notificationCount > 0" class="notification-badge">
            {{ notificationCount > 99 ? '99+' : notificationCount }}
          </span>
        </button>
        <button class="menu-btn" @click="showMenu = true">
          <span>⚙️</span>
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="error-card">
      <div class="error-content">
        <span class="error-icon">⚠️</span>
        <div>
          <h3 class="error-title">Erro ao carregar dados</h3>
          <p class="error-message">{{ error }}</p>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div v-if="dashboardSummary" class="dashboard-content">
      <!-- Business Summary Section -->
      <div class="section">
        <h2 class="section-title">Resumo do Negócio</h2>
        <div class="summary-grid">
          <div class="summary-card primary-gradient">
            <div class="summary-content">
              <div class="summary-icon">
                <span class="icon">💰</span>
              </div>
              <div class="summary-info">
                <p class="summary-label">Total de Vendas</p>
                <p class="summary-value">
                  {{ formatCurrency(dashboardSummary.totalSalesValue || 0) }}
                </p>
              </div>
            </div>
          </div>
          <div class="summary-card success-gradient">
            <div class="summary-content">
              <div class="summary-icon">
                <span class="icon">📈</span>
              </div>
              <div class="summary-info">
                <p class="summary-label">Lucro Total</p>
                <p class="summary-value">
                  {{ formatCurrency(dashboardSummary.totalProfit || 0) }}
                </p>
              </div>
            </div>
          </div>
          <div class="summary-card warning-gradient" @click="navigateToPendingPayments">
            <div class="summary-content">
              <div class="summary-icon">
                <span class="icon">⏰</span>
              </div>
              <div class="summary-info">
                <p class="summary-label">Valores a Receber</p>
                <p class="summary-value">{{ formatCurrency(pendingAmount) }}</p>
              </div>
              <div class="summary-arrow">
                <span class="arrow">→</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Product Indicators Section -->
      <div class="section">
        <h2 class="section-title">Indicadores de Produtos</h2>
        <div class="indicators-grid">
          <div class="indicator-card">
            <div class="indicator-content">
              <span class="indicator-icon">📦</span>
              <p class="indicator-value">{{ dashboardSummary.totalProducts }}</p>
              <p class="indicator-label">Total Produtos</p>
            </div>
          </div>
          <div class="indicator-card">
            <div class="indicator-content">
              <span class="indicator-icon">⚠️</span>
              <p class="indicator-value">{{ dashboardSummary.lowStockProducts }}</p>
              <p class="indicator-label">Estoque Baixo</p>
            </div>
          </div>
          <div class="indicator-card">
            <div class="indicator-content">
              <span class="indicator-icon">✅</span>
              <p class="indicator-value">{{ dashboardSummary.totalProducts - dashboardSummary.lowStockProducts }}</p>
              <p class="indicator-label">Estoque OK</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Promotions Section -->
      <div class="section">
        <h2 class="section-title">Promoções Sugeridas</h2>
        <div class="promo-card">
          <h3 class="promo-title">💡 Movimente seu estoque!</h3>
          <div v-if="highStockProducts.length > 0" class="promo-list">
            <div 
              v-for="product in highStockProducts.slice(0, 3)" 
              :key="product.id"
              class="promo-item"
            >
              <div class="promo-info">
                <p class="promo-product">{{ product.name }}</p>
                <p class="promo-stock">{{ product.quantity }} em estoque</p>
              </div>
              <div class="promo-action">
                <p class="promo-price">{{ formatCurrency(product.unitPrice) }}</p>
                <p class="promo-discount">-20%</p>
              </div>
            </div>
          </div>
          <div v-else class="promo-empty">
            <p>Nenhum produto com estoque alto para promoção</p>
          </div>
        </div>
      </div>

      <!-- Performance Chart Section -->
      <div class="section">
        <h2 class="section-title">Desempenho Semanal</h2>
        <div class="chart-card">
          <div class="chart-header">
            <h3 class="chart-title">Vendas por dia</h3>
            <div class="chart-legend">
              <div class="legend-item">
                <div class="legend-color"></div>
                <span class="legend-text">Total vendido</span>
              </div>
            </div>
          </div>
          <div class="chart-container">
            <div v-if="loading" class="chart-loading">
              <div class="loading-spinner"></div>
            </div>
            <div v-else class="chart-placeholder">
              <span class="chart-icon">📈</span>
              <p class="chart-text">Gráfico de vendas será implementado aqui</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Notification Center Modal -->
    <NotificationCenter
      :visible="showNotifications"
      @close="showNotifications = false"
    />

    <!-- Menu Modal -->
    <div v-if="showMenu" class="menu-overlay" @click="showMenu = false">
      <div class="menu-modal" @click.stop>
        <div class="menu-header">
          <h3 class="menu-title">Menu</h3>
          <button class="menu-close" @click="showMenu = false">×</button>
        </div>
        <div class="menu-content">
          <button class="menu-item" @click="goToSettings">
            <span class="menu-icon">⚙️</span>
            Configurações
          </button>
          <button class="menu-item" @click="goToProfile">
            <span class="menu-icon">👤</span>
            Perfil
          </button>
          <button class="menu-item" @click="goToUsers">
            <span class="menu-icon">👥</span>
            Usuários
          </button>
          <button class="menu-item" @click="goToPendingPayments">
            <span class="menu-icon">💰</span>
            Pagamentos Pendentes
          </button>
          <button class="menu-item" @click="refreshData">
            <span class="menu-icon">🔄</span>
            Atualizar Dados
          </button>
          <button class="menu-item logout-item" @click="handleLogout">
            <span class="menu-icon">🚪</span>
            Sair do Sistema
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../stores/app'
import NotificationCenter from '../components/NotificationCenter.vue'
import type { Product } from '../services/api'

const router = useRouter()
const store = useAppStore()
const { dashboardSummary, products, loading, error } = store

const showNotifications = ref(false)
const showMenu = ref(false)
const notificationCount = ref(0)
const pendingAmount = ref(0)

const highStockProducts = computed(() => {
  return (products.value || []).filter(p => p.quantity > 10)
})

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

// Navigation functions
const goToSettings = () => {
  showMenu.value = false
  router.push('/settings')
}

const goToProfile = () => {
  showMenu.value = false
  router.push('/profile')
}

const goToUsers = () => {
  showMenu.value = false
  router.push('/users')
}

const goToPendingPayments = () => {
  showMenu.value = false
  router.push('/pending-payments')
}

const refreshData = () => {
  showMenu.value = false
  loadData()
}

const handleLogout = () => {
  showMenu.value = false
  if (confirm('Tem certeza que deseja sair do sistema?')) {
    // Remove token do localStorage
    localStorage.removeItem('auth_token')
    // Redireciona para login
    router.push('/login')
  }
}

const navigateToPendingPayments = () => {
  router.push('/pending-payments')
}

const loadData = async () => {
  await Promise.all([
    store.fetchDashboardSummary(),
    store.fetchProducts(),
    store.fetchSales()
  ])
  
  // Calculate pending amount from sales with installments
  const sales = store.sales.value || []
  const pending = sales.reduce((total, sale) => {
    if (sale.installments && sale.installments.length > 0) {
      const unpaidInstallments = sale.installments.filter(inst => 
        inst.status === 'pending' || inst.status === 'overdue'
      )
      return total + unpaidInstallments.reduce((sum, inst) => sum + inst.value, 0)
    }
    return total
  }, 0)
  pendingAmount.value = pending

  // Calculate notification count
  const notifications = sales.filter(sale => 
    sale.installments && sale.installments.some(inst => 
      inst.status === 'pending' || inst.status === 'overdue'
    )
  ).length
  notificationCount.value = notifications
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.dashboard-container {
  flex: 1;
  background-color: var(--background);
  padding: var(--space-6);
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: white;
  border-bottom: 1px solid var(--gray-200);
  margin-top: 2rem;
}

.dashboard-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--gray-800);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.notification-btn {
  position: relative;
  padding: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
}

.notification-icon {
  font-size: 1.25rem;
}

.notification-badge {
  position: absolute;
  top: 0;
  right: 0;
  background-color: var(--danger);
  color: white;
  border-radius: 10px;
  min-width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.625rem;
  font-weight: 700;
  padding: 0 4px;
}

.menu-btn {
  padding: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.25rem;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 3rem;
}

.loading-spinner {
  width: 3rem;
  height: 3rem;
  border: 3px solid var(--gray-200);
  border-top: 3px solid var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.error-card {
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 0.5rem;
  padding: 1rem;
  margin: 1rem;
}

.error-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.error-icon {
  font-size: 1.5rem;
}

.error-title {
  font-weight: 600;
  color: #991b1b;
}

.error-message {
  color: #dc2626;
}

.dashboard-content {
  padding: 1rem;
}

.section {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--gray-800);
  margin-bottom: 1rem;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-6);
  margin-bottom: var(--space-8);
}

.summary-card {
  border-radius: var(--radius-2xl);
  padding: var(--space-8);
  color: white;
  position: relative;
  overflow: hidden;
  transition: all var(--transition-normal);
  cursor: pointer;
}

.summary-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  opacity: 0;
  transition: opacity var(--transition-normal);
}

.summary-card:hover::before {
  opacity: 1;
}

.summary-card:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: var(--shadow-2xl);
}

.primary-gradient {
  background: linear-gradient(135deg, var(--primary-600) 0%, var(--primary-700) 100%);
  box-shadow: var(--shadow-sm);
}

.success-gradient {
  background: linear-gradient(135deg, var(--primary-500) 0%, var(--primary-600) 100%);
  box-shadow: var(--shadow-sm);
}

.warning-gradient {
  background: linear-gradient(135deg, var(--secondary-600) 0%, var(--secondary-700) 100%);
  box-shadow: var(--shadow-sm);
}

.summary-content {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  position: relative;
  z-index: 1;
}

.summary-icon {
  width: 60px;
  height: 60px;
  border-radius: var(--radius-xl);
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.summary-icon .icon {
  font-size: 1.5rem;
}

.summary-info {
  flex: 1;
}

.summary-label {
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: var(--space-1);
  opacity: 0.9;
  letter-spacing: 0.025em;
  text-transform: uppercase;
}

.summary-value {
  font-size: 1.75rem;
  font-weight: 800;
  letter-spacing: -0.025em;
  line-height: 1.2;
}

.summary-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  transition: all var(--transition-normal);
}

.summary-card:hover .summary-arrow {
  transform: translateX(4px);
  background: rgba(255, 255, 255, 0.3);
}

.arrow {
  font-size: 1.25rem;
  font-weight: 700;
}

.pending-card {
  border-radius: 0.75rem;
  padding: 1rem;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.pending-card:hover {
  transform: translateY(-2px);
}

.pending-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: white;
}

.pending-label {
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  opacity: 0.9;
}

.pending-value {
  font-size: 1.5rem;
  font-weight: 800;
}

.pending-arrow {
  font-size: 1.5rem;
  font-weight: bold;
}

.indicators-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-6);
}

.indicator-card {
  background: var(--background);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border);
  transition: all var(--transition-normal);
  position: relative;
  overflow: hidden;
}

.indicator-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--primary) 0%, var(--secondary) 50%, var(--accent) 100%);
  opacity: 0;
  transition: opacity var(--transition-normal);
}

.indicator-card:hover::before {
  opacity: 1;
}

.indicator-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  border-color: var(--primary-200);
}

.indicator-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  text-align: center;
}

.indicator-icon {
  font-size: 2rem;
  width: 60px;
  height: 60px;
  border-radius: var(--radius-xl);
  background: var(--primary-50);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-normal);
}

.indicator-card:hover .indicator-icon {
  transform: scale(1.1);
  background: var(--primary-100);
}

.indicator-value {
  font-size: 2rem;
  font-weight: 800;
  color: var(--heading);
  letter-spacing: -0.025em;
  line-height: 1;
}

.indicator-label {
  font-size: 0.875rem;
  color: var(--text-muted);
  font-weight: 500;
  letter-spacing: 0.025em;
  text-transform: uppercase;
}

.promo-card {
  background-color: white;
  border-radius: 0.5rem;
  padding: 1rem;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--gray-200);
}

.promo-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--gray-800);
  margin-bottom: 1rem;
}

.promo-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.promo-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--gray-200);
}

.promo-item:last-child {
  border-bottom: none;
}

.promo-product {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--gray-800);
}

.promo-stock {
  font-size: 0.75rem;
  color: var(--gray-500);
}

.promo-price {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--gray-800);
}

.promo-discount {
  font-size: 0.75rem;
  color: var(--danger);
  font-weight: 600;
}

.promo-empty {
  text-align: center;
  color: var(--gray-500);
  padding: 1rem;
}

.chart-card {
  background-color: white;
  border-radius: 0.5rem;
  padding: 1rem;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--gray-200);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.chart-title {
  color: var(--gray-800);
  font-weight: 700;
}

.chart-legend {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 6px;
  background-color: var(--primary);
}

.legend-text {
  color: var(--gray-500);
  font-size: 0.75rem;
}

.chart-container {
  height: 240px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-loading {
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: var(--gray-500);
}

.chart-icon {
  font-size: 3rem;
}

.chart-text {
  font-size: 0.875rem;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Menu Modal Styles */
.menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1000;
}

.menu-modal {
  background-color: white;
  border-top-left-radius: 1rem;
  border-top-right-radius: 1rem;
  width: 100%;
  max-width: 400px;
  max-height: 80vh;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
}

.menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--gray-200);
}

.menu-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--gray-800);
}

.menu-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--gray-500);
  padding: 0.25rem;
}

.menu-content {
  padding: 0.5rem;
}

.menu-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  transition: background-color 0.2s ease;
  border-radius: 0.5rem;
  margin: 0.25rem 0;
}

.menu-item:hover {
  background-color: var(--gray-50);
}

.menu-icon {
  font-size: 1.25rem;
  width: 1.5rem;
  text-align: center;
}

.menu-item {
  font-size: 1rem;
  color: var(--gray-800);
  font-weight: 500;
}

.logout-item {
  color: var(--danger);
  border-top: 1px solid var(--border);
  margin-top: var(--space-2);
  padding-top: var(--space-4);
}

.logout-item:hover {
  background-color: var(--danger-50);
  color: var(--danger-700);
}

@media (max-width: 768px) {
  .summary-grid {
    flex-direction: column;
  }
  
  .indicators-grid {
    flex-direction: column;
  }
  
  .dashboard-content {
    padding: 0.5rem;
  }
}
</style>
