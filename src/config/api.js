/**
 * API Configuration
 * 
 * IMPORTANT: Change BACKEND_IP to your computer's IP address
 */

// ========================================
// CONFIGURATION
// ========================================

// TODO: Replace with your computer's IP address
const BACKEND_IP = "192.168.1.18";  // ← CHANGE THIS!
const BACKEND_PORT = "5000";

// Build base URL
export const API_BASE_URL = `http://${BACKEND_IP}:${BACKEND_PORT}`;

// ========================================
// API ENDPOINTS
// ========================================

export const API_ENDPOINTS = {
  // Health Check
  HEALTH: `${API_BASE_URL}/`,
  
  // Authentication
  REGISTER: `${API_BASE_URL}/api/auth/register`,
  GET_PROFILE: (userId) => `${API_BASE_URL}/api/auth/profile/${userId}`,
  UPDATE_CONTACTS: (userId) => `${API_BASE_URL}/api/auth/contacts/${userId}`,
  
  // SOS Alerts
  TRIGGER_SOS: `${API_BASE_URL}/api/sos/trigger`,
  GET_ALERT: (alertId) => `${API_BASE_URL}/api/sos/alert/${alertId}`,
  UPDATE_ALERT_STATUS: (alertId) => `${API_BASE_URL}/api/sos/alert/${alertId}/status`,
  GET_ALERT_HISTORY: (userId) => `${API_BASE_URL}/api/sos/history/${userId}`,
  
  // Evidence Upload
  UPLOAD_EVIDENCE: `${API_BASE_URL}/api/evidence/upload`,
  GET_ALERT_EVIDENCE: (alertId) => `${API_BASE_URL}/api/evidence/alert/${alertId}`,
  
  // AI Danger Detection
  DETECT_DANGER: `${API_BASE_URL}/api/ai/detect-danger`,
};

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Check if backend is reachable
 */
export const checkBackendConnection = async () => {
  try {
    const response = await fetch(API_ENDPOINTS.HEALTH, {
      method: 'GET',
      timeout: 5000,
    });
    
    if (response.ok) {
      const data = await response.json();
      return {
        connected: true,
        data: data,
      };
    }
    
    return {
      connected: false,
      error: 'Backend responded with error',
    };
  } catch (error) {
    return {
      connected: false,
      error: error.message,
    };
  }
};

/**
 * Get current configuration
 */
export const getConfig = () => {
  return {
    backendIP: BACKEND_IP,
    backendPort: BACKEND_PORT,
    baseURL: API_BASE_URL,
  };
};

export default API_BASE_URL;