import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

// Mock data for demonstration
const mockAlerts = [
  {
    id: '1',
    type: 'manual',
    severity: 'CRITICAL',
    timestamp: '2024-01-15 22:45',
    location: 'Park Street, Kolkata',
    status: 'resolved',
    contactsNotified: 3,
  },
  {
    id: '2',
    type: 'ai_detected',
    severity: 'HIGH',
    timestamp: '2024-01-14 20:30',
    location: 'Salt Lake, Kolkata',
    status: 'resolved',
    contactsNotified: 3,
  },
  {
    id: '3',
    type: 'manual',
    severity: 'MEDIUM',
    timestamp: '2024-01-12 18:15',
    location: 'Ballygunge, Kolkata',
    status: 'resolved',
    contactsNotified: 2,
  },
];

export default function AlertsScreen() {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return '#FF3B30';
      case 'HIGH': return '#FF9500';
      case 'MEDIUM': return '#FFCC00';
      default: return '#34C759';
    }
  };

  const getAlertIcon = (type: string) => {
    return type === 'manual' ? 'hand-left' : 'analytics';
  };

  const getAlertTypeText = (type: string) => {
    return type === 'manual' ? 'Manual Trigger' : 'AI Detected';
  };

  return (
    <LinearGradient
      colors={['#0A0A0A', '#1A1A1A']}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Alert History</Text>
        <Text style={styles.subtitle}>
          {mockAlerts.length} alerts recorded
        </Text>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Ionicons name="alert-circle" size={24} color="#FF3B30" />
          <Text style={styles.summaryValue}>3</Text>
          <Text style={styles.summaryLabel}>Total Alerts</Text>
        </View>

        <View style={styles.summaryCard}>
          <Ionicons name="checkmark-circle" size={24} color="#34C759" />
          <Text style={styles.summaryValue}>3</Text>
          <Text style={styles.summaryLabel}>Resolved</Text>
        </View>

        <View style={styles.summaryCard}>
          <Ionicons name="people" size={24} color="#007AFF" />
          <Text style={styles.summaryValue}>3</Text>
          <Text style={styles.summaryLabel}>Contacts</Text>
        </View>
      </View>

      {/* Alerts List */}
      <ScrollView 
        style={styles.alertsList}
        showsVerticalScrollIndicator={false}
      >
        {mockAlerts.length > 0 ? (
          mockAlerts.map((alert) => (
            <Pressable key={alert.id} style={styles.alertCard}>
              {/* Severity Indicator */}
              <View 
                style={[
                  styles.severityBar, 
                  { backgroundColor: getSeverityColor(alert.severity) }
                ]} 
              />

              <View style={styles.alertContent}>
                {/* Header Row */}
                <View style={styles.alertHeader}>
                  <View style={styles.alertTypeContainer}>
                    <Ionicons 
                      name={getAlertIcon(alert.type)} 
                      size={20} 
                      color={getSeverityColor(alert.severity)} 
                    />
                    <Text style={styles.alertType}>
                      {getAlertTypeText(alert.type)}
                    </Text>
                  </View>
                  <View 
                    style={[
                      styles.severityBadge,
                      { backgroundColor: getSeverityColor(alert.severity) + '20' }
                    ]}
                  >
                    <Text 
                      style={[
                        styles.severityText,
                        { color: getSeverityColor(alert.severity) }
                      ]}
                    >
                      {alert.severity}
                    </Text>
                  </View>
                </View>

                {/* Location */}
                <View style={styles.alertRow}>
                  <Ionicons name="location" size={16} color="#8E8E93" />
                  <Text style={styles.alertLocation}>{alert.location}</Text>
                </View>

                {/* Time */}
                <View style={styles.alertRow}>
                  <Ionicons name="time" size={16} color="#8E8E93" />
                  <Text style={styles.alertTime}>{alert.timestamp}</Text>
                </View>

                {/* Footer */}
                <View style={styles.alertFooter}>
                  <View style={styles.contactsInfo}>
                    <Ionicons name="checkmark-circle" size={16} color="#34C759" />
                    <Text style={styles.contactsText}>
                      {alert.contactsNotified} contacts notified
                    </Text>
                  </View>
                  
                  <Pressable style={styles.detailsButton}>
                    <Text style={styles.detailsText}>Details</Text>
                    <Ionicons name="chevron-forward" size={16} color="#007AFF" />
                  </Pressable>
                </View>
              </View>
            </Pressable>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="shield-checkmark" size={64} color="#3A3A3C" />
            <Text style={styles.emptyTitle}>No Alerts Yet</Text>
            <Text style={styles.emptyText}>
              Your emergency alerts will appear here
            </Text>
          </View>
        )}

        {/* Bottom Spacing */}
        <View style={{ height: 20 }} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
  },
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
  alertsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  alertCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  severityBar: {
    height: 4,
    width: '100%',
  },
  alertContent: {
    padding: 16,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  alertTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  severityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  severityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertLocation: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 8,
  },
  alertTime: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 8,
  },
  alertFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#2C2C2E',
  },
  contactsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactsText: {
    fontSize: 13,
    color: '#8E8E93',
    marginLeft: 6,
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailsText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
    marginRight: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
});