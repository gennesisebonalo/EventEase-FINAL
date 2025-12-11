import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';

const { width: screenWidth } = Dimensions.get('window');

// Chart configuration
export const chartConfig = {
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

export const pieChartConfig = {
  color: (opacity = 1) => `rgba(74, 86, 226, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  style: {
    borderRadius: 16,
  },
};

// Custom Line Chart Component
export const CustomLineChart = ({ data, title, height = 220 }) => (
  <View style={styles.chartContainer}>
    {title && <Text style={styles.chartTitle}>{title}</Text>}
    <LineChart
      data={data}
      width={screenWidth - 32}
      height={height}
      chartConfig={chartConfig}
      bezier
      style={styles.chart}
    />
  </View>
);

// Custom Bar Chart Component
export const CustomBarChart = ({ data, title, height = 220 }) => (
  <View style={styles.chartContainer}>
    {title && <Text style={styles.chartTitle}>{title}</Text>}
    <BarChart
      data={data}
      width={screenWidth - 32}
      height={height}
      chartConfig={chartConfig}
      style={styles.chart}
    />
  </View>
);

// Custom Pie Chart Component
export const CustomPieChart = ({ data, title, height = 220 }) => (
  <View style={styles.chartContainer}>
    {title && <Text style={styles.chartTitle}>{title}</Text>}
    <PieChart
      data={data}
      width={screenWidth - 32}
      height={height}
      chartConfig={pieChartConfig}
      accessor="population"
      backgroundColor="transparent"
      paddingLeft="15"
      style={styles.chart}
    />
  </View>
);

// Progress Bar Component
export const ProgressBar = ({ progress, color = '#4A56E2', height = 8, showPercentage = true }) => (
  <View style={styles.progressContainer}>
    <View style={[styles.progressBar, { height }]}>
      <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: color }]} />
    </View>
    {showPercentage && (
      <Text style={styles.progressText}>{progress}%</Text>
    )}
  </View>
);

// Stat Card Component
export const StatCard = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  color = '#4A56E2', 
  trend,
  onPress 
}) => (
  <View style={[styles.statCard, { borderLeftColor: color }]}>
    <View style={styles.statCardHeader}>
      <View style={styles.statCardIconContainer}>
        {icon}
        <Text style={styles.statCardTitle}>{title}</Text>
      </View>
      {trend && (
        <View style={styles.trendContainer}>
          <Text style={[styles.trendText, { color: trend > 0 ? '#4CAF50' : '#F44336' }]}>
            {trend > 0 ? '+' : ''}{trend}%
          </Text>
        </View>
      )}
    </View>
    <Text style={[styles.statCardValue, { color }]}>{value}</Text>
    {subtitle && <Text style={styles.statCardSubtitle}>{subtitle}</Text>}
  </View>
);

// Heatmap Component (simplified version)
export const Heatmap = ({ data, title }) => (
  <View style={styles.heatmapContainer}>
    {title && <Text style={styles.chartTitle}>{title}</Text>}
    <View style={styles.heatmapGrid}>
      {data.map((item, index) => (
        <View key={index} style={styles.heatmapItem}>
          <View 
            style={[
              styles.heatmapCell, 
              { backgroundColor: item.color, opacity: item.intensity }
            ]} 
          />
          <Text style={styles.heatmapLabel}>{item.label}</Text>
        </View>
      ))}
    </View>
  </View>
);

// Rating Component
export const StarRating = ({ rating, maxRating = 5, size = 16, color = '#FFB347' }) => (
  <View style={styles.ratingContainer}>
    {Array.from({ length: maxRating }, (_, index) => (
      <Text 
        key={index} 
        style={[
          styles.star, 
          { 
            fontSize: size, 
            color: index < rating ? color : '#E0E0E0' 
          }
        ]}
      >
        ★
      </Text>
    ))}
    <Text style={styles.ratingText}>{rating}/{maxRating}</Text>
  </View>
);

const styles = StyleSheet.create({
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
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 12,
  },
  chart: {
    borderRadius: 16,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    flex: 1,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212529',
    minWidth: 40,
  },
  statCard: {
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statCardIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statCardTitle: {
    fontSize: 14,
    color: '#6c757d',
    marginLeft: 8,
    fontWeight: '500',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
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
  heatmapContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  heatmapGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  heatmapItem: {
    alignItems: 'center',
    width: 60,
  },
  heatmapCell: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginBottom: 4,
  },
  heatmapLabel: {
    fontSize: 10,
    color: '#6c757d',
    textAlign: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  star: {
    fontSize: 16,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212529',
    marginLeft: 4,
  },
});
