import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/constants/axios';
import { useTheme } from '../assets/components/theme-provider';

export default function Attendance() {
  const router = useRouter();
  const { colors } = useTheme();
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const initialize = async () => {
      await loadUserData();
      // fetchAttendanceHistory will be called by the next effect when user is set
    };
    initialize();
  }, []);

  // Fetch attendance history when user data is loaded
  useEffect(() => {
    if (user?.id) {
      console.log('User ID available, fetching attendance history');
      fetchAttendanceHistory();
    }
  }, [user?.id]);

  const loadUserData = async () => {
    try {
      const userJson = await AsyncStorage.getItem('user');
      const userData = userJson ? JSON.parse(userJson) : null;
      setUser(userData);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const fetchAttendanceHistory = async () => {
    if (!user?.id) {
      console.log('User ID not available');
      return;
    }

    try {
      setLoading(true);
      console.log('Fetching attendance for user ID:', user.id);
      
      const response = await api.get('/api/attendance/user-history', {
        params: { user_id: user.id }
      });

      console.log('API Response:', JSON.stringify(response.data, null, 2));

      if (response.data && response.data.success) {
        console.log('Setting attendance data:', response.data.data);
        setAttendance(response.data.data || []);
      } else {
        console.warn('API returned unsuccessful response:', response.data?.message);
        Alert.alert('Error', response.data?.message || 'Failed to load attendance history');
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
      Alert.alert('Error', 'Failed to load attendance history');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return '#4CAF50';
      case 'absent':
        return '#F44336';
      case 'pending':
        return '#FF9800';
      default:
        return '#666';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'present':
        return 'Present';
      case 'absent':
        return 'Absent';
      case 'pending':
        return 'Pending';
      default:
        return 'Unknown';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.headerBg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.headerBg }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={[styles.backArrow, { color: colors.headerText }]}>{'<' } </Text>
          <Text style={[styles.backText, { color: colors.headerText }]}>Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.headerText }]}>Attendance History</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Content */}
      <View style={[styles.content, { backgroundColor: colors.card }]}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: colors.text, opacity: 0.7 }]}>Loading attendance history...</Text>
          </View>
        ) : attendance.length > 0 ? (
          <ScrollView style={styles.scrollView}>
            {attendance.map((record, index) => (
              <View key={index} style={[styles.attendanceCard, { backgroundColor: colors.card }]}>
                <View style={styles.cardHeader}>
                  <Text style={[styles.eventTitle, { color: colors.text }]}>{record.event.title}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(record.status) }]}>
                    <Text style={styles.statusText}>{getStatusText(record.status)}</Text>
                  </View>
                </View>
                
                <View style={styles.cardContent}>
                  <View style={styles.infoRow}>
                    <Text style={[styles.infoLabel, { color: colors.text, opacity: 0.8 }]}>Venue:</Text>
                    <Text style={[styles.infoValue, { color: colors.text }]}>{record.event.venue}</Text>
                  </View>
                  
                  <View style={styles.infoRow}>
                    <Text style={[styles.infoLabel, { color: colors.text, opacity: 0.8 }]}>Date:</Text>
                    <Text style={[styles.infoValue, { color: colors.text }]}>{formatDate(record.event.start_time)}</Text>
                  </View>
                  
                  {record.status === 'present' && record.checked_in_at && (
                    <View style={styles.infoRow}>
                      <Text style={[styles.infoLabel, { color: colors.text, opacity: 0.8 }]}>Checked In:</Text>
                      <Text style={[styles.infoValue, { color: colors.text }]}>{formatDate(record.checked_in_at)}</Text>
                    </View>
                  )}
                  
                  {record.status === 'absent' && record.reason && (
                    <View style={styles.infoRow}>
                      <Text style={[styles.infoLabel, { color: colors.text, opacity: 0.8 }]}>Reason:</Text>
                      <Text style={[styles.infoValue, { color: colors.text }]}>{record.reason}</Text>
                    </View>
                  )}
                  
                  {record.status === 'absent' && record.declined_at && (
                    <View style={styles.infoRow}>
                      <Text style={[styles.infoLabel, { color: colors.text, opacity: 0.8 }]}>Declined At:</Text>
                      <Text style={[styles.infoValue, { color: colors.text }]}>{formatDate(record.declined_at)}</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyTitle, { color: colors.text } ]}>No Attendance Records</Text>
            <Text style={[styles.emptySubtitle, { color: colors.text, opacity: 0.7 }]}>
              Your attendance history will appear here once you join events.
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4A56E2',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#4A56E2',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backArrow: {
    fontSize: 22,
    color: 'white',
    fontWeight: 'bold',
  },
  backText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  scrollView: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  attendanceCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 10,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardContent: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    width: 100,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
});
