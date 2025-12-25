// app/index.tsx - Home Screen with Flask Backend Integration
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { authAPI, contactsAPI, profileAPI, sosAPI } from '../src/services/api';

export default function HomeScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('User');
  const [contactsCount, setContactsCount] = useState(0);

  useEffect(() => {
    checkLoginStatus();
    requestLocationPermission();
    loadContacts();
  }, []);

  const checkLoginStatus = async () => {
    const loggedIn = await authAPI.isLoggedIn();
    setIsLoggedIn(loggedIn);
    
    if (loggedIn) {
      try {
        const profile = await profileAPI.getProfile();
        setUserName(profile.data?.profile?.name || 'User');
      } catch (error) {
        console.error('Failed to load profile');
      }
    }
  };

  const requestLocationPermission = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required for emergency alerts');
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      console.log('📍 Location obtained:', location.coords.latitude, location.coords.longitude);
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert('Location Error', 'Could not get your location');
    }
  };

  const loadContacts = async () => {
    try {
      const response = await contactsAPI.getContacts();
      setContactsCount(response.count || 0);
    } catch (error) {
      console.error('Failed to load contacts');
    }
  };

  const handleEmergency = async () => {
    if (!isLoggedIn) {
      Alert.alert('Not Logged In', 'Please login to use emergency features');
      return;
    }

    if (!location) {
      Alert.alert('Location Required', 'Getting your location...');
      await requestLocationPermission();
      return;
    }

    Alert.alert(
      '🚨 EMERGENCY ALERT',
      'This will send an emergency alert to all your contacts with your location. Continue?',
      [
        { 
          text: 'Cancel', 
          style: 'cancel' 
        },
        {
          text: 'SEND ALERT',
          style: 'destructive',
          onPress: sendEmergencyAlert
        }
      ]
    );
  };

  const sendEmergencyAlert = async () => {
    setIsLoading(true);
    try {
      if (!location) {
        throw new Error('Location not available');
      }

      console.log('🚨 Triggering SOS...');
      
      const response = await sosAPI.triggerSOS({
        location: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        },
        trigger_type: 'manual'
      });

      console.log('✅ SOS Response:', response);

      Alert.alert(
        '✅ Alert Sent!',
        `Emergency alert sent successfully!\n\nSOS ID: ${response.sos_id}\n\nYour emergency contacts have been notified with your location.`,
        [
          {
            text: 'View Location',
            onPress: () => {
              console.log('Location URL:', response.location_url);
              // You can open the URL with Linking.openURL(response.location_url)
            }
          },
          { text: 'OK' }
        ]
      );

    } catch (error: any) {
      console.error('❌ Emergency alert failed:', error);
      
      let errorMessage = 'Failed to send emergency alert. Please try again.';
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🛡️ R.A.K.S.H.A</Text>
        <Text style={styles.subtitle}>Safety Guardian</Text>
      </View>

      {/* User Info */}
      {isLoggedIn && (
        <View style={styles.userInfo}>
          <Text style={styles.userName}>Welcome, {userName}</Text>
          <Text style={styles.contactsInfo}>
            {contactsCount} Emergency Contact{contactsCount !== 1 ? 's' : ''}
          </Text>
        </View>
      )}

      {/* Emergency Button */}
      <TouchableOpacity 
        style={[styles.emergencyButton, isLoading && styles.buttonDisabled]}
        onPress={handleEmergency}
        activeOpacity={0.8}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="large" color="white" />
        ) : (
          <>
            <Ionicons name="warning" size={70} color="white" />
            <Text style={styles.emergencyText}>EMERGENCY</Text>
            <Text style={styles.emergencySubtext}>Tap to send alert</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Status Cards */}
      <View style={styles.statusContainer}>
        {/* Location Status */}
        <View style={styles.statusCard}>
          <Ionicons 
            name={location ? "location" : "location-outline"} 
            size={24} 
            color={location ? "#2ECC71" : "#95A5A6"} 
          />
          <View style={styles.statusTextContainer}>
            <Text style={styles.statusLabel}>Location</Text>
            <Text style={styles.statusValue}>
              {location 
                ? `${location.coords.latitude.toFixed(4)}, ${location.coords.longitude.toFixed(4)}`
                : 'Getting location...'}
            </Text>
          </View>
        </View>

        {/* Connection Status */}
        <View style={styles.statusCard}>
          <Ionicons 
            name={isLoggedIn ? "shield-checkmark" : "shield-outline"} 
            size={24} 
            color={isLoggedIn ? "#2ECC71" : "#E74C3C"} 
          />
          <View style={styles.statusTextContainer}>
            <Text style={styles.statusLabel}>Status</Text>
            <Text style={styles.statusValue}>
              {isLoggedIn ? 'Protected' : 'Not Logged In'}
            </Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => {/* Navigate to contacts screen */}}
        >
          <Ionicons name="people" size={24} color="#5F27CD" />
          <Text style={styles.actionText}>Contacts</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => {/* Navigate to history screen */}}
        >
          <Ionicons name="time" size={24} color="#5F27CD" />
          <Text style={styles.actionText}>History</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => {/* Navigate to settings */}}
        >
          <Ionicons name="settings" size={24} color="#5F27CD" />
          <Text style={styles.actionText}>Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  subtitle: {
    fontSize: 16,
    color: '#7F8C8D',
    marginTop: 5,
  },
  userInfo: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
  },
  contactsInfo: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 5,
  },
  emergencyButton: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#FF4757',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginVertical: 30,
    shadowColor: '#FF4757',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 15,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  emergencyText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  emergencySubtext: {
    color: 'white',
    fontSize: 12,
    marginTop: 5,
    opacity: 0.9,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statusCard: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusTextContainer: {
    marginLeft: 10,
    flex: 1,
  },
  statusLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 2,
  },
  statusValue: {
    fontSize: 11,
    color: '#2C3E50',
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  actionButton: {
    alignItems: 'center',
    padding: 15,
  },
  actionText: {
    marginTop: 5,
    fontSize: 12,
    color: '#2C3E50',
  },
});