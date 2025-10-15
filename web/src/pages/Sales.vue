<template>
  <div class="sales-container">
    <!-- Header -->
    <div class="sales-header">
      <h1 class="sales-title">Vendas</h1>
      <button class="new-sale-button" @click="showNewSaleModal = true">
        <span class="new-sale-icon">💰</span>
        <span class="new-sale-text">Nova Venda</span>
      </button>
    </div>

    <!-- Summary Cards -->
    <div class="summary-section">
      <div class="summary-card primary-gradient">
        <div class="summary-content">
          <p class="summary-label">Total de Vendas</p>
          <p class="summary-value">{{ formatCurrency(totalSales) }}</p>
        </div>
      </div>
      <div class="summary-card success-gradient">
        <div class="summary-content">
          <p class="summary-label">Vendas Hoje</p>
          <p class="summary-value">{{ todaySales }}</p>
        </div>
      </div>
      <div class="summary-card warning-gradient">
        <div class="summary-content">
          <p class="summary-label">Ticket Médio</p>
          <p class="summary-value">{{ formatCurrency(averageTicket) }}</p>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-card">
      <div class="filters-row">
        <div class="filter-group">
          <select class="filter-select" v-model="dateFilter">
            <option value="today">Hoje</option>
            <option value="week">Esta Semana</option>
            <option value="month">Este Mês</option>
            <option value="all">Todas</option>
          </select>
        </div>
        <div class="filter-group">
          <select class="filter-select" v-model="statusFilter">
            <option value="">Todos os Status</option>
            <option value="completed">Concluídas</option>
            <option value="pending">Pendentes</option>
            <option value="cancelled">Canceladas</option>
          </select>
        </div>
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
          <h3 class="error-title">Erro ao carregar vendas</h3>
          <p class="error-message">{{ error }}</p>
        </div>
      </div>
    </div>

    <!-- Sales List -->
    <div v-if="!loading && !error" class="sales-list">
      <div 
        v-for="sale in filteredSales" 
        :key="sale.id"
        class="sale-item"
      >
        <div class="sale-header">
          <div class="sale-info">
            <h3 class="sale-customer">{{ sale.customerName }}</h3>
            <p class="sale-date">{{ formatDate(sale.dateISO) }}</p>
          </div>
          <div class="sale-status" :class="sale.status">
            {{ getStatusText(sale.status) }}
          </div>
        </div>
        
        <div class="sale-details">
          <div class="detail-row">
            <span class="detail-label">Produto:</span>
            <span class="detail-value">{{ sale.product }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Quantidade:</span>
            <span class="detail-value">{{ sale.quantity }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Valor Total:</span>
            <span class="detail-value price">{{ formatCurrency(sale.totalValue) }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Lucro:</span>
            <span class="detail-value profit">{{ formatCurrency(sale.profit) }}</span>
          </div>
        </div>

        <div class="sale-actions">
          <button class="action-btn view-btn" @click="viewSale(sale)">
            <span>👁️</span>
            Ver Detalhes
          </button>
          <button v-if="sale.status === 'pending'" class="action-btn complete-btn" @click="completeSale(sale.id!)">
            <span>✅</span>
            Concluir
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!loading && !error && filteredSales.length === 0" class="empty-state">
      <div class="empty-card">
        <span class="empty-icon">💰</span>
        <h3 class="empty-title">Nenhuma venda encontrada</h3>
        <p class="empty-subtitle">
          {{ dateFilter !== 'all' ? 'Tente ajustar o filtro de data' : 'Comece registrando sua primeira venda' }}
        </p>
      </div>
    </div>

    <!-- New Sale Modal -->
    <div v-if="showNewSaleModal" class="modal-overlay" @click="showNewSaleModal = false">
      <div class="modal-content" @click.stop>
        <h3 class="modal-title">Nova Venda</h3>
        <form @submit.prevent="handleNewSale">
          <div class="form-group">
            <label class="form-label">Cliente</label>
            <select class="form-input" v-model="newSale.customerId" required>
              <option value="">Selecione um cliente</option>
              <option v-for="customer in customers" :key="customer.id" :value="customer.id">
                {{ customer.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Produto</label>
            <select class="form-input" v-model="newSale.productId" required>
              <option value="">Selecione um produto</option>
              <option v-for="product in products" :key="product.id" :value="product.id">
                {{ product.name }} - {{ formatCurrency(product.unitPrice) }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Quantidade</label>
            <input type="number" class="form-input" v-model="newSale.quantity" required min="1">
          </div>
          <div class="form-group">
            <label class="form-label">Forma de Pagamento</label>
            <select class="form-input" v-model="newSale.paymentMethod" required>
              <option value="">Selecione a forma de pagamento</option>
              <option value="cash">Dinheiro</option>
              <option value="card">Cartão</option>
              <option value="pix">PIX</option>
              <option value="installments">Parcelado</option>
            </select>
          </div>
          <div v-if="newSale.paymentMethod === 'installments'" class="form-group">
            <label class="form-label">Número de Parcelas</label>
            <input type="number" class="form-input" v-model="newSale.installments" min="2" max="12">
          </div>
          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" @click="showNewSaleModal = false">Cancelar</button>
            <button type="submit" class="btn btn-primary" :disabled="loading">
              {{ loading ? 'Salvando...' : 'Registrar Venda' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useAppStore } from '../stores/app'
import type { Sale, Customer, Product } from '../services/api'

const store = useAppStore()
// Use storeToRefs to keep reactivity and refs instead of unwrapped primitives
const { sales, customers, products, loading, error } = storeToRefs(store)

const dateFilter = ref('today')
const statusFilter = ref('')
const showNewSaleModal = ref(false)

const newSale = ref({
  customerId: '',
  productId: '',
  quantity: 1,
  paymentMethod: '',
  installments: 2
})

const filteredSales = computed(() => {
  let filtered = sales.value || []

  // Filter by date
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  
  switch (dateFilter.value) {
    case 'today':
      filtered = filtered.filter(sale => {
        const saleDate = new Date(sale.dateISO)
        return saleDate >= today
      })
      break
    case 'week':
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      filtered = filtered.filter(sale => new Date(sale.dateISO) >= weekAgo)
      break
    case 'month':
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
      filtered = filtered.filter(sale => new Date(sale.dateISO) >= monthAgo)
      break
  }

  // Filter by status
  if (statusFilter.value) {
    filtered = filtered.filter(sale => sale.status === statusFilter.value)
  }

  return filtered.sort((a, b) => new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime())
})

const totalSales = computed(() => {
  return (sales.value || []).reduce((sum, sale) => sum + sale.totalValue, 0)
})

const todaySales = computed(() => {
  const today = new Date()
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  return (sales.value || []).filter(sale => new Date(sale.dateISO) >= todayStart).length
})

const averageTicket = computed(() => {
  if ((sales.value || []).length === 0) return 0
  return totalSales.value / (sales.value || []).length
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
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'completed': return 'Concluída'
    case 'pending': return 'Pendente'
    case 'cancelled': return 'Cancelada'
    default: return status
  }
}

const viewSale = (sale: Sale) => {
  console.log('View sale:', sale)
  // TODO: Implement sale details modal
}

const completeSale = async (id: string) => {
  console.log('Complete sale:', id)
  // TODO: Implement complete sale functionality
}

  const handleNewSale = async () => {
  try {
    loading.value = true
    console.log('New sale:', newSale.value)
    
    // Encontrar o produto selecionado
    const selectedProduct = products.value.find(p => p.id === newSale.value.productId)
    const selectedCustomer = customers.value.find(c => c.id === newSale.value.customerId)
    
    if (!selectedProduct) {
      alert('Produto não encontrado')
      return
    }
    
    if (!selectedCustomer) {
      alert('Cliente não encontrado')
      return
    }
    
    // Calcular valores
    const quantity = newSale.value.quantity
    const totalValue = selectedProduct.unitPrice * quantity
    const totalCost = selectedProduct.cost * quantity
    const profit = totalValue - totalCost
    
    // Criar objeto da venda
    const saleData: any = {
      dateISO: new Date().toISOString(),
      product: selectedProduct.name,
      quantity: quantity,
      totalValue: totalValue,
      totalCost: totalCost,
      profit: profit,
      customerName: selectedCustomer.name,
      customerPhone: selectedCustomer.phone,
      paymentMethod: newSale.value.paymentMethod,
      status: 'paid'
    }

    console.log('Sale data:', saleData)
    
    // Gerar parcelas se for pagamento parcelado
    if (newSale.value.paymentMethod === 'installments' && Number(newSale.value.installments) > 1) {
      const count = Number(newSale.value.installments)
      const baseValue = Math.round((totalValue / count) * 100) / 100
      const installments: any[] = []
      let accumulated = 0
      const today = new Date()
      for (let i = 0; i < count; i++) {
        const value = i === count - 1 ? Number((totalValue - accumulated).toFixed(2)) : baseValue
        accumulated += value
        const dueDate = new Date(today.getFullYear(), today.getMonth() + i + 1, today.getDate())
        installments.push({
          id: `inst_${Date.now()}_${i + 1}`,
          number: i + 1,
          value,
          dueDate: dueDate.toISOString(),
          status: 'pending'
        })
      }
      saleData.installments = installments
      saleData.status = 'pending'
    }

    // Salvar a venda
    await store.createSale(saleData)
    
    alert('Venda registrada com sucesso!')
    
    // Fechar modal e limpar formulário
    showNewSaleModal.value = false
    newSale.value = {
      customerId: '',
      productId: '',
      quantity: 1,
      paymentMethod: '',
      installments: 2
    }
    
  } catch (error) {
    console.error('Erro ao registrar venda:', error)
    alert('Erro ao registrar venda. Tente novamente.')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  store.fetchSales()
  store.fetchCustomers()
  store.fetchProducts()
})
</script>

<style scoped>
.sales-container {
  flex: 1;
  background-color: var(--gray-50);
  padding: 1rem;
}

.sales-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
  margin-bottom: 1.5rem;
}

.sales-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--gray-800);
}

.new-sale-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, var(--success) 0%, var(--accent-dark) 100%);
  color: white;
  border: none;
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.new-sale-button:hover {
  transform: translateY(-2px);
}

.new-sale-icon {
  font-size: 1.25rem;
}

.summary-section {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.summary-card {
  flex: 1;
  border-radius: 0.75rem;
  padding: 1rem;
  color: white;
}

.primary-gradient {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
}

.success-gradient {
  background: linear-gradient(135deg, var(--success) 0%, var(--accent-dark) 100%);
}

.warning-gradient {
  background: linear-gradient(135deg, var(--warning) 0%, #f59e0b 100%);
}

.summary-label {
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  opacity: 0.9;
}

.summary-value {
  font-size: 1.5rem;
  font-weight: 800;
}

.filters-card {
  background-color: white;
  border-radius: 0.75rem;
  padding: 1rem;
  margin-bottom: 1.5rem;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--gray-200);
}

.filters-row {
  display: flex;
  gap: 1rem;
}

.filter-group {
  flex: 1;
}

.filter-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--gray-300);
  border-radius: 0.5rem;
  font-size: 1rem;
  background-color: white;
  cursor: pointer;
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
  margin-bottom: 1.5rem;
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

.sales-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.sale-item {
  background-color: white;
  border-radius: 0.75rem;
  padding: 1rem;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--gray-200);
  transition: all 0.2s ease;
}

.sale-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.sale-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.sale-info {
  flex: 1;
}

.sale-customer {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--gray-800);
  margin-bottom: 0.25rem;
}

.sale-date {
  font-size: 0.875rem;
  color: var(--gray-500);
}

.sale-status {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.sale-status.completed {
  background-color: #f0fdf4;
  color: var(--success-dark);
}

.sale-status.pending {
  background-color: #fffbeb;
  color: var(--warning-dark);
}

.sale-status.cancelled {
  background-color: #fef2f2;
  color: var(--danger);
}

.sale-details {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-label {
  font-size: 0.875rem;
  color: var(--gray-600);
  font-weight: 500;
}

.detail-value {
  font-weight: 600;
  font-size: 0.875rem;
}

.detail-value.price {
  color: var(--success);
}

.detail-value.profit {
  color: var(--primary);
}

.sale-actions {
  display: flex;
  gap: 0.75rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.view-btn {
  background-color: var(--gray-100);
  color: var(--gray-700);
}

.view-btn:hover {
  background-color: var(--gray-200);
}

.complete-btn {
  background-color: var(--success-light);
  color: var(--success-dark);
}

.complete-btn:hover {
  background-color: var(--success);
  color: white;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 3rem;
}

.empty-card {
  text-align: center;
  background-color: white;
  border-radius: 0.75rem;
  padding: 2rem;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--gray-200);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--gray-800);
  margin-bottom: 0.5rem;
}

.empty-subtitle {
  color: var(--gray-500);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background-color: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  width: 100%;
  max-width: 28rem;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--gray-800);
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--gray-700);
  margin-bottom: 0.5rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--gray-300);
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.btn {
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary {
  background-color: var(--gray-100);
  color: var(--gray-700);
}

.btn-secondary:hover {
  background-color: var(--gray-200);
}

.btn-primary {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-1px);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .sales-container {
    padding: 0.5rem;
  }
  
  .sales-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .new-sale-button {
    justify-content: center;
  }
  
  .summary-section {
    flex-direction: column;
  }
  
  .filters-row {
    flex-direction: column;
  }
  
  .sale-details {
    grid-template-columns: 1fr;
  }
  
  .sale-actions {
    flex-direction: column;
  }
  
  .modal-actions {
    flex-direction: column;
  }
}
</style>