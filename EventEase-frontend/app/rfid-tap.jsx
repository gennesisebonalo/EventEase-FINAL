import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/constants/axios';
import { useTheme } from '../assets/components/theme-provider';

export default function RFIDTap() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { colors } = useTheme();
  const [user, setUser] = useState(null);
  const [eventId, setEventId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [eventInfo, setEventInfo] = useState(null);
  const [isWaitingForRFID, setIsWaitingForRFID] = useState(true);
  const [checkInStatus, setCheckInStatus] = useState(null); // 'waiting', 'checking', 'success', 'error'
  const pollingIntervalRef = useRef(null);

  useEffect(() => {
    loadUserData();
    return () => {
      // Cleanup polling on unmount
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  const loadUserData = async () => {
    try {
      const userJson = await AsyncStorage.getItem('user');
      const userData = userJson ? JSON.parse(userJson) : null;
      setUser(userData);
      
      // Get event ID from params or AsyncStorage
      const eventIdFromParams = params.eventId;
      if (eventIdFromParams) {
        setEventId(eventIdFromParams);
        await loadEventInfo(eventIdFromParams);
      } else {
        // Try to get from AsyncStorage if not in params
        const storedEventId = await AsyncStorage.getItem('currentEventId');
        if (storedEventId) {
          setEventId(storedEventId);
          await loadEventInfo(storedEventId);
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadEventInfo = async (eventId) => {
    try {
      const response = await api.get('/api/events', {
        params: { user_id: user?.id }
      });
      const events = Array.isArray(response.data?.data) ? response.data.data : [];
      const event = events.find(e => String(e.id) === String(eventId));
      if (event) {
        setEventInfo(event);
      }
    } catch (error) {
      console.error('Error loading event info:', error);
    }
  };

  // Poll for check-in status
  const checkAttendanceStatus = async () => {
    if (!user || !eventId) return;

    try {
      const response = await api.get(`/api/attendance/event/${eventId}`);
      const attendees = response.data?.data?.attendees || [];
      const userAttendance = attendees.find(a => String(a.user_id) === String(user.id));
      
      if (userAttendance && userAttendance.status === 'present') {
        // User has been checked in via RFID
        setIsWaitingForRFID(false);
        setCheckInStatus('success');
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
        
        Alert.alert(
          'Success!', 
          'You have been successfully checked in to the event!',
          [
            {
              text: 'OK',
              onPress: () => {
                AsyncStorage.removeItem('currentEventId');
                router.push('/(tabs)/');
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error checking attendance status:', error);
    }
  };

  // Start polling when component is ready
  useEffect(() => {
    if (user && eventId && isWaitingForRFID) {
      // Start polling every 2 seconds
      pollingIntervalRef.current = setInterval(() => {
        checkAttendanceStatus();
      }, 2000);
      
      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
      };
    }
  }, [user, eventId, isWaitingForRFID]);

  const simulateRFIDTap = async () => {
    if (!user || !eventId) {
      Alert.alert('Error', 'Missing user or event information');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Simulate RFID scanning delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Call the API to complete RFID tapping
      const response = await api.post('/api/attendance/rfid-complete', {
        user_id: user.id,
        event_id: eventId
      });

      if (response.data.success) {
        Alert.alert(
          'Success!', 
          'You have been successfully checked in to the event!',
          [
            {
              text: 'OK',
              onPress: () => {
                // Clear stored event ID
                AsyncStorage.removeItem('currentEventId');
                router.push('/(tabs)/');
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', response.data.message || 'Failed to check in');
      }
    } catch (error) {
      console.error('RFID tap error:', error);
      Alert.alert(
        'Error', 
        error.response?.data?.message || 'Failed to complete RFID tapping'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={[styles.backArrow, { color: colors.primary }]}>{'<' } </Text>
        <Text style={[styles.backText, { color: colors.primary }]}>Back</Text>
      </TouchableOpacity>
      <Text style={[styles.title, { color: colors.text }]}>RFID Tapping</Text>
      <Text style={[styles.subtitle, { color: colors.text, opacity: 0.7 }]}>Please tap your RFID card to check in.</Text>
      
      {/* Event Time Information */}
      {eventInfo && (
        <View style={[styles.eventInfoBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.eventInfoTitle, { color: colors.text }]}>Event Information</Text>
          <Text style={[styles.eventInfoText, { color: colors.text }]}>Event: {eventInfo.title}</Text>
          <Text style={[styles.eventInfoText, { color: colors.text }]}>Venue: {eventInfo.location}</Text>
          <Text style={[styles.eventInfoText, { color: colors.text }]}>
            Time: {new Date(eventInfo.start_time).toLocaleString('en-US', {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })} - {new Date(eventInfo.end_time).toLocaleString('en-US', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        </View>
      )}
      
      <View style={[styles.placeholderBox, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
        {isWaitingForRFID ? (
          <>
            <Text style={[styles.placeholderText, { color: colors.primary }]}>
              ⏳ Waiting for RFID card tap...
            </Text>
            <Text style={[styles.instructionText, { color: colors.text, opacity: 0.7 }]}>
              Please tap your RFID card on the physical reader device
            </Text>
            <View style={styles.statusIndicator}>
              <View style={[styles.pulseDot, { backgroundColor: colors.primary }]} />
              <Text style={[styles.statusText, { color: colors.text, opacity: 0.6 }]}>
                Listening for RFID tap...
              </Text>
            </View>
          </>
        ) : checkInStatus === 'success' ? (
          <>
            <Text style={[styles.successText, { color: '#10b981' }]}>
              ✓ Check-in Successful!
            </Text>
            <Text style={[styles.instructionText, { color: colors.text, opacity: 0.7 }]}>
              You have been checked in to the event
            </Text>
          </>
        ) : (
          <>
        <Text style={[styles.placeholderText, { color: colors.primary }]}>
              Tap your RFID card on the reader
        </Text>
        <TouchableOpacity 
          style={[styles.tapButton, { backgroundColor: colors.primary }, isProcessing && styles.tapButtonDisabled]}
          onPress={simulateRFIDTap}
          disabled={isProcessing}
        >
          <Text style={[styles.tapButtonText, isProcessing && styles.tapButtonTextDisabled]}>
                {isProcessing ? 'Scanning...' : 'Simulate RFID Tap (Fallback)'}
          </Text>
        </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  backArrow: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  backText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 32,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
  },
  placeholderBox: {
    marginTop: 32,
    padding: 24,
    borderWidth: 1,
    borderRadius: 12,
  },
  placeholderText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  tapButton: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 10,
  },
  tapButtonDisabled: {
    backgroundColor: '#ccc',
  },
  tapButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tapButtonTextDisabled: {
    color: '#666',
  },
  eventInfoBox: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  eventInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  eventInfoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  instructionText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  pulseDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
  },
  successText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
}); 