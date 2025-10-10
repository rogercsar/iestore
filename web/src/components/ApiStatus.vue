<template>
  <div class="api-status">
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">
          <span>🔧</span>
          Status da API
        </h3>
      </div>
      
      <div class="space-y-4">
        <div class="flex justify-between items-center">
          <span>Modo de dados:</span>
          <span class="text-green-600">
            PostgreSQL Database
          </span>
        </div>
        
        <div class="flex justify-between items-center">
          <span>URL da API:</span>
          <span class="text-sm text-gray-600">{{ apiBaseUrl }}</span>
        </div>
        
        <div class="flex justify-between items-center">
          <span>Status da conexão:</span>
          <span :class="connectionStatus === 'connected' ? 'text-green-600' : 'text-red-600'">
            {{ connectionStatus === 'connected' ? '✅ Conectado' : '❌ Desconectado' }}
          </span>
        </div>
        
        <div v-if="lastError" class="p-3 bg-red-50 border border-red-200 rounded">
          <p class="text-sm text-red-800">
            <strong>Último erro:</strong> {{ lastError }}
          </p>
        </div>
        
        <div class="flex gap-2">
          <button class="btn btn-sm" @click="testConnection">
            🔄 Testar Conexão
          </button>
          <button class="btn btn-sm" @click="testDatabaseConnection">
            🗄️ Testar Banco de Dados
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { environment } from '../config/environment'

const apiBaseUrl = ref(environment.apiBaseUrl)
const connectionStatus = ref<'connected' | 'disconnected' | 'testing'>('testing')
const lastError = ref<string | null>(null)

const testConnection = async () => {
  connectionStatus.value = 'testing'
  lastError.value = null
  
  try {
    console.log('Testing Netlify functions connection...')
    const response = await fetch('/.netlify/functions/test')
    
    // Check if we got HTML instead of JSON (local development)
    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      console.log('🔧 Local development detected - Netlify functions not available')
      connectionStatus.value = 'disconnected'
      lastError.value = 'Netlify functions not available in local development'
      return
    }
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Connection test successful:', data)
      connectionStatus.value = 'connected'
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
  } catch (error) {
    console.log('🔧 Local development detected - Netlify functions not available')
    connectionStatus.value = 'disconnected'
    lastError.value = 'Netlify functions not available in local development'
  }
}

const testDatabaseConnection = async () => {
  connectionStatus.value = 'testing'
  lastError.value = null
  
  try {
    console.log('Testing PostgreSQL database connection...')
    const response = await fetch('/.netlify/functions/postgres?table=customers')
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Database connection successful:', data)
      connectionStatus.value = 'connected'
      lastError.value = null
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    connectionStatus.value = 'disconnected'
    lastError.value = error instanceof Error ? error.message : 'Database connection failed'
  }
}

onMounted(() => {
  testConnection()
})
</script>
