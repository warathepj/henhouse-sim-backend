// Use ES module imports
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('Testing API endpoint...');

// Create sample data that exactly matches the expected format
const sampleData = {
  timestamp: new Date().toISOString(),
  coopA: { corner: 25.5, center: 26.2 },
  coopB: { corner: 24.8, center: 25.3 },
  coopC: { center: 25.1 },
  ventilation: { main: 23.5, secondary: 24.0, east: 24.2 },
  processing: { eggWashing: 22.5, eggStorage: 18.2 }
};

// Keep the dynamic import for fetch
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testApiEndpoint() {
  try {
    // Make sure to include all headers that might be expected
    const response = await fetch('http://localhost:3000/api/temperature-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:8080',  // Match one of your allowed origins exactly
        'Accept': 'application/json'
      },
      body: JSON.stringify(sampleData)
    });
    
    console.log('Response status:', response.status);
    
    // Handle different response types
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const result = await response.json();
      console.log('API Response:', result);
    } else {
      const text = await response.text();
      console.log('API Response (text):', text);
    }
  } catch (error) {
    console.error('Error testing API endpoint:', error);
    console.error('Error details:', error.message);
  }
}

testApiEndpoint();