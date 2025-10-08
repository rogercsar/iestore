// Test script to check if the Netlify function is working
async function testAPI() {
  try {
    console.log('Testing API connection...')
    
    // Test the Netlify function
    const response = await fetch('/.netlify/functions/sheets?table=products')
    
    console.log('Response status:', response.status)
    console.log('Response headers:', Object.fromEntries(response.headers.entries()))
    
    const text = await response.text()
    console.log('Response text (first 200 chars):', text.substring(0, 200))
    
    if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
      console.error('❌ API returned HTML instead of JSON')
      console.log('Full response:', text)
    } else {
      try {
        const data = JSON.parse(text)
        console.log('✅ API returned valid JSON:', data)
      } catch (e) {
        console.error('❌ Failed to parse JSON:', e)
        console.log('Raw response:', text)
      }
    }
  } catch (error) {
    console.error('❌ API test failed:', error)
  }
}

// Run the test
testAPI()
