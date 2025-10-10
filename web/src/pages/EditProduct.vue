<template>
  <div class="edit-product-container">
    <div class="edit-product-header">
      <button class="back-button" @click="goBack">
        <span class="back-icon">←</span>
      </button>
      <h1 class="edit-product-title">Editar Produto</h1>
      <div class="placeholder"></div>
    </div>

    <div class="edit-product-content">
      <Card shadow="lg" class="edit-product-card">
        <div class="form-section">
          <div class="form-group">
            <label class="form-label">Nome do Produto *</label>
            <input
              v-model="product.name"
              type="text"
              class="form-input"
              placeholder="Digite o nome do produto"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Categoria</label>
            <select v-model="product.category" class="form-select">
              <option value="">Selecione uma categoria...</option>
              <option value="eletronicos">Eletrônicos</option>
              <option value="roupas">Roupas</option>
              <option value="casa">Casa e Jardim</option>
              <option value="esportes">Esportes</option>
              <option value="beleza">Beleza</option>
              <option value="livros">Livros</option>
              <option value="automoveis">Automóveis</option>
              <option value="outros">Outros</option>
            </select>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Quantidade *</label>
              <input
                v-model.number="product.quantity"
                type="number"
                class="form-input"
                placeholder="0"
                min="0"
              />
            </div>
            <div class="form-group">
              <label class="form-label">Custo (R$) *</label>
              <input
                v-model.number="product.cost"
                type="number"
                step="0.01"
                class="form-input"
                placeholder="0,00"
                min="0"
              />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Preço de Venda (R$) *</label>
            <input
              v-model.number="product.unitPrice"
              type="number"
              step="0.01"
              class="form-input"
              placeholder="0,00"
              min="0"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Foto do Produto</label>
            
            <div v-if="product.photo" class="image-container">
              <img :src="product.photo" :alt="product.name" class="product-image" />
              <button class="remove-image-button" @click="removeImage">
                <span class="remove-icon">×</span>
              </button>
            </div>
            
            <div v-else class="upload-section">
              <button class="upload-button" @click="showImageOptions" :disabled="uploading">
                <span class="upload-icon">{{ uploading ? '⏳' : '📷' }}</span>
                <span class="upload-text">{{ uploading ? 'Processando...' : 'Adicionar Foto' }}</span>
              </button>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Descrição</label>
            <textarea
              v-model="product.description"
              class="form-textarea"
              placeholder="Descrição opcional do produto"
              rows="3"
            ></textarea>
          </div>

          <!-- Summary -->
          <div class="summary">
            <h3 class="summary-title">Resumo</h3>
            <div class="summary-row">
              <span class="summary-label">Lucro por unidade:</span>
              <span class="summary-value">{{ formatCurrency(profit) }}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Margem de lucro:</span>
              <span class="summary-value">{{ profitMargin.toFixed(1) }}%</span>
            </div>
          </div>

          <button 
            class="update-button" 
            @click="handleSubmit"
            :disabled="loading"
          >
            <span v-if="loading" class="loading-spinner"></span>
            {{ loading ? 'Atualizando...' : 'Atualizar Produto' }}
          </button>
        </div>
      </Card>
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

interface ProductForm {
  name: string
  category: string
  quantity: number
  cost: number
  unitPrice: number
  photo: string
  description: string
}

const product = ref<ProductForm>({
  name: '',
  category: '',
  quantity: 0,
  cost: 0,
  unitPrice: 0,
  photo: '',
  description: ''
})

const loading = ref(false)
const uploading = ref(false)

const profit = computed(() => {
  return product.value.unitPrice - product.value.cost
})

const profitMargin = computed(() => {
  if (product.value.cost === 0) return 0
  return (profit.value / product.value.cost) * 100
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
    console.log('🔍 Loading product with ID:', productId)
    
    // Fetch products from PostgreSQL API
    const response = await fetch('/.netlify/functions/postgres?table=products')
    
    if (!response.ok) {
      throw new Error('Erro ao carregar produtos')
    }

    const products: Product[] = await response.json()
    console.log('✅ Products loaded from PostgreSQL:', products.length, 'products')
    
    const foundProduct = products.find(p => p.id === productId)
    if (foundProduct) {
      product.value = {
        name: foundProduct.name,
        category: foundProduct.category || 'eletronicos',
        quantity: parseInt(foundProduct.quantity.toString()) || 0,
        cost: parseFloat(foundProduct.cost.toString()) || 0,
        unitPrice: parseFloat(foundProduct.unitPrice.toString()) || 0,
        photo: foundProduct.photo || '',
        description: foundProduct.description || 'Descrição do produto...'
      }
      console.log('✅ Product loaded:', product.value)
    } else {
      console.log('❌ Product not found with ID:', productId)
      console.log('Available products:', products.map(p => ({ id: p.id, name: p.name })))
    }
  } catch (error) {
    console.error('Error loading product:', error)
  } finally {
    loading.value = false
  }
}

