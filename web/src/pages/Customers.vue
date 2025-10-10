<template>
  <div class="customers-container">
    <!-- Header -->
    <div class="customers-header">
      <h1 class="customers-title">Clientes</h1>
      <button class="add-customer-button" @click="showAddModal = true">
        <span class="add-customer-icon">👥</span>
        <span class="add-customer-text">Adicionar</span>
      </button>
    </div>

    <!-- Summary Cards -->
    <div class="summary-section">
      <div class="summary-card primary-gradient">
        <div class="summary-content">
          <p class="summary-label">Total de Clientes</p>
          <p class="summary-value">{{ customers.length }}</p>
        </div>
      </div>
      <div class="summary-card success-gradient">
        <div class="summary-content">
          <p class="summary-label">Clientes Ativos</p>
          <p class="summary-value">{{ activeCustomers }}</p>
        </div>
      </div>
      <div class="summary-card warning-gradient">
        <div class="summary-content">
          <p class="summary-label">Novos Este Mês</p>
          <p class="summary-value">{{ newCustomersThisMonth }}</p>
        </div>
      </div>
    </div>

    <!-- Search and Filters -->
    <div class="filters-card">
      <div class="search-container">
        <span class="search-icon">🔍</span>
        <input 
          type="text" 
          placeholder="Pesquisar clientes..." 
          class="search-input"
          v-model="searchQuery"
        >
      </div>
      
      <div class="filters-row">
        <div class="filter-group">
          <select class="filter-select" v-model="statusFilter">
            <option value="">Todos</option>
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
          </select>
        </div>
        
        <div class="filter-group">
          <select class="filter-select" v-model="sortBy">
            <option value="name">Nome</option>
            <option value="email">Email</option>
            <option value="created">Data de Cadastro</option>
            <option value="sales">Total de Vendas</option>
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
          <h3 class="error-title">Erro ao carregar clientes</h3>
          <p class="error-message">{{ error }}</p>
        </div>
      </div>
    </div>

    <!-- Customers List -->
    <div v-if="!loading && !error" class="customers-list">
      <div 
        v-for="customer in filteredCustomers" 
        :key="customer.id"
        class="customer-item"
      >
        <div class="customer-header">
          <div class="customer-avatar">
            <span class="avatar-text">{{ getInitials(customer.name) }}</span>
          </div>
          <div class="customer-info">
            <h3 class="customer-name">{{ customer.name }}</h3>
            <p class="customer-email">{{ customer.email }}</p>
            <p class="customer-phone">{{ customer.phone || 'Sem telefone' }}</p>
          </div>
          <div class="customer-actions">
            <button class="action-btn edit-btn" @click="editCustomer(customer)">
              <span>✏️</span>
            </button>
            <button class="action-btn delete-btn" @click="deleteCustomer(customer.id!)">
              <span>🗑️</span>
            </button>
          </div>
        </div>
        
        <div class="customer-details">
          <div class="detail-row">
            <span class="detail-label">Total de Vendas:</span>
            <span class="detail-value">{{ getCustomerSalesCount(customer.id!) }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Valor Total:</span>
            <span class="detail-value price">{{ formatCurrency(getCustomerTotalValue(customer.id!)) }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Última Compra:</span>
            <span class="detail-value">{{ getLastPurchaseDate(customer.id!) }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Status:</span>
            <span class="detail-value status" :class="customer.status || 'active'">
              {{ customer.status === 'inactive' ? 'Inativo' : 'Ativo' }}
            </span>
          </div>
        </div>

        <div class="customer-actions-bottom">
          <button class="action-btn view-btn" @click="viewCustomer(customer)">
            <span>👁️</span>
            Ver Perfil
          </button>
          <button class="action-btn sales-btn" @click="viewCustomerSales(customer.id!)">
            <span>💰</span>
            Ver Vendas
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!loading && !error && filteredCustomers.length === 0" class="empty-state">
      <div class="empty-card">
        <span class="empty-icon">👥</span>
        <h3 class="empty-title">Nenhum cliente encontrado</h3>
        <p class="empty-subtitle">
          {{ searchQuery || statusFilter ? 'Tente ajustar os filtros de pesquisa' : 'Adicione seu primeiro cliente' }}
        </p>
      </div>
    </div>

    <!-- Add Customer Modal -->
    <div v-if="showAddModal" class="modal-overlay" @click="showAddModal = false">
      <div class="modal-content" @click.stop>
        <h3 class="modal-title">Adicionar Cliente</h3>
        <form @submit.prevent="handleAddCustomer">
          <div class="form-group">
            <label class="form-label">Nome Completo</label>
            <input type="text" class="form-input" v-model="newCustomer.name" required>
          </div>
          <div class="form-group">
            <label class="form-label">Email</label>
            <input type="email" class="form-input" v-model="newCustomer.email" required>
          </div>
          <div class="form-group">
            <label class="form-label">Telefone</label>
            <input type="tel" class="form-input" v-model="newCustomer.phone">
          </div>
          <div class="form-group">
            <label class="form-label">Endereço</label>
            <input type="text" class="form-input" v-model="newCustomer.address">
          </div>
          <div class="form-group">
            <label class="form-label">Status</label>
            <select class="form-input" v-model="newCustomer.status">
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
            </select>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" @click="showAddModal = false">Cancelar</button>
            <button type="submit" class="btn btn-primary" :disabled="loading">
              {{ loading ? 'Salvando...' : 'Salvar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAppStore } from '../stores/app'
import type { Customer, Sale } from '../services/api'

const store = useAppStore()
const { customers, sales, loading, error } = store

const searchQuery = ref('')
const statusFilter = ref('')
const sortBy = ref('name')
const showAddModal = ref(false)

const newCustomer = ref({
  name: '',
  email: '',
  phone: '',
  address: '',
  status: 'active'
})

const filteredCustomers = computed(() => {
  console.log('🔍 Computing filtered customers...')
  console.log('📦 Raw customers from store:', customers.value)
  console.log('📦 Customers length:', customers.value?.length)
  
  let filtered = customers.value || []
  console.log('🔍 Initial filtered customers:', filtered.length)
  
  // Debug: Check customer structure
  if (filtered.length > 0) {
    console.log('🔍 First customer structure:', filtered[0])
    console.log('🔍 Customer status values:', filtered.map(c => ({ name: c.name, status: c.status })))
  }

  if (searchQuery.value) {
    filtered = filtered.filter(customer =>
      customer.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (customer.phone && customer.phone.includes(searchQuery.value))
    )
    console.log('🔍 After search filter:', filtered.length)
  }

  if (statusFilter.value) {
    console.log('🔍 Status filter active:', statusFilter.value)
    filtered = filtered.filter(customer => {
      const customerStatus = customer.status || 'active'
      console.log(`🔍 Customer ${customer.name} status: ${customerStatus}, filter: ${statusFilter.value}`)
      return customerStatus === statusFilter.value
    })
    console.log('🔍 After status filter:', filtered.length)
  }

  // Sort customers
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'email':
        return a.email.localeCompare(b.email)
      case 'created':
        return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
      case 'sales':
        const salesA = getCustomerSalesCount(a.id!)
        const salesB = getCustomerSalesCount(b.id!)
        return salesB - salesA
      default:
        return 0
    }
  })

  console.log('✅ Final filtered customers:', filtered.length)
  console.log('✅ Final customer names:', filtered.map(c => c.name))
  return filtered
})

const activeCustomers = computed(() => {
  return (customers.value || []).filter(customer => (customer.status || 'active') === 'active').length
})

const newCustomersThisMonth = computed(() => {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  return (customers.value || []).filter(customer => {
    const createdAt = new Date(customer.createdAt || '')
    return createdAt >= monthStart
  }).length
})

const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const getCustomerSalesCount = (customerId: string) => {
  return (sales.value || []).filter(sale => sale.customerId === customerId).length
}

const getCustomerTotalValue = (customerId: string) => {
  return (sales.value || [])
    .filter(sale => sale.customerId === customerId)
    .reduce((sum, sale) => sum + sale.totalValue, 0)
}

const getLastPurchaseDate = (customerId: string) => {
  const customerSales = sales.value || []
    .filter(sale => sale.customerId === customerId)
    .sort((a, b) => new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime())
  
  if (customerSales.length === 0) return 'Nunca'
  
  return new Date(customerSales[0].dateISO).toLocaleDateString('pt-BR')
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

const editCustomer = (customer: Customer) => {
  console.log('Edit customer:', customer)
  // TODO: Implement edit functionality
}

const deleteCustomer = async (id: string) => {
  if (confirm('Tem certeza que deseja excluir este cliente?')) {
    console.log('Delete customer:', id)
    // TODO: Implement delete functionality
  }
}

const viewCustomer = (customer: Customer) => {
  console.log('View customer:', customer)
  // TODO: Implement customer profile modal
}

const viewCustomerSales = (customerId: string) => {
  console.log('View customer sales:', customerId)
  // TODO: Implement customer sales view
}

const handleAddCustomer = async () => {
  // Validação dos campos obrigatórios
  if (!newCustomer.value.name.trim()) {
    alert('Nome é obrigatório')
    return
  }
  
  if (!newCustomer.value.email.trim()) {
    alert('Email é obrigatório')
    return
  }
  
  if (!newCustomer.value.phone.trim()) {
    alert('Telefone é obrigatório')
    return
  }

  try {
    console.log('Creating customer:', newCustomer.value)
    await store.createCustomer(newCustomer.value)
    showAddModal.value = false
    newCustomer.value = {
      name: '',
      email: '',
      phone: '',
      address: '',
      status: 'active'
    }
    // Refresh customers after creating
    await store.fetchCustomers()
    alert('Cliente criado com sucesso!')
  } catch (error) {
    console.error('Erro ao criar cliente:', error)
    alert('Erro ao criar cliente. Tente novamente.')
  }
}

onMounted(() => {
  store.fetchCustomers()
  store.fetchSales()
})
</script>

<style scoped>
.customers-container {
  flex: 1;
  background-color: var(--gray-50);
  padding: 1rem;
}

.customers-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
  margin-bottom: 1.5rem;
}

.customers-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--gray-800);
}

