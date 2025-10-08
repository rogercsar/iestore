// API service for Google Sheets integration
import { environment } from '../config/environment'

const API_BASE_URL = environment.apiBaseUrl
const USE_MOCK_DATA = environment.useMockData

export interface Product {
  id?: string
  name: string
  quantity: number
  cost: number
  unitPrice: number
  category?: string
  photo?: string
  description?: string
  sku?: string
  createdAt?: string
  updatedAt?: string
}

export interface Customer {
  id?: string
  name: string
  phone: string
  email?: string
  address?: string
  totalPurchases?: number
  totalValue?: number
  pendingAmount?: number
  lastPurchase?: string
  notes?: string
  createdAt?: string
  updatedAt?: string
}

export interface Sale {
  id?: string
  dateISO: string
  product: string
  quantity: number
  totalValue: number
  totalCost: number
  profit: number
  customerName?: string
  customerPhone?: string
  paymentMethod?: string
  status?: 'paid' | 'pending' | 'partial'
  createdAt?: string
}

export interface DashboardSummary {
  totalSalesValue: number
  totalProfit: number
  totalProducts: number
  totalCustomers: number
  lowStockProducts: number
  recentSales: Sale[]
  topProducts: { name: string; quantity: number }[]
}

// Mock data for development
const mockProducts: Product[] = [
  { id: '1', name: 'Smartphone XYZ', category: 'Eletrônicos', cost: 500, unitPrice: 899.90, quantity: 15 },
  { id: '2', name: 'Camiseta Básica', category: 'Roupas', cost: 15, unitPrice: 29.90, quantity: 45 },
  { id: '3', name: 'Notebook ABC', category: 'Eletrônicos', cost: 1500, unitPrice: 2499.90, quantity: 8 },
  { id: '4', name: 'Mesa de Escritório', category: 'Casa', cost: 200, unitPrice: 399.90, quantity: 3 },
  { id: '5', name: 'Tênis Esportivo', category: 'Roupas', cost: 80, unitPrice: 199.90, quantity: 22 },
  { id: '6', name: 'Cadeira Gamer', category: 'Casa', cost: 300, unitPrice: 599.90, quantity: 12 }
]

const mockSales: Sale[] = [
  { id: '1', dateISO: '2024-01-15T10:30:00Z', product: 'Smartphone XYZ', quantity: 1, totalValue: 899.90, totalCost: 500, profit: 399.90, customerName: 'João Silva', status: 'paid' },
  { id: '2', dateISO: '2024-01-15T14:20:00Z', product: 'Camiseta Básica', quantity: 2, totalValue: 59.80, totalCost: 30, profit: 29.80, customerName: 'Maria Santos', status: 'paid' },
  { id: '3', dateISO: '2024-01-14T16:45:00Z', product: 'Notebook ABC', quantity: 1, totalValue: 2499.90, totalCost: 1500, profit: 999.90, customerName: 'Pedro Costa', status: 'paid' },
  { id: '4', dateISO: '2024-01-14T11:15:00Z', product: 'Tênis Esportivo', quantity: 1, totalValue: 199.90, totalCost: 80, profit: 119.90, customerName: 'Ana Oliveira', status: 'paid' },
  { id: '5', dateISO: '2024-01-13T09:30:00Z', product: 'Cadeira Gamer', quantity: 1, totalValue: 599.90, totalCost: 300, profit: 299.90, customerName: 'Carlos Lima', status: 'paid' }
]

const mockCustomers: Customer[] = [
  { id: '1', name: 'João Silva', phone: '(11) 99999-9999', email: 'joao@email.com', totalPurchases: 12, totalValue: 2500, lastPurchase: '2024-01-15T10:30:00Z' },
  { id: '2', name: 'Maria Santos', phone: '(11) 88888-8888', email: 'maria@email.com', totalPurchases: 8, totalValue: 1200, lastPurchase: '2024-01-15T14:20:00Z' },
  { id: '3', name: 'Pedro Costa', phone: '(11) 77777-7777', email: 'pedro@email.com', totalPurchases: 5, totalValue: 3000, lastPurchase: '2024-01-14T16:45:00Z' },
  { id: '4', name: 'Ana Oliveira', phone: '(11) 66666-6666', email: 'ana@email.com', totalPurchases: 15, totalValue: 1800, lastPurchase: '2024-01-14T11:15:00Z' },
  { id: '5', name: 'Carlos Lima', phone: '(11) 55555-5555', email: 'carlos@email.com', totalPurchases: 3, totalValue: 800, lastPurchase: '2024-01-13T09:30:00Z' }
]

