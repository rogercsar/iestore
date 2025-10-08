// Debug service to test API connection
import { environment } from '../config/environment'

export const debugApi = {
  async testConnection() {
    try {
      console.log('🔍 Testing API connection...')
      console.log('Environment:', {
        isDev: environment.isDevelopment,
        isProd: environment.isProduction,
        useMockData: environment.useMockData,
        apiBaseUrl: environment.apiBaseUrl
      })

      // Test basic connection
      const response = await fetch('/.netlify/functions/test')
      console.log('Test function response:', response.status, response.statusText)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Test function data:', data)
      }

      // Test products endpoint
      const productsResponse = await fetch('/.netlify/functions/sheets?table=products')
      console.log('Products endpoint response:', productsResponse.status, productsResponse.statusText)
      
      if (productsResponse.ok) {
        const productsData = await productsResponse.text()
        console.log('Products data (first 500 chars):', productsData.substring(0, 500))
        
        try {
          const parsed = JSON.parse(productsData)
          console.log('Parsed products:', parsed)
        } catch (e) {
          console.error('Failed to parse products JSON:', e)
        }
      } else {
        const errorText = await productsResponse.text()
        console.error('Products endpoint error:', errorText)
      }

      // Test customers endpoint
      const customersResponse = await fetch('/.netlify/functions/sheets?table=customers')
      console.log('Customers endpoint response:', customersResponse.status, customersResponse.statusText)
      
      if (customersResponse.ok) {
        const customersData = await customersResponse.text()
        console.log('Customers data (first 500 chars):', customersData.substring(0, 500))
      } else {
        const errorText = await customersResponse.text()
        console.error('Customers endpoint error:', errorText)
      }

    } catch (error) {
      console.error('Debug API test failed:', error)
    }
  },

  async testCreateCustomer() {
    try {
      console.log('🔍 Testing customer creation...')
      
      const testCustomer = {
        name: 'Test Customer',
        phone: '123456789',
        email: 'test@example.com',
        address: 'Test Address'
      }

      const response = await fetch('/.netlify/functions/sheets?table=customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mode: 'append',
          rows: [testCustomer]
        })
      })

      console.log('Create customer response:', response.status, response.statusText)
      
      if (response.ok) {
        const data = await response.text()
        console.log('Create customer success:', data)
      } else {
        const errorText = await response.text()
        console.error('Create customer error:', errorText)
      }

    } catch (error) {
      console.error('Debug create customer failed:', error)
    }
  }
}

// Make it available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).debugApi = debugApi
}
