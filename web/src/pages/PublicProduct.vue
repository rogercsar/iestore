<template>
  <div class="public-product-page">
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p class="loading-text">Carregando produto...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="!product" class="error-container">
      <div class="error-icon">⚠️</div>
      <h1 class="error-title">Produto não encontrado</h1>
      <p class="error-text">
        O produto que você está procurando não existe ou foi removido.
      </p>
      <a href="/" class="back-link">← Voltar ao início</a>
    </div>

    <!-- Product Content -->
    <div v-else class="product-content">
      <!-- Header -->
      <header class="page-header">
        <div class="header-content">
          <div class="logo-section">
            <span class="logo-icon">🏪</span>
            <h1 class="logo-text">IEStore</h1>
          </div>
          <p class="header-subtitle">Produtos de Qualidade</p>
        </div>
      </header>

      <!-- Main Content -->
      <main class="main-content">
        <!-- Product Card -->
        <div class="product-card">
          <!-- Product Image -->
          <div v-if="product.photo" class="product-image-section">
            <img :src="product.photo" :alt="product.name" class="product-image" />
          </div>
          <div v-else class="product-image-placeholder">
            <span class="placeholder-icon">📦</span>
          </div>

          <!-- Product Info -->
          <div class="product-info-section">
            <div class="product-header">
              <h1 class="product-title">{{ product.name }}</h1>
              <div class="stock-indicator" :class="stockClass">
                <span class="stock-icon">{{ stockIcon }}</span>
                <span class="stock-text">{{ stockText }}</span>
              </div>
            </div>

            <!-- Price Section -->
            <div class="price-section">
              <div class="price-container">
                <span class="price-label">Preço</span>
                <span class="price-value">{{ formatCurrency(product.unitPrice) }}</span>
                <span class="price-subtitle">Preço final</span>
              </div>
            </div>

            <!-- Product Details -->
            <div class="product-details">
              <div class="detail-item">
                <span class="detail-label">Nome:</span>
                <span class="detail-value">{{ product.name }}</span>
              </div>
              
              <div class="detail-item">
                <span class="detail-label">Preço:</span>
                <span class="detail-value price-highlight">{{ formatCurrency(product.unitPrice) }}</span>
              </div>
              
              <div class="detail-item">
                <span class="detail-label">Disponibilidade:</span>
                <span class="detail-value" :class="stockTextClass">
                  {{ product.quantity > 0 ? `${product.quantity} unidades disponíveis` : 'Produto esgotado' }}
                </span>
              </div>
              
              <div v-if="product.category" class="detail-item">
                <span class="detail-label">Categoria:</span>
                <span class="detail-value">{{ product.category }}</span>
              </div>
            </div>

            <!-- Contact Section -->
            <div class="contact-section">
              <div class="contact-header">
                <span class="contact-icon">📞</span>
                <h3 class="contact-title">Interessado neste produto?</h3>
              </div>
              <p class="contact-description">
                Entre em contato conosco para mais informações, esclarecer dúvidas ou fazer seu pedido.
              </p>
              <a :href="whatsappUrl" target="_blank" class="contact-button">
                <span class="button-icon">💬</span>
                <span class="button-text">Entrar em Contato</span>
              </a>
            </div>
          </div>
        </div>
      </main>

      <!-- Footer -->
      <footer class="page-footer">
        <div class="footer-content">
          <p class="footer-text">© 2024 IEStore - Todos os direitos reservados</p>
          <p class="footer-subtext">Produtos de qualidade para você</p>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import type { Product } from '../services/api'

const route = useRoute()
const product = ref<Product | null>(null)
const loading = ref(true)

// Computed properties
const stockClass = computed(() => {
  if (!product.value) return 'stock-empty'
  if (product.value.quantity === 0) return 'stock-empty'
  if (product.value.quantity <= 5) return 'stock-low'
  if (product.value.quantity <= 10) return 'stock-medium'
  return 'stock-good'
})

const stockIcon = computed(() => {
  if (!product.value) return '❌'
  if (product.value.quantity === 0) return '❌'
  if (product.value.quantity <= 5) return '⚠️'
  if (product.value.quantity <= 10) return '⚡'
  return '✅'
})

const stockText = computed(() => {
  if (!product.value) return 'Indisponível'
  if (product.value.quantity === 0) return 'Esgotado'
  if (product.value.quantity <= 5) return 'Últimas unidades'
  if (product.value.quantity <= 10) return 'Estoque baixo'
  return 'Em estoque'
})

const stockTextClass = computed(() => {
  if (!product.value) return 'unavailable'
  return product.value.quantity > 0 ? 'available' : 'unavailable'
})

const whatsappUrl = computed(() => {
  if (!product.value) return '#'
  const message = `Olá! Tenho interesse no produto: *${product.value.name}* - ${formatCurrency(product.value.unitPrice)}`
  return `https://wa.me/?text=${encodeURIComponent(message)}`
})

// Methods
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

