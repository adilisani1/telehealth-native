import axios from 'axios';
import { getToken } from '../utils/tokenStorage';

const BASE_URL = 'https://mrvwhr8v-5000.inc1.devtunnels.ms';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// Helper to get auth headers
const authHeaders = async () => {
  const token = await getToken();
  return { Authorization: `Bearer ${token}` };
};

const healthRecordsApi = {
  // Upload health record (image, pdf, or note)
  uploadHealthRecord: async (data) => {
    try {
      const headers = await authHeaders();
      if (!headers.Authorization) {
        throw new Error('Authentication required. Please log in again.');
      }

      const formData = new FormData();
      
      // Add required fields
      formData.append('type', data.type);
      formData.append('description', data.description);
      
      // Add file if it's image or pdf type
      if (data.type !== 'note' && data.file) {
        formData.append('file', {
          uri: data.file.uri,
          type: data.file.type,
          name: data.file.name || `health_record_${Date.now()}.${data.file.type.split('/')[1]}`,
        });
      }
      
      // Add note data if it's a note type
      if (data.type === 'note' && data.noteData) {
        formData.append('data', data.noteData);
      }

      console.log('📤 Uploading health record:', {
        type: data.type,
        description: data.description,
        hasFile: !!data.file,
        hasNoteData: !!data.noteData
      });

      const response = await api.post('/api/health-records', formData, {
        headers: {
          ...headers,
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('✅ Health record uploaded successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Health record upload error:', error);
      throw error.response?.data || error;
    }
  },

  // Get patient's health records
  getMyHealthRecords: async () => {
    try {
      const headers = await authHeaders();
      if (!headers.Authorization) {
        throw new Error('Authentication required. Please log in again.');
      }

      console.log('📥 Fetching health records...');
      const response = await api.get('/api/health-records', {
        headers,
      });

      console.log('✅ Health records fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Health records fetch error:', error);
      throw error.response?.data || error;
    }
  },

  // Delete health record
  deleteHealthRecord: async (recordId) => {
    try {
      const headers = await authHeaders();
      if (!headers.Authorization) {
        throw new Error('Authentication required. Please log in again.');
      }

      console.log('🗑️ Deleting health record:', recordId);
      const response = await api.delete(`/api/health-records/${recordId}`, {
        headers,
      });

      console.log('✅ Health record deleted successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Health record delete error:', error);
      throw error.response?.data || error;
    }
  },
};

export default healthRecordsApi;
