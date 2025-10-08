<template>
  <div class="product-details-container">
    <div class="product-details-header">
      <button class="back-button" @click="goBack">
        <span class="back-icon">←</span>
      </button>
      <h1 class="product-details-title">Detalhes do Produto</h1>
      <button class="share-button" @click="handleShare">
        <span class="share-icon">📤</span>
      </button>
    </div>

    <div class="product-details-content">
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p class="loading-text">Carregando produto...</p>
      </div>

      <div v-else-if="!product" class="error-container">
        <div class="error-icon">⚠️</div>
        <h2 class="error-title">Produto não encontrado</h2>
        <p class="error-text">O produto que você está procurando não existe ou foi removido.</p>
      </div>

      <div v-else class="product-details-body">
        <!-- Product Card -->
        <Card shadow="lg" class="product-card">
          <div v-if="product.photo" class="photo-container">
            <img :src="product.photo" :alt="product.name" class="product-photo" />
          </div>
          
          <div class="product-header">
            <h2 class="product-name">{{ product.name }}</h2>
            <div class="stock-badge" :class="stockBadgeClass">
              {{ product.quantity }} em estoque
            </div>
          </div>

          <div class="price-section">
            <p class="price-label">Preço de Venda</p>
            <p class="price-value">{{ formatCurrency(product.unitPrice) }}</p>
          </div>
        </Card>

        <!-- Financial Information -->
        <Card shadow="sm" class="info-card">
          <h3 class="section-title">Informações Financeiras</h3>
          
          <div class="info-row">
            <span class="info-label">Custo Unitário:</span>
            <span class="info-value">{{ formatCurrency(product.cost) }}</span>
          </div>
          
          <div class="info-row">
            <span class="info-label">Preço de Venda:</span>
            <span class="info-value">{{ formatCurrency(product.unitPrice) }}</span>
          </div>
          
          <div class="info-row">
            <span class="info-label">Lucro por Unidade:</span>
            <span class="info-value profit-value">{{ formatCurrency(profit) }}</span>
          </div>
          
          <div class="info-row">
            <span class="info-label">Margem de Lucro:</span>
            <span class="info-value profit-value">{{ profitMargin.toFixed(1) }}%</span>
          </div>
        </Card>

        <!-- Stock Information -->
        <Card shadow="sm" class="info-card">
          <h3 class="section-title">Informações de Estoque</h3>
          
          <div class="info-row">
            <span class="info-label">Quantidade Atual:</span>
            <span class="info-value">{{ product.quantity }} unidades</span>
          </div>
          
          <div class="info-row">
            <span class="info-label">Valor Total em Estoque:</span>
            <span class="info-value">{{ formatCurrency(product.quantity * product.cost) }}</span>
          </div>
          
          <div class="info-row">
            <span class="info-label">Valor de Venda Total:</span>
            <span class="info-value price-value">{{ formatCurrency(product.quantity * product.unitPrice) }}</span>
          </div>
        </Card>

        <!-- Share Card -->
        <Card shadow="sm" class="share-card">
          <div class="share-header">
            <span class="share-icon">📤</span>
            <h3 class="share-title">Compartilhar Produto</h3>
          </div>
          <p class="share-description">
            Compartilhe este produto com seus clientes através do WhatsApp
          </p>
          <button class="share-button-large" @click="handleShare">
            <span class="whatsapp-icon">💬</span>
            Compartilhar no WhatsApp
          </button>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Card from '../components/Card.vue'
import type { Product } from '../services/api'

const router = useRouter()
const route = useRoute()

const product = ref<Product | null>(null)
const loading = ref(false)

const profit = computed(() => {
  if (!product.value) return 0
  return product.value.unitPrice - product.value.cost
})

const profitMargin = computed(() => {
  if (!product.value || product.value.cost === 0) return 0
  return (profit.value / product.value.cost) * 100
})

