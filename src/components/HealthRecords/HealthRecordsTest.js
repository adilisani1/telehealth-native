// Test script for Health Records API
// Run in React Native Debugger or add to a test component

import healthRecordsApi from '../services/healthRecordsApi';

// Test health records upload
export const testHealthRecordsUpload = async () => {
  try {
    console.log('🧪 Testing Health Records Upload...');
    
    // Test note upload
    const noteResult = await healthRecordsApi.uploadHealthRecord({
      type: 'note',
      description: 'Test medical note',
      noteData: 'Patient reports mild headache, no fever.'
    });
    
    console.log('✅ Note upload successful:', noteResult);
    
    // Test fetching records
    const records = await healthRecordsApi.getMyHealthRecords();
    console.log('✅ Fetch records successful:', records);
    
    return true;
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
};

// Test with mock data
export const mockHealthRecordsData = {
  image: {
    type: 'image',
    description: 'X-ray scan of chest',
    file: {
      uri: 'file://path/to/image.jpg',
      type: 'image/jpeg',
      name: 'chest_xray.jpg',
      size: 1024000 // 1MB
    }
  },
  note: {
    type: 'note',
    description: 'Consultation notes',
    noteData: 'Patient complains of back pain lasting 3 days. No fever or other symptoms.'
  }
};

export default { testHealthRecordsUpload, mockHealthRecordsData };
