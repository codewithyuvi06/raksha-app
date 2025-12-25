// services/api/config.ts

// ⚠️ CHANGE THIS to your computer's IP address!
const BACKEND_IP = '192.168.0.102'; // Replace with YOUR IP
const BACKEND_PORT = '5000'; // Flask default port

export const API_CONFIG = {
  BASE_URL: `http://${BACKEND_IP}:${BACKEND_PORT}/api`,
  TIMEOUT: 15000, // 15 seconds
};

// API Endpoints matching your Flask backend
export const API_ENDPOINTS = {
  // Health
  HEALTH: '/health',
  
  // Auth
  REGISTER: '/auth/register',
  LOGIN: '/auth/login',
  
  // User Profile
  PROFILE: '/user/profile',
  UPDATE_PROFILE: '/user/profile',
  
  // Emergency Contacts
  CONTACTS: '/user/contacts',
  UPDATE_CONTACTS: '/user/contacts',
  
  // SOS
  TRIGGER_SOS: '/sos/trigger',
  GET_SOS: (sosId: string) => `/sos/${sosId}`,
  DEACTIVATE_SOS: '/sos/deactivate',
  SOS_HISTORY: '/sos/history',
};

console.log('📡 API Base URL:', API_CONFIG.BASE_URL);
console.log('🔥 Using Firebase Authentication');