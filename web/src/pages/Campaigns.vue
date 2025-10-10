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

    <div class="campaigns-list" v-if="campaigns.length">
      <div class="campaign-card" v-for="c in campaigns" :key="c.id">
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
import { ref, onMounted } from 'vue'
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
const promotions = ref<PromotionRef[]>([])
const showModal = ref(false)

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
  await store.createCampaign({
    id,
    name: form.value.name,
    promotionIds: [...form.value.promotionIds],
    audience: form.value.audience,
    channel: form.value.channel,
    publicId: id
  })
  await store.fetchCampaigns()
  campaigns.value = store.campaigns || []
  showModal.value = false
}

onMounted(() => {
  store.fetchPromotions().then(() => {
    promotions.value = (store.promotions || []).map(p => ({ id: p.id!, name: p.name }))
  })
  store.fetchCampaigns().then(() => {
    campaigns.value = store.campaigns || []
  })
})
</script>

<style scoped>
.campaigns-container { flex:1; background:linear-gradient(135deg,#f8fafc,#e2e8f0); padding:1.5rem; min-height:100vh; }
.campaigns-header { display:flex; justify-content:space-between; align-items:center; padding:2rem; background:linear-gradient(145deg,#fff,#f8fafc); border-radius:16px; border:1px solid rgba(226,232,240,.8); margin-bottom:2rem; }
.campaigns-title { font-size:2rem; font-weight:800; color:#1e293b; margin-bottom:.5rem; }
.campaigns-subtitle { color:#64748b; }
.add-button { display:flex; align-items:center; gap:.75rem; background:linear-gradient(135deg,#8b5cf6,#7c3aed); color:#fff; border:none; border-radius:12px; padding:.875rem 1.5rem; font-weight:600; cursor:pointer; box-shadow:0 2px 4px rgba(139,92,246,.3); }
.campaigns-list { display:grid; grid-template-columns:repeat(auto-fill,minmax(320px,1fr)); gap:1rem; }
.campaign-card { background:linear-gradient(145deg,#fff,#f8fafc); border:1px solid rgba(226,232,240,.8); border-radius:16px; padding:1rem; }
.card-header { display:flex; align-items:flex-start; justify-content:space-between; }
.campaign-name { font-weight:800; color:#1e293b; }
.campaign-meta { color:#64748b; font-size:.875rem; }
.campaign-link a { color:#2563eb; text-decoration:underline; }
.modal-backdrop { position:fixed; inset:0; background:rgba(15,23,42,.4); display:flex; align-items:center; justify-content:center; }
.modal { background:#fff; border-radius:12px; padding:1.5rem; width:min(720px,96vw); }
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

