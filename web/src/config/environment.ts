// Environment configuration
export const environment = {
  // API Configuration
  apiBaseUrl: '/.netlify/functions/postgres',
  
  // App Configuration
  appName: 'i e store',
  version: '1.0.0',
  
  // Features
  features: {
    enableAnimations: true,
    enablePostgreSQL: true,
    enableNotifications: true,
    enableOfflineMode: false,
  },
  
  // Development helpers
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
}

// Override with environment variables if available
if (import.meta.env.VITE_API_BASE_URL) {
  environment.apiBaseUrl = import.meta.env.VITE_API_BASE_URL
}

export default environment
