// Configuration for the application
export const config = {
  // API Configuration
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/.netlify/functions/sheets',
  useMockData: import.meta.env.VITE_USE_MOCK_DATA === 'true' || false, // Default to real API
  
  // App Configuration
  appName: 'i e store',
  version: '1.0.0',
  
  // Features
  features: {
    enableAnimations: true,
    enableMockData: false, // Disabled to use real data
    enableGoogleSheets: true, // Enabled to use real Google Sheets
  }
}

// Development helpers
export const isDevelopment = import.meta.env.DEV
export const isProduction = import.meta.env.PROD
