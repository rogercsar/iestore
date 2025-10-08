<template>
  <div v-if="visible" class="share-modal-overlay" @click="closeModal">
    <div class="share-modal" @click.stop>
      <div class="share-header">
        <h3 class="share-title">Compartilhar Produto</h3>
        <button class="close-button" @click="closeModal">×</button>
      </div>
      
      <div class="product-preview">
        <div class="product-image">
          <img v-if="product.photo" :src="product.photo" :alt="product.name" />
          <div v-else class="placeholder-image">📦</div>
        </div>
        <div class="product-info">
          <h4 class="product-name">{{ product.name }}</h4>
          <p class="product-price">{{ formatCurrency(product.unitPrice) }}</p>
          <p v-if="product.category" class="product-category">{{ product.category }}</p>
        </div>
      </div>

      <div class="share-options">
        <!-- Link para copiar -->
        <div class="share-option">
          <div class="option-header">
            <span class="option-icon">🔗</span>
            <span class="option-title">Link do Produto</span>
          </div>
          <div class="link-container">
            <input 
              ref="linkInput"
              type="text" 
              :value="productUrl" 
              readonly 
              class="link-input"
            />
            <button @click="copyLink" class="copy-button">
              {{ linkCopied ? '✅' : '📋' }}
            </button>
          </div>
        </div>

        <!-- QR Code -->
        <div class="share-option">
          <div class="option-header">
            <span class="option-icon">📱</span>
            <span class="option-title">QR Code</span>
          </div>
          <div class="qr-container">
            <canvas ref="qrCanvas" class="qr-code"></canvas>
            <button @click="downloadQR" class="download-qr-button">
              📥 Baixar QR Code
            </button>
          </div>
        </div>

        <!-- WhatsApp -->
        <div class="share-option">
          <div class="option-header">
            <span class="option-icon">💬</span>
            <span class="option-title">WhatsApp</span>
          </div>
          <a :href="whatsappUrl" target="_blank" class="whatsapp-button">
            💬 Enviar no WhatsApp
          </a>
        </div>

        <!-- Redes Sociais -->
        <div class="share-option">
          <div class="option-header">
            <span class="option-icon">📢</span>
            <span class="option-title">Redes Sociais</span>
          </div>
          <div class="social-buttons">
            <a :href="facebookUrl" target="_blank" class="social-button facebook">
              📘 Facebook
            </a>
            <a :href="twitterUrl" target="_blank" class="social-button twitter">
              🐦 Twitter
            </a>
            <a :href="linkedinUrl" target="_blank" class="social-button linkedin">
              💼 LinkedIn
            </a>
            <a :href="telegramUrl" target="_blank" class="social-button telegram">
              ✈️ Telegram
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import type { Product } from '../services/api'

interface Props {
  visible: boolean
  product: Product
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
}>()

const linkInput = ref<HTMLInputElement>()
const qrCanvas = ref<HTMLCanvasElement>()
const linkCopied = ref(false)

const productUrl = computed(() => {
  const baseUrl = window.location.origin
  const productName = encodeURIComponent(props.product.name.toLowerCase().replace(/\s+/g, '-'))
  return `${baseUrl}/public/product/${productName}`
})

const whatsappUrl = computed(() => {
  const message = `Olá! Tenho interesse no produto: ${props.product.name} - ${formatCurrency(props.product.unitPrice)}`
  const encodedMessage = encodeURIComponent(message)
  const encodedUrl = encodeURIComponent(productUrl.value)
  return `https://wa.me/?text=${encodedMessage}%0A%0A${encodedUrl}`
})

const facebookUrl = computed(() => {
  const encodedUrl = encodeURIComponent(productUrl.value)
  const encodedText = encodeURIComponent(`Confira este produto: ${props.product.name} - ${formatCurrency(props.product.unitPrice)}`)
  return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`
})

const twitterUrl = computed(() => {
  const encodedUrl = encodeURIComponent(productUrl.value)
  const encodedText = encodeURIComponent(`Confira este produto: ${props.product.name} - ${formatCurrency(props.product.unitPrice)}`)
  return `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`
})

const linkedinUrl = computed(() => {
  const encodedUrl = encodeURIComponent(productUrl.value)
  const encodedText = encodeURIComponent(`Confira este produto: ${props.product.name} - ${formatCurrency(props.product.unitPrice)}`)
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&summary=${encodedText}`
})

const telegramUrl = computed(() => {
  const encodedUrl = encodeURIComponent(productUrl.value)
  const encodedText = encodeURIComponent(`Confira este produto: ${props.product.name} - ${formatCurrency(props.product.unitPrice)}`)
  return `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`
})

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

