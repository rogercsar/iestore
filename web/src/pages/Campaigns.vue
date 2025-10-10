<template>
  <div class="campaigns-container">
    <div class="campaigns-header">
      <div class="header-content">
        <h1 class="campaigns-title">Campanhas</h1>
        <p class="campaigns-subtitle">Agrupe promoções e defina o público e o canal</p>
      </div>
      <button class="add-button" @click="openCreate()">
        <span class="add-icon">➕</span>
        <span class="add-text">Nova Campanha</span>
      </button>
    </div>

    <div class="filters-card">
      <div class="filters-row">
        <input class="filter-input" v-model="search" placeholder="Buscar campanha..." />
        <select class="filter-select" v-model.number="pageSize">
          <option :value="5">5</option>
          <option :value="10">10</option>
          <option :value="20">20</option>
        </select>
        <button class="btn small" @click="exportCSV">Exportar CSV</button>
      </div>
    </div>

    <div class="campaigns-list" v-if="campaigns.length">
      <div class="campaign-card" v-for="c in paginatedCampaigns" :key="c.id">
        <div class="card-header">
          <div>
            <h3 class="campaign-name">{{ c.name }}</h3>
            <p class="campaign-meta">
              {{ c.promotionIds.length }} promoções • Público: {{ c.audience }} • Canal: {{ c.channel.toUpperCase() }}
            </p>
            <p class="campaign-link" v-if="c.publicLink">
              Link público: <a :href="c.publicLink" target="_blank">{{ c.publicLink }}</a>
            </p>
          </div>
          <div class="campaign-actions">
            <button class="btn small" @click="copyLink(c)">Copiar link</button>
            <button class="btn small" @click="startEdit(c)">Editar</button>
            <button class="btn small danger" @click="removeCampaign(c)">Excluir</button>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <div class="empty-card">
        <span class="empty-icon">📣</span>
        <h3 class="empty-title">Nenhuma campanha cadastrada</h3>
        <p class="empty-subtitle">Crie sua primeira campanha para divulgar suas promoções</p>
      </div>
    </div>

    <div v-if="showModal" class="modal-backdrop" @click.self="closeCreate()">
      <div class="modal">
        <h3 class="modal-title">Nova Campanha</h3>
        <form @submit.prevent="createCampaign">
          <div class="form-grid">
            <label class="form-field">
              <span>Nome</span>
              <input v-model="form.name" class="input" placeholder="Campanha de Verão" required />
            </label>
            <label class="form-field">
              <span>Público Alvo</span>
              <select v-model="form.audience" class="input" required>
                <option value="todos">Todos</option>
                <option value="eletronicos">Clientes de Eletrônicos</option>
                <option value="acessorios">Clientes de Acessórios</option>
                <option value="audio">Clientes de Áudio</option>
              </select>
            </label>
            <div class="form-field">
              <span>Gerar Lista de Transmissão</span>
              <div class="share-row">
                <button type="button" class="btn" @click="generateWhatsappList()">Gerar WhatsApp (copiar)</button>
                <button type="button" class="btn" @click="generateEmailList()">Gerar Email (copiar)</button>
              </div>
              <div class="hint">Baseado na seleção de público. Busca clientes por histórico de compras nas categorias.</div>
            </div>
            <label class="form-field">
              <span>Canal</span>
              <select v-model="form.channel" class="input" required>
                <option value="email">Email</option>
                <option value="whatsapp">WhatsApp</option>
              </select>
            </label>
            <label class="form-field full">
              <span>Promoções</span>
              <select v-model="form.promotionIds" multiple class="input multi">
                <option v-for="p in promotions" :key="p.id" :value="p.id">{{ p.name }}</option>
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
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../stores/app'

interface Campaign {
  id: string
  name: string
  promotionIds: string[]
  audience: string
  channel: 'email' | 'whatsapp'
  publicLink?: string
}

interface PromotionRef { id: string; name: string }

const router = useRouter()
const store = useAppStore()
const campaigns = ref<Campaign[]>([])
const search = ref('')
const page = ref(1)
const pageSize = ref(10)
const promotions = ref<PromotionRef[]>([])
const showModal = ref(false)

const isEditing = ref<null | string>(null)
const form = ref({
  name: '',
  promotionIds: [] as string[],
  audience: 'todos',
  channel: 'whatsapp' as 'email' | 'whatsapp'
})

const openCreate = () => { showModal.value = true }
const closeCreate = () => { showModal.value = false }

