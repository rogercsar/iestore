<template>
  <div class="inventory-container">
    <!-- Header -->
    <div class="inventory-header">
      <div class="header-content">
        <h1 class="inventory-title">Estoque</h1>
        <p class="inventory-subtitle">Gerencie seu inventário de produtos</p>
      </div>
      <div class="header-actions">
        <button class="add-button" @click="exportToPDF">
          <span class="add-icon">📄</span>
          <span class="add-text">Exportar PDF</span>
        </button>
        <button class="add-button" @click="showAddModal = true">
          <span class="add-icon">➕</span>
          <span class="add-text">Adicionar Produto</span>
        </button>
      </div>
    </div>

    <!-- Filters Card -->
    <div class="filters-card">
      <div class="search-container">
        <span class="search-icon">🔍</span>
        <input 
          type="text" 
          placeholder="Pesquisar produtos..." 
          class="search-input"
          v-model="searchQuery"
        >
      </div>
      
      <div class="filters-row">
        <div class="filter-group">
          <select class="filter-select" v-model="categoryFilter">
            <option value="">Todos</option>
            <option v-for="category in availableCategories" :key="category" :value="category">
              {{ category }}
            </option>
          </select>
        </div>
        
        <div class="filter-group">
          <select class="filter-select" v-model="sortBy">
            <option value="name">Nome</option>
            <option value="quantity">Quantidade</option>
            <option value="price">Preço</option>
            <option value="profit">Lucro</option>
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
          <h3 class="error-title">Erro ao carregar produtos</h3>
          <p class="error-message">{{ error }}</p>
        </div>
      </div>
    </div>

    <!-- Products List -->
    <div v-if="!loading && !error" class="products-list">
      <div 
        v-for="product in filteredProducts" 
        :key="product.id"
        class="product-item"
      >
        <div class="product-header">
          <div class="product-info">
            <h3 class="product-name">{{ product.name }}</h3>
            <p class="product-category">{{ product.category || 'Sem categoria' }}</p>
          </div>
          <div class="product-actions">
            <button class="action-btn share-btn" @click="shareProduct(product)">
              <span>📤</span>
            </button>
            <button class="action-btn edit-btn" @click="editProduct(product)">
              <span>✏️</span>
            </button>
            <button class="action-btn delete-btn" @click="deleteProduct(product.name)">
              <span>🗑️</span>
            </button>
          </div>
        </div>
        
        <div class="product-details">
          <div class="detail-row">
            <span class="detail-label">Preço:</span>
            <span class="detail-value price">{{ formatCurrency(product.unitPrice) }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Custo:</span>
            <span class="detail-value">{{ formatCurrency(product.cost) }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Estoque:</span>
            <span 
              class="detail-value stock"
              :class="product.quantity < 10 ? 'low-stock' : 'good-stock'"
            >
              {{ product.quantity }}
            </span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Margem:</span>
            <span class="detail-value margin">{{ calculateMargin(product.cost, product.unitPrice) }}%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!loading && !error && filteredProducts.length === 0" class="empty-state">
      <div class="empty-card">
        <span class="empty-icon">📦</span>
        <h3 class="empty-title">Nenhum produto encontrado</h3>
        <p class="empty-subtitle">
          {{ searchQuery || categoryFilter ? 'Tente ajustar os filtros de pesquisa' : 'Adicione seu primeiro produto' }}
        </p>
      </div>
    </div>

    <!-- Add Product Modal -->
    <div v-if="showAddModal" class="modal-overlay" @click="showAddModal = false">
      <div class="modal-content" @click.stop>
        <h3 class="modal-title">Adicionar Produto</h3>
        <form @submit.prevent="handleAddProduct">
          <div class="form-group">
            <label class="form-label">Nome do Produto</label>
            <input type="text" class="form-input" v-model="newProduct.name" required>
          </div>
          <div class="form-group">
            <label class="form-label">Categoria</label>
            <select class="form-input" v-model="newProduct.category">
              <option value="">Selecione uma categoria</option>
              <option value="Eletrônicos">Eletrônicos</option>
              <option value="Roupas">Roupas</option>
              <option value="Casa">Casa</option>
              <option value="Esportes">Esportes</option>
              <option value="Livros">Livros</option>
            </select>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Custo</label>
              <input type="number" step="0.01" class="form-input" v-model="newProduct.cost" required>
            </div>
            <div class="form-group">
              <label class="form-label">Preço de Venda</label>
              <input type="number" step="0.01" class="form-input" v-model="newProduct.unitPrice" required>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Quantidade em Estoque</label>
            <input type="number" class="form-input" v-model="newProduct.quantity" required>
          </div>
          
          <!-- Image Upload Section -->
          <div class="form-group">
            <label class="form-label">Imagem do Produto</label>
            <div class="image-upload-container">
              <div v-if="newProduct.photo" class="image-preview">
                <img :src="newProduct.photo" :alt="newProduct.name" class="preview-image" />
                <button type="button" class="remove-image-btn" @click="removeNewProductImage">
                  <span class="remove-icon">×</span>
                </button>
              </div>
              <div v-else class="image-upload-placeholder">
                <span class="upload-icon">📷</span>
                <p class="upload-text">Nenhuma imagem selecionada</p>
                <input 
                  type="file" 
                  accept="image/*" 
                  @change="handleImageUpload" 
                  ref="fileInput"
                  style="display: none"
                />
                <button type="button" class="upload-btn" @click="triggerFileInput">
                  Selecionar Imagem
                </button>
              </div>
            </div>
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

    <!-- Share Modal -->
    <ShareModal 
      v-if="selectedProduct"
      :visible="showShareModal" 
      :product="selectedProduct" 
      @close="closeShareModal" 
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../stores/app'
import type { Product } from '../services/api'
// import { addRealProducts as addRealProductsScript } from '../scripts/addRealProducts'
import ShareModal from '../components/ShareModal.vue'
import { ProductCategorizer } from '../utils/categorizer'

const store = useAppStore()
const router = useRouter()
// Don't destructure to maintain reactivity
const products = computed(() => store.products)
const loading = computed(() => store.loading)
const error = computed(() => store.error)

const searchQuery = ref('')
const categoryFilter = ref('')
const sortBy = ref('name')
const showAddModal = ref(false)
const showShareModal = ref(false)
const selectedProduct = ref<Product | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

const newProduct = ref({
  name: '',
  category: '',
  cost: 0,
  unitPrice: 0,
  quantity: 0,
  photo: ''
})

const availableCategories = computed(() => {
  if (!products.value || !Array.isArray(products.value)) {
    return ProductCategorizer.getAllCategories()
  }
  
  const categories = new Set<string>()
  products.value.forEach(product => {
    if (product.category) {
      categories.add(product.category)
    }
  })
  
  return Array.from(categories).sort()
})

const filteredProducts = computed(() => {
  console.log('🔍 Computing filtered products...')
  console.log('📦 Raw products from store:', products.value)
  console.log('📦 Products length:', products.value?.length)
  
  // Ensure we have a valid array and wait for data to load
  if (!products.value || !Array.isArray(products.value)) {
    console.log('⏳ Products not ready yet, returning empty array')
    return []
  }
  
  let filtered = [...products.value] // Create a copy to avoid reactivity issues
  console.log('🔍 Initial filtered products:', filtered.length)

  if (searchQuery.value) {
    filtered = filtered.filter(product =>
      product.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (product.category && product.category.toLowerCase().includes(searchQuery.value.toLowerCase()))
    )
    console.log('🔍 After search filter:', filtered.length)
  }

  if (categoryFilter.value) {
    filtered = filtered.filter(product => product.category === categoryFilter.value)
    console.log('🔍 After category filter:', filtered.length)
  }

  // Sort products
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'quantity':
        return b.quantity - a.quantity
      case 'price':
        return b.unitPrice - a.unitPrice
      case 'profit':
        const profitA = ((a.unitPrice - a.cost) / a.cost) * 100
        const profitB = ((b.unitPrice - b.cost) / b.cost) * 100
        return profitB - profitA
      default:
        return 0
    }
  })

  console.log('✅ Final filtered products:', filtered.length)
  return filtered
})

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

