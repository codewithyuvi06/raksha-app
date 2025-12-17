import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

export default function DetectScreen() {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [threatLevel, setThreatLevel] = useState('LOW');
  const [threatScore, setThreatScore] = useState(0.15);

  const getThreatColor = () => {
    if (threatLevel === 'CRITICAL') return '#FF3B30';
    if (threatLevel === 'HIGH') return '#FF9500';
    if (threatLevel === 'MEDIUM') return '#FFCC00';
    return '#34C759';
  };

  const toggleMonitoring = () => {
    setIsMonitoring(!isMonitoring);
  };

  return (
    <LinearGradient
      colors={['#0A0A0A', '#1A1A1A']}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>AI Threat Detection</Text>
          <Text style={styles.subtitle}>Real-time safety monitoring</Text>
        </View>

        {/* Monitoring Toggle */}
        <View style={styles.toggleCard}>
          <View style={styles.toggleInfo}>
            <Ionicons 
              name={isMonitoring ? "shield-checkmark" : "shield-outline"} 
              size={32} 
              color={isMonitoring ? '#34C759' : '#8E8E93'} 
            />
            <View style={styles.toggleText}>
              <Text style={styles.toggleTitle}>AI Monitoring</Text>
              <Text style={styles.toggleSubtitle}>
                {isMonitoring ? 'Active - Analyzing environment' : 'Tap to start monitoring'}
              </Text>
            </View>
          </View>
          <Switch
            value={isMonitoring}
            onValueChange={toggleMonitoring}
            trackColor={{ false: '#3A3A3C', true: '#34C759' }}
            thumbColor="#FFFFFF"
          />
        </View>

        {/* Threat Level Gauge */}
        <View style={styles.gaugeCard}>
          <Text style={styles.cardTitle}>Threat Level</Text>
          
          <View style={styles.gaugeContainer}>
            <View style={styles.gauge}>
              <View 
                style={[
                  styles.gaugeFill, 
                  { 
                    width: `${threatScore * 100}%`,
                    backgroundColor: getThreatColor()
                  }
                ]} 
              />
            </View>
            
            <View style={styles.levelContainer}>
              <Text style={[styles.levelText, { color: getThreatColor() }]}>
                {threatLevel}
              </Text>
              <Text style={styles.scoreText}>
                {Math.round(threatScore * 100)}% Risk
              </Text>
            </View>
          </View>

          <View style={styles.levelIndicators}>
            <View style={styles.indicator}>
              <View style={[styles.indicatorDot, { backgroundColor: '#34C759' }]} />
              <Text style={styles.indicatorText}>Low</Text>
            </View>
            <View style={styles.indicator}>
              <View style={[styles.indicatorDot, { backgroundColor: '#FFCC00' }]} />
              <Text style={styles.indicatorText}>Medium</Text>
            </View>
            <View style={styles.indicator}>
              <View style={[styles.indicatorDot, { backgroundColor: '#FF9500' }]} />
              <Text style={styles.indicatorText}>High</Text>
            </View>
            <View style={styles.indicator}>
              <View style={[styles.indicatorDot, { backgroundColor: '#FF3B30' }]} />
              <Text style={styles.indicatorText}>Critical</Text>
            </View>
          </View>
        </View>

        {/* Detection Factors */}
        <View style={styles.factorsCard}>
          <Text style={styles.cardTitle}>Detection Factors</Text>
          
          <View style={styles.factor}>
            <View style={styles.factorLeft}>
              <Ionicons name="pulse" size={20} color="#007AFF" />
              <Text style={styles.factorName}>Movement Analysis</Text>
            </View>
            <View style={styles.factorBar}>
              <View style={[styles.factorFill, { width: '20%', backgroundColor: '#34C759' }]} />
            </View>
            <Text style={styles.factorValue}>Low</Text>
          </View>

          <View style={styles.factor}>
            <View style={styles.factorLeft}>
              <Ionicons name="volume-high" size={20} color="#007AFF" />
              <Text style={styles.factorName}>Audio Analysis</Text>
            </View>
            <View style={styles.factorBar}>
              <View style={[styles.factorFill, { width: '15%', backgroundColor: '#34C759' }]} />
            </View>
            <Text style={styles.factorValue}>Low</Text>
          </View>

          <View style={styles.factor}>
            <View style={styles.factorLeft}>
              <Ionicons name="location" size={20} color="#007AFF" />
              <Text style={styles.factorName}>Location Risk</Text>
            </View>
            <View style={styles.factorBar}>
              <View style={[styles.factorFill, { width: '30%', backgroundColor: '#FFCC00' }]} />
            </View>
            <Text style={styles.factorValue}>Medium</Text>
          </View>

          <View style={styles.factor}>
            <View style={styles.factorLeft}>
              <Ionicons name="time" size={20} color="#007AFF" />
              <Text style={styles.factorName}>Time of Day</Text>
            </View>
            <View style={styles.factorBar}>
              <View style={[styles.factorFill, { width: '10%', backgroundColor: '#34C759' }]} />
            </View>
            <Text style={styles.factorValue}>Low</Text>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.activityCard}>
          <Text style={styles.cardTitle}>Recent Activity</Text>
          
          {isMonitoring ? (
            <>
              <View style={styles.activityItem}>
                <View style={styles.activityDot} />
                <View style={styles.activityContent}>
                  <Text style={styles.activityText}>Normal movement detected</Text>
                  <Text style={styles.activityTime}>Just now</Text>
                </View>
              </View>
              
              <View style={styles.activityItem}>
                <View style={styles.activityDot} />
                <View style={styles.activityContent}>
                  <Text style={styles.activityText}>Location updated</Text>
                  <Text style={styles.activityTime}>2 minutes ago</Text>
                </View>
              </View>
              
              <View style={styles.activityItem}>
                <View style={styles.activityDot} />
                <View style={styles.activityContent}>
                  <Text style={styles.activityText}>Monitoring started</Text>
                  <Text style={styles.activityTime}>5 minutes ago</Text>
                </View>
              </View>
            </>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="analytics-outline" size={48} color="#3A3A3C" />
              <Text style={styles.emptyText}>Start monitoring to see activity</Text>
            </View>
          )}
        </View>
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
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1C1C1E',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  toggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  toggleText: {
    marginLeft: 16,
    flex: 1,
  },
  toggleTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  toggleSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
  },
  gaugeCard: {
    backgroundColor: '#1C1C1E',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  gaugeContainer: {
    marginBottom: 20,
  },
  gauge: {
    height: 12,
    backgroundColor: '#2C2C2E',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 16,
  },
  gaugeFill: {
    height: '100%',
    borderRadius: 6,
  },
  levelContainer: {
    alignItems: 'center',
  },
  levelText: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  scoreText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  levelIndicators: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  indicator: {
    alignItems: 'center',
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 6,
  },
  indicatorText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  factorsCard: {
    backgroundColor: '#1C1C1E',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  factor: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  factorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 160,
  },
  factorName: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 8,
  },
  factorBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#2C2C2E',
    borderRadius: 3,
    marginHorizontal: 12,
  },
  factorFill: {
    height: '100%',
    borderRadius: 3,
  },
  factorValue: {
    fontSize: 12,
    color: '#8E8E93',
    width: 50,
    textAlign: 'right',
  },
  activityCard: {
    backgroundColor: '#1C1C1E',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34C759',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    color: '#8E8E93',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyText: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 12,
  },
});