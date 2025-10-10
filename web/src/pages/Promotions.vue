<template>
  <div class="promotions-container">
    <div class="promotions-header">
      <div class="header-content">
        <h1 class="promotions-title">Promoções</h1>
        <p class="promotions-subtitle">Crie e gerencie promoções de produtos</p>
      </div>
      <button class="add-button" @click="openCreate()">
        <span class="add-icon">➕</span>
        <span class="add-text">Nova Promoção</span>
      </button>
    </div>

    <div class="filters-card">
      <div class="filters-row">
        <div class="filter-group">
          <input class="filter-input" v-model="search" placeholder="Buscar por nome da promoção ou produto..." />
        </div>
        <div class="filter-group">
          <select class="filter-select" v-model="statusFilter">
            <option value="">Todas</option>
            <option value="active">Ativas</option>
            <option value="scheduled">Agendadas</option>
            <option value="expired">Encerradas</option>
          </select>
        </div>
        <div class="filter-group">
          <select class="filter-select" v-model="sortBy">
            <option value="recent">Mais recentes</option>
            <option value="name">Nome</option>
            <option value="discount">Desconto</option>
            <option value="start">Início</option>
            <option value="end">Fim</option>
            <option value="status">Status</option>
          </select>
        </div>
        <div class="filter-group small">
          <select class="filter-select" v-model.number="pageSize">
            <option :value="5">5</option>
            <option :value="10">10</option>
            <option :value="20">20</option>
          </select>
        </div>
        <div class="filter-group">
          <button class="btn small" @click="exportCSV">Exportar CSV</button>
        </div>
      </div>
    </div>

    <div class="promotions-list" v-if="promotions.length">
      <div class="promotion-card" v-for="promo in paginatedPromotions" :key="promo.id">
        <div class="card-header">
          <div class="promo-info">
            <h3 class="promo-name">{{ promo.name }}</h3>
            <p class="promo-dates">
              {{ formatDate(promo.startAt) }} → {{ formatDate(promo.endAt) }}
              <span class="promo-remaining" v-if="promo.status === 'active'">• {{ daysLeft(promo.endAt) }} dias restantes</span>
            </p>
          </div>
          <div class="status-badge" :class="promo.status">
            {{ statusLabel(promo.status) }}
          </div>
        </div>
        <div class="promo-products">
          <div class="promo-product" v-for="p in promo.products" :key="p.productId">
            <div class="price">
              <span class="original">{{ formatCurrency(p.unitPrice) }}</span>
              <span class="arrow">→</span>
              <span class="discounted">{{ formatCurrency(discountPrice(p.unitPrice, promo.discountPercent)) }}</span>
              <span class="percent">-{{ promo.discountPercent }}%</span>
            </div>
            <div class="name">{{ p.name }}</div>
          </div>
        </div>
        <div class="promo-actions">
          <button class="btn small" @click="editPromo(promo)">Editar</button>
          <button class="btn small warn" @click="endPromo(promo)">Encerrar</button>
          <button class="btn small danger" @click="deletePromo(promo)">Excluir</button>
          <button class="btn small share" @click="sharePromoWhatsApp(promo)">WhatsApp</button>
          <button class="btn small share" @click="sharePromoEmail(promo)">Email</button>
        </div>
      </div>
    </div>
    <div v-if="totalPages > 1" class="pagination">
      <button class="page-btn" :disabled="page===1" @click="page--">Anterior</button>
      <span class="page-info">{{ page }} / {{ totalPages }}</span>
      <button class="page-btn" :disabled="page===totalPages" @click="page++">Próxima</button>
    </div>

    <div v-else class="empty-state">
      <div class="empty-card">
        <span class="empty-icon">🏷️</span>
        <h3 class="empty-title">Nenhuma promoção cadastrada</h3>
        <p class="empty-subtitle">Crie sua primeira promoção para destacar seus produtos</p>
      </div>
    </div>

    <div v-if="showModal" class="modal-backdrop" @click.self="closeCreate()">
      <div class="modal">
        <h3 class="modal-title">Nova Promoção</h3>
        <form @submit.prevent="createPromotion">
          <div class="form-grid">
            <label class="form-field">
              <span>Nome</span>
              <input v-model="form.name" class="input" placeholder="Promoção de Janeiro" required />
            </label>
            <label class="form-field">
              <span>Desconto (%)</span>
              <input v-model.number="form.discountPercent" type="number" min="1" max="90" class="input" required />
            </label>
            <label class="form-field">
              <span>Início</span>
              <input v-model="form.startAt" type="datetime-local" class="input" required />
            </label>
            <label class="form-field">
              <span>Fim</span>
              <input v-model="form.endAt" type="datetime-local" class="input" required />
            </label>
            <label class="form-field full">
              <span>Produtos</span>
              <select v-model="form.productIds" multiple class="input multi">
                <option v-for="p in products" :key="p.id" :value="p.id">{{ p.name }}</option>
              </select>
            </label>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn" @click="closeCreate()">Cancelar</button>
            <button type="submit" class="btn primary">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAppStore } from '../stores/app'
