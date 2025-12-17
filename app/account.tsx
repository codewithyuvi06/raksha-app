import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AccountScreen() {
  const [userData, setUserData] = useState<any>(null);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userDataStr = await AsyncStorage.getItem('userData');
      if (userDataStr) {
        setUserData(JSON.parse(userDataStr));
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.setItem('isLoggedIn', 'false');
          router.replace('login' as any);
        },
      },
    ]);
  };

  const MenuItem = ({ icon, title, subtitle, onPress, danger }: any) => (
    <Pressable style={styles.menuItem} onPress={onPress}>
      <View style={[styles.menuIcon, danger && styles.menuIconDanger]}>
        <Ionicons name={icon} size={24} color={danger ? '#FF3B30' : '#FFFFFF'} />
      </View>
      <View style={styles.menuContent}>
        <Text style={[styles.menuTitle, danger && styles.menuTitleDanger]}>{title}</Text>
        {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
      </View>
      {!danger && <Ionicons name="chevron-forward" size={20} color="#8E8E93" />}
    </Pressable>
  );

  return (
    <LinearGradient colors={['#0A0A0A', '#1A1A1A']} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
          <Text style={styles.title}>Account</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <LinearGradient colors={['#FF3B30', '#FF6B30']} style={styles.avatar}>
              <Text style={styles.avatarText}>
                {userData?.name?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </LinearGradient>
          </View>
          <Text style={styles.profileName}>{userData?.name || 'User'}</Text>
          <Text style={styles.profileEmail}>{userData?.email || 'user@example.com'}</Text>
          <Text style={styles.profilePhone}>{userData?.phone || '+91 XXXXX XXXXX'}</Text>
        </View>

        {/* Menu Section: Account */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ACCOUNT</Text>
          <View style={styles.menuContainer}>
            <MenuItem
              icon="person-outline"
              title="Edit Profile"
              subtitle="Update your personal information"
              onPress={() => Alert.alert('Edit Profile', 'Coming soon!')}
            />
            <MenuItem
              icon="shield-checkmark-outline"
              title="Privacy & Security"
              subtitle="Manage your privacy settings"
              onPress={() => Alert.alert('Privacy', 'Coming soon!')}
            />
            <MenuItem
              icon="key-outline"
              title="Change Password"
              subtitle="Update your password"
              onPress={() => Alert.alert('Change Password', 'Coming soon!')}
            />
          </View>
        </View>

        {/* Menu Section: Emergency */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>EMERGENCY</Text>
          <View style={styles.menuContainer}>
            <MenuItem
              icon="people-outline"
              title="Emergency Contacts"
              subtitle="Manage trusted contacts"
              onPress={() => router.push('/contacts')}
            />
            <MenuItem
              icon="notifications-outline"
              title="Alert Settings"
              subtitle="Configure alert preferences"
              onPress={() => Alert.alert('Alert Settings', 'Coming soon!')}
            />
            <MenuItem
              icon="location-outline"
              title="Location Permissions"
              subtitle="Manage location access"
              onPress={() => Alert.alert('Location', 'Coming soon!')}
            />
          </View>
        </View>

        {/* Menu Section: App */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>APP</Text>
          <View style={styles.menuContainer}>
            <MenuItem
              icon="information-circle-outline"
              title="About R.A.K.S.H.A"
              subtitle="Version 1.0.0"
              onPress={() => Alert.alert('About', 'R.A.K.S.H.A v1.0.0\nAI Women Safety App')}
            />
            <MenuItem
              icon="help-circle-outline"
              title="Help & Support"
              subtitle="Get help and contact support"
              onPress={() => Alert.alert('Help', 'Coming soon!')}
            />
            <MenuItem
              icon="document-text-outline"
              title="Terms & Conditions"
              subtitle="Read our terms of service"
              onPress={() => Alert.alert('Terms', 'Coming soon!')}
            />
          </View>
        </View>

        {/* Logout Button */}
        <View style={styles.section}>
          <View style={styles.menuContainer}>
            <MenuItem
              icon="log-out-outline"
              title="Logout"
              onPress={handleLogout}
              danger={true}
            />
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  profileCard: {
    backgroundColor: '#1C1C1E',
    marginHorizontal: 20,
    marginBottom: 30,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  profilePhone: {
    fontSize: 14,
    color: '#8E8E93',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    marginLeft: 20,
    marginBottom: 8,
  },
  menuContainer: {
    backgroundColor: '#1C1C1E',
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2C2C2E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuIconDanger: {
    backgroundColor: '#FF3B3020',
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  menuTitleDanger: {
    color: '#FF3B30',
  },
  menuSubtitle: {
    fontSize: 13,
    color: '#8E8E93',
  },
});