.add-customer-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
  color: white;
  border: none;
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.add-customer-button:hover {
  transform: translateY(-2px);
}

.add-customer-icon {
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

.search-container {
  position: relative;
  margin-bottom: 1rem;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.25rem;
  color: var(--gray-400);
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 3rem;
  border: 1px solid var(--gray-300);
  border-radius: 0.5rem;
  font-size: 1rem;
  background-color: var(--gray-50);
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary);
  background-color: white;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
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

.customers-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.customer-item {
  background-color: white;
  border-radius: 0.75rem;
  padding: 1rem;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--gray-200);
  transition: all 0.2s ease;
}

.customer-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.customer-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.customer-avatar {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 1rem;
}

.avatar-text {
  font-size: 0.875rem;
}

.customer-info {
  flex: 1;
}

.customer-name {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--gray-800);
  margin-bottom: 0.25rem;
}

.customer-email {
  font-size: 0.875rem;
  color: var(--gray-600);
  margin-bottom: 0.125rem;
}

.customer-phone {
  font-size: 0.875rem;
  color: var(--gray-500);
}

.customer-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  width: 2.5rem;
  height: 2.5rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.edit-btn {
  background-color: var(--primary-light);
  color: white;
}

.edit-btn:hover {
  background-color: var(--primary);
}

.delete-btn {
  background-color: #fef2f2;
  color: #dc2626;
}

.delete-btn:hover {
  background-color: #fecaca;
}

.customer-details {
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

.detail-value.status.active {
  color: var(--success);
  background-color: #f0fdf4;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
}

.detail-value.status.inactive {
  color: var(--gray-500);
  background-color: var(--gray-100);
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
}

.customer-actions-bottom {
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

.sales-btn {
  background-color: var(--success-light);
  color: var(--success-dark);
}

.sales-btn:hover {
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
  .customers-container {
    padding: 0.5rem;
  }
  
  .customers-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .add-customer-button {
    justify-content: center;
  }
  
  .summary-section {
    flex-direction: column;
  }
  
  .filters-row {
    flex-direction: column;
  }
  
  .customer-details {
    grid-template-columns: 1fr;
  }
  
  .customer-actions-bottom {
    flex-direction: column;
  }
  
  .modal-actions {
    flex-direction: column;
  }
}
</style>