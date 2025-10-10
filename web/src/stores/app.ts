import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiService, type Product, type Customer, type Sale, type DashboardSummary, type Promotion, type Campaign } from '../services/api'

export const useAppStore = defineStore('app', () => {
  // State
  const products = ref<Product[]>([])
  const customers = ref<Customer[]>([])
  const sales = ref<Sale[]>([])
  const promotions = ref<Promotion[]>([])
  const campaigns = ref<Campaign[]>([])
  const dashboardSummary = ref<DashboardSummary | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const lowStockProducts = computed(() => 
    (products.value || []).filter(p => p.quantity < 10)
  )

  const totalInventoryValue = computed(() =>
    (products.value || []).reduce((sum, p) => sum + (p.quantity * p.cost), 0)
  )

  const totalSalesValue = computed(() =>
    (sales.value || []).reduce((sum, s) => sum + s.totalValue, 0)
  )

  // Actions
  const setLoading = (value: boolean) => {
    loading.value = value
  }

  const setError = (message: string | null) => {
    error.value = message
  }

  const clearError = () => {
    error.value = null
  }

  // Products
  const fetchProducts = async () => {
    try {
      setLoading(true)
      clearError()
      console.log('🔄 Fetching products from API...')
      const fetchedProducts = await apiService.getProducts()
      console.log('📦 Products fetched:', fetchedProducts)
      console.log('📦 Products count:', fetchedProducts.length)
      products.value = fetchedProducts
      console.log('✅ Products stored in state:', products.value)
    } catch (err) {
      console.error('❌ Error fetching products:', err)
      setError(err instanceof Error ? err.message : 'Erro ao carregar produtos')
    } finally {
      setLoading(false)
    }
  }

  const createProduct = async (product: Omit<Product, 'id'>) => {
    try {
      setLoading(true)
      clearError()
      await apiService.createProduct(product)
      await fetchProducts()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar produto')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateProduct = async (id: string, product: Partial<Product>) => {
    try {
      setLoading(true)
      clearError()
      await apiService.updateProduct(id, product)
      await fetchProducts()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar produto')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deleteProduct = async (id: string) => {
    try {
      setLoading(true)
      clearError()
      await apiService.deleteProduct(id)
      await fetchProducts()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar produto')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Customers
  const fetchCustomers = async () => {
    try {
      setLoading(true)
      clearError()
      console.log('🔄 Fetching customers from API...')
      const fetchedCustomers = await apiService.getCustomers()
      console.log('📦 Customers fetched:', fetchedCustomers)
      console.log('📦 Customers count:', fetchedCustomers.length)
      customers.value = fetchedCustomers
      console.log('✅ Customers stored in state:', customers.value)
    } catch (err) {
      console.error('❌ Error fetching customers:', err)
      setError(err instanceof Error ? err.message : 'Erro ao carregar clientes')
    } finally {
      setLoading(false)
    }
  }

  const createCustomer = async (customer: Omit<Customer, 'id'>) => {
    try {
      setLoading(true)
      clearError()
      await apiService.createCustomer(customer)
      await fetchCustomers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar cliente')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateCustomer = async (id: string, customer: Partial<Customer>) => {
    try {
      setLoading(true)
      clearError()
      await apiService.updateCustomer(id, customer)
      await fetchCustomers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar cliente')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deleteCustomer = async (id: string) => {
    try {
      setLoading(true)
      clearError()
      await apiService.deleteCustomer(id)
      await fetchCustomers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar cliente')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Sales
  const fetchSales = async () => {
    try {
      setLoading(true)
      clearError()
      sales.value = await apiService.getSales()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar vendas')
    } finally {
      setLoading(false)
    }
  }

  const createSale = async (sale: Omit<Sale, 'id'>) => {
    try {
      setLoading(true)
      clearError()
      await apiService.createSale(sale)
      await fetchSales()
      await fetchDashboardSummary()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar venda')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Dashboard
  const fetchDashboardSummary = async () => {
    try {
      setLoading(true)
      clearError()
      dashboardSummary.value = await apiService.getDashboardSummary()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dashboard')
    } finally {
      setLoading(false)
    }
  }

  // Initialize data
  const initializeData = async () => {
    await Promise.all([
      fetchProducts(),
      fetchCustomers(),
      fetchSales(),
      fetchDashboardSummary()
    ])
  }

  return {
    // State
    products,
    customers,
    sales,
    promotions,
    campaigns,
    dashboardSummary,
    loading,
    error,
    
    // Computed
    lowStockProducts,
    totalInventoryValue,
    totalSalesValue,
    
    // Actions
    setLoading,
    setError,
    clearError,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    fetchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    fetchSales,
    createSale,
    async fetchPromotions() {
      promotions.value = await apiService.getPromotions()
    },
    async createPromotion(promotion: Promotion) {
      const created = await apiService.createPromotion(promotion)
      promotions.value.unshift(created)
      try { localStorage.setItem('promotions', JSON.stringify(promotions.value)) } catch {}
    },
    async updatePromotion(id: string, updates: Partial<Promotion>) {
      await apiService.updatePromotion(id, updates)
      await this.fetchPromotions()
    },
    async endPromotion(id: string) {
      // set endAt to now
      await apiService.updatePromotion(id, { endAt: new Date().toISOString() } as any)
      await this.fetchPromotions()
    },
    async deletePromotion(id: string) {
      await apiService.deletePromotion(id)
      await this.fetchPromotions()
    },
    async fetchCampaigns() {
      campaigns.value = await apiService.getCampaigns()
    },
    async createCampaign(campaign: Campaign) {
      const created = await apiService.createCampaign(campaign)
      campaigns.value.unshift(created)
    },
    async updateCampaign(id: string, updates: Partial<Campaign>) {
      await apiService.updateCampaign(id, updates)
      await this.fetchCampaigns()
    },
    async deleteCampaign(id: string) {
      await apiService.deleteCampaign(id)
      await this.fetchCampaigns()
    },
    fetchDashboardSummary,
    initializeData
  }
})
