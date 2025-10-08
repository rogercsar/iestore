<template>
  <div class="sales-history-container">
    <div class="sales-history-header">
      <button class="back-button" @click="goBack">
        <span class="back-icon">←</span>
      </button>
      <h1 class="sales-history-title">Histórico de Vendas</h1>
      <div class="placeholder"></div>
    </div>

    <div class="sales-history-content">
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p class="loading-text">Carregando vendas...</p>
      </div>

      <div v-else-if="sales.length === 0" class="empty-container">
        <div class="empty-icon">📊</div>
        <h3 class="empty-title">Nenhuma venda encontrada</h3>
        <p class="empty-subtitle">Suas vendas aparecerão aqui</p>
      </div>

      <div v-else class="sales-list">
        <div v-for="(sale, index) in sales" :key="index" class="sale-item">
          <Card shadow="sm">
            <div class="sale-header">
              <div class="sale-info">
                <h3 class="sale-title">
                  {{ isMultiSale(sale) ? `Venda Múltipla (${sale.items.length} itens)` : sale.product }}
                </h3>
                <p class="sale-date">{{ formatDate(sale.dateISO) }}</p>
                <p v-if="sale.customerName" class="sale-customer">Cliente: {{ sale.customerName }}</p>
                <p v-if="sale.paymentMethod" class="sale-payment">Pagamento: {{ sale.paymentMethod }}</p>
              </div>
              <div class="sale-values">
                <div class="sale-total">{{ formatCurrency(sale.totalValue) }}</div>
                <div class="sale-profit">Lucro: {{ formatCurrency(sale.profit) }}</div>
                <button class="details-button" @click="handleViewDetails(sale)">
                  <span class="details-icon">👁️</span>
                  Detalhes
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>

    <!-- Sale Details Modal -->
    <SaleDetailsModal
      :sale="selectedSale"
      :visible="modalVisible"
      @close="handleCloseModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Card from '../components/Card.vue'
import SaleDetailsModal from '../components/SaleDetailsModal.vue'
import type { Sale, MultiSale } from '../services/api'

const router = useRouter()

const sales = ref<(Sale | MultiSale)[]>([])
const loading = ref(false)
const selectedSale = ref<Sale | MultiSale | null>(null)
const modalVisible = ref(false)

const goBack = () => {
  router.go(-1)
}

const isMultiSale = (sale: Sale | MultiSale): sale is MultiSale => {
  return 'items' in sale
}

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

const loadSales = async () => {
  loading.value = true
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Mock sales data
    sales.value = [
      {
        id: '1',
        product: 'Produto A',
        quantity: 2,
        unitPrice: 50,
        totalValue: 100,
        totalCost: 60,
        profit: 40,
        dateISO: '2024-01-15T10:00:00Z',
        customerName: 'João Silva',
        customerPhone: '+5511999999999',
        paymentMethod: 'Dinheiro',
        status: 'paid'
      },
      {
        id: '2',
        product: 'Produto B',
        quantity: 1,
        unitPrice: 80,
        totalValue: 80,
        totalCost: 50,
        profit: 30,
        dateISO: '2024-01-14T14:30:00Z',
        customerName: 'Maria Santos',
        customerPhone: '+5511888888888',
        paymentMethod: 'Cartão',
        status: 'paid'
      },
      {
        id: '3',
        items: [
          {
            product: 'Produto C',
            quantity: 1,
            unitPrice: 30,
            totalValue: 30,
            totalCost: 20
          },
          {
            product: 'Produto D',
            quantity: 2,
            unitPrice: 25,
            totalValue: 50,
            totalCost: 30
          }
        ],
        totalValue: 80,
        totalCost: 50,
        totalProfit: 30,
        dateISO: '2024-01-13T09:15:00Z',
        customerName: 'Pedro Oliveira',
        customerPhone: '+5511777777777',
        paymentMethod: 'Parcelado',
        status: 'partial',
        installments: [
          {
            id: '1',
            number: 1,
            value: 40,
            dueDate: '2024-01-20T00:00:00Z',
            status: 'paid',
            paidDate: '2024-01-18T00:00:00Z'
          },
          {
            id: '2',
            number: 2,
            value: 40,
            dueDate: '2024-02-20T00:00:00Z',
            status: 'pending'
          }
        ]
      }
    ]
  } catch (error) {
    console.error('Error loading sales:', error)
  } finally {
    loading.value = false
  }
}

const handleViewDetails = (sale: Sale | MultiSale) => {
  selectedSale.value = sale
  modalVisible.value = true
}

const handleCloseModal = () => {
  modalVisible.value = false
  selectedSale.value = null
}

onMounted(() => {
  loadSales()
})
</script>

<style scoped>
.sales-history-container {
  flex: 1;
  background-color: var(--gray-50);
}

.sales-history-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background-color: white;
  border-bottom: 1px solid var(--gray-200);
  margin-top: 2rem;
}

.back-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--gray-800);
  padding: 0.25rem;
}

.sales-history-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--gray-800);
}

.placeholder {
  width: 1.5rem;
}

.sales-history-content {
  padding: 1rem;
}

.loading-container {
  display: flex;
  flex-direction: column;
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

.loading-text {
  margin-top: 1rem;
  color: var(--gray-600);
}

.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem;
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

.sales-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.sale-item {
  /* Card styling handled by Card component */
}

.sale-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.sale-info {
  flex: 1;
}

.sale-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--gray-800);
  margin-bottom: 0.25rem;
}

.sale-date {
  font-size: 0.875rem;
  color: var(--gray-600);
  margin-bottom: 0.25rem;
}

.sale-customer {
  font-size: 0.875rem;
  color: var(--gray-600);
  margin-bottom: 0.25rem;
}

.sale-payment {
  font-size: 0.875rem;
  color: var(--gray-600);
}

.sale-values {
  text-align: right;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}

.sale-total {
  font-size: 1.125rem;
  font-weight: 800;
  color: var(--gray-800);
}

.sale-profit {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--success);
}

.details-button {
  display: flex;
  align-items: center;
  background: var(--primary-light);
  color: white;
  border: none;
  border-radius: 0.375rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  gap: 0.25rem;
  margin-top: 0.5rem;
}

.details-button:hover {
  background: var(--primary);
}

.details-icon {
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

@media (max-width: 768px) {
  .sales-history-content {
    padding: 0.5rem;
  }
  
  .sale-header {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .sale-values {
    text-align: left;
    align-items: flex-start;
  }
}
</style>
