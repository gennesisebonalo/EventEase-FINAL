import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function DebugNavigation() {
  const router = useRouter();

  const testNavigation = (route) => {
    console.log(`Testing navigation to: ${route}`);
    try {
      router.push(route);
      console.log(`Successfully navigated to: ${route}`);
    } catch (error) {
      console.error(`Navigation error to ${route}:`, error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Debug Navigation</Text>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={() => testNavigation('/attendance-details?id=1')}
      >
        <Text style={styles.buttonText}>Test Attendance Details</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.button}
        onPress={() => testNavigation('/all-events')}
      >
        <Text style={styles.buttonText}>Test All Events</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.button}
        onPress={() => testNavigation('/(tabs)/calendar')}
      >
        <Text style={styles.buttonText}>Test Calendar Tab</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.button}
        onPress={() => testNavigation('/(tabs)/notification')}
      >
        <Text style={styles.buttonText}>Test Notification Tab</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.button}
        onPress={() => testNavigation('/(tabs)/profile')}
      >
        <Text style={styles.buttonText}>Test Profile Tab</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  button: {
    backgroundColor: '#4A56E2',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 15,
    minWidth: 200,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
