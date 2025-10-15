<template>
  <div class="pending-payments-container">
    <div class="pending-payments-header">
      <button class="back-button" @click="goBack">
        <span class="back-icon">←</span>
      </button>
      <h1 class="pending-payments-title">Valores a Receber</h1>
      <div class="placeholder"></div>
    </div>

    <div class="pending-payments-content">
      <!-- Calendar Header -->
      <Card shadow="sm" class="calendar-header">
        <div class="month-navigation">
          <button @click="navigateMonth('prev')" class="nav-button">
            <span class="nav-icon">‹</span>
          </button>
          <h2 class="month-title">{{ monthNames[currentDate.getMonth()] }} {{ currentDate.getFullYear() }}</h2>
          <button @click="navigateMonth('next')" class="nav-button">
            <span class="nav-icon">›</span>
          </button>
        </div>
      </Card>

      <!-- Calendar Grid -->
      <Card shadow="sm" class="calendar">
        <!-- Week days header -->
        <div class="week-days-header">
          <div v-for="day in weekDays" :key="day" class="week-day">{{ day }}</div>
        </div>

        <!-- Calendar days -->
        <div class="calendar-grid">
          <div
            v-for="(day, index) in calendarDays"
            :key="index"
            class="day-cell"
            :class="{
              'day-other-month': !day.isCurrentMonth,
              'day-today': day.isToday,
              'day-with-payments': day.payments.length > 0
            }"
            @click="handleDayPress(day)"
          >
            <div class="day-number">{{ day.date.getDate() }}</div>
            <div v-if="day.payments.length > 0" class="day-payments">
              <div class="day-payment-count">{{ day.payments.length }}</div>
              <div class="day-payment-amount">{{ formatCurrency(day.totalAmount) }}</div>
            </div>
          </div>
        </div>
      </Card>

      <!-- Summary -->
      <Card shadow="sm" class="summary">
        <h3 class="summary-title">Resumo do Mês</h3>
        <div class="summary-row">
          <span class="summary-label">Total a Receber:</span>
          <span class="summary-value">{{ formatCurrency(totalPendingAmount) }}</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">Parcelas Pendentes:</span>
          <span class="summary-value">{{ totalPendingCount }}</span>
        </div>
      </Card>
    </div>

    <!-- Day Details Modal -->
    <div v-if="modalVisible" class="modal-overlay" @click="modalVisible = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2 class="modal-title">{{ selectedDay && formatDate(selectedDay.date.toISOString()) }}</h2>
          <button class="close-button" @click="modalVisible = false">×</button>
        </div>

        <div class="modal-body">
          <div v-for="(payment, index) in selectedDay?.payments" :key="index" class="payment-card">
            <Card shadow="sm">
              <div class="payment-header">
                <div class="payment-info">
                  <h4 class="payment-customer">{{ payment.customerName || 'Cliente não informado' }}</h4>
                  <p class="payment-phone">{{ payment.customerPhone || 'Telefone não informado' }}</p>
                  <p class="payment-value">{{ formatCurrency(payment.installment.value) }}</p>
                </div>
                <div class="payment-actions">
                  <div class="status-badge" :class="getStatusClass(payment.installment)">
                    {{ getStatusText(payment.installment) }}
                  </div>
                  <button class="paid-button" @click="markAsPaid(payment)">
                    <span class="paid-icon">✓</span>
                    Recebido
                  </button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../stores/app'
import Card from '../components/Card.vue'

const router = useRouter()
const store = useAppStore()

interface Installment {
  id: string
  number: number
  value: number
  dueDate: string
  status: 'pending' | 'paid' | 'overdue'
  paidDate?: string
}

interface PendingPayment {
  saleId: string
  customerName?: string
  customerPhone?: string
  installment: Installment
}

interface CalendarDay {
  date: Date
  payments: PendingPayment[]
  totalAmount: number
  isCurrentMonth: boolean
  isToday: boolean
}

const currentDate = ref(new Date())
const modalVisible = ref(false)
const selectedDay = ref<CalendarDay | null>(null)

const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const monthNames = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

// Load real pending payments from sales with installments
const pendingPayments = ref<PendingPayment[]>([])

const loadPendingPayments = async () => {
  try {
    await store.fetchSales()
    
    const sales = store.sales || []
    const pendingList: PendingPayment[] = []
    
    // Check each sale for pending installments
    sales.forEach(sale => {
      if (sale.installments && sale.installments.length > 0) {
        sale.installments.forEach(installment => {
          if (installment.status === 'pending' || installment.status === 'overdue') {
            pendingList.push({
              saleId: sale.id || '',
              customerName: sale.customerName || 'Cliente',
              customerPhone: sale.customerPhone || '',
              installment: installment
            })
          }
        })
      }
    })
    
    pendingPayments.value = pendingList
  } catch (error) {
    console.error('Error loading pending payments:', error)
  }
}

const goBack = () => {
  router.go(-1)
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

const generateCalendar = (): CalendarDay[] => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())
  
  const days: CalendarDay[] = []
  const today = new Date()
  
  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    
    const dayPayments = pendingPayments.value.filter(payment => {
      const dueDate = new Date(payment.installment.dueDate)
      return dueDate.toDateString() === date.toDateString()
    })
    
    const totalAmount = dayPayments.reduce((sum, payment) => sum + payment.installment.value, 0)
    
    days.push({
      date,
      payments: dayPayments,
      totalAmount,
      isCurrentMonth: date.getMonth() === month,
      isToday: date.toDateString() === today.toDateString()
    })
  }
  
  return days
}

const calendarDays = computed(() => generateCalendar())

const totalPendingAmount = computed(() => {
  return pendingPayments.value.reduce((sum, payment) => sum + payment.installment.value, 0)
})