import type { Product, Promotion } from '../services/api'

type PromotionStatus = 'scheduled' | 'active' | 'expired'

interface PromotionProduct {
  productId: string
  name: string
  unitPrice: number
}

interface Promotion {
  id: string
  name: string
  discountPercent: number
  startAt: string
  endAt: string
  status: PromotionStatus
  products: PromotionProduct[]
}

const store = useAppStore()
const products = computed<Product[]>(() => store.products || [])

const promotions = ref<Promotion[]>([])
const statusFilter = ref('')
const search = ref('')
const page = ref(1)
const pageSize = ref(10)
const sortBy = ref<'recent'|'name'|'discount'|'start'|'end'|'status'>('recent')
const showModal = ref(false)

const isEditing = ref<null | string>(null)
const form = ref({
  name: '',
  discountPercent: 10,
  startAt: '',
  endAt: '',
  productIds: [] as string[]
})

const filteredPromotions = computed(() => {
  let list = promotions.value
  if (statusFilter.value) list = list.filter(p => p.status === statusFilter.value)
  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter(p => p.name.toLowerCase().includes(q) || p.products.some(pp => pp.name.toLowerCase().includes(q)))
  }
  // sort
  return [...list].sort((a, b) => {
    switch (sortBy.value) {
      case 'name': return a.name.localeCompare(b.name)
      case 'discount': return (b.discountPercent||0) - (a.discountPercent||0)
      case 'start': return new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
      case 'end': return new Date(a.endAt).getTime() - new Date(b.endAt).getTime()
      case 'status': return (a.status||'').localeCompare(b.status||'')
      default: return new Date(b.startAt).getTime() - new Date(a.startAt).getTime()
    }
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredPromotions.value.length / pageSize.value)))
const paginatedPromotions = computed(() => {
  if (page.value > totalPages.value) page.value = totalPages.value
  const start = (page.value - 1) * pageSize.value
  return filteredPromotions.value.slice(start, start + pageSize.value)
})

const openCreate = () => {
  showModal.value = true
}

const closeCreate = () => {
  showModal.value = false
}

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
const discountPrice = (price: number, percent: number) => Math.max(0, +(price * (1 - percent / 100)).toFixed(2))
const formatDate = (iso: string) => new Date(iso).toLocaleString('pt-BR')
const daysLeft = (iso: string) => {
  const diff = new Date(iso).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}
const statusLabel = (s: PromotionStatus) => s === 'active' ? 'Ativa' : s === 'scheduled' ? 'Agendada' : 'Encerrada'

const createPromotion = async () => {
  // Simple local creation for now (persist via API later)
  const selected = products.value.filter(p => form.value.productIds.includes(p.id!)).map(p => ({
    productId: p.id!,
    name: p.name,
    unitPrice: p.unitPrice
  }))
  const now = new Date().toISOString()
  const promo: Promotion = {
    id: `promo_${Date.now()}`,
    name: form.value.name,
    discountPercent: form.value.discountPercent,
    startAt: new Date(form.value.startAt).toISOString(),
    endAt: new Date(form.value.endAt).toISOString(),
    status: new Date(form.value.startAt) > new Date() ? 'scheduled' : (new Date(form.value.endAt) < new Date() ? 'expired' : 'active'),
    products: selected
  }
  if (isEditing.value) {
    await store.updatePromotion(isEditing.value, promo)
  } else {
    await store.createPromotion(promo)
  }
  await store.fetchPromotions()
  promotions.value = store.promotions || []
  showModal.value = false
  isEditing.value = null
}

