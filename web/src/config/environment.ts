// Environment configuration
export const environment = {
  // Use real Google Sheets API now that credentials are working
  useMockData: import.meta.env.DEV || import.meta.env.VITE_USE_MOCK_DATA === 'true',
  
  // API Configuration
  apiBaseUrl: '/.netlify/functions/postgres',
  
  // App Configuration
  appName: 'i e store',
  version: '1.0.0',
  
  // Features
  features: {
    enableAnimations: true,
    enableMockData: false,
    enableGoogleSheets: false,
    enablePostgreSQL: true,
    enableNotifications: true,
    enableOfflineMode: false,
  },
  
  // Development helpers
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
}

// Override with environment variables if available
if (import.meta.env.VITE_USE_MOCK_DATA === 'true') {
  environment.useMockData = true
  environment.features.enableMockData = true
  environment.features.enableGoogleSheets = false
  environment.features.enablePostgreSQL = false
}

if (import.meta.env.VITE_API_BASE_URL) {
  environment.apiBaseUrl = import.meta.env.VITE_API_BASE_URL
}

export default environment
