import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  Share,
} from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: screenWidth } = Dimensions.get('window');

// Mock data - replace with actual API calls
const mockData = {
  totalAttendees: 1247,
  totalEvents: 23,
  averageAttendance: 78.5,
  engagementTrends: [
    { month: 'Jan', attendance: 65 },
    { month: 'Feb', attendance: 72 },
    { month: 'Mar', attendance: 78 },
    { month: 'Apr', attendance: 82 },
    { month: 'May', attendance: 85 },
    { month: 'Jun', attendance: 88 },
  ],
  topEvents: [
    { name: 'Foundation Day', attendees: 245, rating: 4.8 },
    { name: 'Tech Conference', attendees: 198, rating: 4.6 },
    { name: 'Cultural Festival', attendees: 187, rating: 4.7 },
    { name: 'Sports Day', attendees: 156, rating: 4.5 },
    { name: 'Career Fair', attendees: 134, rating: 4.4 },
  ],
  demographics: {
    age: [
      { name: '18-22', population: 45, color: '#4A56E2' },
      { name: '23-27', population: 30, color: '#7B68EE' },
      { name: '28-32', population: 15, color: '#9370DB' },
      { name: '33+', population: 10, color: '#BA55D3' },
    ],
    gender: [
      { name: 'Female', population: 55, color: '#FF6B6B' },
      { name: 'Male', population: 40, color: '#4ECDC4' },
      { name: 'Other', population: 5, color: '#45B7D1' },
    ],
    location: [
      { name: 'On-Campus', population: 60, color: '#96CEB4' },
      { name: 'Off-Campus', population: 35, color: '#FFEAA7' },
      { name: 'Online', population: 5, color: '#DDA0DD' },
    ],
  },
  eventAnalytics: [
    { name: 'Foundation Day', enrolled: 300, attended: 245, rate: 81.7, avgGrade: 88.5 },
    { name: 'Tech Conference', enrolled: 250, attended: 198, rate: 79.2, avgGrade: 92.3 },
    { name: 'Cultural Festival', enrolled: 220, attended: 187, rate: 85.0, avgGrade: 85.7 },
    { name: 'Sports Day', enrolled: 180, attended: 156, rate: 86.7, avgGrade: 90.1 },
    { name: 'Career Fair', enrolled: 160, attended: 134, rate: 83.8, avgGrade: 87.9 },
  ],
  engagementMetrics: {
    activeParticipation: 65,
    passiveParticipation: 35,
    averageRating: 4.6,
    feedbackCount: 892,
  },
};

