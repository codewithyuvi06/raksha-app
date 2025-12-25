// test-backend.tsx - Test Backend Connection
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { authAPI, contactsAPI, healthAPI, sosAPI } from './services/api';
import { API_CONFIG } from './services/api/config';

export default function TestBackend() {
  const [results, setResults] = useState([]);

  const addResult = (message) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testHealth = async () => {
    addResult('🧪 Testing health endpoint...');
    try {
      const response = await healthAPI.checkHealth();
      addResult(`✅ Health check passed: ${response.status}`);
      Alert.alert('Success', 'Backend is reachable!');
    } catch (error) {
      addResult(`❌ Health check failed: ${error.message}`);
      Alert.alert('Failed', `Cannot reach backend.\n\nMake sure:\n1. Flask server is running\n2. You're on the same WiFi\n3. IP address is correct in config.ts`);
    }
  };

  const testRegister = async () => {
    addResult('🧪 Testing registration...');
    try {
      const testUser = {
        email: `test${Date.now()}@example.com`,
        password: 'Test123!',
        name: 'Test User',
        phone: `+91${Math.floor(1000000000 + Math.random() * 9000000000)}`
      };
      
      const response = await authAPI.register(testUser);
      addResult(`✅ Registration successful: ${response.user_id}`);
      Alert.alert('Success', `User registered!\nUser ID: ${response.user_id}`);
    } catch (error) {
      addResult(`❌ Registration failed: ${error.response?.data?.error || error.message}`);
      Alert.alert('Failed', error.response?.data?.error || error.message);
    }
  };

  const testSOS = async () => {
    addResult('🧪 Testing SOS trigger...');
    
    const isLoggedIn = await authAPI.isLoggedIn();
    if (!isLoggedIn) {
      addResult('❌ Not logged in. Register first.');
      Alert.alert('Error', 'Please register/login first');
      return;
    }

    try {
      const response = await sosAPI.triggerSOS({
        location: {
          latitude: 28.6139,
          longitude: 77.2090
        },
        trigger_type: 'manual'
      });
      addResult(`✅ SOS triggered: ${response.sos_id}`);
      Alert.alert('Success', `SOS sent!\nID: ${response.sos_id}\nLocation: ${response.location_url}`);
    } catch (error) {
      addResult(`❌ SOS failed: ${error.response?.data?.error || error.message}`);
      Alert.alert('Failed', error.response?.data?.error || error.message);
    }
  };

  const testContacts = async () => {
    addResult('🧪 Testing contacts...');
    
    const isLoggedIn = await authAPI.isLoggedIn();
    if (!isLoggedIn) {
      addResult('❌ Not logged in. Register first.');
      Alert.alert('Error', 'Please register/login first');
      return;
    }

    try {
      // Add test contacts
      const testContacts = [
        { name: 'Emergency Contact 1', phone: '+919876543210', relation: 'Friend' },
        { name: 'Emergency Contact 2', phone: '+919876543211', relation: 'Family' }
      ];
      
      await contactsAPI.updateContacts(testContacts);
      addResult(`✅ Contacts updated: ${testContacts.length}`);
      
      // Get contacts
      const response = await contactsAPI.getContacts();
      addResult(`✅ Contacts retrieved: ${response.count}`);
      Alert.alert('Success', `Contacts added: ${response.count}`);
    } catch (error) {
      addResult(`❌ Contacts failed: ${error.response?.data?.error || error.message}`);
      Alert.alert('Failed', error.response?.data?.error || error.message);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Backend Connection Test</Text>
      
      <View style={styles.infoCard}>
        <Text style={styles.infoLabel}>Backend URL:</Text>
        <Text style={styles.infoValue}>{API_CONFIG.BASE_URL}</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={testHealth}>
          <Text style={styles.buttonText}>1. Test Health</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={testRegister}>
          <Text style={styles.buttonText}>2. Test Register</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={testSOS}>
          <Text style={styles.buttonText}>3. Test SOS</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={testContacts}>
          <Text style={styles.buttonText}>4. Test Contacts</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.clearButton]} onPress={clearResults}>
          <Text style={styles.buttonText}>Clear Results</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.resultsContainer}>
        <Text style={styles.resultsTitle}>Test Results:</Text>
        {results.length === 0 ? (
          <Text style={styles.noResults}>No tests run yet</Text>
        ) : (
          results.map((result, index) => (
            <Text key={index} style={styles.resultText}>{result}</Text>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  infoCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  infoLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 5,
  },
  infoValue: {
    fontSize: 12,
    color: '#2C3E50',
    fontFamily: 'monospace',
  },
  buttonContainer: {
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#5F27CD',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  clearButton: {
    backgroundColor: '#E74C3C',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: '#2C3E50',
    borderRadius: 10,
    padding: 15,
  },
  resultsTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  resultText: {
    color: '#ECF0F1',
    fontSize: 12,
    marginBottom: 5,
    fontFamily: 'monospace',
  },
  noResults: {
    color: '#7F8C8D',
    fontSize: 14,
    fontStyle: 'italic',
  },
});