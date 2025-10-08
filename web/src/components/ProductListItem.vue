<template>
  <Card shadow="sm" class="product-item">
    <div class="product-container">
      <div v-if="product.photo" class="photo-container">
        <img :src="product.photo" :alt="product.name" class="product-photo" />
      </div>
      
      <div class="product-header">
        <h3 class="product-name">{{ product.name }}</h3>
        <div class="header-right">
          <div class="stock-badge" :class="stockBadgeClass">
            {{ product.quantity }} em estoque
          </div>
          <button class="menu-button" @click="showMenu = true">
            <span class="menu-icon">⋮</span>
          </button>
        </div>
      </div>
      
      <div class="product-details">
        <div class="detail-row">
          <span class="label">Custo:</span>
          <span class="value">{{ formatCurrency(product.cost) }}</span>
        </div>
        <div class="detail-row">
          <span class="label">Venda:</span>
          <span class="value price-value">{{ formatCurrency(product.unitPrice) }}</span>
        </div>
        <div class="detail-row">
          <span class="label">Lucro:</span>
          <span class="value profit-value">
            {{ formatCurrency(profit) }} ({{ profitMargin.toFixed(1) }}%)
          </span>
        </div>
      </div>
    </div>

    <!-- Context Menu -->
    <div v-if="showMenu" class="context-menu-overlay" @click="showMenu = false">
      <div class="context-menu" @click.stop>
        <button class="menu-item" @click="handleEdit">
          <span class="menu-icon">✏️</span>
          Editar
        </button>
        <button class="menu-item" @click="handleViewDetails">
          <span class="menu-icon">👁️</span>
          Ver Detalhes
        </button>
        <button class="menu-item" @click="handleShare">
          <span class="menu-icon">📤</span>
          Compartilhar
        </button>
        <button class="menu-item danger" @click="handleDelete">
          <span class="menu-icon">🗑️</span>
          Excluir
        </button>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Card from './Card.vue'
import type { Product } from '../services/api'

interface Props {
  product: Product
}

const props = defineProps<Props>()
const emit = defineEmits<{
  edit: [product: Product]
  delete: [product: Product]
  share: [product: Product]
  viewDetails: [product: Product]
}>()

const showMenu = ref(false)

const profit = computed(() => props.product.unitPrice - props.product.cost)
const profitMargin = computed(() => {
  if (props.product.cost === 0) return 0
  return (profit.value / props.product.cost) * 100
})

const stockBadgeClass = computed(() => {
  if (props.product.quantity === 0) return 'stock-empty'
  if (props.product.quantity <= 5) return 'stock-low'
  if (props.product.quantity <= 10) return 'stock-medium'
  return 'stock-good'
})

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

const handleEdit = () => {
  showMenu.value = false
  emit('edit', props.product)
}

const handleDelete = () => {
  showMenu.value = false
  emit('delete', props.product)
}

const handleShare = () => {
  showMenu.value = false
  emit('share', props.product)
}

const handleViewDetails = () => {
  showMenu.value = false
  emit('viewDetails', props.product)
}
</script>

<style scoped>
.product-item {
  margin-bottom: 1rem;
}

.product-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.photo-container {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.product-photo {
  width: 5rem;
  height: 5rem;
  border-radius: 0.5rem;
  background-color: var(--gray-100);
  object-fit: cover;
}

.product-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-name {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--gray-800);
  flex: 1;
  margin-right: 0.5rem;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.stock-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
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

.menu-button {
  background: none;
  border: none;
  padding: 0.25rem;
  cursor: pointer;
  color: var(--gray-500);
}

.menu-icon {
  font-size: 1.25rem;
  font-weight: bold;
}

.product-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.label {
  color: var(--gray-600);
  font-size: 0.875rem;
  font-weight: 500;
}

.value {
  color: var(--gray-800);
  font-size: 0.875rem;
  font-weight: 600;
}

.price-value {
  color: var(--primary);
}

.profit-value {
  color: var(--success);
}

.context-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.context-menu {
  background: white;
  border-radius: 0.75rem;
  padding: 0.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  min-width: 12rem;
}

.menu-item {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  color: var(--gray-700);
  transition: background-color 0.2s ease;
}

.menu-item:hover {
  background-color: var(--gray-50);
}

.menu-item.danger {
  color: var(--danger);
}

.menu-item .menu-icon {
  margin-right: 0.75rem;
  font-size: 1rem;
}

@media (max-width: 768px) {
  .product-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .header-right {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
