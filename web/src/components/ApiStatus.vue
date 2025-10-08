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
          <span :class="useMockData ? 'text-yellow-600' : 'text-green-600'">
            {{ useMockData ? 'Mock Data' : 'Google Sheets' }}
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
          <button class="btn btn-sm" @click="toggleMockData">
            {{ useMockData ? '📊 Usar API Real' : '🎭 Usar Mock Data' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { environment } from '../config/environment'

const useMockData = ref(environment.useMockData)
const apiBaseUrl = ref(environment.apiBaseUrl)
const connectionStatus = ref<'connected' | 'disconnected' | 'testing'>('testing')
const lastError = ref<string | null>(null)

const testConnection = async () => {
  connectionStatus.value = 'testing'
  lastError.value = null
  
  if (useMockData.value) {
    connectionStatus.value = 'connected'
    return
  }
  
  try {
    console.log('Testing API connection...')
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

const toggleMockData = () => {
  useMockData.value = !useMockData.value
  environment.useMockData = useMockData.value
  environment.features.enableMockData = useMockData.value
  environment.features.enableGoogleSheets = !useMockData.value
  console.log('Mock data toggled:', useMockData.value)
}

onMounted(() => {
  testConnection()
})
</script>
