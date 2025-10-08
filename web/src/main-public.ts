import { createApp } from 'vue'
import { createPinia } from 'pinia'
import publicRouter from './router/public'
import PublicProduct from './pages/PublicProduct.vue'
import './style.css'

// Criar app Vue separado para páginas públicas
const app = createApp(PublicProduct)
const pinia = createPinia()

app.use(pinia)
app.use(publicRouter)

// Remover loading inicial
const loadingElement = document.querySelector('.initial-loading')
if (loadingElement) {
  loadingElement.remove()
}

app.mount('#app')
