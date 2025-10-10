<template>
  <div class="customer-details">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <button class="back-btn" @click="goBack">
          <span>←</span>
          Voltar
        </button>
        <div class="header-info">
          <h1 class="page-title">Detalhes do Cliente</h1>
          <p class="page-subtitle">Informações completas e histórico de compras</p>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Carregando dados do cliente...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="error-container">
      <div class="error-icon">❌</div>
      <h3>Erro ao carregar cliente</h3>
      <p>{{ error }}</p>
      <button class="retry-btn" @click="loadCustomer">Tentar novamente</button>
    </div>

    <!-- Customer Details -->
    <div v-else-if="customer" class="customer-content">
      <!-- Customer Info Card -->
      <div class="info-card">
        <div class="card-header">
          <div class="customer-avatar">
            <span>{{ customerInitials }}</span>
          </div>
          <div class="customer-basic-info">
            <h2 class="customer-name">{{ customer.name }}</h2>
            <div class="customer-status">
              <span class="status-badge" :class="customer.status">
                {{ customer.status === 'active' ? 'Ativo' : 'Inativo' }}
              </span>
            </div>
          </div>
          <div class="customer-actions">
            <button class="action-btn edit-btn" @click="editCustomer">
              <span>✏️</span>
              Editar
            </button>
            <button class="action-btn delete-btn" @click="deleteCustomer">
              <span>🗑️</span>
              Excluir
            </button>
          </div>
        </div>

        <div class="card-content">
          <div class="info-grid">
            <div class="info-item">
              <label>Telefone</label>
              <span>{{ customer.phone || 'Não informado' }}</span>
            </div>
            <div class="info-item">
              <label>Email</label>
              <span>{{ customer.email || 'Não informado' }}</span>
            </div>
            <div class="info-item">
              <label>Endereço</label>
              <span>{{ customer.address || 'Não informado' }}</span>
            </div>
            <div class="info-item">
              <label>Total de Compras</label>
              <span>{{ customer.totalPurchases || 0 }}</span>
            </div>
            <div class="info-item">
              <label>Valor Total</label>
              <span>R$ {{ formatCurrency(customer.totalValue) }}</span>
            </div>
            <div class="info-item">
              <label>Valor Pendente</label>
              <span>R$ {{ formatCurrency(customer.pendingAmount) }}</span>
            </div>
            <div class="info-item">
              <label>Última Compra</label>
              <span>{{ formatDate(customer.lastPurchase) }}</span>
            </div>
          </div>

          <div v-if="customer.notes" class="notes-section">
            <h3>Observações</h3>
            <p>{{ customer.notes }}</p>
          </div>
        </div>
      </div>

      <!-- Sales History -->
      <div class="sales-section">
        <div class="section-header">
          <h3>Histórico de Vendas</h3>
          <span class="sales-count">{{ customerSales.length }} vendas</span>
        </div>

        <div v-if="customerSales.length === 0" class="empty-state">
          <div class="empty-icon">📊</div>
          <h4>Nenhuma venda registrada</h4>
          <p>Este cliente ainda não possui histórico de compras.</p>
        </div>

        <div v-else class="sales-list">
          <div v-for="sale in customerSales" :key="sale.id" class="sale-item">
            <div class="sale-info">
              <div class="sale-product">{{ sale.product }}</div>
              <div class="sale-date">{{ formatDate(sale.dateISO) }}</div>
            </div>
            <div class="sale-details">
              <div class="sale-quantity">Qtd: {{ sale.quantity }}</div>
              <div class="sale-value">R$ {{ formatCurrency(sale.totalValue) }}</div>
              <div class="sale-status" :class="sale.status">
                {{ sale.status === 'paid' ? 'Pago' : 'Pendente' }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '../stores/app'
import { useAlert } from '../composables/useAlert'

const route = useRoute()
const router = useRouter()
const store = useAppStore()
const { success, error: showError, confirm } = useAlert()

const loading = ref(true)
const error = ref('')
const customer = ref(null)
const customerSales = ref([])

const customerId = computed(() => route.params.id as string)

const customerInitials = computed(() => {
  if (!customer.value?.name) return '??'
  const names = customer.value.name.split(' ')
  if (names.length >= 2) {
    return (names[0][0] + names[1][0]).toUpperCase()
  }
  return names[0][0].toUpperCase()
})

const loadCustomer = async () => {
  try {
    loading.value = true
    error.value = ''
    
    // Carregar clientes
    await store.fetchCustomers()
    const customers = store.customers
    
    // Encontrar cliente específico
    const foundCustomer = customers.find(c => c.id === customerId.value)
    if (!foundCustomer) {
      error.value = 'Cliente não encontrado'
      return
    }
    
    customer.value = foundCustomer
    
    // Carregar vendas do cliente
    await store.fetchSales()
    const allSales = store.sales
    customerSales.value = allSales.filter(sale => 
      sale.customerName === foundCustomer.name || 
      sale.customerPhone === foundCustomer.phone
    )
    
  } catch (err) {
    console.error('Erro ao carregar cliente:', err)
    error.value = 'Erro ao carregar dados do cliente'
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.go(-1)
}

const editCustomer = () => {
  router.push(`/customer/${customerId.value}/edit`)
}

const deleteCustomer = async () => {
  const confirmed = await confirm(
    'Confirmar Exclusão',
    `Tem certeza que deseja excluir o cliente "${customer.value.name}"?`,
    'Esta ação não pode ser desfeita.'
  )
  
  if (confirmed) {
    try {
      await store.deleteCustomer(customerId.value)
      await success(
        'Cliente Excluído',
        'Cliente excluído com sucesso!'
      )
      router.push('/customers')
    } catch (err) {
      await showError(
        'Erro ao Excluir',
        'Não foi possível excluir o cliente.',
        err.message
      )
    }
  }
}

const formatCurrency = (value) => {
  if (!value) return '0,00'
  return parseFloat(value).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

const formatDate = (dateString) => {
  if (!dateString) return 'Nunca'
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  loadCustomer()
})
</script>

<style scoped>
.customer-details {
  padding: 1.5rem;
  padding-top: 5rem; /* Espaço para o header fixo */
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
  margin-top: 2rem; /* Espaço adicional para o botão de voltar */
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
}

.back-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.header-info {
  flex: 1;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
}

.page-subtitle {
  color: #6b7280;
  margin: 0;
}

.loading-container, .error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.loading-spinner {
  width: 3rem;
  height: 3rem;
  border: 3px solid #e5e7eb;
  border-top: 3px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.retry-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 600;
  margin-top: 1rem;
}

.customer-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.info-card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-bottom: 1px solid #e5e7eb;
}

.customer-avatar {
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  font-weight: 700;
}

.customer-basic-info {
  flex: 1;
}

.customer-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 600;
}