const stockBadgeClass = computed(() => {
  if (!product.value) return 'stock-empty'
  if (product.value.quantity === 0) return 'stock-empty'
  if (product.value.quantity <= 5) return 'stock-low'
  if (product.value.quantity <= 10) return 'stock-medium'
  return 'stock-good'
})

const goBack = () => {
  router.go(-1)
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

const loadProduct = async () => {
  loading.value = true
  try {
    // Get product ID from route params
    const productId = route.params.id as string
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Mock product data
    const mockProducts: Product[] = [
      {
        id: '1',
        name: 'Produto A',
        quantity: 15,
        cost: 30,
        unitPrice: 50,
        photo: 'https://via.placeholder.com/200x200?text=Produto+A'
      },
      {
        id: '2',
        name: 'Produto B',
        quantity: 8,
        cost: 40,
        unitPrice: 80,
        photo: 'https://via.placeholder.com/200x200?text=Produto+B'
      }
    ]
    
    product.value = mockProducts.find(p => p.id === productId) || null
  } catch (error) {
    console.error('Error loading product:', error)
  } finally {
    loading.value = false
  }
}

const handleShare = () => {
  if (!product.value) return
  
  const message = `🛍️ *${product.value.name}*\n\n💰 Preço: ${formatCurrency(product.value.unitPrice)}\n📦 Estoque: ${product.value.quantity} unidades\n\n🔗 Ver detalhes: ${window.location.href}`
  
  const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(message)}`
  window.open(whatsappUrl, '_blank')
}

onMounted(() => {
  loadProduct()
})
</script>

<style scoped>
.product-details-container {
  flex: 1;
  background-color: var(--gray-50);
}

.product-details-header {
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

.product-details-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--gray-800);
  flex: 1;
  text-align: center;
}

.share-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--primary);
  padding: 0.25rem;
}

.product-details-content {
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

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem;
}

.error-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.error-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--gray-800);
  margin-bottom: 0.5rem;
}

.error-text {
  color: var(--gray-600);
  text-align: center;
  line-height: 1.5;
}

.product-details-body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.product-card {
  max-width: 32rem;
  margin: 0 auto;
}

.photo-container {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.product-photo {
  width: 12.5rem;
  height: 12.5rem;
  border-radius: 0.75rem;
  background-color: var(--gray-100);
  object-fit: cover;
}

.product-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.product-name {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--gray-800);
  flex: 1;
  margin-right: 1rem;
}

.stock-badge {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
}

.stock-empty {
  background-color: var(--danger);
}

.stock-low {
  background-color: var(--warning);
}

.stock-medium {
  background-color: #f59e0b;
}

.stock-good {
  background-color: var(--success);
}

.price-section {
  text-align: center;
  padding: 1.5rem;
  background-color: var(--gray-50);
  border-radius: 0.75rem;
}

.price-label {
  font-size: 1rem;
  color: var(--gray-600);
  margin-bottom: 0.5rem;
}

.price-value {
  font-size: 2rem;
  font-weight: 800;
  color: var(--primary);
}

.info-card {
  max-width: 32rem;
  margin: 0 auto;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--gray-800);
  margin-bottom: 1rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--gray-100);
}

.info-label {
  font-size: 0.875rem;
  color: var(--gray-600);
  flex: 1;
}

.info-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--gray-800);
}

.profit-value {
  color: var(--success);
}

.price-value {
  color: var(--primary);
}

.share-card {
  max-width: 32rem;
  margin: 0 auto;
}

.share-header {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
}

.share-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--gray-800);
  margin-left: 0.5rem;
}

.share-description {
  font-size: 0.875rem;
  color: var(--gray-600);
  margin-bottom: 1rem;
}

.share-button-large {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #25D366;
  color: white;
  border: none;
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  gap: 0.5rem;
  width: 100%;
}

.whatsapp-icon {
  font-size: 1.25rem;
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
  .product-details-content {
    padding: 0.5rem;
  }
  
  .product-header {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .product-name {
    margin-right: 0;
  }
  
  .product-photo {
    width: 10rem;
    height: 10rem;
  }
}
</style>
