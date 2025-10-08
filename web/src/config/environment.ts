// Environment configuration
export const environment = {
  // Set to false to use real Google Sheets API
  useMockData: import.meta.env.VITE_USE_MOCK_DATA === 'true' || false, // Only use mock data if explicitly set
  
  // API Configuration
  apiBaseUrl: '/.netlify/functions/sheets',
  
  // App Configuration
  appName: 'i e store',
  version: '1.0.0',
  
  // Features
  features: {
    enableAnimations: true,
    enableMockData: false,
    enableGoogleSheets: true,
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
}

if (import.meta.env.VITE_API_BASE_URL) {
  environment.apiBaseUrl = import.meta.env.VITE_API_BASE_URL
}

export default environment
