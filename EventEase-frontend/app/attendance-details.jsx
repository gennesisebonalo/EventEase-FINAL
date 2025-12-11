import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../assets/components/theme-provider';

const eventData = {
  '1': {
    title: 'Foundation Day',
    date: 'March 15, 2023',
    image: require('../assets/images/foundation.jpg'),
    description: 'This is a special day celebrating the foundation of our organization. Join us for fun, food, and festivities!'
  },
  '2': {
    title: 'Zumba',
    date: 'March 20, 2023',
    image: require('../assets/images/zumba.jpg'),
    description: 'Get ready to dance and sweat it out with our Zumba event! All levels welcome.'
  },
  '3': {
    title: 'English Day',
    date: 'March 25, 2023',
    image: require('../assets/images/english.jpg'),
    description: 'Celebrate English language and culture with activities, games, and more.'
  },
};

export default function AttendanceDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { colors } = useTheme();
  const event = eventData[id] || {};
  const [attendance, setAttendance] = useState(null);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const stored = await AsyncStorage.getItem('attendanceStatus');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed[id]) {
            setAttendance(parsed[id]);
          }
        }
      } catch (e) {
        console.log('Error loading attendance status', e);
      }
    };
    fetchAttendance();
  }, [id]);

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.card }] }>
      {/* Back Button */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={20} color={colors.primary} />
        <Text style={[styles.backText, { color: colors.primary }]}>Back</Text>
      </TouchableOpacity>

      {/* Event Card */}
      <View style={[styles.card, { backgroundColor: colors.card }] }>
        <Image source={event.image} style={styles.image} />
        <Text style={[styles.title, { color: colors.text }]}>{event.title}</Text>
        <Text style={[styles.date, { color: colors.text, opacity: 0.75 }]}>
          <Ionicons name="calendar-outline" size={16} color={colors.text} /> {event.date}
        </Text>
      </View>

      {/* Attendance Section */}
      {attendance?.status === 'checkedIn' && (
        <View style={[styles.infoBox, { backgroundColor: colors.surface }]}>
          <Ionicons name="checkmark-circle" size={20} color="#4caf50" />
          <Text style={[styles.infoText, { color: '#4caf50' }]}>Checked in at {attendance.checkedInTime}</Text>
        </View>
      )}

      {attendance?.status === 'absent' && (
        <View style={[styles.infoBox, { backgroundColor: colors.surface }]}>
          <Ionicons name="close-circle" size={20} color="#e53935" />
          <Text style={[styles.absentText, { color: '#e53935' }]}>Absent</Text>
          <Text style={[styles.reasonLabel, { color: colors.text }]}>Reason:</Text>
          <Text style={[styles.reasonText, { color: colors.text }]}>{attendance.reason || 'No reason provided'}</Text>

          {/* Evidence Image */}
          {attendance.evidenceImage ? (
            <Image source={{ uri: attendance.evidenceImage }} style={styles.evidenceImage} resizeMode="cover" />
          ) : (
            <View style={[styles.noEvidenceBox, { backgroundColor: colors.surface }]}>
              <Ionicons name="image-outline" size={40} color={colors.text} />
              <Text style={[styles.noEvidenceText, { color: colors.text, opacity: 0.7 }]}>No Evidence Image</Text>
            </View>
          )}
        </View>
      )}

      {/* Description Box */}
      <View style={[styles.descriptionCard, { backgroundColor: colors.card }] }>
        <Text style={[styles.descriptionTitle, { color: colors.text }]}>About this Event</Text>
        <Text style={[styles.description, { color: colors.text }]}>{event.description}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f8fc',
    padding: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  backText: {
    fontSize: 16,
    color: '#a993fe',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    marginBottom: 20,
  },
  image: {
    width: 140,
    height: 140,
    borderRadius: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  date: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  infoBox: {
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  checkedInBox: {
    backgroundColor: '#e8f5e9',
  },
  absentBox: {
    backgroundColor: '#ffebee',
  },
  infoText: {
    marginTop: 5,
    fontSize: 15,
    fontWeight: 'bold',
    color: '#4caf50',
  },
  absentText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e53935',
    marginTop: 5,
  },
  reasonLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
  },
  reasonText: {
    fontSize: 14,
    color: '#444',
    textAlign: 'center',
    marginVertical: 8,
  },
  evidenceImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
    marginTop: 10,
  },
  noEvidenceBox: {
    width: 200,
    height: 150,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  noEvidenceText: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
  descriptionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 15,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    marginBottom: 20,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#444',
    textAlign: 'justify',
  },
});