const handleSubmit = async () => {
  if (!product.value.name.trim() || !product.value.quantity || !product.value.cost || !product.value.unitPrice) {
    alert('Preencha todos os campos obrigatórios')
    return
  }

  if (product.value.quantity < 0) {
    alert('Quantidade inválida')
    return
  }

  if (product.value.cost < 0) {
    alert('Custo inválido')
    return
  }

  if (product.value.unitPrice < 0) {
    alert('Preço de venda inválido')
    return
  }

  loading.value = true
  try {
    // Get product ID from route params
    const productId = route.params.id as string
    
    // Update product via PostgreSQL API
    const response = await fetch('/.netlify/functions/postgres?table=products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mode: 'append',
        rows: [{
          id: productId,
          name: product.value.name,
          category: product.value.category,
          quantity: product.value.quantity,
          cost: product.value.cost,
          unitPrice: product.value.unitPrice,
          photo: product.value.photo,
          description: product.value.description
        }]
      })
    })
    
    if (!response.ok) {
      throw new Error('Erro ao atualizar produto')
    }
    
    console.log('✅ Product updated successfully')
    alert('Produto atualizado com sucesso!')
    router.go(-1)
  } catch (error) {
    console.error('❌ Error updating product:', error)
    alert('Falha ao atualizar produto')
  } finally {
    loading.value = false
  }
}

const showImageOptions = () => {
  // In a real app, this would show image picker options
  alert('Funcionalidade de seleção de imagem será implementada')
}

const removeImage = () => {
  product.value.photo = ''
}

onMounted(() => {
  loadProduct()
})
</script>

<style scoped>
.edit-product-container {
  flex: 1;
  background-color: var(--gray-50);
}

.edit-product-header {
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

.edit-product-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--gray-800);
}

.placeholder {
  width: 1.5rem;
}

.edit-product-content {
  padding: 1rem;
}

.edit-product-card {
  max-width: 32rem;
  margin: 0 auto;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--gray-700);
  margin-bottom: 0.5rem;
}

.form-input {
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

.form-select {
  padding: 0.75rem;
  border: 1px solid var(--gray-300);
  border-radius: 0.5rem;
  font-size: 1rem;
  background-color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.form-select:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-textarea {
  padding: 0.75rem;
  border: 1px solid var(--gray-300);
  border-radius: 0.5rem;
  font-size: 1rem;
  resize: vertical;
  min-height: 5rem;
  transition: all 0.2s ease;
}

.form-textarea:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.image-container {
  position: relative;
  display: flex;
  justify-content: center;
}

.product-image {
  width: 7.5rem;
  height: 7.5rem;
  border-radius: 0.75rem;
  background-color: var(--gray-100);
  object-fit: cover;
}

.remove-image-button {
  position: absolute;
  top: -0.5rem;
  right: -0.5rem;
  background: var(--danger);
  color: white;
  border: none;
  border-radius: 50%;
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1rem;
}

.upload-section {
  display: flex;
  justify-content: center;
}

.upload-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2px dashed var(--gray-300);
  border-radius: 0.75rem;
  padding: 2rem;
  background-color: var(--gray-50);
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  max-width: 12rem;
}

.upload-button:hover:not(:disabled) {
  border-color: var(--primary);
  background-color: rgba(59, 130, 246, 0.05);
}

.upload-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.upload-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.upload-text {
  font-size: 1rem;
  font-weight: 600;
  color: var(--primary);
}

.summary {
  background-color: var(--gray-50);
  border-radius: 0.5rem;
  padding: 1rem;
}

.summary-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--gray-800);
  margin-bottom: 0.5rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.25rem;
}

.summary-label {
  color: var(--gray-600);
  font-size: 0.875rem;
}

.summary-value {
  color: var(--gray-800);
  font-size: 0.875rem;
  font-weight: 600;
}

.update-button {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--warning) 0%, #f59e0b 100%);
  color: white;
  border: none;
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  gap: 0.5rem;
}

.update-button:hover:not(:disabled) {
  transform: translateY(-1px);
}

.update-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.loading-spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
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
  .edit-product-content {
    padding: 0.5rem;
  }
  
  .edit-product-card {
    max-width: none;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
