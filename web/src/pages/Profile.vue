<template>
  <div class="profile-container">
    <div class="profile-header">
      <button class="back-button" @click="goBack">
        <span class="back-icon">←</span>
      </button>
      <h1 class="profile-title">Perfil</h1>
      <div class="placeholder"></div>
    </div>

    <div class="profile-content">
      <Card shadow="lg" class="profile-card">
        <div class="profile-avatar-section">
          <div class="avatar-container">
            <span class="avatar-icon">👤</span>
          </div>
          <h2 class="profile-name">{{ profile.name }}</h2>
          <p class="profile-email">{{ profile.email }}</p>
        </div>

        <div class="form-section">
          <div class="form-group">
            <label class="form-label">Nome Completo *</label>
            <input
              v-model="profile.name"
              type="text"
              class="form-input"
              placeholder="Digite seu nome completo"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Email *</label>
            <input
              v-model="profile.email"
              type="email"
              class="form-input"
              placeholder="Digite seu email"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Telefone</label>
            <input
              v-model="profile.phone"
              type="tel"
              class="form-input"
              placeholder="Digite seu telefone"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Empresa</label>
            <input
              v-model="profile.company"
              type="text"
              class="form-input"
              placeholder="Digite o nome da empresa"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Endereço</label>
            <textarea
              v-model="profile.address"
              class="form-textarea"
              placeholder="Digite seu endereço"
              rows="3"
            ></textarea>
          </div>

          <button 
            class="save-button" 
            @click="handleSave"
            :disabled="loading"
          >
            <span v-if="loading" class="loading-spinner"></span>
            {{ loading ? 'Salvando...' : 'Salvar Alterações' }}
          </button>

          <!-- Security / Change Password -->
          <hr class="section-divider" />
          <h3 class="section-title">Segurança</h3>

          <div class="form-group">
            <label class="form-label">Senha Atual *</label>
            <input
              v-model="currentPassword"
              type="password"
              class="form-input"
              placeholder="Digite sua senha atual"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Nova Senha *</label>
            <input
              v-model="newPassword"
              type="password"
              class="form-input"
              placeholder="Digite a nova senha"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Confirmar Nova Senha *</label>
            <input
              v-model="confirmPassword"
              type="password"
              class="form-input"
              placeholder="Confirme a nova senha"
            />
          </div>

          <button 
            class="save-button" 
            @click="handleChangePassword"
            :disabled="changing"
          >
            <span v-if="changing" class="loading-spinner"></span>
            {{ changing ? 'Alterando...' : 'Alterar Senha' }}
          </button>
        </div>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Card from '../components/Card.vue'
import { useAppStore } from '../stores/app'

const router = useRouter()

interface UserProfile {
  id?: string
  name: string
  email: string
  phone: string
  company: string
  address: string
}

const profile = ref<UserProfile>({
  name: '',
  email: '',
  phone: '',
  company: '',
  address: ''
})

const loading = ref(false)
const changing = ref(false)
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')

const goBack = () => {
  router.go(-1)
}

const store = useAppStore()

function decodeTokenPayload(token: string | null): any | null {
  if (!token) return null
  const parts = token.split('.')
  if (parts.length < 2) return null
  try {
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
    return payload
  } catch {
    return null
  }
}

const loadProfile = async () => {
  try {
    const token = localStorage.getItem('auth_token')
    const payload = decodeTokenPayload(token)
    await store.fetchUsers()
    const all = store.users || []
    let current = null as any
    if (payload && payload.username) {
      current = all.find(u => u.username === payload.username) || null
    }
    if (!current && all.length > 0) current = all[0]

    if (current) {
      profile.value = {
        id: current.id,
        name: current.name,
        email: current.email,
        phone: current.phone || '',
        company: profile.value.company || '',
        address: profile.value.address || ''
      }
    } else {
      // Fallback para dados simulados
      profile.value = {
        name: 'Admin',
        email: 'admin@iestore.netlify.app',
        phone: '(11) 99999-9999',
        company: 'inCRM Store',
        address: 'São Paulo, SP'
      }
    }
  } catch (e) {
    console.error('Erro ao carregar perfil', e)
  }
}

