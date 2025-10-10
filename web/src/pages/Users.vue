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
              <div class="user-avatar" v-if="user.photo">
                <img :src="user.photo" :alt="user.name" class="avatar-image" />
              </div>
              <div class="user-avatar initials" v-else>
                {{ getInitials(user.name) }}
              </div>
              <div class="user-info">
                <h3 class="user-name">{{ user.name }}</h3>
                <p class="user-email">{{ user.email }}</p>
                <p class="user-username">@{{ user.username || 'sem-username' }}</p>
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
                  @click="openEdit(user)"
                >
                  <span class="action-icon">✏️</span>
                </button>
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
    <div v-if="showAddForm || showEditForm" class="modal-overlay" @click="closeModals">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2 class="modal-title">{{ showEditForm ? 'Editar Usuário' : 'Adicionar Usuário' }}</h2>
          <button class="close-button" @click="closeModals">×</button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Nome Completo *</label>
            <input
              v-model="activeUser.name"
              type="text"
              class="form-input"
              placeholder="Digite o nome completo"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Username *</label>
            <input
              v-model="activeUser.username"
              @input="activeUser.username = (activeUser.username || '').toLowerCase().trim()"
              type="text"
              class="form-input"
              placeholder="usuário de login"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Email *</label>
            <input
              v-model="activeUser.email"
              type="email"
              class="form-input"
              placeholder="Digite o email"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Telefone</label>
            <input
              v-model="activeUser.phone"
              type="tel"
              class="form-input"
              placeholder="(DDD) 99999-9999"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Foto</label>
            <div class="photo-upload">
              <div v-if="activeUser.photo" class="photo-preview">
                <img :src="activeUser.photo" :alt="activeUser.name" class="photo-image" />
                <button type="button" class="remove-photo" @click="removePhoto">Remover</button>
              </div>
              <div v-else class="photo-input-row">
                <input type="file" accept="image/*" @change="onPhotoChange" />
              </div>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Senha {{ showEditForm ? '(deixe em branco para não alterar)' : '*' }}</label>
            <input
              v-model="activeUser.password"
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
                :class="{ active: activeUser.role === 'user' }"
                @click="activeUser.role = 'user'"
              >
                Usuário
              </button>
              <button
                class="role-button"
                :class="{ active: activeUser.role === 'admin' }"
                @click="activeUser.role = 'admin'"
              >
                Admin
              </button>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="cancel-button" @click="closeModals">
            Cancelar
          </button>
          <button 
            class="save-button" 
            @click="showEditForm ? handleUpdateUser() : handleAddUser()"
            :disabled="loading"
          >
            <span v-if="loading" class="loading-spinner"></span>
            {{ loading ? (showEditForm ? 'Salvando...' : 'Criando...') : (showEditForm ? 'Salvar' : 'Criar Usuário') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Card from '../components/Card.vue'

const router = useRouter()

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
const showEditForm = ref(false)
const activeUser = ref({
  id: '',
  name: '',
  username: '',
  email: '',
  phone: '',
  photo: '',
  password: '',
  role: 'user' as 'admin' | 'user'
})
const uploadInProgress = ref(false)

const goBack = () => {
  router.go(-1)
}

const isValidEmail = (email: string) => /.+@.+\..+/.test(email)
const isValidPhone = (phone: string) => !phone || phone.replace(/\D+/g,'').length >= 10
const getInitials = (name: string) => (name || '').split(' ').filter(Boolean).map(p => p[0]).join('').toUpperCase().slice(0,2)
const isUsernameAvailable = async (username: string, excludeId?: string) => {
  try {
    const res = await fetch('/.netlify/functions/postgres?table=users')
    if (!res.ok) return true // fail-open to avoid blocking
    const list = await res.json()
    return !Array.isArray(list) || !list.some((u: any) => (u.username || '').toLowerCase() === username.toLowerCase() && u.id !== excludeId)
  } catch {
    return true
  }
}

const loadUsers = async () => {
  loading.value = true
  try {
    const res = await fetch('/.netlify/functions/postgres?table=users')
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    users.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.warn('Users API unavailable or empty. Showing empty list.', error)
    users.value = []
  } finally {
    loading.value = false
  }
}

const handleAddUser = async () => {
  activeUser.value.username = activeUser.value.username.trim().toLowerCase()
  if (!activeUser.value.name.trim() || !activeUser.value.username.trim() || !activeUser.value.email.trim() || !activeUser.value.password.trim()) {
    alert('Preencha todos os campos obrigatórios')
    return
  }
  if (!isValidEmail(activeUser.value.email)) {
    alert('Email inválido')
    return
  }
  if (!isValidPhone(activeUser.value.phone)) {
    alert('Telefone inválido (informe DDD + número)')
    return
  }
  const available = await isUsernameAvailable(activeUser.value.username.trim())
  if (!available) {
    alert('Username já está em uso. Escolha outro.')
    return
  }

  loading.value = true
  try {
    const user: User = {
      id: `user_${Date.now()}`,
      name: activeUser.value.name.trim(),
      email: activeUser.value.email.trim(),
      role: activeUser.value.role,
      status: 'active'
    }
    // Upload photo to Cloudinary if provided (dataURL way)
    const fileEl = (document.querySelector('.photo-input-row input[type="file"]') as HTMLInputElement | null)
    const file = fileEl?.files?.[0] || null
    if (file) {
      uploadInProgress.value = true
      const reader = new FileReader()
      const dataUrl: string = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(String(reader.result))
        reader.onerror = () => reject(reader.error)
        reader.readAsDataURL(file)
      })
      const up = await fetch('/.netlify/functions/upload', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ dataUrl }) })
      const upJson = await up.json()
      if (up.ok && upJson.url) activeUser.value.photo = upJson.url
      uploadInProgress.value = false
    }

    const res = await fetch('/.netlify/functions/postgres?table=users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'append', data: [{
        ...user,
        username: activeUser.value.username.trim(),
        phone: activeUser.value.phone || null,
        photo: activeUser.value.photo || null,
        password: activeUser.value.password || null
      }] })
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    await loadUsers()
    resetActive()
    showAddForm.value = false
    alert('Usuário criado com sucesso!')
  } catch (error) {
    console.error('Falha ao criar usuário na API.', error)
  } finally {
    loading.value = false
    uploadInProgress.value = false
  }
}

