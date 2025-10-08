<template>
  <div v-if="visible" class="modal-overlay" @click="onClose">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2 class="modal-title">Notificações</h2>
        <button class="close-button" @click="onClose">×</button>
      </div>
      
      <div class="modal-body">
        <div v-if="loading" class="loading-container">
          <div class="loading-spinner"></div>
          <p class="loading-text">Carregando notificações...</p>
        </div>
        
        <div v-else-if="notifications.length === 0" class="empty-container">
          <div class="empty-icon">✅</div>
          <h3 class="empty-title">Nenhuma notificação</h3>
          <p class="empty-subtitle">Todos os pagamentos estão em dia!</p>
        </div>
        
        <div v-else class="notifications-list">
          <div v-for="(notification, index) in notifications" :key="index" class="notification-card">
            <div class="notification-header">
              <div class="notification-icon" :class="getNotificationIconClass(notification.type, notification.daysUntilDue)">
                {{ getNotificationIcon(notification.type, notification.daysUntilDue) }}
              </div>
              <div class="notification-content">
                <h4 class="notification-title">{{ getNotificationTitle(notification.type, notification.daysUntilDue) }}</h4>
                <p class="customer-name">{{ notification.customerName || 'Cliente não informado' }}</p>
                <p class="product-name">{{ notification.productName }}</p>
                <p class="installment-info">
                  Parcela {{ notification.installment.number }} de {{ notification.totalInstallments }}
                </p>
              </div>
              <div class="notification-values">
                <div class="amount">{{ formatCurrency(notification.installment.value) }}</div>
                <div class="due-date">{{ formatDate(notification.installment.dueDate) }}</div>
              </div>
            </div>
            
            <div class="notification-actions">
              <button class="pay-button" @click="handleMarkAsPaid(notification)">
                <span class="pay-icon">✓</span>
                Marcar como Pago
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface NotificationItem {
  sale: any
  installment: {
    id: string
    number: number
    value: number
    dueDate: string
    status: string
  }
  customerName?: string
  productName: string
  totalInstallments: number
  daysUntilDue: number
  daysOverdue?: number
  type: 'upcoming' | 'overdue'
}

interface Props {
  visible: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
}>()

const onClose = () => {
  emit('close')
}

const notifications = ref<NotificationItem[]>([])
const loading = ref(false)

// Mock data for now - in real app this would come from API
const loadNotifications = async () => {
  loading.value = true
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Mock notifications
    notifications.value = [
      {
        sale: {},
        installment: {
          id: '1-2',
          number: 2,
          value: 50,
          dueDate: '2024-02-15T00:00:00Z',
          status: 'pending'
        },
        customerName: 'João Silva',
        productName: 'Produto A',
        totalInstallments: 2,
        daysUntilDue: 5,
        type: 'upcoming'
      }
    ]
  } catch (error) {
    console.error('Error loading notifications:', error)
  } finally {
    loading.value = false
  }
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const getNotificationIcon = (type: 'upcoming' | 'overdue', days: number) => {
  if (type === 'overdue') return '⚠️'
  if (days === 0) return '⏰'
  if (days <= 3) return '🔔'
  return '📅'
}

const getNotificationIconClass = (type: 'upcoming' | 'overdue', days: number) => {
  if (type === 'overdue') return 'icon-overdue'
  if (days === 0) return 'icon-today'
  if (days <= 3) return 'icon-urgent'
  return 'icon-upcoming'
}

const getNotificationTitle = (type: 'upcoming' | 'overdue', days: number) => {
  if (type === 'overdue') {
    return `Pagamento Atrasado há ${Math.abs(days)} dia${Math.abs(days) > 1 ? 's' : ''}`
  }
  
  if (days === 0) {
    return 'Pagamento Vence Hoje'
  } else if (days === 1) {
    return 'Pagamento Vence Amanhã'
  } else {
    return `Pagamento Vence em ${days} dias`
  }
}

const handleMarkAsPaid = (notification: NotificationItem) => {
  if (confirm(`Confirmar o recebimento da parcela ${notification.installment.number} no valor de ${formatCurrency(notification.installment.value)}?`)) {
    // In real app, this would update the installment status via API
    console.log('Marking as paid:', notification)
    alert('Pagamento confirmado com sucesso!')
    
    // Remove notification from list
    const index = notifications.value.findIndex(n => n.installment.id === notification.installment.id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }
}

// Load notifications when modal opens
watch(() => props.visible, (newVisible) => {
  if (newVisible) {
    loadNotifications()
  }
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 1rem 1rem 0 0;
  width: 100%;
  max-width: 100%;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 -10px 25px rgba(0, 0, 0, 0.1);
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
  font-weight: 800;
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
  padding: 1rem;
  max-height: 70vh;
  overflow-y: auto;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
}

.loading-spinner {
  width: 2rem;
  height: 2rem;
  border: 2px solid var(--gray-200);
  border-top: 2px solid var(--primary);
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
  padding: 2rem;
  text-align: center;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--gray-800);
  margin-bottom: 0.5rem;
}

.empty-subtitle {
  color: var(--gray-600);
}

.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.notification-card {
  background: var(--gray-50);
  border-radius: 0.75rem;
  padding: 1rem;
  border: 1px solid var(--gray-200);
}

.notification-header {
  display: flex;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.notification-icon {
  font-size: 1.5rem;
  margin-right: 1rem;
  margin-top: 0.25rem;
}

.notification-content {
  flex: 1;
  margin-right: 1rem;
}

.notification-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--gray-800);
  margin-bottom: 0.25rem;
}

.customer-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--gray-700);
  margin-bottom: 0.25rem;
}

.product-name, .installment-info {
  font-size: 0.8125rem;
  color: var(--gray-600);
  margin-bottom: 0.25rem;
}

.notification-values {
  text-align: right;
}

.amount {
  font-size: 1rem;
  font-weight: 800;
  color: var(--gray-800);
  margin-bottom: 0.25rem;
}

.due-date {
  font-size: 0.75rem;
  color: var(--gray-600);
}

.notification-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 0.5rem;
  border-top: 1px solid var(--gray-200);
}

.pay-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--success);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.pay-button:hover {
  opacity: 0.9;
}

.pay-icon {
  font-size: 1rem;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>