const totalPendingCount = computed(() => {
  return pendingPayments.value.length
})

const navigateMonth = (direction: 'prev' | 'next') => {
  const newDate = new Date(currentDate.value)
  if (direction === 'prev') {
    newDate.setMonth(newDate.getMonth() - 1)
  } else {
    newDate.setMonth(newDate.getMonth() + 1)
  }
  currentDate.value = newDate
}

const handleDayPress = (day: CalendarDay) => {
  if (day.payments.length > 0) {
    selectedDay.value = day
    modalVisible.value = true
  }
}

const getStatusClass = (installment: Installment) => {
  const dueDate = new Date(installment.dueDate)
  const today = new Date()
  const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 3600 * 24))
  
  if (installment.status === 'paid') return 'status-paid'
  if (installment.status === 'overdue' || diffDays < 0) return 'status-overdue'
  if (diffDays <= 3) return 'status-urgent'
  return 'status-pending'
}

const getStatusText = (installment: Installment) => {
  const dueDate = new Date(installment.dueDate)
  const today = new Date()
  const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 3600 * 24))
  
  if (installment.status === 'paid') return 'Pago'
  if (installment.status === 'overdue' || diffDays < 0) return 'Vencido'
  if (diffDays === 0) return 'Vence hoje'
  if (diffDays === 1) return 'Vence amanhã'
  return `${diffDays} dias`
}

const markAsPaid = async (payment: PendingPayment) => {
  if (confirm(`Confirmar o recebimento da parcela ${payment.installment.number} no valor de ${formatCurrency(payment.installment.value)}?`)) {
    try {
      await store.markInstallmentPaid(payment.saleId, payment.installment.id)
      // Atualizar UI local rapidamente
      const index = pendingPayments.value.findIndex(p => p.installment.id === payment.installment.id)
      if (index > -1) {
        pendingPayments.value.splice(index, 1)
      }
      if (selectedDay.value) {
        selectedDay.value.payments = selectedDay.value.payments.filter(p => p.installment.id !== payment.installment.id)
        selectedDay.value.totalAmount = selectedDay.value.payments.reduce((sum, p) => sum + p.installment.value, 0)
      }
      alert('Pagamento confirmado e persistido com sucesso!')
    } catch (e) {
      console.error('Erro ao persistir recebimento', e)
      alert('Falha ao persistir recebimento. Tente novamente.')
    }
  }
}

onMounted(() => {
  loadPendingPayments()
})
</script>

<style scoped>
.pending-payments-container {
  flex: 1;
  background-color: var(--gray-50);
}

.pending-payments-header {
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

.pending-payments-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--gray-800);
}

.placeholder {
  width: 1.5rem;
}

.pending-payments-content {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.calendar-header {
  margin-bottom: 0;
}

.month-navigation {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
}

.nav-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--primary);
  cursor: pointer;
  padding: 0.5rem;
}

.month-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--gray-800);
}

.calendar {
  margin-bottom: 0;
}

.week-days-header {
  display: flex;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--gray-200);
}

.week-day {
  flex: 1;
  text-align: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--gray-600);
  padding: 0.5rem 0;
}

.calendar-grid {
  display: flex;
  flex-wrap: wrap;
}

.day-cell {
  width: 14.28%;
  aspect-ratio: 1;
  border: 1px solid var(--gray-200);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0.25rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.day-cell:hover {
  background-color: var(--gray-50);
}

.day-other-month {
  background-color: var(--gray-50);
  color: var(--gray-400);
}

.day-today {
  background-color: rgba(59, 130, 246, 0.1);
}

.day-with-payments {
  background-color: rgba(245, 158, 11, 0.1);
}

.day-number {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--gray-800);
}

.day-payments {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 0.25rem;
}

.day-payment-count {
  font-size: 0.625rem;
  font-weight: 700;
  color: var(--warning);
}

.day-payment-amount {
  font-size: 0.5rem;
  color: var(--gray-600);
  font-weight: 600;
}

.summary {
  margin-bottom: 0;
}

.summary-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--gray-800);
  margin-bottom: 1rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.summary-label {
  font-size: 0.875rem;
  color: var(--gray-600);
}

.summary-value {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--gray-800);
}

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
  max-height: 80%;
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
  font-size: 1.125rem;
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
  padding: 1rem;
  max-height: 60vh;
  overflow-y: auto;
}

.payment-card {
  margin-bottom: 1rem;
}

.payment-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.payment-info {
  flex: 1;
}

.payment-customer {
  font-size: 1rem;
  font-weight: 700;
  color: var(--gray-800);
  margin-bottom: 0.25rem;
}

.payment-phone {
  font-size: 0.875rem;
  color: var(--gray-600);
  margin-bottom: 0.25rem;
}

.payment-value {
  font-size: 1rem;
  font-weight: 700;
  color: var(--primary);
}

.payment-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
}

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.625rem;
  font-weight: 600;
  color: white;
}

.status-paid {
  background-color: var(--success);
}

.status-pending {
  background-color: var(--gray-500);
}

.status-urgent {
  background-color: var(--warning);
}

.status-overdue {
  background-color: var(--danger);
}

.paid-button {
  display: flex;
  align-items: center;
  background: var(--success);
  color: white;
  border: none;
  border-radius: 0.375rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  gap: 0.25rem;
}

.paid-icon {
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .pending-payments-content {
    padding: 0.5rem;
  }
  
  .day-cell {
    padding: 0.125rem;
  }
  
  .day-number {
    font-size: 0.625rem;
  }
  
  .day-payment-count {
    font-size: 0.5rem;
  }
  
  .day-payment-amount {
    font-size: 0.375rem;
  }
  
  .modal-content {
    border-radius: 0;
  }
  
  .payment-header {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .payment-actions {
    align-items: flex-start;
  }
}
</style>
