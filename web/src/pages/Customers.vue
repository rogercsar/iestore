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
          <p class="summary-value">{{ store.customers?.length || 0 }}</p>
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
    <div v-if="store.loading" class="loading-container">
      <div class="loading-spinner"></div>
    </div>

    <!-- Error State -->
    <div v-if="store.error" class="error-card">
      <div class="error-content">
        <span class="error-icon">⚠️</span>
        <div>
          <h3 class="error-title">Erro ao carregar clientes</h3>
          <p class="error-message">{{ store.error }}</p>
        </div>
      </div>
    </div>

    <!-- Customers List -->
    <div v-if="!store.loading && !store.error" class="customers-list">
      <div 
        v-for="customer in filteredCustomers" 
        :key="customer.id"
        class="customer-card"
      >
        <!-- Card Header -->
        <div class="card-header">
          <div class="customer-avatar">
            <span class="avatar-text">{{ getInitials(customer.name) }}</span>
          </div>
          <div class="customer-info">
            <h3 class="customer-name">{{ customer.name }}</h3>
            <div class="contact-info">
              <p class="customer-email">
                <span class="icon">📧</span>
                {{ customer.email || 'Sem email' }}
              </p>
              <p class="customer-phone">
                <span class="icon">📱</span>
                {{ customer.phone || 'Sem telefone' }}
              </p>
            </div>
          </div>
          <div class="status-badge" :class="customer.status || 'active'">
            {{ customer.status === 'inactive' ? 'Inativo' : 'Ativo' }}
          </div>
        </div>

        <!-- Card Stats -->
        <div class="card-stats">
          <div class="stat-item">
            <div class="stat-value">{{ getCustomerSalesCount(customer.id!) }}</div>
            <div class="stat-label">Vendas</div>
          </div>
          <div class="stat-item">
            <div class="stat-value price">{{ formatCurrency(getCustomerTotalValue(customer.id!)) }}</div>
            <div class="stat-label">Total</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ getLastPurchaseDate(customer.id!) }}</div>
            <div class="stat-label">Última Compra</div>
          </div>
        </div>

        <!-- Card Actions -->
        <div class="card-actions">
          <button class="action-btn primary" @click="viewCustomerDetails(customer)">
            <span class="btn-icon">👁️</span>
            <span class="btn-text">Ver Detalhes</span>
          </button>
          <button class="action-btn secondary" @click="viewCustomerSales(customer.id!)">
            <span class="btn-icon">💰</span>
            <span class="btn-text">Vendas</span>
          </button>
          <button class="action-btn edit" @click="editCustomer(customer)">
            <span class="btn-icon">✏️</span>
            <span class="btn-text">Editar</span>
          </button>
          <button class="action-btn danger" @click="deleteCustomer(customer.id!)">
            <span class="btn-icon">🗑️</span>
            <span class="btn-text">Excluir</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!store.loading && !store.error && filteredCustomers.length === 0" class="empty-state">
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
            <button type="submit" class="btn btn-primary" :disabled="store.loading">
              {{ store.loading ? 'Salvando...' : 'Salvar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../stores/app'
import { useAlert } from '../composables/useAlert'
import type { Customer, Sale } from '../services/api'

const router = useRouter()
const store = useAppStore()
const { success, error, confirm } = useAlert()

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
  console.log('📦 Raw customers from store:', store.customers)
  console.log('📦 Customers length:', store.customers?.length)
  console.log('📦 Loading state:', store.loading)
  console.log('📦 Error state:', store.error)
  
  let filtered = store.customers || []
  console.log('🔍 Initial filtered customers:', filtered.length)
  
  // Debug: Check customer structure
  if (filtered.length > 0) {
    console.log('🔍 First customer structure:', filtered[0])
    console.log('🔍 Customer status values:', filtered.map(c => ({ name: c.name, status: c.status })))
  }

  // Force reactivity by ensuring we have a proper array
  if (!Array.isArray(filtered)) {
    console.warn('⚠️ Customers is not an array:', filtered)
    filtered = []
  }

  if (searchQuery.value) {
    filtered = filtered.filter(customer =>
      customer.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (customer.email && customer.email.toLowerCase().includes(searchQuery.value.toLowerCase())) ||
      (customer.phone && customer.phone.includes(searchQuery.value))
    )
    console.log('🔍 After search filter:', filtered.length)
  }

  if (statusFilter.value && statusFilter.value !== '') {
    console.log('🔍 Status filter active:', statusFilter.value)
    filtered = filtered.filter(customer => {
      const customerStatus = customer.status || 'active'
      console.log(`🔍 Customer ${customer.name} status: ${customerStatus}, filter: ${statusFilter.value}`)
      return customerStatus === statusFilter.value
    })
    console.log('🔍 After status filter:', filtered.length)
  } else {
    console.log('🔍 No status filter applied')
  }

  // Sort customers
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'email':
        return (a.email || '').localeCompare(b.email || '')
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
  return (store.customers || []).filter(customer => (customer.status || 'active') === 'active').length
})

const newCustomersThisMonth = computed(() => {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  return (store.customers || []).filter(customer => {
    const createdAt = new Date(customer.createdAt || '')
    return createdAt >= monthStart
  }).length
})

const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const getCustomerSalesCount = (customerId: string) => {
  return (store.sales || []).filter(sale => sale.customerId === customerId).length
}

