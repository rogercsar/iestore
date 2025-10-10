<template>
  <div class="users-container">
    <div class="users-header">
      <button class="back-button" @click="goBack">
        <span class="back-icon">←</span>
      </button>
      <h1 class="users-title">Usuários</h1>
      <div class="placeholder"></div>
    </div>

    <div class="users-content">
      <!-- Add User Button -->
      <div class="add-button-container">
        <button class="add-button" @click="showAddForm = true">
          <span class="add-icon">+</span>
          Adicionar Usuário
        </button>
      </div>

      <!-- Users List -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p class="loading-text">Carregando usuários...</p>
      </div>

      <div v-else-if="users.length === 0" class="empty-container">
        <div class="empty-icon">👥</div>
        <h3 class="empty-title">Nenhum usuário encontrado</h3>
        <p class="empty-subtitle">Adicione usuários para começar</p>
      </div>

      <div v-else class="users-list">
        <div v-for="user in users" :key="user.id" class="user-item">
          <Card shadow="sm">
            <div class="user-header">
              <div class="user-info">
                <h3 class="user-name">{{ user.name }}</h3>
                <p class="user-email">{{ user.email }}</p>
                <div class="user-badges">
                  <span class="badge" :class="user.role === 'admin' ? 'badge-admin' : 'badge-user'">
                    {{ user.role === 'admin' ? 'Admin' : 'Usuário' }}
                  </span>
                  <span class="badge" :class="user.status === 'active' ? 'badge-active' : 'badge-inactive'">
                    {{ user.status === 'active' ? 'Ativo' : 'Inativo' }}
                  </span>
                </div>
              </div>
              <div class="user-actions">
                <button 
                  class="action-button"
                  :class="user.status === 'active' ? 'action-pause' : 'action-play'"
                  @click="handleToggleUserStatus(user.id)"
                >
                  <span class="action-icon">{{ user.status === 'active' ? '⏸️' : '▶️' }}</span>
                </button>
                <button 
                  v-if="user.role !== 'admin'"
                  class="action-button action-delete"
                  @click="handleDeleteUser(user.id)"
                >
                  <span class="action-icon">🗑️</span>
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>

    <!-- Add User Modal -->
    <div v-if="showAddForm" class="modal-overlay" @click="showAddForm = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2 class="modal-title">Adicionar Usuário</h2>
          <button class="close-button" @click="showAddForm = false">×</button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Nome Completo *</label>
            <input
              v-model="newUser.name"
              type="text"
              class="form-input"
              placeholder="Digite o nome completo"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Email *</label>
            <input
              v-model="newUser.email"
              type="email"
              class="form-input"
              placeholder="Digite o email"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Senha *</label>
            <input
              v-model="newUser.password"
              type="password"
              class="form-input"
              placeholder="Digite a senha"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Tipo de Usuário</label>
            <div class="role-buttons">
              <button
                class="role-button"
                :class="{ active: newUser.role === 'user' }"
                @click="newUser.role = 'user'"
              >
                Usuário
              </button>
              <button
                class="role-button"
                :class="{ active: newUser.role === 'admin' }"
                @click="newUser.role = 'admin'"
              >
                Admin
              </button>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="cancel-button" @click="showAddForm = false">
            Cancelar
          </button>
          <button 
            class="save-button" 
            @click="handleAddUser"
            :disabled="loading"
          >
            <span v-if="loading" class="loading-spinner"></span>
            {{ loading ? 'Criando...' : 'Criar Usuário' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../stores/app'
import Card from '../components/Card.vue'

const router = useRouter()
const store = useAppStore()

interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'user'
  status: 'active' | 'inactive'
}

const users = ref<User[]>([])
const loading = ref(false)
const showAddForm = ref(false)
const newUser = ref({
  name: '',
  email: '',
  password: '',
  role: 'user' as 'admin' | 'user'
})

const goBack = () => {
  router.go(-1)
}

const loadUsers = async () => {
  loading.value = true
  try {
    // Load real customers data from store
    await store.fetchCustomers()
    users.value = store.customers || []
  } catch (error) {
    console.error('Error loading users:', error)
  } finally {
    loading.value = false
  }
}

const handleAddUser = async () => {
  if (!newUser.value.name.trim() || !newUser.value.email.trim() || !newUser.value.password.trim()) {
    alert('Preencha todos os campos obrigatórios')
    return
  }

  loading.value = true
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const user: User = {
      id: Date.now().toString(),
      name: newUser.value.name.trim(),
      email: newUser.value.email.trim(),
      role: newUser.value.role,
      status: 'active'
    }

    users.value.push(user)
    newUser.value = { name: '', email: '', password: '', role: 'user' }
    showAddForm.value = false
    alert('Usuário criado com sucesso!')
  } catch (error) {
    alert('Falha ao criar usuário')
  } finally {
    loading.value = false
  }
}