const createCampaign = async () => {
  const id = `camp_${Date.now()}`
  const link = `${window.location.origin}/public/campaign/${id}`
  if (isEditing.value) {
    await store.updateCampaign(isEditing.value, {
      name: form.value.name,
      promotionIds: [...form.value.promotionIds],
      audience: form.value.audience,
      channel: form.value.channel
    })
  } else {
    await store.createCampaign({
      id,
      name: form.value.name,
      promotionIds: [...form.value.promotionIds],
      audience: form.value.audience,
      channel: form.value.channel,
      publicId: id
    })
  }
  await store.fetchCampaigns()
  campaigns.value = store.campaigns || []
  showModal.value = false
  isEditing.value = null
}

onMounted(() => {
  store.fetchPromotions().then(() => {
    promotions.value = (store.promotions || []).map(p => ({ id: p.id!, name: p.name }))
  })
  store.fetchCampaigns().then(() => {
    campaigns.value = store.campaigns || []
  })
  // garantir dados para geração de listas
  store.fetchCustomers()
  store.fetchProducts()
  store.fetchSales()
})

const copyLink = (c: Campaign) => {
  const link = c.publicLink || `${window.location.origin}/public/campaign/${c.publicId || c.id}`
  navigator.clipboard.writeText(link).then(() => {
    alert('Link copiado para a área de transferência!')
  })
}

const filteredCampaigns = computed(() => {
  if (!search.value) return campaigns.value
  const q = search.value.toLowerCase()
  return campaigns.value.filter(c => c.name.toLowerCase().includes(q))
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredCampaigns.value.length / pageSize.value)))
const paginatedCampaigns = computed(() => {
  if (page.value > totalPages.value) page.value = totalPages.value
  const start = (page.value - 1) * pageSize.value
  return filteredCampaigns.value.slice(start, start + pageSize.value)
})

// Helpers de lista de transmissão
const normalizeCategory = (c?: string) => (c || '').toLowerCase()

const getAudienceCustomers = () => {
  const customers = store.customers || []
  if (form.value.audience === 'todos') return customers
  const sales = store.sales || []
  const products = store.products || []
  const target = form.value.audience // eletronicos | acessorios | audio
  const productByName = new Map(products.map(p => [p.name.toLowerCase(), p]))
  const customerNames = new Set<string>()
  // coletar nomes por vendas cujo produto é da categoria alvo
  for (const s of sales) {
    const prod = productByName.get((s.product || '').toLowerCase())
    const cat = normalizeCategory(prod?.category)
    const isTarget = (target === 'eletronicos' && cat.includes('eletr'))
      || (target === 'acessorios' && cat.includes('acess'))
      || (target === 'audio' && cat.includes('áudio') || cat.includes('audio'))
    if (isTarget && s.customerName) customerNames.add(s.customerName)
  }
  // mapear nomes -> clientes do store, fallback por phone em sales se não achar
  const nameToCustomer = new Map(customers.map(c => [c.name, c]))
  const viaSalesCustomers: any[] = []
  for (const s of sales) {
    if (s.customerName && customerNames.has(s.customerName)) {
      const c = nameToCustomer.get(s.customerName)
      if (!c) viaSalesCustomers.push({ name: s.customerName, phone: s.customerPhone || '' })
    }
  }
  const list = [...customerNames].map(n => nameToCustomer.get(n)).filter(Boolean) as any[]
  // merge únicos por phone/email
  const seen = new Set<string>()
  const merged: { name: string; phone?: string; email?: string }[] = []
  for (const c of [...list, ...viaSalesCustomers]) {
    const key = (c.email || '') + '|' + (c.phone || '') + '|' + c.name
    if (seen.has(key)) continue
    seen.add(key)
    merged.push({ name: c.name, phone: c.phone, email: c.email })
  }
  return merged
}

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    alert('Lista copiada para a área de transferência!')
  } catch {
    // fallback
    const ta = document.createElement('textarea')
    ta.value = text
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
    alert('Lista copiada!')
  }
}

const generateWhatsappList = () => {
  const recipients = getAudienceCustomers()
  const numbers = recipients.map(r => (r.phone || '').replace(/\D+/g, '')).filter(n => n.length >= 10)
  const unique = Array.from(new Set(numbers))
  if (unique.length === 0) return alert('Nenhum número encontrado para este público.')
  copyToClipboard(unique.join('\n'))
}

const generateEmailList = () => {
  const recipients = getAudienceCustomers()
  const emails = recipients.map(r => (r.email || '')).filter(e => /.+@.+\..+/.test(e))
  const unique = Array.from(new Set(emails))
  if (unique.length === 0) return alert('Nenhum email encontrado para este público.')
  copyToClipboard(unique.join('; '))
}

const startEdit = (c: Campaign) => {
  isEditing.value = c.id || null
  form.value = {
    name: c.name,
    promotionIds: [...c.promotionIds],
    audience: c.audience,
    channel: c.channel
  }
  showModal.value = true
}

