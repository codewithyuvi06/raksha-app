// services/api/client.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_CONFIG } from './config';

const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add Firebase auth token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // Get Firebase token from AsyncStorage
      const firebaseToken = await AsyncStorage.getItem('firebaseToken');
      
      if (firebaseToken) {
        config.headers.Authorization = `Bearer ${firebaseToken}`;
      }
      
      console.log('📤 API Request:', config.method?.toUpperCase(), config.url);
      return config;
    } catch (error) {
      console.error('❌ Request interceptor error:', error);
      return config;
    }
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
  (response) => {
    console.log('📥 API Response:', response.config.url, '→ Success');
    return response;
  },
  async (error) => {
    console.error('❌ API Error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.response?.data?.error || error.message
    });
    
    // Handle 401 Unauthorized - token expired
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('firebaseToken');
      await AsyncStorage.removeItem('userId');
      console.log('🔒 Token expired, please login again');
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;