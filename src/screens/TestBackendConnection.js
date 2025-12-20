import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getConfig } from '../config/api';
import { getAlertHistory, registerUser, testConnection, triggerSOS } from '../services/apiService';

export default function TestBackendConnection() {
  const [status, setStatus] = useState('Not tested');
  const [userId, setUserId] = useState(null);
  const [logs, setLogs] = useState([]);

  const addLog = (message, type = 'info') => {
    const emoji = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
    setLogs(prev => [...prev, `${emoji} ${message}`]);
  };

  // Test 1: Connection
  const handleTestConnection = async () => {
    setLogs([]);
    addLog('Testing backend connection...');
    
    const config = getConfig();
    addLog(`Backend: ${config.baseURL}`);
    
    try {
      const result = await testConnection();
      
      if (result.connected) {
        setStatus('✅ Connected');
        addLog('Backend is reachable!', 'success');
        addLog(`Version: ${result.data.version}`, 'info');
        Alert.alert('Success!', 'Backend is connected and working!');
      } else {
        setStatus('❌ Not Connected');
        addLog('Cannot connect to backend', 'error');
        addLog(result.error, 'error');
        Alert.alert('Connection Failed', result.hint || result.error);
      }
    } catch (error) {
      setStatus('❌ Error');
      addLog(`Error: ${error.message}`, 'error');
      Alert.alert('Error', error.message);
    }
  };

  // Test 2: Register User
  const handleTestRegister = async () => {
    addLog('Testing user registration...');
    
    try {
      const userData = {
        phone: '+919876543210',
        name: 'App Test User',
        email: 'apptest@raksha.app',
        emergencyContacts: [
          {
            name: 'Test Contact',
            phone: '+919876543211',
            relation: 'Friend'
          }
        ]
      };
      
      const result = await registerUser(userData);
      
      if (result.success) {
        setUserId(result.data.userId);
        addLog(`User registered: ${result.data.userId}`, 'success');
        Alert.alert('Success!', `User registered!\nID: ${result.data.userId}`);
      }
    } catch (error) {
      addLog(`Registration failed: ${error.message}`, 'error');
      Alert.alert('Registration Failed', error.message);
    }
  };

  // Test 3: Trigger SOS
  const handleTestSOS = async () => {
    if (!userId) {
      Alert.alert('Error', 'Please register user first!');
      return;
    }
    
    addLog('Testing SOS alert...');
    
    try {
      const location = {
        latitude: 22.5726,
        longitude: 88.3639,
        address: 'Test Location, Kolkata'
      };
      
      const result = await triggerSOS(userId, location, 'manual');
      
      if (result.success) {
        addLog(`SOS triggered! Alert ID: ${result.data.alertId}`, 'success');
        addLog(`Contacts notified: ${result.data.contactsNotified}`, 'success');
        Alert.alert(
          'SOS Triggered!', 
          `Alert ID: ${result.data.alertId}\nContacts notified: ${result.data.contactsNotified}\n\nCheck phones for SMS!`
        );
      }
    } catch (error) {
      addLog(`SOS failed: ${error.message}`, 'error');
      Alert.alert('SOS Failed', error.message);
    }
  };

  // Test 4: Get History
  const handleTestHistory = async () => {
    if (!userId) {
      Alert.alert('Error', 'Please register user first!');
      return;
    }
    
    addLog('Testing alert history...');
    
    try {
      const result = await getAlertHistory(userId);
      
      if (result.success) {
        addLog(`Found ${result.count} alerts`, 'success');
        Alert.alert('History Retrieved', `Found ${result.count} alerts`);
      }
    } catch (error) {
      addLog(`History failed: ${error.message}`, 'error');
      Alert.alert('History Failed', error.message);
    }
  };

  // Auto-test on mount
  useEffect(() => {
    handleTestConnection();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Backend Connection Test</Text>
        <Text style={styles.status}>Status: {status}</Text>
        <Text style={styles.config}>Backend: {getConfig().baseURL}</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleTestConnection}>
          <Text style={styles.buttonText}>1. Test Connection</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleTestRegister}>
          <Text style={styles.buttonText}>2. Register User</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleTestSOS}>
          <Text style={styles.buttonText}>3. Trigger SOS</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleTestHistory}>
          <Text style={styles.buttonText}>4. Get History</Text>
        </TouchableOpacity>
      </View>

      {userId && (
        <View style={styles.userIdContainer}>
          <Text style={styles.userIdLabel}>User ID:</Text>
          <Text style={styles.userId}>{userId}</Text>
        </View>
      )}

      <View style={styles.logsContainer}>
        <Text style={styles.logsTitle}>Logs:</Text>
        {logs.map((log, index) => (
          <Text key={index} style={styles.logText}>{log}</Text>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#6200ee',
    padding: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  status: {
    fontSize: 16,
    color: 'white',
    marginBottom: 5,
  },
  config: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  buttonContainer: {
    padding: 20,
  },
  button: {
    backgroundColor: '#6200ee',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  userIdContainer: {
    backgroundColor: 'white',
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 8,
  },
  userIdLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  userId: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  logsContainer: {
    backgroundColor: 'white',
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 8,
  },
  logsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  logText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
    fontFamily: 'monospace',
  },
});