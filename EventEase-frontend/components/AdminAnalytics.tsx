import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface EventCardProps {
  title: string;
  date: string;
  location: string;
  registered: number;
  attended: number;
  progress: string;
  onViewDetails: () => void;
}

const EventCard: React.FC<EventCardProps> = ({
  title,
  date,
  location,
  registered,
  attended,
  progress,
  onViewDetails,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.eventTitle} numberOfLines={1} ellipsizeMode="tail">{title}</Text>
      </View>
      <View style={styles.cardBody}>
        <View style={styles.eventDetail}>
          <Ionicons name="calendar-outline" size={16} color="#666" />
          <Text style={styles.detailText}>{date}</Text>
        </View>
        <View style={styles.eventDetail}>
          <Ionicons name="location-outline" size={16} color="#666" />
          <Text style={styles.detailText} numberOfLines={1} ellipsizeMode="tail">{location}</Text>
        </View>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${Math.min(100, (attended / (registered || 1)) * 100)}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>{progress}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.viewButton} onPress={onViewDetails}>
        <Text style={styles.viewButtonText}>View Details</Text>
      </TouchableOpacity>
    </View>
  );
};

const AdminAnalytics: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [events, setEvents] = useState([
    {
      id: 1,
      title: 'Christmas Party 2025',
      date: 'Dec 19, 2025',
      location: 'Gymnasium',
      registered: 0,
      attended: 0,
      progress: '0%',
    },
    {
      id: 2,
      title: 'CCS Days 2025',
      date: 'Oct 30, 2025',
      location: 'Gymnasium',
      registered: 1,
      attended: 1,
      progress: '100%',
    },
    {
      id: 3,
      title: 'Worship Service By the IT Department',
      date: 'Oct 16, 2025',
      location: 'Gymnasium',
      registered: 0,
      attended: 0,
      progress: '0%',
    },
    {
      id: 4,
      title: 'Science and Math Month',
      date: 'Sep 30, 2025',
      location: 'Gymnasium',
      registered: 0,
      attended: 0,
      progress: '0%',
    },
    {
      id: 5,
      title: 'Intramurals 2025',
      date: 'Sep 12, 2025',
      location: 'Gymnasium',
      registered: 0,
      attended: 0,
      progress: '0%',
    },
    {
      id: 6,
      title: 'Drug Awareness and Penology Drive',
      date: 'Aug 28, 2025',
      location: 'Gymnasium',
      registered: 0,
      attended: 0,
      progress: '0%',
    },
  ]);

  const handleViewDetails = (eventId: number) => {
    // Navigate to event details or show modal
    console.log('View details for event:', eventId);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Events</Text>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <Text style={styles.searchText}>Search events...</Text>
        </View>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {['All Events', 'Upcoming', 'Ongoing', 'Completed'].map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterButton,
              activeFilter === filter.toLowerCase().replace(' ', '') && styles.filterButtonActive
            ]}
            onPress={() => setActiveFilter(filter.toLowerCase().replace(' ', ''))}
          >
            <Text 
              style={[
                styles.filterText,
                activeFilter === filter.toLowerCase().replace(' ', '') && styles.filterTextActive
              ]}
            >
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>Total Events</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>Total Reg</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>Total Che In</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>A</Text>
          <Text style={styles.statLabel}></Text>
        </View>
      </View>

      <ScrollView style={styles.eventsContainer}>
        {events.map((event) => (
          <EventCard
            key={event.id}
            title={event.title}
            date={event.date}
            location={event.location}
            registered={event.registered}
            attended={event.attended}
            progress={event.progress}
            onViewDetails={() => handleViewDetails(event.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#212529',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f3f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchText: {
    color: '#6c757d',
    fontSize: 16,
  },
  filterContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  filterContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#f1f3f5',
  },
  filterButtonActive: {
    backgroundColor: '#0d6efd',
  },
  filterText: {
    color: '#495057',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#fff',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'center',
  },
  eventsContainer: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
  },
  cardBody: {
    padding: 16,
  },
  eventDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 8,
    color: '#495057',
    flex: 1,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0d6efd',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#6c757d',
    minWidth: 40,
    textAlign: 'right',
  },
  viewButton: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    alignItems: 'center',
  },
  viewButtonText: {
    color: '#0d6efd',
    fontWeight: '500',
  },
});

export default AdminAnalytics;
