import { ref, reactive } from 'vue'

interface AlertOptions {
  type?: 'success' | 'error' | 'warning' | 'info' | 'confirm'
  title: string
  message: string
  details?: string
  confirmText?: string
  cancelText?: string
  showCancel?: boolean
}

interface AlertState {
  show: boolean
  type: 'success' | 'error' | 'warning' | 'info' | 'confirm'
  title: string
  message: string
  details?: string
  confirmText: string
  cancelText: string
  showCancel: boolean
  resolve?: (value: boolean) => void
}

const alertState = reactive<AlertState>({
  show: false,
  type: 'info',
  title: '',
  message: '',
  details: undefined,
  confirmText: 'OK',
  cancelText: 'Cancelar',
  showCancel: false,
  resolve: undefined
})

export function useAlert() {
  const showAlert = (options: AlertOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      alertState.show = true
      alertState.type = options.type || 'info'
      alertState.title = options.title
      alertState.message = options.message
      alertState.details = options.details
      alertState.confirmText = options.confirmText || 'OK'
      alertState.cancelText = options.cancelText || 'Cancelar'
      alertState.showCancel = options.showCancel || false
      alertState.resolve = resolve
    })
  }

  const closeAlert = (confirmed: boolean = false) => {
    alertState.show = false
    if (alertState.resolve) {
      alertState.resolve(confirmed)
    }
  }

  // Métodos de conveniência
  const success = (title: string, message: string, details?: string) => {
    return showAlert({ type: 'success', title, message, details })
  }

  const error = (title: string, message: string, details?: string) => {
    return showAlert({ type: 'error', title, message, details })
  }

  const warning = (title: string, message: string, details?: string) => {
    return showAlert({ type: 'warning', title, message, details })
  }

  const info = (title: string, message: string, details?: string) => {
    return showAlert({ type: 'info', title, message, details })
  }

  const confirm = (title: string, message: string, details?: string) => {
    return showAlert({ 
      type: 'confirm', 
      title, 
      message, 
      details, 
      showCancel: true,
      confirmText: 'Confirmar',
      cancelText: 'Cancelar'
    })
  }

  return {
    alertState,
    showAlert,
    closeAlert,
    success,
    error,
    warning,
    info,
    confirm
  }
}
