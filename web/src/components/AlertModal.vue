<template>
  <div v-if="show" class="alert-overlay" @click="close">
    <div class="alert-modal" @click.stop>
      <div class="alert-header" :class="typeClass">
        <div class="alert-icon">
          <span v-if="type === 'success'">✅</span>
          <span v-else-if="type === 'error'">❌</span>
          <span v-else-if="type === 'warning'">⚠️</span>
          <span v-else-if="type === 'info'">ℹ️</span>
          <span v-else>💬</span>
        </div>
        <h3 class="alert-title">{{ title }}</h3>
        <button class="alert-close" @click="close">
          <span>×</span>
        </button>
      </div>
      
      <div class="alert-content">
        <p class="alert-message">{{ message }}</p>
        
        <div v-if="details" class="alert-details">
          <h4>Detalhes:</h4>
          <pre>{{ details }}</pre>
        </div>
      </div>
      
      <div class="alert-actions">
        <button 
          v-if="showCancel" 
          class="alert-btn alert-btn-cancel" 
          @click="cancel"
        >
          {{ cancelText }}
        </button>
        <button 
          class="alert-btn alert-btn-primary" 
          :class="typeClass"
          @click="confirm"
        >
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  show: boolean
  type?: 'success' | 'error' | 'warning' | 'info' | 'confirm'
  title: string
  message: string
  details?: string
  confirmText?: string
  cancelText?: string
  showCancel?: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'confirm'): void
  (e: 'cancel'): void
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  confirmText: 'OK',
  cancelText: 'Cancelar',
  showCancel: false
})

const emit = defineEmits<Emits>()

const typeClass = computed(() => {
  switch (props.type) {
    case 'success': return 'alert-success'
    case 'error': return 'alert-error'
    case 'warning': return 'alert-warning'
    case 'info': return 'alert-info'
    case 'confirm': return 'alert-confirm'
    default: return 'alert-info'
  }
})

const close = () => emit('close')
const confirm = () => emit('confirm')
const cancel = () => emit('cancel')
</script>

<style scoped>
.alert-overlay {
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
  backdrop-filter: blur(4px);
}

.alert-modal {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow: hidden;
  animation: alertSlideIn 0.3s ease-out;
}

@keyframes alertSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.alert-header {
  display: flex;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  position: relative;
}

.alert-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  border-radius: 16px 16px 0 0;
}

.alert-header.alert-success::before {
  background: linear-gradient(90deg, #10b981, #059669);
}

.alert-header.alert-error::before {
  background: linear-gradient(90deg, #ef4444, #dc2626);
}

.alert-header.alert-warning::before {
  background: linear-gradient(90deg, #f59e0b, #d97706);
}

.alert-header.alert-info::before {
  background: linear-gradient(90deg, #3b82f6, #2563eb);
}

.alert-header.alert-confirm::before {
  background: linear-gradient(90deg, #8b5cf6, #7c3aed);
}

.alert-icon {
  font-size: 1.5rem;
  margin-right: 1rem;
}

.alert-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  flex: 1;
}

.alert-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #6b7280;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.375rem;
  transition: all 0.2s ease;
}

.alert-close:hover {
  background: #f3f4f6;
  color: #374151;
}

.alert-content {
  padding: 1.5rem;
}

.alert-message {
  color: #4b5563;
  line-height: 1.6;
  margin: 0 0 1rem 0;
}

.alert-details {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-top: 1rem;
}

.alert-details h4 {
  margin: 0 0 0.5rem 0;
  color: #374151;
  font-size: 0.875rem;
  font-weight: 600;
}

.alert-details pre {
  margin: 0;
  color: #6b7280;
  font-size: 0.875rem;
  white-space: pre-wrap;
  word-break: break-word;
}

.alert-actions {
  display: flex;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
  justify-content: flex-end;
}

.alert-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.alert-btn-cancel {
  background: #f3f4f6;
  color: #374151;
}

.alert-btn-cancel:hover {
  background: #e5e7eb;
}

.alert-btn-primary {
  color: white;
}

.alert-btn-primary.alert-success {
  background: linear-gradient(135deg, #10b981, #059669);
}

.alert-btn-primary.alert-success:hover {
  background: linear-gradient(135deg, #059669, #047857);
}

.alert-btn-primary.alert-error {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}

.alert-btn-primary.alert-error:hover {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
}

.alert-btn-primary.alert-warning {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.alert-btn-primary.alert-warning:hover {
  background: linear-gradient(135deg, #d97706, #b45309);
}

.alert-btn-primary.alert-info {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
}

.alert-btn-primary.alert-info:hover {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
}

.alert-btn-primary.alert-confirm {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
}

.alert-btn-primary.alert-confirm:hover {
  background: linear-gradient(135deg, #7c3aed, #6d28d9);
}

/* Mobile */
@media (max-width: 640px) {
  .alert-modal {
    width: 95%;
    margin: 1rem;
  }
  
  .alert-header {
    padding: 1rem;
  }
  
  .alert-content {
    padding: 1rem;
  }
  
  .alert-actions {
    padding: 1rem;
    flex-direction: column;
  }
  
  .alert-btn {
    width: 100%;
  }
}
</style>