.status-badge.active {
  background: #dcfce7;
  color: #166534;
}

.status-badge.inactive {
  background: #fee2e2;
  color: #991b1b;
}

.customer-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
}

.edit-btn {
  background: #f3f4f6;
  color: #374151;
}

.edit-btn:hover {
  background: #e5e7eb;
}

.delete-btn {
  background: #fee2e2;
  color: #991b1b;
}

.delete-btn:hover {
  background: #fecaca;
}

.card-content {
  padding: 1.5rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-item label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.info-item span {
  color: #1f2937;
  font-weight: 500;
}

.notes-section {
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.notes-section h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.notes-section p {
  color: #4b5563;
  line-height: 1.6;
  margin: 0;
}

.sales-section {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-bottom: 1px solid #e5e7eb;
}

.section-header h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.sales-count {
  background: #667eea;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 600;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  text-align: center;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-state h4 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.empty-state p {
  color: #6b7280;
  margin: 0;
}

.sales-list {
  padding: 1.5rem;
}

.sale-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  margin-bottom: 0.75rem;
  transition: all 0.2s ease;
}

.sale-item:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.sale-item:last-child {
  margin-bottom: 0;
}

.sale-info {
  flex: 1;
}

.sale-product {
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.sale-date {
  font-size: 0.875rem;
  color: #6b7280;
}

.sale-details {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.sale-quantity, .sale-value {
  font-size: 0.875rem;
  color: #4b5563;
}

.sale-value {
  font-weight: 600;
  color: #059669;
}

.sale-status {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 600;
}

.sale-status.paid {
  background: #dcfce7;
  color: #166534;
}

.sale-status.pending {
  background: #fef3c7;
  color: #92400e;
}

/* Mobile */
@media (max-width: 768px) {
  .customer-details {
    padding: 1rem;
  }
  
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .customer-actions {
    width: 100%;
    justify-content: stretch;
  }
  
  .action-btn {
    flex: 1;
    justify-content: center;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .sale-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .sale-details {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