const calculateMargin = (cost: number, price: number) => {
  if (cost === 0) return 0
  return Math.round(((price - cost) / cost) * 100)
}

const handleAddProduct = async () => {
  try {
    await store.createProduct(newProduct.value)
    showAddModal.value = false
    newProduct.value = {
      name: '',
      category: '',
      cost: 0,
      unitPrice: 0,
      quantity: 0,
      photo: ''
    }
    // Refresh products after creating
    await store.fetchProducts()
  } catch (error) {
    console.error('Erro ao criar produto:', error)
  }
}

// Image upload functions
const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      newProduct.value.photo = result
    }
    reader.readAsDataURL(file)
  }
}

const removeNewProductImage = () => {
  newProduct.value.photo = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const editProduct = (product: Product) => {
  // Navigate to edit product page
  router.push(`/product/${product.id}/edit`)
}

const deleteProduct = async (id: string) => {
  if (confirm('Tem certeza que deseja excluir este produto?')) {
    try {
      await store.deleteProduct(id)
      // Refresh products after deleting
      await store.fetchProducts()
    } catch (error) {
      console.error('Erro ao deletar produto:', error)
    }
  }
}

const shareProduct = (product: Product) => {
  selectedProduct.value = product
  showShareModal.value = true
}

const closeShareModal = () => {
  showShareModal.value = false
  selectedProduct.value = null
}

const exportToPDF = () => {
  try {
    // Criar conteúdo HTML para o PDF
    const products = filteredProducts.value
    const totalProducts = products.length
    const totalValue = products.reduce((sum, p) => sum + (p.quantity * p.unitPrice), 0)
    const totalCost = products.reduce((sum, p) => sum + (p.quantity * p.cost), 0)
    const totalProfit = totalValue - totalCost

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Relatório de Estoque - ${new Date().toLocaleDateString('pt-BR')}</title>
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
          .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Relatório de Estoque</h1>
          <p>Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
        </div>
        
        <div class="summary">
          <div class="summary-item">
            <div class="summary-value">${totalProducts}</div>
            <div class="summary-label">Total de Produtos</div>
          </div>
          <div class="summary-item">
            <div class="summary-value">R$ ${totalValue.toFixed(2)}</div>
            <div class="summary-label">Valor Total</div>
          </div>
          <div class="summary-item">
            <div class="summary-value">R$ ${totalCost.toFixed(2)}</div>
            <div class="summary-label">Custo Total</div>
          </div>
          <div class="summary-item">
            <div class="summary-value">R$ ${totalProfit.toFixed(2)}</div>
            <div class="summary-label">Lucro Total</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Produto</th>
              <th class="text-center">Quantidade</th>
              <th class="text-right">Custo Unit.</th>
              <th class="text-right">Preço Unit.</th>
              <th class="text-right">Valor Total</th>
              <th class="text-right">Lucro</th>
            </tr>
          </thead>
          <tbody>
            ${products.map(p => `
              <tr>
                <td>${p.name}</td>
                <td class="text-center">${p.quantity}</td>
                <td class="text-right">R$ ${p.cost.toFixed(2)}</td>
                <td class="text-right">R$ ${p.unitPrice.toFixed(2)}</td>
                <td class="text-right">R$ ${(p.quantity * p.unitPrice).toFixed(2)}</td>
                <td class="text-right">R$ ${(p.quantity * (p.unitPrice - p.cost)).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          <p>Relatório gerado automaticamente pelo sistema iEstore</p>
        </div>
      </body>
      </html>
    `

    // Abrir em nova janela para impressão/PDF
    const printWindow = window.open('', '_blank')
    printWindow.document.write(htmlContent)
    printWindow.document.close()
    printWindow.focus()
    
    // Aguardar carregamento e imprimir
    setTimeout(() => {
      printWindow.print()
    }, 500)

  } catch (error) {
    console.error('Erro ao gerar PDF:', error)
    alert('Erro ao gerar PDF. Tente novamente.')
  }
}

// Função removida - produtos duplicados foram identificados e corrigidos

onMounted(async () => {
  store.fetchProducts()
  
  // Importar e disponibilizar função de substituição
  const { replaceAllProducts } = await import('../scripts/replaceProducts')
  if (typeof window !== 'undefined') {
    (window as any).replaceAllProducts = replaceAllProducts
  }
})
</script>

<style scoped>
.inventory-container {
  flex: 1;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 1.5rem;
  min-height: 100vh;
}

.inventory-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem;
  background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(226, 232, 240, 0.8);
  margin-bottom: 2rem;
  position: relative;
  overflow: hidden;
}

.inventory-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #8b5cf6, #7c3aed);
}

.header-content {
  flex: 1;
}

.inventory-title {
  font-size: 2rem;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #1e293b, #475569);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.inventory-subtitle {
  font-size: 1rem;
  color: #64748b;
  font-weight: 500;
}

.add-button {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 0.875rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 4px rgba(139, 92, 246, 0.3);
}

.add-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(139, 92, 246, 0.4);
}


