<template>
  <div class="reports-container">
    <!-- Header -->
    <div class="reports-header">
      <div class="header-content">
        <h1 class="reports-title">Relatórios</h1>
        <p class="reports-subtitle">Análises e exportações de dados do seu negócio</p>
      </div>
    </div>

    <!-- Filters Card -->
    <div class="filters-card">
      <div class="filter-group">
        <label class="filter-label">Período</label>
        <select class="filter-select" v-model="selectedPeriod">
          <option value="week">Última Semana</option>
          <option value="month">Último Mês</option>
          <option value="quarter">Último Trimestre</option>
          <option value="year">Último Ano</option>
          <option value="custom">Personalizado</option>
        </select>
      </div>
      
      <div class="filter-group" v-if="selectedPeriod === 'custom'">
        <label class="filter-label">Data Início</label>
        <input type="date" class="filter-input" v-model="customStartDate" />
      </div>
      
      <div class="filter-group" v-if="selectedPeriod === 'custom'">
        <label class="filter-label">Data Fim</label>
        <input type="date" class="filter-input" v-model="customEndDate" />
      </div>
      
      <div class="filter-group">
        <label class="filter-label">Tipo de Relatório</label>
        <select class="filter-select" v-model="selectedReportType">
          <option value="sales">Vendas</option>
          <option value="products">Produtos</option>
          <option value="customers">Clientes</option>
          <option value="financial">Financeiro</option>
        </select>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p class="loading-text">Gerando relatório...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <div class="error-icon">⚠️</div>
      <h3 class="error-title">Erro ao carregar dados</h3>
      <p class="error-message">{{ error }}</p>
      <button class="retry-button" @click="loadData">Tentar novamente</button>
    </div>

    <!-- Reports Content -->
    <div v-else class="reports-content">
      <!-- Summary Cards -->
      <div class="summary-cards">
        <div class="summary-card sales-card">
          <div class="card-header">
            <div class="card-icon">💰</div>
            <div class="card-title">Vendas</div>
          </div>
          <div class="card-value">R$ {{ formatCurrency(reportData.totalSales) }}</div>
          <div class="card-subtitle">{{ reportData.totalSalesCount }} vendas</div>
        </div>

        <div class="summary-card profit-card">
          <div class="card-header">
            <div class="card-icon">📈</div>
            <div class="card-title">Lucro</div>
          </div>
          <div class="card-value">R$ {{ formatCurrency(reportData.totalProfit) }}</div>
          <div class="card-subtitle">{{ reportData.profitMargin }}% margem</div>
        </div>

        <div class="summary-card customers-card">
          <div class="card-header">
            <div class="card-icon">👥</div>
            <div class="card-title">Clientes</div>
          </div>
          <div class="card-value">{{ reportData.totalCustomers }}</div>
          <div class="card-subtitle">clientes ativos</div>
        </div>

        <div class="summary-card products-card">
          <div class="card-header">
            <div class="card-icon">📦</div>
            <div class="card-title">Produtos</div>
          </div>
          <div class="card-value">{{ reportData.totalProducts }}</div>
          <div class="card-subtitle">produtos vendidos</div>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="charts-section">
        <div class="chart-card">
          <div class="chart-header">
            <h3 class="chart-title">Vendas por Período</h3>
            <div class="chart-actions">
              <button class="chart-action-btn" @click="exportChart('sales')">📊</button>
            </div>
          </div>
          <div class="chart-placeholder">
            <div class="chart-icon">📈</div>
            <p>Gráfico de vendas por período</p>
            <small>Implementação futura</small>
          </div>
        </div>

        <div class="chart-card">
          <div class="chart-header">
            <h3 class="chart-title">Top Produtos</h3>
            <div class="chart-actions">
              <button class="chart-action-btn" @click="exportChart('products')">📊</button>
            </div>
          </div>
          <div class="chart-placeholder">
            <div class="chart-icon">🏆</div>
            <p>Produtos mais vendidos</p>
            <small>Implementação futura</small>
          </div>
        </div>
      </div>

      <!-- Export Actions -->
      <div class="export-section">
        <div class="export-card">
          <h3 class="export-title">Exportar Relatórios</h3>
          <p class="export-subtitle">Baixe seus dados em diferentes formatos</p>
          
          <div class="export-buttons">
            <button class="export-btn csv-btn" @click="exportToCSV">
              <span class="export-icon">📄</span>
              <span class="export-text">Exportar CSV</span>
            </button>
            
            <button class="export-btn pdf-btn" @click="exportToPDF">
              <span class="export-icon">📋</span>
              <span class="export-text">Exportar PDF</span>
            </button>
            
            <button class="export-btn whatsapp-btn" @click="shareViaWhatsApp">
              <span class="export-icon">💬</span>
              <span class="export-text">Compartilhar WhatsApp</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Data Tables -->
      <div class="tables-section">
        <!-- Top Products Table -->
        <div class="table-card">
          <div class="table-header">
            <h3 class="table-title">Produtos Mais Vendidos</h3>
            <button class="table-action-btn" @click="exportTable('topProducts')">📊</button>
          </div>
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Quantidade</th>
                  <th>Valor Total</th>
                  <th>Lucro</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="product in reportData.topProducts" :key="product.name">
                  <td>{{ product.name }}</td>
                  <td class="text-center">{{ product.quantity }}</td>
                  <td class="text-right">R$ {{ formatCurrency(product.totalValue) }}</td>
                  <td class="text-right">R$ {{ formatCurrency(product.profit) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Top Customers Table -->
        <div class="table-card">
          <div class="table-header">
            <h3 class="table-title">Clientes que Mais Compram</h3>
            <button class="table-action-btn" @click="exportTable('topCustomers')">📊</button>
          </div>
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Email</th>
                  <th>Compras</th>
                  <th>Valor Total</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="customer in reportData.topCustomers" :key="customer.id">
                  <td>{{ customer.name }}</td>
                  <td>{{ customer.email }}</td>
                  <td class="text-center">{{ customer.purchaseCount }}</td>
                  <td class="text-right">R$ {{ formatCurrency(customer.totalValue) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAppStore } from '../stores/app'

const store = useAppStore()

// Reactive data
const loading = ref(false)
const error = ref('')
const selectedPeriod = ref('month')
const selectedReportType = ref('sales')
const customStartDate = ref('')
const customEndDate = ref('')

// Report data
const reportData = ref({
  totalSales: 0,
  totalSalesCount: 0,
  totalProfit: 0,
  profitMargin: 0,
  totalCustomers: 0,
  totalProducts: 0,
  topProducts: [],
  topCustomers: []
})

// Computed
const dateRange = computed(() => {
  const now = new Date()
  const endDate = new Date(now)
  
  switch (selectedPeriod.value) {
    case 'week':
      const weekAgo = new Date(now)
      weekAgo.setDate(now.getDate() - 7)
      return { start: weekAgo, end: endDate }
    case 'month':
      const monthAgo = new Date(now)
      monthAgo.setMonth(now.getMonth() - 1)
      return { start: monthAgo, end: endDate }
    case 'quarter':
      const quarterAgo = new Date(now)
      quarterAgo.setMonth(now.getMonth() - 3)
      return { start: quarterAgo, end: endDate }
    case 'year':
      const yearAgo = new Date(now)
      yearAgo.setFullYear(now.getFullYear() - 1)
      return { start: yearAgo, end: endDate }
    case 'custom':
      return { 
        start: customStartDate.value ? new Date(customStartDate.value) : new Date(),
        end: customEndDate.value ? new Date(customEndDate.value) : new Date()
      }
    default:
      return { start: new Date(), end: new Date() }
  }
})

// Methods
const loadData = async () => {
  loading.value = true
  error.value = ''
  
  try {
    await Promise.all([
      store.fetchSales(),
      store.fetchCustomers(),
      store.fetchProducts()
    ])
    
    generateReportData()
  } catch (err) {
    error.value = 'Erro ao carregar dados dos relatórios'
    console.error('Erro ao carregar dados:', err)
  } finally {
    loading.value = false
  }
}

const generateReportData = () => {
  const sales = store.sales || []
  const customers = store.customers || []
  const products = store.products || []
  
  const { start, end } = dateRange.value
  
  // Filter sales by date range
  const filteredSales = sales.filter(sale => {
    const saleDate = new Date(sale.createdAt || sale.date)
    return saleDate >= start && saleDate <= end
  })
  
  // Calculate totals
  const totalSales = filteredSales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0)
  const totalCost = filteredSales.reduce((sum, sale) => sum + (sale.totalCost || 0), 0)
  const totalProfit = totalSales - totalCost
  const profitMargin = totalSales > 0 ? (totalProfit / totalSales) * 100 : 0
  
  // Top products
  const productSales = {}
  filteredSales.forEach(sale => {
    if (sale.items) {
      sale.items.forEach(item => {
        if (!productSales[item.name]) {
          productSales[item.name] = {
            name: item.name,
            quantity: 0,
            totalValue: 0,
            totalCost: 0
          }
        }
        productSales[item.name].quantity += item.quantity
        productSales[item.name].totalValue += item.quantity * item.unitPrice
        productSales[item.name].totalCost += item.quantity * item.cost
      })
    }
  })
  
  const topProducts = Object.values(productSales)
    .map(p => ({
      ...p,
      profit: p.totalValue - p.totalCost
    }))
    .sort((a, b) => b.totalValue - a.totalValue)
    .slice(0, 10)
  
  // Top customers
  const customerSales = {}
  filteredSales.forEach(sale => {
    const customerId = sale.customerId || sale.customer
    if (customerId) {
      if (!customerSales[customerId]) {
        customerSales[customerId] = {
          id: customerId,
          name: 'Cliente',
          email: '',
          purchaseCount: 0,
          totalValue: 0
        }
      }
      customerSales[customerId].purchaseCount += 1
      customerSales[customerId].totalValue += sale.totalAmount || 0
    }
  })
  
  // Match with actual customer data
  Object.values(customerSales).forEach(customer => {
    const actualCustomer = customers.find(c => c.id === customer.id)
    if (actualCustomer) {
      customer.name = actualCustomer.name
      customer.email = actualCustomer.email || ''
    }
  })
  
  const topCustomers = Object.values(customerSales)
    .sort((a, b) => b.totalValue - a.totalValue)
    .slice(0, 10)
  
  reportData.value = {
    totalSales,
    totalSalesCount: filteredSales.length,
    totalProfit,
    profitMargin: Math.round(profitMargin * 100) / 100,
    totalCustomers: customers.length,
    totalProducts: products.length,
    topProducts,
    topCustomers
  }
}

const formatCurrency = (value: number) => {
  return value.toFixed(2).replace('.', ',')
}

const exportToCSV = () => {
  try {
    const { start, end } = dateRange.value
    const period = selectedPeriod.value === 'custom' 
      ? `${customStartDate.value} a ${customEndDate.value}`
      : selectedPeriod.value
    
    let csvContent = `Relatório de ${selectedReportType.value} - ${period}\n\n`
    
    if (selectedReportType.value === 'sales') {
      csvContent += 'Produto,Quantidade,Valor Total,Lucro\n'
      reportData.value.topProducts.forEach(p => {
        csvContent += `${p.name},${p.quantity},R$ ${p.totalValue.toFixed(2)},R$ ${p.profit.toFixed(2)}\n`
      })
    } else if (selectedReportType.value === 'customers') {
      csvContent += 'Cliente,Email,Compras,Valor Total\n'
      reportData.value.topCustomers.forEach(c => {
        csvContent += `${c.name},${c.email},${c.purchaseCount},R$ ${c.totalValue.toFixed(2)}\n`
      })
    }
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `relatorio_${selectedReportType.value}_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  } catch (error) {
    console.error('Erro ao exportar CSV:', error)
    alert('Erro ao exportar CSV')
  }
}

const exportToPDF = () => {
  try {
    const { start, end } = dateRange.value
    const period = selectedPeriod.value === 'custom' 
      ? `${customStartDate.value} a ${customEndDate.value}`
      : selectedPeriod.value
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Relatório - ${selectedReportType.value}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .summary { display: flex; justify-content: space-around; margin-bottom: 30px; background: #f5f5f5; padding: 20px; border-radius: 8px; }
          .summary-item { text-align: center; }
          .summary-value { font-size: 24px; font-weight: bold; color: #2563eb; }
          .summary-label { font-size: 14px; color: #666; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #f8fafc; font-weight: bold; }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Relatório de ${selectedReportType.value}</h1>
          <p>Período: ${period}</p>
          <p>Gerado em: ${new Date().toLocaleDateString('pt-BR')}</p>
        </div>
        
        <div class="summary">
          <div class="summary-item">
            <div class="summary-value">R$ ${reportData.value.totalSales.toFixed(2)}</div>
            <div class="summary-label">Vendas Totais</div>
          </div>
          <div class="summary-item">
            <div class="summary-value">R$ ${reportData.value.totalProfit.toFixed(2)}</div>
            <div class="summary-label">Lucro Total</div>
          </div>
          <div class="summary-item">
            <div class="summary-value">${reportData.value.totalCustomers}</div>
            <div class="summary-label">Clientes</div>
          </div>
          <div class="summary-item">
            <div class="summary-value">${reportData.value.totalProducts}</div>
            <div class="summary-label">Produtos</div>
          </div>
        </div>
      </body>
      </html>
    `
    
    const printWindow = window.open('', '_blank')
    printWindow.document.write(htmlContent)
    printWindow.document.close()
    printWindow.focus()
    
    setTimeout(() => {
      printWindow.print()
    }, 500)
  } catch (error) {
    console.error('Erro ao gerar PDF:', error)
    alert('Erro ao gerar PDF')
  }
}

const shareViaWhatsApp = () => {
  try {
    const { start, end } = dateRange.value
    const period = selectedPeriod.value === 'custom' 
      ? `${customStartDate.value} a ${customEndDate.value}`
      : selectedPeriod.value
    
    const message = `📊 *Relatório de ${selectedReportType.value}* - ${period}

💰 *Vendas Totais:* R$ ${reportData.value.totalSales.toFixed(2)}
📈 *Lucro Total:* R$ ${reportData.value.totalProfit.toFixed(2)}
👥 *Clientes:* ${reportData.value.totalCustomers}
📦 *Produtos:* ${reportData.value.totalProducts}

Gerado em: ${new Date().toLocaleDateString('pt-BR')}

Relatório gerado pelo iEstore`
    
    const encodedMessage = encodeURIComponent(message)
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`
    
    window.open(whatsappUrl, '_blank')
  } catch (error) {
    console.error('Erro ao compartilhar via WhatsApp:', error)
    alert('Erro ao compartilhar via WhatsApp')
  }
}

const exportChart = (type: string) => {
  alert(`Exportar gráfico de ${type} - Implementação futura`)
}

const exportTable = (type: string) => {
  alert(`Exportar tabela de ${type} - Implementação futura`)
}

// Lifecycle
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.reports-container {
  flex: 1;
  background-color: var(--gray-50);
  padding: 2rem;
}

.reports-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2rem;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  position: relative;
  overflow: hidden;
}

.reports-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--accent) 0%, var(--warning) 100%);
}

.header-content {
  flex: 1;
}

.reports-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: white;
  margin: 0 0 0.5rem 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.reports-subtitle {
  font-size: 1.125rem;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  font-weight: 500;
}

.filters-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 2rem;
  display: flex;
  gap: 1.5rem;
  align-items: end;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 200px;
}

.filter-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--gray-700);
}

.filter-select, .filter-input {
  padding: 0.75rem;
  border: 1px solid var(--gray-300);
  border-radius: 8px;
  font-size: 1rem;
  background-color: white;
  transition: border-color 0.2s;
}

.filter-select:focus, .filter-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.loading-spinner {
  width: 3rem;
  height: 3rem;
  border: 3px solid var(--gray-200);
  border-top: 3px solid var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  margin-top: 1rem;
  color: var(--gray-600);
  font-weight: 500;
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  text-align: center;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.error-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--danger);
  margin-bottom: 0.5rem;
}

.error-message {
  color: var(--gray-600);
  margin-bottom: 1.5rem;
}

.retry-button {
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.retry-button:hover {
  background: var(--primary-dark);
}

.reports-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.summary-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  position: relative;
  overflow: hidden;
}

.summary-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
}

.sales-card::before {
  background: linear-gradient(90deg, var(--success) 0%, var(--success-light) 100%);
}

.profit-card::before {
  background: linear-gradient(90deg, var(--warning) 0%, var(--warning-light) 100%);
}

.customers-card::before {
  background: linear-gradient(90deg, var(--primary) 0%, var(--primary-light) 100%);
}

.products-card::before {
  background: linear-gradient(90deg, var(--accent) 0%, var(--accent-light) 100%);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.card-icon {
  font-size: 1.5rem;
}

.card-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--gray-700);
}

.card-value {
  font-size: 2rem;
  font-weight: 800;
  color: var(--gray-900);
  margin-bottom: 0.25rem;
}

.card-subtitle {
  font-size: 0.875rem;
  color: var(--gray-600);
}

.charts-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
}

.chart-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.chart-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--gray-900);
  margin: 0;
}

.chart-actions {
  display: flex;
  gap: 0.5rem;
}

.chart-action-btn {
  background: var(--gray-100);
  border: none;
  border-radius: 6px;
  padding: 0.5rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.chart-action-btn:hover {
  background: var(--gray-200);
}

.chart-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  background: var(--gray-50);
  border-radius: 8px;
  color: var(--gray-500);
}

.chart-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.export-section {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.export-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--gray-900);
  margin: 0 0 0.5rem 0;
}

.export-subtitle {
  color: var(--gray-600);
  margin: 0 0 2rem 0;
}

.export-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.export-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.csv-btn {
  background: var(--success);
  color: white;
}

.csv-btn:hover {
  background: var(--success-dark);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(34, 197, 94, 0.3);
}

.pdf-btn {
  background: var(--danger);
  color: white;
}

.pdf-btn:hover {
  background: var(--danger-dark);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(239, 68, 68, 0.3);
}

.whatsapp-btn {
  background: #25D366;
  color: white;
}

.whatsapp-btn:hover {
  background: #128C7E;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(37, 211, 102, 0.3);
}

.export-icon {
  font-size: 1.25rem;
}

.tables-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.table-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.table-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--gray-900);
  margin: 0;
}

.table-action-btn {
  background: var(--gray-100);
  border: none;
  border-radius: 6px;
  padding: 0.5rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.table-action-btn:hover {
  background: var(--gray-200);
}

.table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid var(--gray-200);
}

.data-table th {
  background-color: var(--gray-50);
  font-weight: 600;
  color: var(--gray-700);
}

.data-table tbody tr:hover {
  background-color: var(--gray-50);
}

.text-right {
  text-align: right;
}

.text-center {
  text-align: center;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .reports-container {
    padding: 1rem;
  }
  
  .filters-card {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-group {
    min-width: auto;
  }
  
  .summary-cards {
    grid-template-columns: 1fr;
  }
  
  .charts-section {
    grid-template-columns: 1fr;
  }
  
  .export-buttons {
    flex-direction: column;
  }
  
  .export-btn {
    justify-content: center;
  }
}
</style>