const editPromo = (promo: Promotion) => {
  showModal.value = true
  isEditing.value = promo.id || null
  form.value = {
    name: promo.name,
    discountPercent: promo.discountPercent,
    startAt: promo.startAt.slice(0,16),
    endAt: promo.endAt.slice(0,16),
    productIds: promo.products.map(p => p.productId)
  }
  // On submit, we could detect edit mode; for simplicity, keep create-only UI now
}

const endPromo = async (promo: Promotion) => {
  if (!promo.id) return
  if (confirm('Encerrar esta promoção agora?')) {
    await store.endPromotion(promo.id)
    await store.fetchPromotions()
    promotions.value = store.promotions || []
  }
}

const deletePromo = async (promo: Promotion) => {
  if (!promo.id) return
  if (confirm('Excluir esta promoção? Esta ação não pode ser desfeita.')) {
    await store.deletePromotion(promo.id)
    await store.fetchPromotions()
    promotions.value = store.promotions || []
  }
}

const sharePromoWhatsApp = (promo: Promotion) => {
  const msgLines = [
    `🏷️ ${promo.name} (-${promo.discountPercent}%)`,
    ...promo.products.slice(0,5).map(p => `• ${p.name}: de ${formatCurrency(p.unitPrice)} por ${formatCurrency(discountPrice(p.unitPrice, promo.discountPercent))}`),
    `Válida até: ${formatDate(promo.endAt)}`
  ]
  const text = msgLines.join('\n')
  const phone = prompt('Número do WhatsApp com DDI e DDD (opcional):\nEx: 5565999999999')
  const base = phone && phone.trim() ? `https://wa.me/${phone.trim()}` : 'https://wa.me/'
  const url = `${base}?text=${encodeURIComponent(text)}`
  window.open(url, '_blank')
}

