<template>
  <div v-if="visible" class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2 class="modal-title">Detalhes da Venda</h2>
        <button class="close-button" @click="onClose">×</button>
      </div>

      <div class="modal-body">
        <!-- Informações do Cliente -->
        <div v-if="sale.customerName" class="section">
          <h3 class="section-title">Cliente</h3>
          <div class="info-row">
            <span class="label">Nome:</span>
            <span class="value">{{ sale.customerName }}</span>
          </div>
          <div v-if="sale.customerPhone" class="info-row">
            <span class="label">Telefone:</span>
            <span class="value">{{ sale.customerPhone }}</span>
          </div>
        </div>

        <!-- Produtos -->
        <div class="section">
          <h3 class="section-title">Produtos</h3>
          <div v-if="isMultiSale">
            <div v-for="(item, index) in sale.items" :key="index" class="product-item">
              <div class="product-info">
                <div class="product-name">{{ item.product }}</div>
                <div class="product-quantity">Qtd: {{ item.quantity }}</div>
              </div>
              <div class="product-values">
                <div class="product-price">{{ formatCurrency(item.unitPrice) }}</div>
                <div class="product-total">{{ formatCurrency(item.totalValue) }}</div>
              </div>
            </div>
          </div>
          <div v-else class="product-item">
            <div class="product-info">
              <div class="product-name">{{ sale.product }}</div>
              <div class="product-quantity">Qtd: {{ sale.quantity }}</div>
            </div>
            <div class="product-values">
              <div class="product-price">{{ formatCurrency(sale.totalValue / sale.quantity) }}</div>
              <div class="product-total">{{ formatCurrency(sale.totalValue) }}</div>
            </div>
          </div>
        </div>

        <!-- Resumo Financeiro -->
        <div class="section">
          <h3 class="section-title">Resumo Financeiro</h3>
          <div class="info-row">
            <span class="label">Total da Venda:</span>
            <span class="value total-value">{{ formatCurrency(sale.totalValue) }}</span>
          </div>
          <div class="info-row">
            <span class="label">Custo Total:</span>
            <span class="value">{{ formatCurrency(sale.totalCost) }}</span>
          </div>
          <div class="info-row">
            <span class="label">Lucro:</span>
            <span class="value profit-value">{{ formatCurrency(sale.profit) }}</span>
          </div>
          <div class="info-row">
            <span class="label">Status:</span>
            <span class="value" :class="getStatusClass(sale.status)">{{ getStatusText(sale.status) }}</span>
          </div>
        </div>

        <!-- Parcelas -->
        <div v-if="hasInstallments" class="section">
          <h3 class="section-title">Parcelas</h3>
          <div v-for="(installment, index) in sale.installments" :key="index" class="installment-item">
            <div class="installment-info">
              <div class="installment-number">Parcela {{ installment.number }}</div>
              <div class="installment-date">Vencimento: {{ formatDate(installment.dueDate) }}</div>
              <div v-if="installment.paidDate" class="installment-paid">
                Pago em: {{ formatDate(installment.paidDate) }}
              </div>
            </div>
            <div class="installment-values">
              <div class="installment-value">{{ formatCurrency(installment.value) }}</div>
              <div class="status-badge" :class="getStatusClass(installment.status)">
                {{ getInstallmentStatusText(installment.status) }}
              </div>
            </div>
          </div>
        </div>

        <!-- Informações da Venda -->
        <div class="section">
          <h3 class="section-title">Informações da Venda</h3>
          <div class="info-row">
            <span class="label">Data:</span>
            <span class="value">{{ formatDate(sale.dateISO) }}</span>
          </div>
          <div class="info-row">
            <span class="label">Forma de Pagamento:</span>
            <span class="value">{{ sale.paymentMethod || 'Não informado' }}</span>
          </div>
        </div>
      </div>

      <!-- Botões de Ação -->
      <div class="modal-actions">
        <button v-if="sale.customerPhone" class="whatsapp-button" @click="handleWhatsAppReceipt">
          <span class="whatsapp-icon">💬</span>
          Enviar Comprovante
        </button>
        <button class="close-action-button" @click="onClose">
          Fechar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Sale, MultiSale } from '../services/api'

interface Props {
  sale: Sale | MultiSale
  visible: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
}>()

const isMultiSale = computed(() => 'items' in props.sale)
const hasInstallments = computed(() => props.sale.installments && props.sale.installments.length > 0)

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

const getStatusClass = (status?: string) => {
  switch (status) {
    case 'paid': return 'status-paid'
    case 'pending': return 'status-pending'
    case 'partial': return 'status-partial'
    case 'overdue': return 'status-overdue'
    default: return 'status-unknown'
  }
}

