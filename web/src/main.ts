import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import './style.css'
import './services/debug' // Import debug service

// Import pages
import Login from './pages/Login.vue'
import Dashboard from './pages/Dashboard.vue'
import Inventory from './pages/Inventory.vue'
import Sales from './pages/Sales.vue'
import Customers from './pages/Customers.vue'
import Settings from './pages/Settings.vue'
import Profile from './pages/Profile.vue'
import SalesHistory from './pages/SalesHistory.vue'
import Users from './pages/Users.vue'
import PendingPayments from './pages/PendingPayments.vue'
import ProductDetails from './pages/ProductDetails.vue'
import EditProduct from './pages/EditProduct.vue'
import PublicProduct from './pages/PublicProduct.vue'

// Router configuration
const routes = [
  { path: '/', redirect: '/dashboard' },
  { path: '/login', component: Login },
  { path: '/dashboard', component: Dashboard },
  { path: '/inventory', component: Inventory },
  { path: '/sales', component: Sales },
  { path: '/customers', component: Customers },
  { path: '/settings', component: Settings },
  { path: '/profile', component: Profile },
  { path: '/sales-history', component: SalesHistory },
  { path: '/users', component: Users },
  { path: '/pending-payments', component: PendingPayments },
  { path: '/product/:id', component: ProductDetails },
  { path: '/product/:id/edit', component: EditProduct },
  { path: '/public/product/:name', component: PublicProduct }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard para verificar autenticação
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('auth_token')
  
  // Se não tem token e não está indo para login, redireciona para login
  if (!token && to.path !== '/login') {
    next('/login')
  }
  // Se tem token e está indo para login, redireciona para dashboard
  else if (token && to.path === '/login') {
    next('/dashboard')
  }
  // Se tem token e está indo para raiz, redireciona para dashboard
  else if (token && to.path === '/') {
    next('/dashboard')
  }
  // Caso contrário, permite navegação
  else {
    next()
  }
})

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(router)
app.mount('#app')