.add-icon {
  font-size: 1.25rem;
}

.filters-card {
  background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(226, 232, 240, 0.8);
  margin-bottom: 2rem;
  position: relative;
  overflow: hidden;
}

.filters-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #06b6d4, #0891b2);
  opacity: 0.7;
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

.products-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.product-item {
  background-color: white;
  border-radius: 0.75rem;
  padding: 1rem;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--gray-200);
  transition: all 0.2s ease;
}

.product-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.product-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.product-info {
  flex: 1;
}

.product-name {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--gray-800);
  margin-bottom: 0.25rem;
}

.product-category {
  font-size: 0.875rem;
  color: var(--gray-500);
  background-color: var(--gray-100);
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  display: inline-block;
}

.product-actions {
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

.share-btn {
  background-color: #f0f9ff;
  color: #0369a1;
}

.share-btn:hover {
  background-color: #e0f2fe;
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

.product-details {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
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

.detail-value.stock.low-stock {
  color: var(--danger);
  background-color: #fef2f2;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
}

.detail-value.stock.good-stock {
  color: var(--success);
  background-color: #f0fdf4;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
}

.detail-value.margin {
  color: var(--primary);
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

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
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

/* Image Upload Styles */
.image-upload-container {
  border: 2px dashed #d1d5db;
  border-radius: 0.5rem;
  padding: 1rem;
  text-align: center;
  transition: all 0.2s ease;
}

.image-upload-container:hover {
  border-color: #3b82f6;
  background-color: #f8fafc;
}

.image-preview {
  position: relative;
  display: inline-block;
}

.preview-image {
  max-width: 200px;
  max-height: 200px;
  border-radius: 0.5rem;
  object-fit: cover;
}

.remove-image-btn {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
}

.remove-image-btn:hover {
  background: #dc2626;
}

.image-upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.upload-icon {
  font-size: 2rem;
  color: #9ca3af;
}

.upload-text {
  color: #6b7280;
  font-size: 0.875rem;
  margin: 0;
}

.upload-btn {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.upload-btn:hover {
  background: #2563eb;
  transform: translateY(-1px);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}


@media (max-width: 768px) {
  .inventory-container {
    padding: 0.5rem;
  }
  
  .inventory-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .header-actions {
    flex-direction: column;
    width: 100%;
    gap: 0.75rem;
  }
  
  .add-button {
    justify-content: center;
  }
  
  .filters-row {
    flex-direction: column;
  }
  
  .product-details {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .modal-actions {
    flex-direction: column;
  }
}
</style>
