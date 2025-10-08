<template>
  <div id="app">
    <!-- Navigation -->
    <nav class="nav">
      <a href="/" class="nav-brand">🏪 i e store</a>
      <div class="nav-menu">
        <button class="nav-toggle" @click="toggleSidebar">
          ☰
        </button>
      </div>
    </nav>

    <!-- Sidebar -->
    <aside class="sidebar" :class="{ open: sidebarOpen }">
      <nav class="sidebar-nav">
        <router-link to="/dashboard" class="nav-item" @click="closeSidebar">
          <span class="nav-item-icon">📊</span>
          Dashboard
        </router-link>
        <router-link to="/inventory" class="nav-item" @click="closeSidebar">
          <span class="nav-item-icon">📦</span>
          Estoque
        </router-link>
        <router-link to="/sales" class="nav-item" @click="closeSidebar">
          <span class="nav-item-icon">💰</span>
          Vendas
        </router-link>
        <router-link to="/customers" class="nav-item" @click="closeSidebar">
          <span class="nav-item-icon">👥</span>
          Clientes
        </router-link>
        <router-link to="/settings" class="nav-item" @click="closeSidebar">
          <span class="nav-item-icon">⚙️</span>
          Configurações
        </router-link>
        <router-link to="/profile" class="nav-item" @click="closeSidebar">
          <span class="nav-item-icon">👤</span>
          Perfil
        </router-link>
        <router-link to="/sales-history" class="nav-item" @click="closeSidebar">
          <span class="nav-item-icon">📊</span>
          Histórico de Vendas
        </router-link>
        <router-link to="/users" class="nav-item" @click="closeSidebar">
          <span class="nav-item-icon">👥</span>
          Usuários
        </router-link>
              <router-link to="/pending-payments" class="nav-item" @click="closeSidebar">
                <span class="nav-item-icon">💰</span>
                Pagamentos Pendentes
              </router-link>
              
              <!-- Separador -->
              <div class="nav-separator"></div>
              
              <!-- Logout -->
              <button class="nav-item logout-nav-item" @click="handleLogout">
                <span class="nav-item-icon">🚪</span>
                Sair do Sistema
              </button>
            </nav>
    </aside>

    <!-- Sidebar Overlay for Mobile -->
    <div 
      class="sidebar-overlay" 
      :class="{ open: sidebarOpen }"
      @click="closeSidebar"
    ></div>

    <!-- Main Content -->
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const sidebarOpen = ref(false)

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const closeSidebar = () => {
  sidebarOpen.value = false
}

const handleLogout = () => {
  if (confirm('Tem certeza que deseja sair do sistema?')) {
    // Remove token do localStorage
    localStorage.removeItem('auth_token')
    // Redireciona para login
    router.push('/login')
  }
}

// Close sidebar on escape key
const handleEscape = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    closeSidebar()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
})
</script>

<style scoped>
.nav-separator {
  height: 1px;
  background-color: var(--border);
  margin: 0.75rem 1.25rem;
}

.logout-nav-item {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--danger);
  font-weight: 600;
}

.logout-nav-item:hover {
  background-color: var(--danger-50);
  color: var(--danger-700);
}
</style>