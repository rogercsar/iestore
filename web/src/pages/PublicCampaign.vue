<template>
  <div class="public-campaign-page">
    <header class="page-header">
      <div class="header-content">
        <div class="logo-section">
          <span class="logo-icon">📣</span>
          <h1 class="logo-text">Campanha</h1>
        </div>
        <p class="header-subtitle">Ofertas selecionadas para você</p>
      </div>
    </header>

    <main class="main-content">
      <div v-if="loading" class="loading">Carregando campanha...</div>
      <div v-else-if="!campaignName" class="error">Campanha não encontrada</div>
      <div v-else>
        <h2 class="campaign-title">{{ campaignName }}</h2>
        <div class="products-grid">
          <div class="product-card" v-for="item in campaignProducts" :key="item.productId">
            <div class="product-info">
              <h3 class="product-name">{{ item.name }}</h3>
              <div class="promo-line">
                <span class="original">{{ formatCurrency(item.unitPrice) }}</span>
                <span class="arrow">→</span>
                <span class="discounted">{{ formatCurrency(discountPrice(item.unitPrice, item.discountPercent)) }}</span>
                <span class="percent">-{{ item.discountPercent }}%</span>
              </div>
              <a :href="productLink(item.name)" target="_blank" class="cta">Ver produto</a>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { apiService, type Promotion } from '../services/api'

const route = useRoute()
const loading = ref(true)
const campaignName = ref<string>('')
const campaignProducts = ref<{ productId: string; name: string; unitPrice: number; discountPercent: number }[]>([])

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
const discountPrice = (price: number, percent: number) => Math.max(0, +(price * (1 - percent / 100)).toFixed(2))
const productLink = (name: string) => `/public/product/${encodeURIComponent(name.toLowerCase().replace(/\s+/g, '-'))}`

onMounted(async () => {
  try {
    loading.value = true
    const publicId = route.params.id as string
    // Load campaigns and promotions
    const campaigns = await apiService.getCampaigns()
    const campaign = campaigns.find(c => c.publicId === publicId || c.id === publicId)
    if (!campaign) {
      loading.value = false
      return
    }
    campaignName.value = campaign.name
    const promos: Promotion[] = await apiService.getPromotions()
    const selected = promos.filter(p => campaign.promotionIds.includes(p.id as string))
    campaignProducts.value = selected.flatMap(p => p.products.map(prod => ({
      productId: prod.productId,
      name: prod.name,
      unitPrice: prod.unitPrice,
      discountPercent: p.discountPercent
    })))
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.public-campaign-page { min-height:100vh; background:linear-gradient(135deg,#f8fafc,#e2e8f0); }
.page-header { background:white; box-shadow:0 1px 3px rgba(0,0,0,.1); padding:1.5rem 0; }
.header-content { max-width:1200px; margin:0 auto; padding:0 1rem; text-align:center; }
.logo-section { display:flex; align-items:center; justify-content:center; gap:.75rem; margin-bottom:.5rem; }
.logo-icon { font-size:2rem; }
.logo-text { font-size:2rem; font-weight:800; color:#1f2937; margin:0; }
.header-subtitle { color:#6b7280; }
.main-content { max-width:1200px; margin:0 auto; padding:2rem 1rem; }
.campaign-title { font-size:1.5rem; font-weight:800; color:#1f2937; margin-bottom:1rem; }
.products-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:1rem; }
.product-card { background:white; border-radius:12px; padding:1rem; border:1px solid #e5e7eb; }
.promo-line { display:flex; align-items:baseline; gap:.5rem; }
.original { text-decoration:line-through; color:#64748b; }
.discounted { color:#059669; font-weight:800; }
.percent { color:#10b981; font-weight:700; }
.cta { display:inline-block; margin-top:.5rem; background:#3b82f6; color:white; padding:.5rem .75rem; border-radius:.5rem; text-decoration:none; }
.loading,.error { text-align:center; padding:2rem; color:#64748b; }
</style>