const handleSave = async () => {
  if (!profile.value.name.trim() || !profile.value.email.trim()) {
    alert('Nome e email são obrigatórios')
    return
  }

  loading.value = true
  try {
    const id = profile.value.id
    if (!id) {
      alert('Usuário não identificado. Faça login novamente.')
      return
    }
    await store.updateUser(id, {
      name: profile.value.name,
      email: profile.value.email,
      phone: profile.value.phone
    })
    alert('Perfil atualizado com sucesso!')
  } catch (error) {
    alert('Falha ao atualizar perfil')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadProfile()
})

const handleChangePassword = async () => {
  if (!profile.value.id) {
    alert('Usuário não identificado. Faça login novamente.')
    return
  }
  const cp = currentPassword.value.trim()
  const np = newPassword.value.trim()
  const cf = confirmPassword.value.trim()
  if (!cp || !np || !cf) {
    alert('Preencha todos os campos de senha')
    return
  }
  if (np.length < 6) {
    alert('A nova senha deve ter pelo menos 6 caracteres')
    return
  }
  if (np !== cf) {
    alert('A confirmação da senha não confere')
    return
  }

  changing.value = true
  try {
    // Verificar senha atual usando o endpoint de auth
    const token = localStorage.getItem('auth_token')
    const payload = decodeTokenPayload(token)
    const username = payload?.username
    if (!username) {
      alert('Não foi possível validar o usuário logado. Faça login novamente.')
      return
    }

    const res = await fetch('/.netlify/functions/postgres?table=auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password: cp })
    })
    if (!res.ok) {
      let message = 'Senha atual incorreta'
      try {
        const txt = await res.text()
        const json = JSON.parse(txt)
        message = json?.message || json?.error || message
      } catch {}
      alert(message)
      return
    }

    // Atualizar senha via store/API
    await store.updateUser(profile.value.id, { password: np })
    alert('Senha alterada com sucesso!')
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
  } catch (e) {
    console.error('Erro ao alterar senha', e)
    alert('Falha ao alterar senha')
  } finally {
    changing.value = false
  }
}
</script>

<style scoped>
.profile-container {
  flex: 1;
  background-color: var(--gray-50);
}

.profile-header {
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

.profile-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--gray-800);
}

.placeholder {
  width: 1.5rem;
}

.profile-content {
  padding: 1rem;
}

.profile-card {
  max-width: 32rem;
  margin: 0 auto;
}

.profile-avatar-section {
  text-align: center;
  margin-bottom: 2rem;
}

.avatar-container {
  width: 5rem;
  height: 5rem;
  border-radius: 50%;
  background-color: var(--gray-100);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
}

.avatar-icon {
  font-size: 3rem;
  color: var(--primary);
}

.profile-name {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--gray-800);
  margin-bottom: 0.25rem;
}

.profile-email {
  font-size: 1rem;
  color: var(--gray-600);
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--gray-700);
  margin-bottom: 0.5rem;
}

.form-input {
  padding: 0.75rem;
  border: 1px solid var(--gray-300);
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.section-divider {
  margin: 1.5rem 0;
  border: none;
  border-top: 1px solid var(--gray-200);
}

.section-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--gray-800);
}

.form-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-textarea {
  padding: 0.75rem;
  border: 1px solid var(--gray-300);
  border-radius: 0.5rem;
  font-size: 1rem;
  resize: vertical;
  min-height: 5rem;
  transition: all 0.2s ease;
}

.form-textarea:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.save-button {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
  color: white;
  border: none;
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  gap: 0.5rem;
}

.save-button:hover:not(:disabled) {
  transform: translateY(-1px);
}

.save-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.loading-spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
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
  .profile-content {
    padding: 0.5rem;
  }
  
  .profile-card {
    max-width: none;
  }
}
</style>