const loadProduct = async () => {
  try {
    loading.value = true
    
    // Get product name from route params
    const productName = route.params.name as string
    console.log('🔍 Loading product:', productName)
    
    if (!productName) {
      throw new Error('Nome do produto não fornecido')
    }

    // Decode the product name (convert from URL format back to original)
    const decodedName = decodeURIComponent(productName.replace(/-/g, ' '))
    console.log('🔍 Decoded product name:', decodedName)

    // Fetch products from API
    console.log('🌐 Fetching products from PostgreSQL API...')
    const response = await fetch('/.netlify/functions/postgres?table=products')
    
    if (!response.ok) {
      console.error('❌ API Error:', response.status, response.statusText)
      throw new Error('Erro ao carregar produtos')
    }

    const products: Product[] = await response.json()
    console.log('✅ Products loaded from PostgreSQL:', products.length, 'products')
    console.log('📦 Product names:', products.map(p => p.name))

    // Find the product by name (case insensitive)
    const foundProduct = products.find(p => 
      p.name.toLowerCase() === decodedName.toLowerCase()
    )

    if (foundProduct) {
      // Process the product data
      product.value = {
        ...foundProduct,
        quantity: parseInt(foundProduct.quantity.toString()) || 0,
        cost: parseFloat(foundProduct.cost.toString()) || 0,
        unitPrice: parseFloat(foundProduct.unitPrice.toString()) || 0,
        category: foundProduct.category || 'Outros'
      }
      console.log('✅ Product found and processed:', product.value)
    } else {
      console.log('❌ Product not found. Available products:', products.map(p => p.name))
      console.log('🔍 Looking for:', decodedName)
      console.log('🔍 Available:', products.map(p => p.name))
      product.value = null
    }

  } catch (error) {
    console.error('❌ Error loading product:', error)
    product.value = null
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadProduct()
})
</script>

<style scoped>
.public-product-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Loading State */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: white;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  margin-top: 1rem;
  color: #64748b;
  font-size: 1rem;
}

/* Error State */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: white;
  padding: 2rem;
  text-align: center;
}

.error-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.error-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.error-text {
  font-size: 1.125rem;
  color: #6b7280;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.back-link {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
  padding: 0.75rem 1.5rem;
  border: 2px solid #3b82f6;
  border-radius: 0.5rem;
  transition: all 0.2s;
}

.back-link:hover {
  background: #3b82f6;
  color: white;
}

/* Header */
.page-header {
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1.5rem 0;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  text-align: center;
}

.logo-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.logo-icon {
  font-size: 2rem;
}

.logo-text {
  font-size: 2rem;
  font-weight: 800;
  color: #1f2937;
  margin: 0;
}

.header-subtitle {
  color: #6b7280;
  font-size: 1rem;
  margin: 0;
}

/* Main Content */
.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.product-card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  min-height: 600px;
}

/* Product Image */
.product-image-section {
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.product-image {
  max-width: 100%;
  max-height: 400px;
  object-fit: contain;
  border-radius: 0.5rem;
}

.product-image-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  padding: 2rem;
}

.placeholder-icon {
  font-size: 8rem;
  color: #cbd5e1;
}

/* Product Info */
.product-info-section {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.product-header {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.product-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: #1f2937;
  margin: 0;
  line-height: 1.2;
}

.stock-indicator {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  font-weight: 600;
  font-size: 0.875rem;
  width: fit-content;
}

.stock-indicator.stock-good {
  background: #dcfce7;
  color: #166534;
}

.stock-indicator.stock-medium {
  background: #fef3c7;
  color: #92400e;
}

.stock-indicator.stock-low {
  background: #fed7aa;
  color: #c2410c;
}

.stock-indicator.stock-empty {
  background: #fee2e2;
  color: #dc2626;
}

/* Price Section */
.price-section {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  border-radius: 1rem;
  padding: 2rem;
  text-align: center;
  color: white;
}

.price-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.price-label {
  font-size: 1rem;
  opacity: 0.9;
}

.price-value {
  font-size: 3rem;
  font-weight: 800;
  margin: 0;
}

.price-subtitle {
  font-size: 0.875rem;
  opacity: 0.8;
}

/* Product Details */
.product-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e5e7eb;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  font-weight: 500;
  color: #6b7280;
}

.detail-value {
  font-weight: 600;
  color: #1f2937;
}

.detail-value.price-highlight {
  color: #059669;
  font-weight: 700;
}

.detail-value.available {
  color: #059669;
}

.detail-value.unavailable {
  color: #dc2626;
}

/* Contact Section */
.contact-section {
  background: #f8fafc;
  border-radius: 1rem;
  padding: 1.5rem;
  text-align: center;
}

.contact-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.contact-icon {
  font-size: 1.5rem;
}

.contact-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.contact-description {
  color: #6b7280;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.contact-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #25d366;
  color: white;
  text-decoration: none;
  padding: 1rem 2rem;
  border-radius: 0.75rem;
  font-weight: 600;
  font-size: 1.125rem;
  transition: all 0.2s;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.contact-button:hover {
  background: #128c7e;
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.button-icon {
  font-size: 1.25rem;
}

/* Footer */
.page-footer {
  background: white;
  border-top: 1px solid #e5e7eb;
  padding: 2rem 0;
  margin-top: 2rem;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  text-align: center;
}

.footer-text {
  color: #6b7280;
  margin: 0 0 0.5rem 0;
}

.footer-subtext {
  color: #9ca3af;
  font-size: 0.875rem;
  margin: 0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .product-card {
    grid-template-columns: 1fr;
  }
  
  .product-title {
    font-size: 2rem;
  }
  
  .price-value {
    font-size: 2.5rem;
  }
  
  .main-content {
    padding: 1rem;
  }
  
  .product-info-section {
    padding: 1.5rem;
  }
  
  .header-content {
    padding: 0 1rem;
  }
  
  .logo-text {
    font-size: 1.5rem;
  }
  
  .logo-icon {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .product-title {
    font-size: 1.75rem;
  }
  
  .price-value {
    font-size: 2rem;
  }
  
  .contact-button {
    padding: 0.875rem 1.5rem;
    font-size: 1rem;
  }
}
</style>