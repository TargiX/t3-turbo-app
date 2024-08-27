import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '~/utils/auth';

export default function HomeScreen() {
  const user = useUser();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.welcomeText}>Welcome, {user?.name || 'Meditator'}!</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Recommendation</Text>
          <TouchableOpacity style={styles.card}>
            <Text style={styles.cardTitle}>Morning Mindfulness</Text>
            <Text style={styles.cardSubtitle}>10 min • Beginner</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Continue Session</Text>
          <TouchableOpacity style={styles.card}>
            <Text style={styles.cardTitle}>Stress Relief</Text>
            <Text style={styles.cardSubtitle}>15 min • 3/7 completed</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Timer</Text>
          <View style={styles.timerButtons}>
            <TouchableOpacity style={styles.timerButton}>
              <Text style={styles.timerButtonText}>5 min</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.timerButton}>
              <Text style={styles.timerButtonText}>10 min</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.timerButton}>
              <Text style={styles.timerButtonText}>15 min</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Stats</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>7</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>120</Text>
              <Text style={styles.statLabel}>Total Minutes</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>15</Text>
              <Text style={styles.statLabel}>Sessions</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  timerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timerButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 5,
    padding: 10,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  timerButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
});