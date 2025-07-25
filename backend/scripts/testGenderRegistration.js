/**
 * Test the fixed gender registration
 * This script tests if gender is properly saved during registration
 */

const testGenderRegistration = async () => {
  try {
    console.log('🧪 Testing Gender Registration Fix');
    console.log('===================================');
    
    const testUserData = {
      name: 'Test Patient',
      email: 'test.patient.gender@example.com',
      phone: '+1234567890123', // Unique phone for testing
      password: 'testpass123',
      role: 'patient',
      gender: 'Female', // This should be normalized to 'female'
      dob: '1990-01-01',
      consent: true
    };
    
    console.log('📤 Sending registration request with data:');
    console.log(JSON.stringify(testUserData, null, 2));
    
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUserData)
    });
    
    const result = await response.json();
    
    console.log('📥 Registration response:');
    console.log('   - Status:', response.status);
    console.log('   - Success:', result.success);
    console.log('   - Message:', result.message);
    
    if (result.success && result.data) {
      console.log('   - User ID:', result.data._id);
      console.log('   - User Name:', result.data.name);
      console.log('   - User Gender:', result.data.gender);
      console.log('   - User DOB:', result.data.dob);
      
      if (result.data.gender === 'female') {
        console.log('✅ SUCCESS: Gender was properly normalized and saved!');
      } else {
        console.log('❌ FAILED: Gender normalization issue. Expected "female", got:', result.data.gender);
      }
    } else {
      console.log('❌ Registration failed:', result.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
};

// Run the test if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testGenderRegistration();
}

export { testGenderRegistration };