const getStatusText = (status?: string) => {
  switch (status) {
    case 'paid': return 'Pago'
    case 'pending': return 'Pendente'
    case 'partial': return 'Parcial'
    case 'overdue': return 'Vencido'
    default: return 'Não informado'
  }
}

const getInstallmentStatusText = (status?: string) => {
  switch (status) {
    case 'paid': return 'Pago'
    case 'pending': return 'Pendente'
    case 'overdue': return 'Vencido'
    default: return 'Pendente'
  }
}

const handleOverlayClick = () => {
  emit('close')
}

const onClose = () => {
  emit('close')
}

const handleWhatsAppReceipt = () => {
  if (!props.sale.customerPhone) {
    alert('Telefone do cliente não informado')
    return
  }

  const message = `📋 *Comprovante de Venda*\n\n` +
    `🛍️ *Produto(s):*\n` +
    (isMultiSale.value 
      ? props.sale.items.map(item => `• ${item.product} (${item.quantity}x) - ${formatCurrency(item.totalValue)}`).join('\n')
      : `• ${props.sale.product} (${props.sale.quantity}x) - ${formatCurrency(props.sale.totalValue)}`
    ) +
    `\n\n💰 *Total: ${formatCurrency(props.sale.totalValue)}*\n` +
    `📅 *Data: ${formatDate(props.sale.dateISO)}*\n` +
    `💳 *Pagamento: ${props.sale.paymentMethod || 'Não informado'}*\n\n` +
    `Obrigado pela preferência! 🎉`

  const whatsappUrl = `whatsapp://send?phone=${props.sale.customerPhone}&text=${encodeURIComponent(message)}`
  window.open(whatsappUrl, '_blank')
}
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
  padding: 1.5rem;
  max-height: 60vh;
  overflow-y: auto;
}

.section {
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--gray-800);
  margin-bottom: 1rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--gray-100);
}

.label {
  font-size: 0.875rem;
  color: var(--gray-600);
}

.value {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--gray-800);
}

.total-value {
  color: var(--primary);
  font-weight: 700;
}

.profit-value {
  color: var(--success);
  font-weight: 700;
}

.status-paid {
  color: var(--success);
}

.status-pending {
  color: var(--warning);
}

.status-partial {
  color: var(--primary);
}

.status-overdue {
  color: var(--danger);
}

.status-unknown {
  color: var(--gray-500);
}

.product-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--gray-100);
}

.product-info {
  flex: 1;
}

.product-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--gray-800);
}

.product-quantity {
  font-size: 0.75rem;
  color: var(--gray-500);
  margin-top: 0.25rem;
}

.product-values {
  text-align: right;
}

.product-price {
  font-size: 0.875rem;
  color: var(--gray-600);
}

.product-total {
  font-size: 1rem;
  font-weight: 700;
  color: var(--primary);
  margin-top: 0.25rem;
}

.installment-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--gray-100);
}

.installment-info {
  flex: 1;
}

.installment-number {
  font-size: 1rem;
  font-weight: 600;
  color: var(--gray-800);
}

.installment-date {
  font-size: 0.75rem;
  color: var(--gray-500);
  margin-top: 0.25rem;
}

.installment-paid {
  font-size: 0.75rem;
  color: var(--success);
  margin-top: 0.25rem;
}

.installment-values {
  text-align: right;
}

.installment-value {
  font-size: 1rem;
  font-weight: 700;
  color: var(--gray-800);
}

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.625rem;
  font-weight: 600;
  color: white;
  margin-top: 0.25rem;
  display: inline-block;
}

.status-badge.status-paid {
  background-color: var(--success);
}

.status-badge.status-pending {
  background-color: var(--warning);
}

.status-badge.status-overdue {
  background-color: var(--danger);
}

.modal-actions {
  display: flex;
  padding: 1.5rem;
  gap: 0.75rem;
  border-top: 1px solid var(--gray-200);
}

.whatsapp-button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #25D366;
  color: white;
  border: none;
  border-radius: 0.5rem;
  padding: 0.75rem;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  gap: 0.5rem;
}

.whatsapp-icon {
  font-size: 1.25rem;
}

.close-action-button {
  flex: 1;
  background: var(--gray-100);
  color: var(--gray-800);
  border: 1px solid var(--gray-300);
  border-radius: 0.5rem;
  padding: 0.75rem;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
}

@media (max-width: 768px) {
  .modal-content {
    border-radius: 0;
  }
  
  .modal-actions {
    flex-direction: column;
  }
}
</style>