const sharePromoEmail = (promo: Promotion) => {
  const subject = `Promoção: ${promo.name}`
  const body = `Olá,\n\nConfira nossa promoção ${promo.name} (-${promo.discountPercent}%):\n\n` +
    promo.products.map(p => `• ${p.name}: de ${formatCurrency(p.unitPrice)} por ${formatCurrency(discountPrice(p.unitPrice, promo.discountPercent))}`).join('\n') +
    `\n\nVálida até: ${formatDate(promo.endAt)}\n\n` +
    `Acesse nossa campanha: ${window.location.origin}/promotions`
  window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

const exportCSV = () => {
  const rows = filteredPromotions.value.flatMap(p => p.products.map(pp => ({
    promocao: p.name,
    desconto_percent: p.discountPercent,
    inicio: p.startAt,
    fim: p.endAt,
    status: p.status,
    produto: pp.name,
    preco_original: pp.unitPrice,
    preco_promocional: discountPrice(pp.unitPrice, p.discountPercent)
  })))
  const header = Object.keys(rows[0] || {promocao:'',desconto_percent:'',inicio:'',fim:'',status:'',produto:'',preco_original:'',preco_promocional:''})
  const csv = [header.join(','), ...rows.map(r => header.map(k => JSON.stringify((r as any)[k] ?? '')).join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `promocoes_${new Date().toISOString().slice(0,10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

onMounted(async () => {
  await store.fetchProducts()
  await store.fetchPromotions()
  promotions.value = store.promotions || []
})
</script>

<style scoped>
.promotions-container { flex: 1; background: linear-gradient(135deg, #f8fafc, #e2e8f0); padding: 1.5rem; min-height: 100vh; box-sizing: border-box; }
.promotions-header { display:flex; justify-content:space-between; align-items:center; padding:2rem; background:linear-gradient(145deg,#fff,#f8fafc); border-radius:16px; border:1px solid rgba(226,232,240,.8); margin-bottom:2rem; position:relative; overflow:hidden; }
.promotions-title { font-size:2rem; font-weight:800; color:#1e293b; margin-bottom:.5rem; }
.promotions-subtitle { color:#64748b; }
.add-button { display:flex; align-items:center; gap:.75rem; background:linear-gradient(135deg,#3b82f6,#1d4ed8); color:#fff; border:none; border-radius:12px; padding:.875rem 1.5rem; font-weight:600; cursor:pointer; box-shadow:0 2px 4px rgba(59,130,246,.3); }
.add-icon { font-size:1.25rem; }
.filters-card { background:linear-gradient(145deg,#fff,#f8fafc); border:1px solid rgba(226,232,240,.8); border-radius:16px; padding:1.5rem; margin-bottom:2rem; }
.filters-row { display:flex; gap:1rem; }
.filter-select { padding:.5rem .75rem; border:1px solid #e2e8f0; border-radius:.5rem; }
.filter-input { padding:.5rem .75rem; border:1px solid #e2e8f0; border-radius:.5rem; min-width:240px; }
.promotions-list { display:grid; grid-template-columns:repeat(auto-fill,minmax(320px,1fr)); gap:1rem; }
.promotion-card { background:linear-gradient(145deg,#fff,#f8fafc); border:1px solid rgba(226,232,240,.8); border-radius:16px; padding:1rem; }
.card-header { display:flex; align-items:flex-start; justify-content:space-between; }
.promo-name { font-weight:700; color:#1e293b; }
.promo-dates { color:#64748b; font-size:.875rem; }
.status-badge { padding:.25rem .5rem; border-radius:999px; font-size:.75rem; font-weight:700; }
.status-badge.active { background:linear-gradient(135deg,#10b981,#059669); color:#fff; }
.status-badge.scheduled { background:linear-gradient(135deg,#f59e0b,#d97706); color:#fff; }
.status-badge.expired { background:linear-gradient(135deg,#ef4444,#dc2626); color:#fff; }
.promo-products { display:grid; gap:.5rem; margin-top:.75rem; }
.promo-product .price { display:flex; align-items:baseline; gap:.5rem; }
.original { text-decoration:line-through; color:#64748b; }
.discounted { color:#059669; font-weight:800; }
.percent { color:#10b981; font-weight:700; }
.promo-actions { display:flex; gap:.5rem; justify-content:flex-end; margin-top:.75rem; }
.btn.small { padding:.375rem .75rem; border:none; border-radius:.5rem; background:#e2e8f0; cursor:pointer; }
.btn.small.warn { background:#f59e0b; color:#fff; }
.btn.small.danger { background:#ef4444; color:#fff; }
.btn.small.share { background:#22c55e; color:#fff; }
.pagination { display:flex; align-items:center; justify-content:center; gap:.75rem; margin-top:1rem; }
.page-btn { padding:.375rem .75rem; border:none; border-radius:.5rem; background:#e2e8f0; cursor:pointer; }
.page-info { color:#64748b; font-weight:600; }
.empty-state { display:flex; justify-content:center; padding:3rem; }
.empty-card { text-align:center; background:#fff; border:1px solid #e2e8f0; border-radius:12px; padding:2rem; }
.modal-backdrop { position: fixed; inset: 0; background: rgba(15,23,42,.5); display: flex; align-items: center; justify-content: center; padding: 1rem; z-index: 1000; }
.modal { background: #fff; border-radius: 12px; padding: 1.5rem; width: min(720px, 96vw); max-height: 90vh; overflow: auto; box-sizing: border-box; box-shadow: 0 20px 25px rgba(0,0,0,.15); }
.modal-title { position: sticky; top: 0; background: #fff; padding-bottom: .5rem; margin-bottom: 1rem; z-index: 1; }
.modal-title { font-weight:800; color:#1e293b; margin-bottom:1rem; }
.form-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:1rem; }
.filters-card { overflow: hidden; }
@media (max-width: 640px) {
  .form-grid { grid-template-columns: 1fr; }
  .promotions-header { padding: 1rem; }
}
.form-field { display:flex; flex-direction:column; gap:.25rem; }
.form-field.full { grid-column:1 / -1; }
.input { border:1px solid #e2e8f0; border-radius:.5rem; padding:.5rem .75rem; }
.input.multi { height: 7rem; }
.modal-actions { display:flex; justify-content:flex-end; gap:.75rem; margin-top:1rem; }
.btn { border:none; border-radius:.5rem; padding:.5rem 1rem; cursor:pointer; }
.btn.primary { background:linear-gradient(135deg,#3b82f6,#1d4ed8); color:#fff; }
</style>

