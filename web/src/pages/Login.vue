<template>
  <div class="login-container">
    <!-- Header com gradiente -->
    <div class="login-header">
      <div class="header-icon">🏪</div>
      <h1 class="header-title">IEStore</h1>
      <p class="header-subtitle">Sistema de Gestão de Produtos</p>
    </div>

    <!-- Card de formulário -->
    <div class="login-form-card">
      <Card shadow="lg" class="form-card">
        <h2 class="form-title">Entrar no Sistema</h2>
        
        <div class="form-group">
          <label class="form-label">Usuário</label>
          <input
            v-model="username"
            type="text"
            class="form-input"
            placeholder="Digite seu usuário"
            @keyup.enter="handleLogin"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Senha</label>
          <input
            v-model="password"
            type="password"
            class="form-input"
            placeholder="Digite sua senha"
            @keyup.enter="handleLogin"
          />
        </div>

        <button 
          @click="handleLogin" 
          :disabled="loading"
          class="login-button"
        >
          <div class="button-gradient">
            <span v-if="loading" class="loading-spinner"></span>
            <span v-else class="button-icon">🔑</span>
            <span class="button-text">
              {{ loading ? 'Entrando...' : 'Entrar' }}
            </span>
          </div>
        </button>

      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Card from '../components/Card.vue'

const router = useRouter()
const username = ref('')
const password = ref('')
const loading = ref(false)

const handleLogin = async () => {
  if (!username.value.trim() || !password.value.trim()) {
    alert('Preencha todos os campos')
    return
  }

  loading.value = true
  try {
  const payload = { username: username.value.trim().toLowerCase(), password: password.value.trim() }
    console.log('[login:web] Attempt', { username: payload.username })

    const res = await fetch('/.netlify/functions/postgres?table=auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    let rawText = ''
    try {
      rawText = await res.clone().text()
    } catch (e: any) {
      rawText = `(erro ao ler corpo: ${e?.message || String(e)})`
    }
    console.log('[login:web] Response', { status: res.status, ok: res.ok, body: rawText })

    if (!res.ok) {
      let message = rawText || 'Falha no login'
      try {
        const parsed = JSON.parse(rawText)
        message = parsed?.message || parsed?.error || message
      } catch {}
      alert(message)
      return
    }

    let json: any
    try {
      json = await res.json()
    } catch (e: any) {
      console.log('[login:web] JSON parse error', { message: e?.message, stack: e?.stack })
      alert('Resposta inválida do servidor')
      return
    }

    const token = json?.token || `auth_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    console.log('[login:web] Success', { tokenPreview: token?.slice(0, 12) + '...' })
    localStorage.setItem('auth_token', token)
    router.push('/dashboard')
  } catch (e: any) {
    console.log('[login:web] Network error', { message: e?.message, stack: e?.stack })
    alert(e?.message || 'Erro de rede ao tentar entrar')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  width: 100vw;
  background: var(--background);
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
}

.login-header {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
  padding: 4rem 2rem 2.5rem;
  text-align: center;
  color: white;
  position: relative;
  overflow: hidden;
}

.login-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  pointer-events: none;
}

.header-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  position: relative;
  z-index: 1;
}

.header-title {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  position: relative;
  z-index: 1;
}

.header-subtitle {
  font-size: 1.125rem;
  opacity: 0.9;
  position: relative;
  z-index: 1;
}

.login-form-card {
  margin: -1.25rem 1.5rem 0;
  position: relative;
  z-index: 10;
}

.form-card {
  padding: 2rem;
}

.form-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--heading);
  text-align: center;
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  color: var(--text);
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.form-input {
  width: 100%;
  background: var(--background-soft);
  border: 1px solid var(--border);
  color: var(--text);
  border-radius: var(--radius-lg);
  padding: 0.75rem 1rem;
  font-size: 1rem;
  transition: all var(--transition-normal);
}

.form-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-100);
  background: var(--background);
}

.login-button {
  width: 100%;
  margin-top: 1rem;
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: none;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.login-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.login-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: var(--shadow-lg);
}

.button-gradient {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: white;
  font-weight: 700;
  font-size: 1rem;
}

.button-icon {
  font-size: 1.25rem;
}

.button-text {
  font-weight: 700;
}

.loading-spinner {
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.login-info {
  margin-top: 2rem;
  padding: 1rem;
  background: var(--background-soft);
  border-radius: var(--radius-lg);
  text-align: center;
}

.info-text {
  color: var(--text-muted);
  font-size: 0.875rem;
  margin: 0.25rem 0;
}

.info-text strong {
  color: var(--text);
  font-weight: 600;
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
  .login-header {
    padding: 3rem 1.5rem 2rem;
  }
  
  .header-title {
    font-size: 2rem;
  }
  
  .login-form-card {
    margin: -1rem 1rem 0;
  }
  
  .form-card {
    padding: 1.5rem;
  }
}
</style>
