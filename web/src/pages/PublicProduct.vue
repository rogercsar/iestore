<template>
  <div class="public-product-container">
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p class="loading-text">Carregando produto...</p>
    </div>

    <div v-else-if="!product" class="error-container">
      <div class="error-icon">⚠️</div>
      <h1 class="error-title">Produto não encontrado</h1>
      <p class="error-text">
        O produto que você está procurando não existe ou foi removido.
      </p>
    </div>

    <div v-else class="public-product-content">
      <!-- Header -->
      <div class="header">
        <div class="logo-container">
          <span class="logo-icon">🏪</span>
          <h1 class="logo-text">inCRM Store</h1>
        </div>
      </div>

      <!-- Product Card -->
      <Card shadow="lg" class="product-card">
        <div v-if="product.photo" class="photo-container">
          <img :src="product.photo" :alt="product.name" class="product-photo" />
        </div>
        
        <div class="product-header">
          <h2 class="product-name">{{ product.name }}</h2>
          <div class="stock-badge" :class="stockBadgeClass">
            {{ product.quantity > 0 ? `${product.quantity} disponíveis` : 'Esgotado' }}
          </div>
        </div>

        <div class="price-section">
          <p class="price-label">Preço</p>
          <p class="price-value">{{ formatCurrency(product.unitPrice) }}</p>
          <p class="price-subtext">Preço final</p>
        </div>
      </Card>

      <!-- Product Info -->
      <Card shadow="sm" class="info-card">
        <h3 class="section-title">Informações do Produto</h3>
        
        <div class="info-row">
          <span class="info-label">Nome:</span>
          <span class="info-value">{{ product.name }}</span>
        </div>
        
        <div class="info-row">
          <span class="info-label">Preço:</span>
          <span class="info-value price-value">{{ formatCurrency(product.unitPrice) }}</span>
        </div>
        
        <div class="info-row">
          <span class="info-label">Disponibilidade:</span>
          <span class="info-value" :class="product.quantity > 0 ? 'available' : 'unavailable'">
            {{ product.quantity > 0 ? `${product.quantity} unidades` : 'Esgotado' }}
          </span>
        </div>
      </Card>

      <!-- Contact Info -->
      <Card shadow="sm" class="contact-card">
        <div class="contact-header">
          <span class="contact-icon">📞</span>
          <h3 class="contact-title">Interessado no produto?</h3>
        </div>
        <p class="contact-text">
          Entre em contato conosco para mais informações ou para fazer seu pedido.
        </p>
        <button class="contact-button" @click="handleWhatsAppContact">
          <span class="whatsapp-icon">💬</span>
          Entrar em Contato
        </button>
      </Card>

      <!-- Footer -->
      <div class="footer">
        <p class="footer-text">© 2024 inCRM Store - Todos os direitos reservados</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Card from '../components/Card.vue'
import type { Product } from '../services/api'

const route = useRoute()

const product = ref<Product | null>(null)
const loading = ref(false)

const stockBadgeClass = computed(() => {
  if (!product.value) return 'stock-empty'
  if (product.value.quantity === 0) return 'stock-empty'
  if (product.value.quantity <= 5) return 'stock-low'
  if (product.value.quantity <= 10) return 'stock-medium'
  return 'stock-good'
})

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

const loadProduct = async () => {
  loading.value = true
  try {
    // Get product name from route params
    const productName = route.params.name as string
    
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
    
    product.value = mockProducts.find(p => p.name === productName) || null
  } catch (error) {
    console.error('Error loading product:', error)
  } finally {
    loading.value = false
  }
}

const handleWhatsAppContact = () => {
  if (!product.value) return
  
  const message = `Olá! Gostaria de saber mais sobre o produto: *${product.value.name}*`
  const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(message)}`
  
  // Try to open WhatsApp app, fallback to web if not available
  window.open(whatsappUrl, '_blank')
}

onMounted(() => {
  loadProduct()
})
</script>

<style scoped>
.public-product-container {
  min-height: 100vh;
  background-color: var(--gray-50);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: var(--gray-50);
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
  font-size: 1rem;
  color: var(--gray-600);
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: var(--gray-50);
  padding: 2rem;
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
  font-size: 1rem;
  color: var(--gray-600);
  text-align: center;
  line-height: 1.5;
}

.public-product-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
}

.header {
  background-color: white;
  padding: 1.5rem;
  border-bottom: 1px solid var(--gray-200);
  border-radius: 0.75rem;
}

.logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.logo-icon {
  font-size: 2rem;
  color: var(--primary);
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--primary);
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
  margin-bottom: 1.5rem;
}

.product-name {
  font-size: 1.75rem;
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
  font-size: 2.25rem;
  font-weight: 800;
  color: var(--primary);
  margin-bottom: 0.25rem;
}

.price-subtext {
  font-size: 0.875rem;
  color: var(--gray-600);
}

.info-card {
  max-width: 32rem;
  margin: 0 auto;
}

.section-title {
  font-size: 1.25rem;
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
  font-size: 1rem;
  color: var(--gray-600);
  flex: 1;
}

.info-value {
  font-size: 1rem;
  font-weight: 600;
  color: var(--gray-800);
}

.info-value.price-value {
  color: var(--primary);
  font-weight: 700;
}

.info-value.available {
  color: var(--success);
}

.info-value.unavailable {
  color: var(--danger);
}

.contact-card {
  max-width: 32rem;
  margin: 0 auto;
}

.contact-header {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.contact-icon {
  font-size: 1.5rem;
  color: var(--primary);
  margin-right: 0.5rem;
}

.contact-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--gray-800);
}

.contact-text {
  font-size: 0.875rem;
  color: var(--gray-600);
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.contact-button {
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
  transition: all 0.2s ease;
}

.contact-button:hover {
  background: #128C7E;
  transform: translateY(-1px);
}

.whatsapp-icon {
  font-size: 1.25rem;
}

.footer {
  padding: 1.5rem;
  text-align: center;
}

.footer-text {
  font-size: 0.75rem;
  color: var(--gray-500);
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
  .public-product-content {
    padding: 0.5rem;
  }
  
  .product-header {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .product-name {
    margin-right: 0;
  }
  
  .product-photo {
    width: 10rem;
    height: 10rem;
  }
  
  .price-value {
    font-size: 1.875rem;
  }
}
</style>
