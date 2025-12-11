import { View, Text, ScrollView, TouchableOpacity, Animated, Dimensions, PanResponder } from "react-native";
// Notifications: import dynamically later to avoid crashes if package not installed
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState, useRef } from "react";
import api from "@/constants/axios";
import { useTheme } from "../../assets/components/theme-provider";

const { width } = Dimensions.get('window');

function formatDate(year, month, day) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function Calendar() {
  const { colors } = useTheme();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  // Draggable position for floating summary
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pan.setOffset({
          x: pan.x._value,
          y: pan.y._value,
        });
      },
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: () => {
        pan.flattenOffset();
      },
    })
  ).current;

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const userJson = await AsyncStorage.getItem('user');
        const user = userJson ? JSON.parse(userJson) : null;
        const res = await api.get("/api/events", { params: { user_id: user?.id } });
        const items = (res.data?.data || []).map((e) => {
          const startDate = new Date(e.start_time);
          const endDate = new Date(e.end_time);
          return {
            id: e.id,
            title: e.title,
            description: e.description || "",
            time: startDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            date: `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, "0")}-${String(startDate.getDate()).padStart(2, "0")}`,
            startAt: startDate,
            endAt: endDate,
          };
        });
        setEvents(items);
        
        // Animate content in
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ]).start();
        
        try {
          const { scheduleNotificationAsync } = await import('expo-notifications');
          const scheduledKey = 'scheduledEventReminders_v1';
          const existingJson = await AsyncStorage.getItem(scheduledKey);
          const scheduled = existingJson ? JSON.parse(existingJson) : {};
          for (const ev of items) {
            const key = String(ev.id);
            if (!scheduled[key]) {
              if (ev.startAt > new Date()) {
                await scheduleNotificationAsync({
                  content: { title: 'Event starting', body: `${ev.title} starts now.` },
                  trigger: ev.startAt,
                });
              }
              if (ev.endAt > new Date()) {
                await scheduleNotificationAsync({
                  content: { title: 'Event ending', body: `${ev.title} ends now.` },
                  trigger: ev.endAt,
                });
              }
              scheduled[key] = true;
            }
          }
          await AsyncStorage.setItem(scheduledKey, JSON.stringify(scheduled));
        } catch {}
      } catch (err) {
        setError("Failed to load events");
        // eslint-disable-next-line no-console
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
    const interval = setInterval(fetchEvents, 15000);
    return () => clearInterval(interval);
  }, []);

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1);

  function getDaysInMonth(year, month) {
    return new Date(year, month, 0).getDate();
  }
  
  // Get the first day of the month (0 = Sunday, 1 = Monday, etc.)
  function getFirstDayOfMonth(year, month) {
    return new Date(year, month - 1, 1).getDay();
  }
  
  // Convert Sunday (0) to Monday (0) system
  function getDayIndex(day) {
    return day === 0 ? 6 : day - 1; // Sunday becomes 6, Monday becomes 0
  }
  
  // Build complete calendar grid with previous/next month dates
  function buildCalendarGrid(year, month) {
    const numDays = getDaysInMonth(year, month);
    const firstDayIndex = getDayIndex(getFirstDayOfMonth(year, month));
    
    // Get previous month's last days
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    const prevMonthDays = getDaysInMonth(prevYear, prevMonth);
    const prevMonthDates = [];
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      prevMonthDates.push({
        date: prevMonthDays - i,
        month: prevMonth,
        year: prevYear,
        isCurrentMonth: false,
      });
    }
    
    // Current month's dates
    const currentMonthDates = Array.from({ length: numDays }, (_, i) => ({
      date: i + 1,
      month: month,
      year: year,
      isCurrentMonth: true,
    }));
    
    // Get next month's first days to fill the grid
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    const totalCells = prevMonthDates.length + currentMonthDates.length;
    const remainingCells = 42 - totalCells; // 6 rows * 7 days = 42
    const nextMonthDates = Array.from({ length: remainingCells }, (_, i) => ({
      date: i + 1,
      month: nextMonth,
      year: nextYear,
      isCurrentMonth: false,
    }));
    
    return [...prevMonthDates, ...currentMonthDates, ...nextMonthDates];
  }
  
  const calendarGrid = buildCalendarGrid(currentYear, currentMonth);
  const dates = calendarGrid.filter(d => d.isCurrentMonth).map(d => d.date);

  const defaultSelected =
    today.getFullYear() === currentYear && today.getMonth() + 1 === currentMonth
      ? today.getDate()
      : 1;
  const [selectedDate, setSelectedDate] = useState(defaultSelected);

  function handleMonthChange(next) {
    // Animate month change
    fadeAnim.setValue(0);
    slideAnim.setValue(next ? -50 : 50);
    
    let newMonth = currentMonth + (next ? 1 : -1);
    let newYear = currentYear;
    if (newMonth < 1) {
      newMonth = 12;
      newYear--;
    } else if (newMonth > 12) {
      newMonth = 1;
      newYear++;
    }
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
    
    // Set selected date to today if it's the current month, otherwise first day
    const newToday = new Date();
    if (newYear === newToday.getFullYear() && newMonth === newToday.getMonth() + 1) {
      setSelectedDate(newToday.getDate());
    } else {
      setSelectedDate(1);
    }
    
    // Animate back in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }

  // Get event icon based on title/category
  const getEventIcon = (title) => {
    const t = (title || '').toLowerCase();
    if (t.includes('party') || t.includes('celebration')) return '🎉';
    if (t.includes('sport') || t.includes('game')) return '⚽';
    if (t.includes('academic') || t.includes('school')) return '🎓';
    if (t.includes('tech') || t.includes('ai')) return '🤖';
    if (t.includes('music') || t.includes('concert')) return '🎵';
    if (t.includes('art') || t.includes('cultural')) return '🎨';
    if (t.includes('workshop') || t.includes('seminar')) return '📚';
    return '📅';
  };

  // Get event color based on status
  const getEventColor = (event) => {
    const now = new Date();
    if (event.endAt && now > event.endAt) return '#E0E0E0'; // Past - gray
    if (event.startAt && now >= event.startAt && event.endAt && now <= event.endAt) return '#4CAF50'; // Ongoing - green
    if (event.startAt && event.startAt.getTime() - now.getTime() < 24 * 60 * 60 * 1000) return '#FF9800'; // Soon - orange
    return '#2196F3'; // Upcoming - blue
  };

  const selectedDateString = formatDate(currentYear, currentMonth, selectedDate);
  const eventsForSelectedDate = events.filter((e) => e.date === selectedDateString);

  const eventDates = events
    .filter((e) => e.date.startsWith(`${currentYear}-${String(currentMonth).padStart(2, "0")}`))
    .map((e) => Number(e.date.split("-")[2]));

  const monthlyEvents = events.filter((e) =>
    e.date.startsWith(`${currentYear}-${String(currentMonth).padStart(2, "0")}`)
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.headerBg }}>
      {/* Header */}
      <View style={{ padding: 16, backgroundColor: colors.headerBg }}>
        <Text style={{ fontSize: 24, fontWeight: "bold", color: colors.headerText, marginBottom: 20 }}>
          Event Calendar
        </Text>
      </View>

      <View
        style={{
          flex: 1,
          backgroundColor: colors.card,
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
        }}
      >
        <ScrollView 
          style={{ padding: 16 }}
          contentContainerStyle={{ paddingBottom: 30 }}
          showsVerticalScrollIndicator={true}
        >
          {/* Month selector */}
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateX: slideAnim }],
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
                backgroundColor: colors.surface,
                padding: 15,
                borderRadius: 15,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <TouchableOpacity 
                onPress={() => handleMonthChange(false)}
                style={{
                  backgroundColor: colors.primary,
                  borderRadius: 20,
                  padding: 8,
                }}
              >
                <Ionicons name="chevron-back" size={20} color="white" />
              </TouchableOpacity>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 20, fontWeight: "bold", color: colors.text }}>
                  {monthNames[currentMonth - 1]} {currentYear}
                </Text>
                <Text style={{ fontSize: 12, color: colors.text, opacity: 0.6, marginTop: 2 }}>
                  {monthlyEvents.length} {monthlyEvents.length === 1 ? 'event' : 'events'} this month
                </Text>
              </View>
              <TouchableOpacity 
                onPress={() => handleMonthChange(true)}
                style={{
                  backgroundColor: colors.primary,
                  borderRadius: 20,
                  padding: 8,
                }}
              >
                <Ionicons name="chevron-forward" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Days of week header */}
          <View
            style={{
              flexDirection: "row",
              marginBottom: 8,
              paddingHorizontal: 15,
            }}
          >
            {days.map((day) => (
              <View
                key={day}
                style={{
                  width: (width - 60) / 7,
                  alignItems: "center",
                  paddingVertical: 8,
                }}
              >
                <Text
                  style={{
                    color: colors.text,
                    opacity: 0.6,
                    fontSize: 13,
                    fontWeight: "700",
                    textTransform: "uppercase",
                  }}
                >
                  {day}
                </Text>
              </View>
            ))}
          </View>

          {/* Calendar grid */}
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateX: slideAnim }],
              marginBottom: 30,
              backgroundColor: colors.surface,
              borderRadius: 15,
              padding: 8,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            {/* Calendar rows */}
            {Array.from({ length: 6 }, (_, rowIndex) => {
              const weekDates = calendarGrid.slice(rowIndex * 7, (rowIndex + 1) * 7);
              return (
                <View
                  key={rowIndex}
                  style={{
                    flexDirection: "row",
                    marginBottom: rowIndex < 5 ? 4 : 0,
                  }}
                >
                  {weekDates.map((cell, cellIndex) => {
                    const hasEvent = cell.isCurrentMonth && eventDates.includes(cell.date);
                    const isSelected = cell.isCurrentMonth && selectedDate === cell.date;
                    const isToday = 
                      cell.isCurrentMonth &&
                      cell.year === today.getFullYear() &&
                      cell.month === today.getMonth() + 1 &&
                      cell.date === today.getDate();

                    return (
                      <TouchableOpacity
                        key={`${cell.year}-${cell.month}-${cell.date}-${cellIndex}`}
                        onPress={() => {
                          if (cell.isCurrentMonth) {
                            setSelectedDate(cell.date);
                          } else {
                            // Navigate to that month
                            setCurrentYear(cell.year);
                            setCurrentMonth(cell.month);
                            setSelectedDate(cell.date);
                          }
                        }}
                        style={{
                          width: (width - 60) / 7,
                          height: (width - 60) / 7,
                          justifyContent: "center",
                          alignItems: "center",
                          borderRadius: 10,
                          margin: 2,
                          backgroundColor: isSelected
                            ? colors.primary
                            : isToday
                            ? colors.primary + '20'
                            : hasEvent && cell.isCurrentMonth
                            ? colors.primary + '10'
                            : "transparent",
                          borderWidth: isToday ? 2 : 0,
                          borderColor: colors.primary,
                          opacity: cell.isCurrentMonth ? 1 : 0.3,
                        }}
                      >
                        <Text
                          style={{
                            color: isSelected 
                              ? "white" 
                              : isToday 
                              ? colors.primary 
                              : cell.isCurrentMonth 
                              ? colors.text 
                              : colors.text,
                            fontWeight: isSelected || hasEvent || isToday ? "bold" : "normal",
                            fontSize: isSelected || isToday ? 16 : 14,
                          }}
                        >
                          {cell.date}
                        </Text>
                        {hasEvent && !isSelected && cell.isCurrentMonth && (
                          <View
                            style={{
                              width: 5,
                              height: 5,
                              borderRadius: 2.5,
                              backgroundColor: colors.primary,
                              position: "absolute",
                              bottom: 6,
                            }}
                          />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              );
            })}
          </Animated.View>

          {/* Events for selected date */}
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            {eventsForSelectedDate.length > 0 && (
              <>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
                  <Ionicons name="calendar" size={24} color={colors.primary} style={{ marginRight: 10 }} />
                  <Text style={{ fontSize: 20, fontWeight: "bold", color: colors.text }}>
                    {loading ? "Loading..." : `${eventsForSelectedDate.length} ${eventsForSelectedDate.length === 1 ? 'Event' : 'Events'} on ${monthNames[currentMonth - 1]} ${selectedDate}`}
                  </Text>
                </View>
                <View style={{ gap: 15 }}>
                  {eventsForSelectedDate.map((event, index) => {
                    const eventColor = getEventColor(event);
                    const eventIcon = getEventIcon(event.title);
                  
                  return (
                    <Animated.View
                      key={event.id}
                      style={{
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }],
                        flexDirection: "row",
                        alignItems: "center",
                        backgroundColor: colors.surface,
                        padding: 18,
                        borderRadius: 16,
                        borderLeftWidth: 5,
                        borderLeftColor: eventColor,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                        elevation: 3,
                      }}
                    >
                      <View style={{
                        width: 50,
                        height: 50,
                        borderRadius: 25,
                        backgroundColor: eventColor + '20',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginRight: 15,
                      }}>
                        <Text style={{ fontSize: 24 }}>{eventIcon}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                          <Ionicons name="time-outline" size={14} color={eventColor} style={{ marginRight: 5 }} />
                          <Text style={{ fontWeight: "bold", color: eventColor, fontSize: 12 }}>
                            {event.time}
                          </Text>
                        </View>
                        <Text style={{ fontWeight: "bold", color: colors.text, fontSize: 16, marginBottom: 5 }}>
                          {event.title}
                        </Text>
                        {event.description && (
                          <Text style={{ color: colors.text, opacity: 0.7, fontSize: 13 }} numberOfLines={2}>
                            {event.description}
                          </Text>
                        )}
                      </View>
                    </Animated.View>
                  );
                  })}
                </View>
              </>
            )}
          </Animated.View>

        </ScrollView>

        {/* Draggable Floating Monthly Events Summary */}
        {monthlyEvents.length > 0 && (
          <Animated.View
            style={{
              position: "absolute",
              bottom: 20,
              right: 16,
              transform: [{ translateX: pan.x }, { translateY: pan.y }],
              backgroundColor: colors.card || colors.surface,
              padding: 12,
              borderRadius: 12,
              maxWidth: 200,
              maxHeight: 200,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 5,
            }}
            {...panResponder.panHandlers}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ fontWeight: "bold", color: colors.text, fontSize: 14 }}>
                Events this month:
              </Text>
              <View style={{
                width: 20,
                height: 4,
                backgroundColor: colors.text,
                opacity: 0.3,
                borderRadius: 2,
              }} />
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {monthlyEvents.map((event) => {
                const eventDay = parseInt(event.date.split("-")[2]);
                return (
                  <TouchableOpacity
                    key={event.id}
                    onPress={() => setSelectedDate(eventDay)}
                    style={{ marginBottom: 6 }}
                  >
                    <Text style={{ fontSize: 13, color: colors.text, lineHeight: 18 }}>
                      {String(eventDay).padStart(2, '0')} - {event.title}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </Animated.View>
        )}

      </View>
    </SafeAreaView>
  );
}