const openEdit = (user: any) => {
  activeUser.value = {
    id: user.id,
    name: user.name || '',
    username: user.username || '',
    email: user.email || '',
    phone: user.phone || '',
    photo: user.photo || '',
    password: '',
    role: user.role || 'user'
  }
  showEditForm.value = true
}

const closeModals = () => {
  showAddForm.value = false
  showEditForm.value = false
}

const resetActive = () => {
  activeUser.value = { id: '', name: '', username: '', email: '', phone: '', photo: '', password: '', role: 'user' }
}

const handleUpdateUser = async () => {
  if (!activeUser.value.id) return
  loading.value = true
  try {
    activeUser.value.username = activeUser.value.username.trim().toLowerCase()
    const patch: any = {
      name: activeUser.value.name.trim(),
      username: activeUser.value.username.trim(),
      email: activeUser.value.email.trim(),
      phone: activeUser.value.phone || null,
      photo: activeUser.value.photo || null,
      role: activeUser.value.role
    }
    if (!activeUser.value.username.trim()) {
      alert('Username é obrigatório')
      loading.value = false
      return
    }
    if (!isValidEmail(patch.email)) {
      alert('Email inválido')
      loading.value = false
      return
    }
    if (!isValidPhone(activeUser.value.phone)) {
      alert('Telefone inválido (informe DDD + número)')
      loading.value = false
      return
    }
    const available = await isUsernameAvailable(activeUser.value.username.trim(), activeUser.value.id)
    if (!available) {
      alert('Username já está em uso. Escolha outro.')
      loading.value = false
      return
    }

    // Upload new photo if a new file was selected
    const fileEl = (document.querySelector('.photo-input-row input[type="file"]') as HTMLInputElement | null)
    const file = fileEl?.files?.[0] || null
    if (file) {
      uploadInProgress.value = true
      const reader = new FileReader()
      const dataUrl: string = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(String(reader.result))
        reader.onerror = () => reject(reader.error)
        reader.readAsDataURL(file)
      })
      const up = await fetch('/.netlify/functions/upload', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ dataUrl }) })
      const upJson = await up.json()
      if (up.ok && upJson.url) patch.photo = upJson.url
      uploadInProgress.value = false
    }

    if (activeUser.value.password && activeUser.value.password.trim()) {
      patch.password = activeUser.value.password
    }
    const res = await fetch('/.netlify/functions/postgres?table=users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'overwrite', id: activeUser.value.id, data: patch })
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    await loadUsers()
    closeModals()
    resetActive()
  } catch (e) {
    console.error('Falha ao atualizar usuário', e)
  } finally {
    loading.value = false
    uploadInProgress.value = false
  }
}

const handleToggleUserStatus = async (userId: string) => {
  const user = users.value.find(u => u.id === userId)
  if (!user) return
  const newStatus = user.status === 'active' ? 'inactive' : 'active'
  user.status = newStatus
  // Persist via API (overwrite)
  try {
    const res = await fetch('/.netlify/functions/postgres?table=users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'overwrite', id: userId, data: { status: newStatus } })
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
  } catch (e) {
    console.warn('Falha ao atualizar status na API. Estado apenas local.', e)
  }
}

const handleDeleteUser = async (userId: string) => {
  if (!confirm('Tem certeza que deseja excluir este usuário?')) return
  const prev = users.value
  users.value = users.value.filter(user => user.id !== userId)
  try {
    const res = await fetch('/.netlify/functions/postgres?table=users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', id: userId })
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
  } catch (e) {
    console.warn('Falha ao excluir na API. Revertendo local.', e)
    users.value = prev
  }
}

const onPhotoChange = (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0] || null
  // apenas marcador; upload real ocorre no submit
}

const removePhoto = () => {
  activeUser.value.photo = ''
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

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gray-200);
  color: var(--gray-700);
  font-weight: 700;
}

.user-avatar .avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-avatar.initials {
  font-size: 0.875rem;
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

.user-username {
  font-size: 0.8125rem;
  color: var(--gray-500);
  margin-top: -0.5rem;
  margin-bottom: 0.5rem;
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

.photo-upload { display:flex; flex-direction: column; gap:.5rem; }
.photo-preview { display:flex; align-items:center; gap:.75rem; }
.photo-image { width:48px; height:48px; border-radius:50%; object-fit:cover; border:1px solid var(--gray-300); }
.remove-photo { border:1px solid var(--gray-300); background:#fff; border-radius:.375rem; padding:.25rem .5rem; cursor:pointer; }
.photo-input-row input[type="file"] { width:100%; }

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
