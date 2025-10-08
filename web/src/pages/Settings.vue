<template>
  <div class="settings-container">
    <!-- Header -->
    <div class="settings-header">
      <h1 class="settings-title">Configurações</h1>
    </div>

    <!-- API Status -->
    <div class="api-status-section">
      <ApiStatus />
    </div>

    <!-- Settings Sections -->
    <div class="settings-sections">
      <!-- Store Settings -->
      <div class="settings-section">
        <h2 class="section-title">Detalhes da Loja</h2>
        <div class="settings-card">
          <form @submit.prevent="saveStoreSettings">
            <div class="form-group">
              <label class="form-label">Nome da Loja</label>
              <input type="text" class="form-input" v-model="storeSettings.name">
            </div>
            <div class="form-group">
              <label class="form-label">Endereço</label>
              <input type="text" class="form-input" v-model="storeSettings.address">
            </div>
            <div class="form-group">
              <label class="form-label">Telefone</label>
              <input type="tel" class="form-input" v-model="storeSettings.phone">
            </div>
            <button type="submit" class="btn btn-primary">Salvar Configurações</button>
          </form>
        </div>
      </div>

      <!-- User Settings -->
      <div class="settings-section">
        <h2 class="section-title">Configurações de Usuário</h2>
        <div class="settings-card">
          <form @submit.prevent="saveUserSettings">
            <div class="form-group">
              <label class="form-label">Nome de Usuário</label>
              <input type="text" class="form-input" v-model="userSettings.name">
            </div>
            <div class="form-group">
              <label class="form-label">Email</label>
              <input type="email" class="form-input" v-model="userSettings.email">
            </div>
            <button type="submit" class="btn btn-primary">Atualizar Perfil</button>
          </form>
        </div>
      </div>

      <!-- System Settings -->
      <div class="settings-section">
        <h2 class="section-title">Configurações do Sistema</h2>
        <div class="settings-card">
          <div class="setting-item">
            <div class="setting-info">
              <h3 class="setting-title">Notificações</h3>
              <p class="setting-description">Receber notificações sobre vendas e estoque</p>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" v-model="systemSettings.notifications">
              <span class="toggle-slider"></span>
            </label>
          </div>
          
          <div class="setting-item">
            <div class="setting-info">
              <h3 class="setting-title">Backup Automático</h3>
              <p class="setting-description">Fazer backup dos dados automaticamente</p>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" v-model="systemSettings.autoBackup">
              <span class="toggle-slider"></span>
            </label>
          </div>
          
          <div class="setting-item">
            <div class="setting-info">
              <h3 class="setting-title">Modo Escuro</h3>
              <p class="setting-description">Usar tema escuro na interface</p>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" v-model="systemSettings.darkMode">
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>

      <!-- Data Management -->
      <div class="settings-section">
        <h2 class="section-title">Gerenciamento de Dados</h2>
        <div class="settings-card">
          <div class="data-actions">
            <button class="btn btn-secondary" @click="exportData">
              <span>📤</span>
              Exportar Dados
            </button>
            <button class="btn btn-secondary" @click="importData">
              <span>📥</span>
              Importar Dados
            </button>
            <button class="btn btn-warning" @click="clearCache">
              <span>🗑️</span>
              Limpar Cache
            </button>
          </div>
        </div>
      </div>

      <!-- About -->
      <div class="settings-section">
        <h2 class="section-title">Sobre</h2>
        <div class="settings-card">
          <div class="about-info">
            <div class="app-logo">
              <span class="logo-icon">🏪</span>
              <h3 class="app-name">i e store</h3>
            </div>
            <div class="version-info">
              <p class="version">Versão 1.0.0</p>
              <p class="build">Build 2024.01.15</p>
            </div>
            <div class="about-actions">
              <button class="btn btn-outline" @click="checkUpdates">
                <span>🔄</span>
                Verificar Atualizações
              </button>
              <button class="btn btn-outline" @click="showHelp">
                <span>❓</span>
                Ajuda
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ApiStatus from '../components/ApiStatus.vue'

// Store settings
const storeSettings = ref({
  name: 'Minha Loja Incrível',
  address: 'Rua Exemplo, 123, Cidade, Estado',
  phone: '(XX) XXXXX-XXXX'
})

// User settings
const userSettings = ref({
  name: 'Usuário Admin',
  email: 'admin@iestore.com'
})

// System settings
const systemSettings = ref({
  notifications: true,
  autoBackup: false,
  darkMode: false
})

const saveStoreSettings = () => {
  alert('Configurações da loja salvas!')
  console.log('Store Settings:', storeSettings.value)
}

const saveUserSettings = () => {
  alert('Configurações de usuário salvas!')
  console.log('User Settings:', userSettings.value)
}

const exportData = () => {
  alert('Funcionalidade de exportação será implementada')
}

const importData = () => {
  alert('Funcionalidade de importação será implementada')
}

const clearCache = () => {
  if (confirm('Tem certeza que deseja limpar o cache? Esta ação não pode ser desfeita.')) {
    alert('Cache limpo com sucesso!')
  }
}

const checkUpdates = () => {
  alert('Verificando atualizações...')
}

const showHelp = () => {
  alert('Abrindo ajuda...')
}
</script>

<style scoped>
.settings-container {
  flex: 1;
  background-color: var(--gray-50);
  padding: 1rem;
}

.settings-header {
  margin-top: 2rem;
  margin-bottom: 1.5rem;
}

.settings-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--gray-800);
}

.api-status-section {
  margin-bottom: 2rem;
}

.settings-sections {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.settings-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--gray-800);
}

.settings-card {
  background-color: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--gray-200);
}

.form-group {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--gray-700);
  margin-bottom: 0.5rem;
}

.form-input {
  width: 100%;
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

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.btn-primary {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-1px);
}

.btn-secondary {
  background-color: var(--gray-100);
  color: var(--gray-700);
  border: 1px solid var(--gray-300);
}

.btn-secondary:hover {
  background-color: var(--gray-200);
}

.btn-warning {
  background-color: var(--warning);
  color: white;
}

.btn-warning:hover {
  background-color: #d97706;
}

.btn-outline {
  background-color: transparent;
  color: var(--primary);
  border: 1px solid var(--primary);
}

.btn-outline:hover {
  background-color: var(--primary);
  color: white;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid var(--gray-200);
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-info {
  flex: 1;
}

.setting-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--gray-800);
  margin-bottom: 0.25rem;
}

.setting-description {
  font-size: 0.875rem;
  color: var(--gray-500);
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 3rem;
  height: 1.5rem;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--gray-300);
  transition: 0.3s;
  border-radius: 1.5rem;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 1.125rem;
  width: 1.125rem;
  left: 0.1875rem;
  bottom: 0.1875rem;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

input:checked + .toggle-slider {
  background-color: var(--primary);
}

input:checked + .toggle-slider:before {
  transform: translateX(1.5rem);
}

.data-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.about-info {
  text-align: center;
}

.app-logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1.5rem;
}

.logo-icon {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.app-name {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--gray-800);
}

.version-info {
  margin-bottom: 1.5rem;
}

.version {
  font-size: 1rem;
  font-weight: 600;
  color: var(--gray-700);
  margin-bottom: 0.25rem;
}

.build {
  font-size: 0.875rem;
  color: var(--gray-500);
}

.about-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

@media (min-width: 768px) {
  .settings-container {
    padding: 1.5rem;
  }
  
  .data-actions {
    flex-direction: row;
  }
  
  .about-actions {
    flex-direction: row;
  }
}
</style>