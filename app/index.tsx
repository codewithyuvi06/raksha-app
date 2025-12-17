import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Alert, Pressable, SafeAreaView, StyleSheet, Text, Vibration, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const [isPressed, setIsPressed] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const insets = useSafeAreaInsets();

  const handlePressIn = () => {
    setIsPressed(true);
    Vibration.vibrate(100);
    
    // Start countdown (3 seconds to trigger)
    let count = 3;
    setCountdown(count);
    
    const interval = setInterval(() => {
      count--;
      setCountdown(count);
      Vibration.vibrate(50);
      
      if (count <= 0) {
        clearInterval(interval);
        triggerEmergency();
      }
    }, 1000);

    // Store interval to clear on release
    // @ts-ignore
    global.emergencyInterval = interval;
  };

  const handlePressOut = () => {
    setIsPressed(false);
    setCountdown(0);
    // @ts-ignore
    if (global.emergencyInterval) {
      // @ts-ignore
      clearInterval(global.emergencyInterval);
    }
  };

  const triggerEmergency = () => {
    Vibration.vibrate([0, 500, 200, 500]);
    Alert.alert(
      '🚨 Emergency Alert Triggered!',
      'Alert sent to your emergency contacts with your location.',
      [{ text: 'OK' }]
    );
    setIsPressed(false);
    setCountdown(0);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0A0A0A' }}>
      <LinearGradient
        colors={['#0A0A0A', '#1A1A1A', '#2A1A1A']}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.appTitle}>Safety Guardian</Text>
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, isMonitoring && styles.statusActive]} />
            <Text style={styles.statusText}>
              {isMonitoring ? 'Monitoring Active' : 'Monitoring Off'}
            </Text>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="location" size={24} color="#34C759" />
            <Text style={styles.statValue}>Active</Text>
            <Text style={styles.statLabel}>Location</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="people" size={24} color="#007AFF" />
            <Text style={styles.statValue}>3</Text>
            <Text style={styles.statLabel}>Contacts</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="shield-checkmark" size={24} color="#FF9500" />
            <Text style={styles.statValue}>Safe</Text>
            <Text style={styles.statLabel}>Status</Text>
          </View>
        </View>

        {/* Emergency Button */}
        <View style={styles.buttonContainer}>
          <Pressable
            style={[styles.button, isPressed && styles.buttonPressed]}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
          >
            <View style={styles.buttonInner}>
              <Text style={styles.buttonText}>
                {countdown > 0 ? countdown : 'SOS'}
              </Text>
              <Text style={styles.buttonSubText}>
                {countdown > 0 ? 'Releasing will cancel' : 'Press & Hold 3s'}
              </Text>
            </View>
            
            {/* Animated rings */}
            {!isPressed && (
              <>
                <View style={[styles.ring, styles.ring1]} />
                <View style={[styles.ring, styles.ring2]} />
              </>
            )}
          </Pressable>
          
          <Text style={styles.instructionText}>
            Hold the button for 3 seconds to trigger emergency alert
          </Text>
        </View>

        {/* Quick Actions with bottom safe area */}
        <View style={[styles.quickActions, { marginBottom: insets.bottom > 0 ? 0 : 20 }]}>
          <Pressable style={styles.actionButton}>
            <Ionicons name="call" size={24} color="#FFFFFF" />
            <Text style={styles.actionText}>Call 911</Text>
          </Pressable>
          
          <Pressable style={styles.actionButton}>
            <Ionicons name="share-social" size={24} color="#FFFFFF" />
            <Text style={styles.actionText}>Share Location</Text>
          </Pressable>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginTop: 20,
    marginBottom: 30,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8E8E93',
    marginRight: 8,
  },
  statusActive: {
    backgroundColor: '#34C759',
  },
  statusText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  buttonPressed: {
    backgroundColor: '#CC0000',
    transform: [{ scale: 0.95 }],
    shadowOpacity: 0.8,
  },
  buttonInner: {
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  buttonSubText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginTop: 8,
    opacity: 0.9,
  },
  ring: {
    position: 'absolute',
    borderRadius: 200,
    borderWidth: 2,
    borderColor: '#FF3B30',
  },
  ring1: {
    width: 240,
    height: 240,
    opacity: 0.3,
  },
  ring2: {
    width: 260,
    height: 260,
    opacity: 0.2,
  },
  instructionText: {
    marginTop: 30,
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});