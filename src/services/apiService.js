/**
 * API Service
 * All backend API calls
 */

import { API_ENDPOINTS } from '../config/api';

// ========================================
// AUTHENTICATION SERVICES
// ========================================

/**
 * Register a new user
 */
export const registerUser = async (userData) => {
  try {
    console.log('📤 API: Registering user...', userData);
    
    const response = await fetch(API_ENDPOINTS.REGISTER, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }
    
    console.log('✅ API: User registered', data);
    return data;
  } catch (error) {
    console.error('❌ API: Register error:', error);
    throw error;
  }
};

/**
 * Get user profile
 */
export const getUserProfile = async (userId) => {
  try {
    console.log('📤 API: Getting profile for', userId);
    
    const response = await fetch(API_ENDPOINTS.GET_PROFILE(userId));
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to get profile');
    }
    
    console.log('✅ API: Profile retrieved');
    return data;
  } catch (error) {
    console.error('❌ API: Profile error:', error);
    throw error;
  }
};

/**
 * Update emergency contacts
 */
export const updateEmergencyContacts = async (userId, contacts) => {
  try {
    console.log('📤 API: Updating contacts...', contacts);
    
    const response = await fetch(API_ENDPOINTS.UPDATE_CONTACTS(userId), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ emergencyContacts: contacts }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update contacts');
    }
    
    console.log('✅ API: Contacts updated');
    return data;
  } catch (error) {
    console.error('❌ API: Update contacts error:', error);
    throw error;
  }
};

// ========================================
// SOS ALERT SERVICES
// ========================================

/**
 * Trigger SOS alert
 */
export const triggerSOS = async (userId, location, type = 'manual') => {
  try {
    console.log('📤 API: Triggering SOS...', { userId, location });
    
    const response = await fetch(API_ENDPOINTS.TRIGGER_SOS, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        location,
        type,
      }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to trigger SOS');
    }
    
    console.log('✅ API: SOS triggered', data);
    return data;
  } catch (error) {
    console.error('❌ API: SOS error:', error);
    throw error;
  }
};

/**
 * Get alert history
 */
export const getAlertHistory = async (userId) => {
  try {
    console.log('📤 API: Getting alert history for', userId);
    
    const response = await fetch(API_ENDPOINTS.GET_ALERT_HISTORY(userId));
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to get history');
    }
    
    console.log('✅ API: History retrieved', data.count, 'alerts');
    return data;
  } catch (error) {
    console.error('❌ API: History error:', error);
    throw error;
  }
};

// ========================================
// EVIDENCE UPLOAD SERVICE
// ========================================

/**
 * Upload evidence file
 */
export const uploadEvidence = async (file, alertId, userId, type) => {
  try {
    console.log('📤 API: Uploading evidence...', type);
    
    const formData = new FormData();
    
    // Add file
    formData.append('file', {
      uri: file.uri,
      type: file.type || 'image/jpeg',
      name: file.fileName || `evidence.${type}`,
    });
    
    // Add metadata
    formData.append('alertId', alertId);
    formData.append('userId', userId);
    formData.append('type', type);
    
    const response = await fetch(API_ENDPOINTS.UPLOAD_EVIDENCE, {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to upload evidence');
    }
    
    console.log('✅ API: Evidence uploaded', data.data.url);
    return data;
  } catch (error) {
    console.error('❌ API: Upload error:', error);
    throw error;
  }
};

// ========================================
// AI DETECTION SERVICE
// ========================================

/**
 * Detect danger in audio
 */
export const detectDanger = async (audioFile) => {
  try {
    console.log('📤 API: Analyzing audio...');
    
    const formData = new FormData();
    formData.append('audio', {
      uri: audioFile.uri,
      type: audioFile.type || 'audio/wav',
      name: audioFile.fileName || 'audio.wav',
    });
    
    const response = await fetch(API_ENDPOINTS.DETECT_DANGER, {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to detect danger');
    }
    
    console.log('✅ API: Analysis complete', data.analysis);
    return data;
  } catch (error) {
    console.error('❌ API: Detection error:', error);
    throw error;
  }
};

// ========================================
// CONNECTION TEST
// ========================================

/**
 * Test backend connection
 */
export const testConnection = async () => {
  try {
    console.log('📤 API: Testing connection...');
    
    const response = await fetch(API_ENDPOINTS.HEALTH, {
      method: 'GET',
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ API: Backend connected!');
      return { connected: true, data };
    }
    
    console.log('⚠️  API: Backend responded but with error');
    return { connected: false, error: 'Backend error' };
    
  } catch (error) {
    console.error('❌ API: Connection failed:', error.message);
    return { 
      connected: false, 
      error: error.message,
      hint: 'Check if backend is running and IP address is correct'
    };
  }
};