const removeCampaign = async (c: Campaign) => {
  if (!c.id) return
  if (confirm('Excluir esta campanha? Esta ação não pode ser desfeita.')) {
    await store.deleteCampaign(c.id)
    await store.fetchCampaigns()
    campaigns.value = store.campaigns || []
  }
}

const exportCSV = () => {
  const rows = filteredCampaigns.value.map(c => ({
    id: c.id,
    nome: c.name,
    promocoes: c.promotionIds.join('|'),
    publico: c.audience,
    canal: c.channel,
    link: `${window.location.origin}/public/campaign/${c.publicId || c.id}`
  }))
  const header = Object.keys(rows[0] || {id:'',nome:'',promocoes:'',publico:'',canal:'',link:''})
  const csv = [header.join(','), ...rows.map(r => header.map(k => JSON.stringify((r as any)[k] ?? '')).join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `campanhas_${new Date().toISOString().slice(0,10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.campaigns-container { flex:1; background:linear-gradient(135deg,#f8fafc,#e2e8f0); padding:1.5rem; min-height:100vh; box-sizing: border-box; }
.campaigns-header { display:flex; justify-content:space-between; align-items:center; padding:2rem; background:linear-gradient(145deg,#fff,#f8fafc); border-radius:16px; border:1px solid rgba(226,232,240,.8); margin-bottom:2rem; }
.campaigns-title { font-size:2rem; font-weight:800; color:#1e293b; margin-bottom:.5rem; }
.campaigns-subtitle { color:#64748b; }
.add-button { display:flex; align-items:center; gap:.75rem; background:linear-gradient(135deg,#8b5cf6,#7c3aed); color:#fff; border:none; border-radius:12px; padding:.875rem 1.5rem; font-weight:600; cursor:pointer; box-shadow:0 2px 4px rgba(139,92,246,.3); }
.filters-card { background:linear-gradient(145deg,#fff,#f8fafc); border:1px solid rgba(226,232,240,.8); border-radius:16px; padding:1rem; margin-bottom:1rem; }
.filters-row { display:flex; gap:1rem; align-items:center; }
.filter-input, .filter-select { padding:.5rem .75rem; border:1px solid #e2e8f0; border-radius:.5rem; }
.campaigns-list { display:grid; grid-template-columns:repeat(auto-fill,minmax(320px,1fr)); gap:1rem; }
.campaign-card { background:linear-gradient(145deg,#fff,#f8fafc); border:1px solid rgba(226,232,240,.8); border-radius:16px; padding:1rem; }
.card-header { display:flex; align-items:flex-start; justify-content:space-between; }
.campaign-name { font-weight:800; color:#1e293b; }
.campaign-meta { color:#64748b; font-size:.875rem; }
.campaign-link a { color:#2563eb; text-decoration:underline; }
.campaign-actions { display:flex; align-items:center; gap:.5rem; }
.btn.small { padding:.375rem .75rem; border:none; border-radius:.5rem; background:#e2e8f0; cursor:pointer; }
.pagination { display:flex; align-items:center; justify-content:center; gap:.75rem; margin-top:1rem; }
.page-btn { padding:.375rem .75rem; border:none; border-radius:.5rem; background:#e2e8f0; cursor:pointer; }
.page-info { color:#64748b; font-weight:600; }
.modal-backdrop { position: fixed; inset: 0; background: rgba(15,23,42,.5); display: flex; align-items: center; justify-content: center; padding: 1rem; z-index: 1000; }
.modal { background:#fff; border-radius:12px; padding:1.5rem; width:min(720px,96vw); max-height: 90vh; overflow: auto; box-sizing: border-box; box-shadow: 0 20px 25px rgba(0,0,0,.15); }
.modal-title { position: sticky; top: 0; background: #fff; padding-bottom: .5rem; margin-bottom: 1rem; z-index: 1; }
.filters-card { overflow: hidden; }
@media (max-width: 640px) {
  .form-grid { grid-template-columns: 1fr; }
  .campaigns-header { padding: 1rem; }
}
.modal-title { font-weight:800; color:#1e293b; margin-bottom:1rem; }
.form-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:1rem; }
.form-field { display:flex; flex-direction:column; gap:.25rem; }
.form-field.full { grid-column:1 / -1; }
.input { border:1px solid #e2e8f0; border-radius:.5rem; padding:.5rem .75rem; }
.input.multi { height: 7rem; }
.modal-actions { display:flex; justify-content:flex-end; gap:.75rem; margin-top:1rem; }
.btn { border:none; border-radius:.5rem; padding:.5rem 1rem; cursor:pointer; }
.btn.primary { background:linear-gradient(135deg,#8b5cf6,#7c3aed); color:#fff; }
</style>

