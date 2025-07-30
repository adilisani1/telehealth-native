// Simple test script to verify the missed appointments API endpoint
const fetch = require('node-fetch');

const testMissedAPI = async () => {
  try {
    console.log('🧪 Testing missed appointments API endpoint...');
    
    const response = await fetch('http://localhost:5000/api/appointments/missed', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // You'll need to add your auth token here
        // 'Authorization': 'Bearer YOUR_TOKEN_HERE'
      }
    });
    
    console.log('📊 Response status:', response.status);
    console.log('📊 Response headers:', response.headers);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API Response:', data);
    } else {
      console.log('❌ API Error:', response.statusText);
      const errorData = await response.text();
      console.log('❌ Error details:', errorData);
    }
  } catch (error) {
    console.error('❌ Network error:', error);
  }
};

testMissedAPI();