const getCustomerTotalValue = (customerId: string) => {
  return (store.sales || [])
    .filter(sale => sale.customerId === customerId)
    .reduce((sum, sale) => sum + sale.totalValue, 0)
}

const getLastPurchaseDate = (customerId: string) => {
  const customerSales = store.sales || []
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
  // Preencher o modal com os dados do cliente
  newCustomer.value = {
    name: customer.name,
    email: customer.email || '',
    phone: customer.phone,
    address: customer.address || '',
    status: customer.status || 'active'
  }
  showAddModal.value = true
  // TODO: Implementar modo de edição no modal
}

const deleteCustomer = async (id: string) => {
  const confirmed = await confirm(
    'Confirmar Exclusão',
    'Tem certeza que deseja excluir este cliente?',
    'Esta ação não pode ser desfeita.'
  )
  
  if (confirmed) {
    try {
      console.log('Delete customer:', id)
      await store.deleteCustomer(id)
      await success(
        'Cliente Excluído',
        'Cliente excluído com sucesso!'
      )
    } catch (err) {
      console.error('Erro ao excluir cliente:', err)
      await error(
        'Erro ao Excluir',
        'Não foi possível excluir o cliente.',
        err.message
      )
    }
  }
}

const viewCustomerDetails = (customer: Customer) => {
  router.push(`/customer/${customer.id}`)
}

const viewCustomer = async (customer: Customer) => {
  console.log('View customer:', customer)
  // Mostrar modal com detalhes do cliente
  const details = `Nome: ${customer.name}\nEmail: ${customer.email || 'Não informado'}\nTelefone: ${customer.phone}\nEndereço: ${customer.address || 'Não informado'}\nStatus: ${customer.status === 'inactive' ? 'Inativo' : 'Ativo'}`
  await info('Perfil do Cliente', 'Informações do cliente:', details)
}

const viewCustomerSales = async (customerId: string) => {
  console.log('View customer sales:', customerId)
  const customer = store.customers?.find(c => c.id === customerId)
  const salesCount = getCustomerSalesCount(customerId)
  const totalValue = getCustomerTotalValue(customerId)
  const lastPurchase = getLastPurchaseDate(customerId)
  
  const details = `Cliente: ${customer?.name}\nTotal de Vendas: ${salesCount}\nValor Total: ${formatCurrency(totalValue)}\nÚltima Compra: ${lastPurchase}`
  await info('Vendas do Cliente', 'Histórico de vendas:', details)
}

const handleAddCustomer = async () => {
  // Validação dos campos obrigatórios
  if (!newCustomer.value.name.trim()) {
    await error('Campo Obrigatório', 'Nome é obrigatório')
    return
  }
  
  if (!newCustomer.value.email.trim()) {
    await error('Campo Obrigatório', 'Email é obrigatório')
    return
  }
  
  if (!newCustomer.value.phone.trim()) {
    await error('Campo Obrigatório', 'Telefone é obrigatório')
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
    await success('Cliente Criado', 'Cliente criado com sucesso!')
  } catch (err) {
    console.error('Erro ao criar cliente:', err)
    await error('Erro ao Criar Cliente', 'Não foi possível criar o cliente. Tente novamente.')
  }
}

onMounted(() => {
  console.log('🚀 Customers page mounted, fetching data...')
  store.fetchCustomers()
  store.fetchSales()
})
</script>

<style scoped>
.customers-container {
  flex: 1;
  background-color: var(--gray-50);
  padding: 1rem;
  padding-top: 5rem; /* Espaço para o header fixo */
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
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  padding: 1rem 0;
}

.customer-card {
  background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(226, 232, 240, 0.8);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.customer-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6, #06b6d4);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.customer-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.customer-card:hover::before {
  opacity: 1;
}

.card-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.5rem;
  position: relative;
}

.customer-avatar {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 1.25rem;
  box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
  flex-shrink: 0;
}

.avatar-text {
  font-size: 1rem;
}

.customer-info {
  flex: 1;
  min-width: 0;
}

.customer-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.5rem;
  line-height: 1.3;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.customer-email,
.customer-phone {
  font-size: 0.875rem;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  line-height: 1.4;
}

.contact-info .icon {
  font-size: 0.75rem;
  opacity: 0.7;
}

.status-badge {
  position: absolute;
  top: 0;
  right: 0;
  padding: 0.375rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.status-badge.active {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);
}

.status-badge.inactive {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
}

.card-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  border-radius: 12px;
  border: 1px solid rgba(226, 232, 240, 0.5);
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.stat-value.price {
  color: #059669;
}

.stat-label {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.card-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  text-decoration: none;
  position: relative;
  overflow: hidden;
}

.action-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.action-btn:hover::before {
  left: 100%;
}

.btn-icon {
  font-size: 1rem;
}

.btn-text {
  font-size: 0.8125rem;
}

.action-btn.primary {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
}

.action-btn.primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.4);
}

.action-btn.secondary {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: white;
  box-shadow: 0 2px 4px rgba(139, 92, 246, 0.3);
}

.action-btn.secondary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(139, 92, 246, 0.4);
}

.action-btn.edit {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  box-shadow: 0 2px 4px rgba(245, 158, 11, 0.3);
}

.action-btn.edit:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(245, 158, 11, 0.4);
}

.action-btn.danger {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
}

.action-btn.danger:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(239, 68, 68, 0.4);
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