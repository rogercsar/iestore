// Configuration for the application
export const config = {
  // API Configuration
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/.netlify/functions/postgres',
  useMockData: false, // Always use real data
  
  // App Configuration
  appName: 'i e store',
  version: '1.0.0',
  
  // Features
  features: {
    enableAnimations: true,
    enableMockData: false, // Disabled to use real data
    enablePostgreSQL: true, // Enabled to use real PostgreSQL database
  }
}

// Development helpers
export const isDevelopment = import.meta.env.DEV
export const isProduction = import.meta.env.PROD