const closeModal = () => {
  emit('close')
}

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(productUrl.value)
    linkCopied.value = true
    setTimeout(() => {
      linkCopied.value = false
    }, 2000)
  } catch (err) {
    // Fallback for older browsers
    linkInput.value?.select()
    document.execCommand('copy')
    linkCopied.value = true
    setTimeout(() => {
      linkCopied.value = false
    }, 2000)
  }
}

const generateQRCode = async () => {
  if (!qrCanvas.value) return
  
  try {
    const canvas = qrCanvas.value
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // Set canvas size
    canvas.width = 200
    canvas.height = 200
    
    // Clear canvas
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, 200, 200)
    
    // Generate QR code using Google Charts API (free and reliable)
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(productUrl.value)}`
    
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      ctx.drawImage(img, 10, 10, 180, 180)
      
      // Add store name at bottom
      ctx.fillStyle = 'black'
      ctx.font = 'bold 14px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('IEStore', 100, 195)
    }
    img.onerror = () => {
      // Fallback: draw a simple pattern
      ctx.fillStyle = 'black'
      const size = 8
      for (let i = 0; i < 25; i++) {
        for (let j = 0; j < 25; j++) {
          if ((i + j) % 3 === 0 || (i * j) % 7 === 0) {
            ctx.fillRect(i * size, j * size, size, size)
          }
        }
      }
      ctx.fillStyle = 'black'
      ctx.font = '12px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('IEStore', 100, 190)
    }
    img.src = qrUrl
    
  } catch (error) {
    console.error('Error generating QR code:', error)
  }
}

const downloadQR = () => {
  if (!qrCanvas.value) return
  
  const link = document.createElement('a')
  link.download = `qrcode-${props.product.name.replace(/\s+/g, '-')}.png`
  link.href = qrCanvas.value.toDataURL()
  link.click()
}

onMounted(() => {
  nextTick(() => {
    generateQRCode()
  })
})
</script>

<style scoped>
.share-modal-overlay {
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

.share-modal {
  background: white;
  border-radius: 1rem;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.share-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.share-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
  padding: 0.25rem;
}

.close-button:hover {
  color: #374151;
}

.product-preview {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.product-image {
  width: 80px;
  height: 80px;
  border-radius: 0.5rem;
  overflow: hidden;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.placeholder-image {
  font-size: 2rem;
}

.product-info {
  flex: 1;
}

.product-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
}

.product-price {
  font-size: 1.25rem;
  font-weight: 700;
  color: #059669;
  margin: 0 0 0.25rem 0;
}

.product-category {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.share-options {
  padding: 1.5rem;
}

.share-option {
  margin-bottom: 2rem;
}

.share-option:last-child {
  margin-bottom: 0;
}

.option-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.option-icon {
  font-size: 1.25rem;
}

.option-title {
  font-weight: 600;
  color: #1f2937;
}

.link-container {
  display: flex;
  gap: 0.5rem;
}

.link-input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  background: #f9fafb;
}

.copy-button {
  padding: 0.75rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;
}

.copy-button:hover {
  background: #2563eb;
}

.qr-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.qr-code {
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
}

.download-qr-button {
  padding: 0.75rem 1.5rem;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.download-qr-button:hover {
  background: #059669;
}

.whatsapp-button {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background: #25d366;
  color: white;
  text-decoration: none;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: background-color 0.2s;
}

.whatsapp-button:hover {
  background: #128c7e;
}

.social-buttons {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.social-button {
  display: inline-block;
  padding: 0.75rem 1rem;
  text-decoration: none;
  border-radius: 0.5rem;
  font-weight: 500;
  text-align: center;
  transition: all 0.2s;
}

.social-button.facebook {
  background: #1877f2;
  color: white;
}

.social-button.facebook:hover {
  background: #166fe5;
}

.social-button.twitter {
  background: #1da1f2;
  color: white;
}

.social-button.twitter:hover {
  background: #1a91da;
}

.social-button.linkedin {
  background: #0077b5;
  color: white;
}

.social-button.linkedin:hover {
  background: #005885;
}

.social-button.telegram {
  background: #0088cc;
  color: white;
}

.social-button.telegram:hover {
  background: #0077b3;
}

@media (max-width: 640px) {
  .share-modal {
    margin: 1rem;
    max-height: calc(100vh - 2rem);
  }
  
  .product-preview {
    flex-direction: column;
    text-align: center;
  }
  
  .social-buttons {
    grid-template-columns: 1fr;
  }
}
</style>
