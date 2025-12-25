// services/api/index.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from './client';
import { API_ENDPOINTS } from './config';

// ==================== TYPES ====================

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relation?: string;
}

export interface TriggerSOSData {
  location: {
    latitude: number;
    longitude: number;
  };
  trigger_type?: 'manual' | 'auto';
}

export interface UpdateProfileData {
  name?: string;
  phone?: string;
  address?: string;
  blood_group?: string;
  medical_info?: string;
}

// ==================== AUTH API ====================

export const authAPI = {
  /**
   * Register new user
   */
  register: async (data: RegisterData) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.REGISTER, data);
      
      // Store Firebase token and user ID
      if (response.data.token) {
        await AsyncStorage.setItem('firebaseToken', response.data.token);
        await AsyncStorage.setItem('userId', response.data.user_id);
        await AsyncStorage.setItem('userEmail', data.email);
      }
      
      console.log('✅ Registration successful');
      return response.data;
    } catch (error: any) {
      console.error('❌ Registration failed:', error.response?.data);
      throw error;
    }
  },

  /**
   * Login user
   */
  login: async (data: LoginData) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.LOGIN, data);
      
      // Store Firebase token and user ID
      if (response.data.token) {
        await AsyncStorage.setItem('firebaseToken', response.data.token);
        await AsyncStorage.setItem('userId', response.data.user_id);
        await AsyncStorage.setItem('userEmail', data.email);
      }
      
      console.log('✅ Login successful');
      return response.data;
    } catch (error: any) {
      console.error('❌ Login failed:', error.response?.data);
      throw error;
    }
  },

  /**
   * Logout user
   */
  logout: async () => {
    try {
      await AsyncStorage.removeItem('firebaseToken');
      await AsyncStorage.removeItem('userId');
      await AsyncStorage.removeItem('userEmail');
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout error:', error);
    }
  },

  /**
   * Check if user is logged in
   */
  isLoggedIn: async (): Promise<boolean> => {
    const token = await AsyncStorage.getItem('firebaseToken');
    return !!token;
  },

  /**
   * Get current user ID
   */
  getCurrentUserId: async (): Promise<string | null> => {
    return await AsyncStorage.getItem('userId');
  }
};

// ==================== USER PROFILE API ====================

export const profileAPI = {
  /**
   * Get user profile
   */
  getProfile: async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.PROFILE);
      console.log('✅ Profile fetched');
      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to fetch profile:', error.response?.data);
      throw error;
    }
  },

  /**
   * Update user profile
   */
  updateProfile: async (data: UpdateProfileData) => {
    try {
      const response = await apiClient.put(API_ENDPOINTS.UPDATE_PROFILE, data);
      console.log('✅ Profile updated');
      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to update profile:', error.response?.data);
      throw error;
    }
  }
};

// ==================== CONTACTS API ====================

export const contactsAPI = {
  /**
   * Get emergency contacts
   */
  getContacts: async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CONTACTS);
      console.log('✅ Contacts fetched:', response.data.count);
      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to fetch contacts:', error.response?.data);
      throw error;
    }
  },

  /**
   * Update emergency contacts
   */
  updateContacts: async (contacts: EmergencyContact[]) => {
    try {
      const response = await apiClient.put(API_ENDPOINTS.UPDATE_CONTACTS, {
        contacts
      });
      console.log('✅ Contacts updated:', contacts.length);
      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to update contacts:', error.response?.data);
      throw error;
    }
  },

  /**
   * Add a single contact
   */
  addContact: async (contact: EmergencyContact) => {
    try {
      // First get existing contacts
      const currentContacts = await contactsAPI.getContacts();
      const contacts = currentContacts.contacts || [];
      
      // Add new contact
      contacts.push(contact);
      
      // Update all contacts
      return await contactsAPI.updateContacts(contacts);
    } catch (error: any) {
      console.error('❌ Failed to add contact:', error.response?.data);
      throw error;
    }
  },

  /**
   * Remove a contact by phone number
   */
  removeContact: async (phone: string) => {
    try {
      // Get existing contacts
      const currentContacts = await contactsAPI.getContacts();
      const contacts = currentContacts.contacts || [];
      
      // Filter out the contact
      const updatedContacts = contacts.filter(
        (c: EmergencyContact) => c.phone !== phone
      );
      
      // Update contacts
      return await contactsAPI.updateContacts(updatedContacts);
    } catch (error: any) {
      console.error('❌ Failed to remove contact:', error.response?.data);
      throw error;
    }
  }
};

// ==================== SOS API ====================

export const sosAPI = {
  /**
   * Trigger emergency SOS
   */
  triggerSOS: async (data: TriggerSOSData) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.TRIGGER_SOS, data);
      console.log('🚨 SOS triggered:', response.data.sos_id);
      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to trigger SOS:', error.response?.data);
      throw error;
    }
  },

  /**
   * Get SOS details
   */
  getSOS: async (sosId: string) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.GET_SOS(sosId));
      console.log('✅ SOS details fetched');
      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to fetch SOS:', error.response?.data);
      throw error;
    }
  },

  /**
   * Deactivate SOS
   */
  deactivateSOS: async (sosId: string) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.DEACTIVATE_SOS, {
        sos_id: sosId
      });
      console.log('✅ SOS deactivated');
      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to deactivate SOS:', error.response?.data);
      throw error;
    }
  },

  /**
   * Get SOS history
   */
  getHistory: async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.SOS_HISTORY);
      console.log('✅ SOS history fetched:', response.data.count);
      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to fetch history:', error.response?.data);
      throw error;
    }
  }
};

// ==================== HEALTH CHECK API ====================

export const healthAPI = {
  /**
   * Check if backend is reachable
   */
  checkHealth: async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.HEALTH);
      console.log('✅ Backend is healthy');
      return response.data;
    } catch (error: any) {
      console.error('❌ Backend health check failed');
      throw error;
    }
  }
};

// Export all APIs
export default {
  auth: authAPI,
  profile: profileAPI,
  contacts: contactsAPI,
  sos: sosAPI,
  health: healthAPI
};