class ApiService {
  private async testConnection(): Promise<boolean> {
    try {
      console.log('Testing Netlify functions connection...')
      const response = await fetch('/.netlify/functions/test')
      
      // Check if we got HTML instead of JSON (local development)
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        console.log('🔧 Local development detected - Netlify functions not available')
        return false
      }
      
      const data = await response.json()
      console.log('✅ Netlify functions are working:', data)
      return true
    } catch (error) {
      console.log('🔧 Local development detected - Netlify functions not available')
      return false
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    // Use mock data if configured
    if (USE_MOCK_DATA) {
      console.log(`Using mock data for ${endpoint}`)
      return this.getMockData<T>(endpoint, options)
    }

    // Test connection first
    const isConnected = await this.testConnection()
    if (!isConnected) {
      console.warn('Netlify functions not available, using mock data')
      return this.getMockData<T>(endpoint, options)
    }

    const url = `${API_BASE_URL}?table=${endpoint}`
    console.log(`Making API request to: ${url}`)
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      })

      console.log(`API response status: ${response.status}`)
      console.log(`API response headers:`, Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`API Error ${response.status}:`, errorText)
        
        // If it's a Google Sheets authentication error, fall back to mock data
        if (errorText.includes('invalid_grant') || errorText.includes('account not found')) {
          console.warn('Google Sheets authentication failed, falling back to mock data')
          return this.getMockData<T>(endpoint, options)
        }
        
        throw new Error(`API Error: ${response.status} ${response.statusText}`)
      }

      const text = await response.text()
      console.log(`API response text (first 200 chars):`, text.substring(0, 200))
      
      // Check if response is HTML (error page)
      if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
        console.error('API returned HTML instead of JSON. Full response:', text)
        throw new Error('API returned HTML instead of JSON. Check if the Netlify function is deployed correctly.')
      }

      const data = JSON.parse(text)
      console.log(`✅ API returned valid data for ${endpoint}:`, data)
      
      // Process data to ensure correct types
      if (endpoint === 'products') {
        return data.map((product: any) => ({
          ...product,
          quantity: parseInt(product.quantity) || 0,
          cost: parseFloat(product.cost) || 0,
          unitPrice: parseFloat(product.unitPrice) || 0,
          id: product.id || `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }))
      }
      
      if (endpoint === 'customers') {
        return data.map((customer: any) => ({
          ...customer,
          id: customer.id || `customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }))
      }
      
      if (endpoint === 'sales') {
        return data.map((sale: any) => ({
          ...sale,
          quantity: parseInt(sale.quantity) || 0,
          totalValue: parseFloat(sale.totalValue) || 0,
          totalCost: parseFloat(sale.totalCost) || 0,
          profit: parseFloat(sale.profit) || 0,
          id: sale.id || `sale_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }))
      }
      
      return data
    } catch (error) {
      console.error(`❌ API request failed for ${endpoint}:`, error)
      console.warn('Falling back to mock data')
      return this.getMockData<T>(endpoint, options)
    }
  }

  private async getMockData<T>(endpoint: string, _options: RequestInit = {}): Promise<T> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500))

    switch (endpoint) {
      case 'products':
        return mockProducts as T
      case 'customers':
        return mockCustomers as T
      case 'sales':
        return mockSales as T
      default:
        throw new Error(`Unknown endpoint: ${endpoint}`)
    }
  }

  // Products
  async getProducts(): Promise<Product[]> {
    return this.request<Product[]>('products')
  }

  async createProduct(product: Omit<Product, 'id'>): Promise<void> {
    await this.request('products', {
      method: 'POST',
      body: JSON.stringify({
        mode: 'append',
        rows: [product]
      })
    })
  }

  async updateProduct(id: string, product: Partial<Product>): Promise<void> {
    // For now, we'll get all products, update the one we need, and overwrite
    const products = await this.getProducts()
    const index = products.findIndex(p => p.id === id)
    if (index !== -1) {
      products[index] = { ...products[index], ...product }
      await this.request('products', {
        method: 'POST',
        body: JSON.stringify({
          mode: 'overwrite',
          rows: products
        })
      })
    }
  }

  async deleteProduct(id: string): Promise<void> {
    const products = await this.getProducts()
    const filteredProducts = products.filter(p => p.id !== id)
    await this.request('products', {
      method: 'POST',
      body: JSON.stringify({
        mode: 'overwrite',
        rows: filteredProducts
      })
    })
  }

  // Customers
  async getCustomers(): Promise<Customer[]> {
    return this.request<Customer[]>('customers')
  }

  async createCustomer(customer: Omit<Customer, 'id'>): Promise<Customer> {
    console.log('Creating customer:', customer)
    const result = await this.request('customers', {
      method: 'POST',
      body: JSON.stringify({
        mode: 'append',
        rows: [customer]
      })
    })
    console.log('Customer creation result:', result)
    return { ...customer, id: Date.now().toString() } as Customer
  }

  async updateCustomer(id: string, customer: Partial<Customer>): Promise<void> {
    const customers = await this.getCustomers()
    const index = customers.findIndex(c => c.id === id)
    if (index !== -1) {
      customers[index] = { ...customers[index], ...customer }
      await this.request('customers', {
        method: 'POST',
        body: JSON.stringify({
          mode: 'overwrite',
          rows: customers
        })
      })
    }
  }

  // Sales
  async getSales(): Promise<Sale[]> {
    return this.request<Sale[]>('sales')
  }

  async createSale(sale: Omit<Sale, 'id'>): Promise<void> {
    await this.request('sales', {
      method: 'POST',
      body: JSON.stringify({
        mode: 'append',
        rows: [sale]
      })
    })
  }

  // Dashboard
  async getDashboardSummary(): Promise<DashboardSummary> {
    const [products, sales, customers] = await Promise.all([
      this.getProducts(),
      this.getSales(),
      this.getCustomers()
    ])

    const totalSalesValue = sales.reduce((sum, sale) => sum + sale.totalValue, 0)
    const totalProfit = sales.reduce((sum, sale) => sum + sale.profit, 0)
    const lowStockProducts = products.filter(p => p.quantity < 10).length
    const recentSales = sales.slice(-5).reverse()

    // Calculate top products
    const productSales = sales.reduce((acc, sale) => {
      acc[sale.product] = (acc[sale.product] || 0) + sale.quantity
      return acc
    }, {} as Record<string, number>)

    const topProducts = Object.entries(productSales)
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5)

    return {
      totalSalesValue,
      totalProfit,
      totalProducts: products.length,
      totalCustomers: customers.length,
      lowStockProducts,
      recentSales,
      topProducts
    }
  }
}

export const apiService = new ApiService()