export default function AnalyticsDashboard() {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState('6months');
  const [selectedDemographic, setSelectedDemographic] = useState('age');
  const [dashboardData, setDashboardData] = useState(mockData);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // In a real app, this would fetch from your API
      const stored = await AsyncStorage.getItem('dashboardData');
      if (stored) {
        setDashboardData(JSON.parse(stored));
      }
    } catch (error) {
      console.log('Error loading dashboard data:', error);
    }
  };

  const handleExport = async (format) => {
    try {
      if (format === 'csv') {
        // Generate CSV data
        const csvData = generateCSVData();
        await Share.share({
          message: csvData,
          title: 'EventEase Analytics Export',
        });
      } else if (format === 'pdf') {
        Alert.alert('Export PDF', 'PDF export functionality would be implemented here');
      } else if (format === 'image') {
        Alert.alert('Export Image', 'Image export functionality would be implemented here');
      }
    } catch (error) {
      Alert.alert('Export Error', 'Failed to export data');
    }
  };

  const generateCSVData = () => {
    let csv = 'Event Name,Enrolled,Attended,Attendance Rate,Average Grade\n';
    dashboardData.eventAnalytics.forEach(event => {
      csv += `${event.name},${event.enrolled},${event.attended},${event.rate}%,${event.avgGrade}\n`;
    });
    return csv;
  };

  const StatCard = ({ title, value, subtitle, icon, color = '#4A56E2' }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statCardHeader}>
        <Ionicons name={icon} size={24} color={color} />
        <Text style={styles.statCardTitle}>{title}</Text>
      </View>
      <Text style={[styles.statCardValue, { color }]}>{value}</Text>
      {subtitle && <Text style={styles.statCardSubtitle}>{subtitle}</Text>}
    </View>
  );

  const FilterButton = ({ label, value, isActive, onPress }) => (
    <TouchableOpacity
      style={[styles.filterButton, isActive && styles.filterButtonActive]}
      onPress={() => onPress(value)}
    >
      <Text style={[styles.filterButtonText, isActive && styles.filterButtonTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(74, 86, 226, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#4A56E2',
    },
  };

  const pieChartConfig = {
    color: (opacity = 1) => `rgba(74, 86, 226, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Analytics Dashboard</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.exportButton} onPress={() => handleExport('csv')}>
            <Ionicons name="download-outline" size={20} color="#4A56E2" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.exportButton} onPress={() => handleExport('pdf')}>
            <Ionicons name="document-outline" size={20} color="#4A56E2" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Overview Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="Total Attendees"
            value={dashboardData.totalAttendees.toLocaleString()}
            subtitle="Across all events"
            icon="people-outline"
            color="#4A56E2"
          />
          <StatCard
            title="Total Events"
            value={dashboardData.totalEvents}
            subtitle="This semester"
            icon="calendar-outline"
            color="#7B68EE"
          />
          <StatCard
            title="Avg Attendance"
            value={`${dashboardData.averageAttendance}%`}
            subtitle="Engagement rate"
            icon="trending-up-outline"
            color="#96CEB4"
          />
          <StatCard
            title="Avg Rating"
            value={`${dashboardData.engagementMetrics.averageRating}/5`}
            subtitle="Student feedback"
            icon="star-outline"
            color="#FFB347"
          />
        </View>
      </View>

      {/* Engagement Trends */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Engagement Trends</Text>
        <View style={styles.chartContainer}>
          <LineChart
            data={{
              labels: dashboardData.engagementTrends.map(item => item.month),
              datasets: [
                {
                  data: dashboardData.engagementTrends.map(item => item.attendance),
                  color: (opacity = 1) => `rgba(74, 86, 226, ${opacity})`,
                  strokeWidth: 3,
                },
              ],
            }}
            width={screenWidth - 32}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        </View>
      </View>

      {/* Top Events */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Top Events</Text>
        {dashboardData.topEvents.map((event, index) => (
          <View key={index} style={styles.eventCard}>
            <View style={styles.eventInfo}>
              <Text style={styles.eventName}>{event.name}</Text>
              <Text style={styles.eventAttendees}>{event.attendees} attendees</Text>
            </View>
            <View style={styles.eventRating}>
              <Ionicons name="star" size={16} color="#FFB347" />
              <Text style={styles.ratingText}>{event.rating}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Demographics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Student Demographics</Text>
        
        {/* Demographic Filter */}
        <View style={styles.filterContainer}>
          <FilterButton
            label="Age"
            value="age"
            isActive={selectedDemographic === 'age'}
            onPress={setSelectedDemographic}
          />
          <FilterButton
            label="Gender"
            value="gender"
            isActive={selectedDemographic === 'gender'}
            onPress={setSelectedDemographic}
          />
          <FilterButton
            label="Location"
            value="location"
            isActive={selectedDemographic === 'location'}
            onPress={setSelectedDemographic}
          />
        </View>

        <View style={styles.chartContainer}>
          <PieChart
            data={dashboardData.demographics[selectedDemographic]}
            width={screenWidth - 32}
            height={220}
            chartConfig={pieChartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            style={styles.chart}
          />
        </View>
      </View>

      {/* Event Analytics Table */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Event Analytics</Text>
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderText}>Event</Text>
            <Text style={styles.tableHeaderText}>Enrolled</Text>
            <Text style={styles.tableHeaderText}>Attended</Text>
            <Text style={styles.tableHeaderText}>Rate</Text>
            <Text style={styles.tableHeaderText}>Avg Grade</Text>
          </View>
          {dashboardData.eventAnalytics.map((event, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.tableCell}>{event.name}</Text>
              <Text style={styles.tableCell}>{event.enrolled}</Text>
              <Text style={styles.tableCell}>{event.attended}</Text>
              <Text style={[styles.tableCell, { color: event.rate >= 80 ? '#4CAF50' : '#FF9800' }]}>
                {event.rate}%
              </Text>
              <Text style={styles.tableCell}>{event.avgGrade}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Engagement Metrics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Engagement Metrics</Text>
        <View style={styles.engagementContainer}>
          <View style={styles.engagementCard}>
            <Text style={styles.engagementTitle}>Active Participation</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${dashboardData.engagementMetrics.activeParticipation}%` }]} />
            </View>
            <Text style={styles.engagementValue}>{dashboardData.engagementMetrics.activeParticipation}%</Text>
          </View>
          
          <View style={styles.engagementCard}>
            <Text style={styles.engagementTitle}>Passive Participation</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${dashboardData.engagementMetrics.passiveParticipation}%`, backgroundColor: '#FF6B6B' }]} />
            </View>
            <Text style={styles.engagementValue}>{dashboardData.engagementMetrics.passiveParticipation}%</Text>
          </View>
        </View>

        <View style={styles.feedbackContainer}>
          <View style={styles.feedbackCard}>
            <Ionicons name="star" size={24} color="#FFB347" />
            <View style={styles.feedbackInfo}>
              <Text style={styles.feedbackRating}>{dashboardData.engagementMetrics.averageRating}/5</Text>
              <Text style={styles.feedbackCount}>{dashboardData.engagementMetrics.feedbackCount} reviews</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Time Range Filter */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Time Range</Text>
        <View style={styles.filterContainer}>
          <FilterButton
            label="3 Months"
            value="3months"
            isActive={selectedTimeRange === '3months'}
            onPress={setSelectedTimeRange}
          />
          <FilterButton
            label="6 Months"
            value="6months"
            isActive={selectedTimeRange === '6months'}
            onPress={setSelectedTimeRange}
          />
          <FilterButton
            label="1 Year"
            value="1year"
            isActive={selectedTimeRange === '1year'}
            onPress={setSelectedTimeRange}
          />
        </View>
      </View>

      {/* Alerts/Notifications */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Alerts</Text>
        <View style={styles.alertCard}>
          <Ionicons name="warning-outline" size={20} color="#FF6B6B" />
          <Text style={styles.alertText}>Attendance dropped 15% for "Career Fair" this month</Text>
        </View>
        <View style={styles.alertCard}>
          <Ionicons name="checkmark-circle-outline" size={20} color="#4CAF50" />
          <Text style={styles.alertText}>"Foundation Day" exceeded attendance expectations by 20%</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  exportButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statCardTitle: {
    fontSize: 14,
    color: '#6c757d',
    marginLeft: 8,
    fontWeight: '500',
  },
  statCardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statCardSubtitle: {
    fontSize: 12,
    color: '#6c757d',
  },
  chartContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chart: {
    borderRadius: 16,
  },
  eventCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  eventInfo: {
    flex: 1,
  },
  eventName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 4,
  },
  eventAttendees: {
    fontSize: 14,
    color: '#6c757d',
  },
  eventRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212529',
    marginLeft: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  filterButtonActive: {
    backgroundColor: '#4A56E2',
    borderColor: '#4A56E2',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#ffffff',
  },
  tableContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  tableHeaderText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  tableCell: {
    flex: 1,
    fontSize: 14,
    color: '#212529',
  },
  engagementContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  engagementCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  engagementTitle: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 8,
    fontWeight: '500',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: 8,
    backgroundColor: '#4A56E2',
    borderRadius: 4,
  },
  engagementValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
  },
  feedbackContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  feedbackCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  feedbackInfo: {
    marginLeft: 12,
  },
  feedbackRating: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
  },
  feedbackCount: {
    fontSize: 14,
    color: '#6c757d',
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  alertText: {
    flex: 1,
    fontSize: 14,
    color: '#212529',
    marginLeft: 12,
  },
});