const handleToggleUserStatus = async (userId: string) => {
  const user = users.value.find(u => u.id === userId)
  if (user) {
    user.status = user.status === 'active' ? 'inactive' : 'active'
    // In real app, this would call API to update user status
  }
}

const handleDeleteUser = (userId: string) => {
  if (confirm('Tem certeza que deseja excluir este usuário?')) {
    users.value = users.value.filter(user => user.id !== userId)
    // In real app, this would call API to delete user
  }
}

onMounted(() => {
  loadUsers()
})
</script>

<style scoped>
.users-container {
  flex: 1;
  background-color: var(--gray-50);
}

.users-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background-color: white;
  border-bottom: 1px solid var(--gray-200);
  margin-top: 2rem;
}

.back-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--gray-800);
  padding: 0.25rem;
}

.users-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--gray-800);
}

.placeholder {
  width: 1.5rem;
}

.users-content {
  padding: 1rem;
}

.add-button-container {
  margin-bottom: 1.5rem;
}

.add-button {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  gap: 0.5rem;
  width: 100%;
}

.add-icon {
  font-size: 1.25rem;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem;
}

.loading-spinner {
  width: 3rem;
  height: 3rem;
  border: 3px solid var(--gray-200);
  border-top: 3px solid var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  margin-top: 1rem;
  color: var(--gray-600);
}

.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--gray-800);
  margin-bottom: 0.5rem;
}

.empty-subtitle {
  color: var(--gray-500);
}

.users-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.user-item {
  /* Card styling handled by Card component */
}

.user-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--gray-800);
  margin-bottom: 0.25rem;
}

.user-email {
  font-size: 0.875rem;
  color: var(--gray-600);
  margin-bottom: 0.75rem;
}

.user-badges {
  display: flex;
  gap: 0.5rem;
}

.badge {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
}

.badge-admin {
  background-color: var(--primary);
}

.badge-user {
  background-color: var(--success);
}

.badge-active {
  background-color: var(--success);
}

.badge-inactive {
  background-color: var(--danger);
}

.user-actions {
  display: flex;
  gap: 0.5rem;
}

.action-button {
  padding: 0.5rem;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-pause {
  background-color: var(--warning);
}

.action-play {
  background-color: var(--success);
}

.action-delete {
  background-color: var(--danger);
}

.action-icon {
  font-size: 1rem;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 0.75rem;
  width: 100%;
  max-width: 28rem;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--gray-200);
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--gray-800);
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--gray-600);
  cursor: pointer;
  padding: 0.25rem;
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
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

.role-buttons {
  display: flex;
  gap: 0.75rem;
}

.role-button {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid var(--gray-300);
  border-radius: 0.5rem;
  background: white;
  color: var(--gray-700);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.role-button.active {
  background: var(--primary);
  border-color: var(--primary);
  color: white;
}

.modal-footer {
  display: flex;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid var(--gray-200);
}

.cancel-button {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid var(--gray-300);
  border-radius: 0.5rem;
  background: white;
  color: var(--gray-700);
  font-weight: 600;
  cursor: pointer;
}

.save-button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
  color: white;
  border: none;
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  font-weight: 700;
  cursor: pointer;
  gap: 0.5rem;
}

.save-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .users-content {
    padding: 0.5rem;
  }
  
  .user-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .user-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .modal-footer {
    flex-direction: column;
  }
}
</style>
