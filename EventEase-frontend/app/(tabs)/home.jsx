import { View, Text, ScrollView, TouchableOpacity, Image, TextInput, ActivityIndicator, Modal } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { useState, useEffect } from "react"
import { useRouter } from "expo-router"
import { useTheme } from "../../assets/components/theme-provider"
import AsyncStorage from "@react-native-async-storage/async-storage"
import api from "@/constants/axios"

export default function Home() {
  const router = useRouter();
  const { colors } = useTheme();
  const [search, setSearch] = useState("");
  const [reminders, setReminders] = useState([]);
  const [loadingReminders, setLoadingReminders] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventDetails, setEventDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [recentEvents, setRecentEvents] = useState([]);
  const [loadingRecentEvents, setLoadingRecentEvents] = useState(false);
  const [featuredEvent, setFeaturedEvent] = useState(null);

  // Fetch reminders (upcoming events)
  useEffect(() => {
    const fetchReminders = async () => {
      try {
        setLoadingReminders(true);
        const userJson = await AsyncStorage.getItem('user');
        const user = userJson ? JSON.parse(userJson) : null;
        
        if (!user?.id) {
          setLoadingReminders(false);
          return;
        }

        const res = await api.get("/api/events", { params: { user_id: user.id } });
        const events = res.data?.data || [];
        
        // Parse dates and filter for upcoming/ongoing events
        const now = new Date();
        const upcomingReminders = events
          .map((e) => {
            const startDate = e.start_time ? new Date(e.start_time) : null;
            const endDate = e.end_time ? new Date(e.end_time) : null;
            
            if (!startDate) return null;
            
            // Calculate time until event
            const timeUntil = startDate.getTime() - now.getTime();
            const hoursUntil = Math.floor(timeUntil / (1000 * 60 * 60));
            const daysUntil = Math.floor(hoursUntil / 24);
            
            // Determine if event is upcoming or ongoing
            let status = 'upcoming';
            if (endDate && now >= startDate && now <= endDate) {
              status = 'ongoing';
            } else if (endDate && now > endDate) {
              status = 'ended';
            }
            
            return {
              id: e.id,
              title: e.title,
              startTime: startDate,
              endTime: endDate,
              status,
              hoursUntil,
              daysUntil,
              venue: e.location || e.venue?.name || 'TBA',
            };
          })
          .filter(e => e && (e.status === 'upcoming' || e.status === 'ongoing'))
          .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
          .slice(0, 5); // Show only top 5 upcoming events
        
        setReminders(upcomingReminders);
      } catch (error) {
        console.log("Error fetching reminders:", error);
      } finally {
        setLoadingReminders(false);
      }
    };

    fetchReminders();
    // Refresh reminders every 5 minutes
    const interval = setInterval(fetchReminders, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch recent events (2-3 most recent events from all events)
  useEffect(() => {
    const fetchRecentEvents = async () => {
      try {
        setLoadingRecentEvents(true);
        const userJson = await AsyncStorage.getItem('user');
        const user = userJson ? JSON.parse(userJson) : null;
        
        if (!user?.id) {
          setLoadingRecentEvents(false);
          return;
        }

        const res = await api.get("/api/events", { params: { user_id: user.id } });
        const events = res.data?.data || [];
        
        // Parse dates and sort by start time (most recent first)
        const now = new Date();
        const parsedEvents = events
          .map((e) => {
            const startDate = e.start_time ? new Date(e.start_time) : null;
            const endDate = e.end_time ? new Date(e.end_time) : null;
            
            if (!startDate) return null;
            
            // Determine status
            let status = 'upcoming';
            if (endDate && now >= startDate && now <= endDate) {
              status = 'ongoing';
            } else if (endDate && now > endDate) {
              status = 'completed';
            }
            
            return {
              id: e.id,
              title: e.title,
              startDate,
              endDate,
              status,
              venue: e.location || e.venue?.name || 'TBA',
              category: e.category?.name || e.category || null,
              description: e.description,
              attendanceCount: 0, // Will be fetched separately
            };
          })
          .filter(e => e !== null)
          .sort((a, b) => b.startDate.getTime() - a.startDate.getTime()) // Most recent first
          .slice(0, 3); // Show only 2-3 most recent events
        
        setRecentEvents(parsedEvents);
        
        // Get featured event (most upcoming or ongoing)
        const upcomingOrOngoing = parsedEvents.filter(e => e.status === 'upcoming' || e.status === 'ongoing');
        if (upcomingOrOngoing.length > 0) {
          const featured = upcomingOrOngoing[0];
          setFeaturedEvent({
            id: featured.id,
            title: featured.title,
            date: formatEventDateTime(featured.startDate),
            description: events.find(e => e.id === featured.id)?.description || 'Join us for this exciting event!',
            image: require("../../assets/images/foundation.jpg"), // Default image
          });
        }
        
        // Fetch attendance counts for each event
        for (const event of parsedEvents) {
          try {
            const attendanceRes = await api.get(`/api/events/${event.id}/attendees`);
            const attendees = attendanceRes.data?.data?.attendees || attendanceRes.data?.attendees || [];
            const presentCount = attendees.filter(a => a.status === 'present').length;
            
            setRecentEvents(prev => prev.map(ev => 
              ev.id === event.id ? { ...ev, attendanceCount: presentCount } : ev
            ));
          } catch (err) {
            console.log(`Error fetching attendance for event ${event.id}:`, err);
          }
        }
      } catch (error) {
        console.log("Error fetching recent events:", error);
      } finally {
        setLoadingRecentEvents(false);
      }
    };

    fetchRecentEvents();
    // Refresh every 2 minutes
    const interval = setInterval(fetchRecentEvents, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Format time until event
  const formatTimeUntil = (days, hours) => {
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} away`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} away`;
    } else {
      return 'Starting soon';
    }
  };

  // Format date and time
  const formatEventDateTime = (date) => {
    if (!date) return '';
    const options = { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    };
    return date.toLocaleDateString('en-US', options);
  };

  // Format date only
  const formatDate = (date) => {
    if (!date) return '';
    const options = { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric', 
      year: 'numeric'
    };
    return date.toLocaleDateString('en-US', options);
  };

  // Format time only
  const formatTime = (date) => {
    if (!date) return '';
    const options = { 
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    };
    return date.toLocaleTimeString('en-US', options);
  };

  // Fetch event details when a reminder is clicked
  useEffect(() => {
    const fetchEventDetails = async () => {
      if (!selectedEvent) return;

      try {
        setLoadingDetails(true);
        const userJson = await AsyncStorage.getItem('user');
        const user = userJson ? JSON.parse(userJson) : null;
        
        if (!user?.id) {
          setLoadingDetails(false);
          return;
        }

        // Fetch all events and find the selected one
        const res = await api.get("/api/events", { params: { user_id: user.id } });
        const events = res.data?.data || [];
        const event = events.find(e => e.id === selectedEvent.id);
        
        if (event) {
          const startDate = event.start_time ? new Date(event.start_time) : null;
          const endDate = event.end_time ? new Date(event.end_time) : null;
          
          setEventDetails({
            ...event,
            startDate: startDate || selectedEvent.startTime,
            endDate: endDate || selectedEvent.endTime,
            venue: event.location || event.venue?.name || selectedEvent.venue || 'TBA',
            category: event.category?.name || event.category || 'General',
            status: selectedEvent.status, // Use status from reminder
          });
        } else {
          // If event not found in API, use reminder data
          setEventDetails({
            ...selectedEvent,
            startDate: selectedEvent.startTime,
            endDate: selectedEvent.endTime,
            description: selectedEvent.description || 'No description available.',
          });
        }
      } catch (error) {
        console.log("Error fetching event details:", error);
        // Fallback to reminder data if API fails
        setEventDetails({
          ...selectedEvent,
          startDate: selectedEvent.startTime,
          endDate: selectedEvent.endTime,
          description: selectedEvent.description || 'No description available.',
        });
      } finally {
        setLoadingDetails(false);
      }
    };

    fetchEventDetails();
  }, [selectedEvent]);

  // Filter events by search (for recent events)
  const filteredRecentEvents = search 
    ? recentEvents.filter(event =>
    event.title.toLowerCase().includes(search.toLowerCase()) ||
        (event.startDate && formatEventDateTime(event.startDate).toLowerCase().includes(search.toLowerCase()))
      )
    : recentEvents;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.headerBg }}>
      {/* Header with Search */}
      <View style={{ padding: 16, backgroundColor: colors.headerBg }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.card,
            borderRadius: 25,
            paddingHorizontal: 15,
            paddingVertical: 10,
            marginBottom: 10,
          }}
        >
          <Ionicons name="search" size={20} color={colors.text} />
          <TextInput
            style={{ marginLeft: 10, color: colors.text, flex: 1 }}
            placeholder="Search..."
            placeholderTextColor={colors.text + '99'}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* Content */}
      <View style={{ 
        flex: 1, 
        backgroundColor: colors.card, 
        borderTopLeftRadius: 30, 
        borderTopRightRadius: 30,
        paddingTop: 20
      }}>
        <ScrollView style={{ padding: 16 }}>
          {/* Featured Event Banner */}
          {featuredEvent ? (
          <TouchableOpacity
            style={{
              backgroundColor: "#FFF3E0",
              borderRadius: 16,
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 25,
              padding: 16,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 4,
              elevation: 2,
            }}
              onPress={() => {
                const event = recentEvents.find(e => e.id === featuredEvent.id) || reminders.find(r => r.id === featuredEvent.id);
                if (event) {
                  setSelectedEvent(event);
                } else {
                  router.push(`/attendance-details?id=${featuredEvent.id}`);
                }
              }}
          >
            <Image
              source={featuredEvent.image}
              style={{ width: 80, height: 80, borderRadius: 12, marginRight: 16 }}
            />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 4, color: colors.text }}>{featuredEvent.title}</Text>
              <Text style={{ color: colors.text, opacity: 0.7, fontSize: 13, marginBottom: 4 }}>{featuredEvent.date}</Text>
                <Text style={{ color: colors.text, opacity: 0.8, fontSize: 12 }} numberOfLines={2}>{featuredEvent.description}</Text>
              </View>
            </TouchableOpacity>
          ) : loadingRecentEvents ? (
            <View style={{ alignItems: 'center', padding: 20, marginBottom: 25 }}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : null}

          {/* Reminders Section */}
          <View style={{ marginBottom: 25 }}>
            <View style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: 15 
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="notifications" size={20} color={colors.primary} style={{ marginRight: 8 }} />
                <Text style={{ fontSize: 18, fontWeight: "bold", color: colors.text }}>Reminders</Text>
              </View>
            </View>

            {loadingReminders ? (
              <View style={{ alignItems: 'center', padding: 20 }}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            ) : reminders.length > 0 ? (
              reminders.map((reminder) => (
                <TouchableOpacity
                  key={reminder.id}
                  style={{
                    backgroundColor: reminder.status === 'ongoing' ? '#E8F5E9' : '#FFF3E0',
                    borderRadius: 12,
                    padding: 14,
                    marginBottom: 10,
                    borderLeftWidth: 4,
                    borderLeftColor: reminder.status === 'ongoing' ? '#4CAF50' : '#FF9800',
                  }}
                  onPress={() => {
                    console.log('Reminder clicked:', reminder);
                    setSelectedEvent(reminder);
                  }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                        <Ionicons 
                          name={reminder.status === 'ongoing' ? 'time' : 'calendar'} 
                          size={16} 
                          color={reminder.status === 'ongoing' ? '#4CAF50' : '#FF9800'} 
                          style={{ marginRight: 6 }}
                        />
                        <Text style={{ 
                          fontSize: 12, 
                          fontWeight: '600', 
                          color: reminder.status === 'ongoing' ? '#4CAF50' : '#FF9800',
                          textTransform: 'uppercase'
                        }}>
                          {reminder.status === 'ongoing' ? 'Ongoing Now' : formatTimeUntil(reminder.daysUntil, reminder.hoursUntil)}
                        </Text>
                      </View>
                      <Text style={{ 
                        fontSize: 16, 
                        fontWeight: 'bold', 
                        color: colors.text,
                        marginBottom: 6
                      }}>
                        {reminder.title}
                      </Text>
                      <Text style={{ 
                        fontSize: 12, 
                        color: colors.text, 
                        opacity: 0.7,
                        marginBottom: 4
                      }}>
                        <Ionicons name="time-outline" size={12} color={colors.text} /> {formatEventDateTime(reminder.startTime)}
                      </Text>
                      <Text style={{ 
                        fontSize: 12, 
                        color: colors.text, 
                        opacity: 0.7
                      }}>
                        <Ionicons name="location-outline" size={12} color={colors.text} /> {reminder.venue}
                      </Text>
                    </View>
                    <Ionicons 
                      name="chevron-forward" 
                      size={20} 
                      color={colors.text} 
                      style={{ opacity: 0.5, marginLeft: 8 }}
                    />
            </View>
          </TouchableOpacity>
              ))
            ) : (
              <View style={{
                backgroundColor: colors.surface,
                borderRadius: 12,
                padding: 20,
                alignItems: 'center',
              }}>
                <Ionicons name="notifications-outline" size={40} color={colors.text} style={{ opacity: 0.3, marginBottom: 8 }} />
                <Text style={{ color: colors.text, opacity: 0.6, fontSize: 14 }}>
                  No upcoming events to remind you about
                </Text>
              </View>
            )}
          </View>

          {/* Recent Events Section */}
          <View style={{ marginBottom: 25 }}>
            <View style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: 15 
            }}>
              <Text style={{ fontSize: 18, fontWeight: "bold", color: colors.text }}>Recent Events</Text>
              <TouchableOpacity
                onPress={() => {
                  console.log('Navigating to all-events');
                  router.push('/all-events');
                }}
              >
                <Text style={{ color: colors.primary, fontSize: 14 }}>See All</Text>
              </TouchableOpacity>
            </View>

            {loadingRecentEvents ? (
              <View style={{ alignItems: 'center', padding: 20 }}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            ) : filteredRecentEvents.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 15 }}
            >
                {filteredRecentEvents.map((event) => {
                  // Get icon and color based on category or default
                  const getEventIcon = (category) => {
                    const cat = (category || '').toLowerCase();
                    if (cat.includes('academic') || cat.includes('school')) return '🎓';
                    if (cat.includes('sport')) return '⚽';
                    if (cat.includes('cultural') || cat.includes('art')) return '🎨';
                    if (cat.includes('tech') || cat.includes('ai')) return '🤖';
                    return '📅';
                  };
                  
                  const getEventColor = (category) => {
                    const cat = (category || '').toLowerCase();
                    if (cat.includes('academic') || cat.includes('school')) return '#FFD8D8';
                    if (cat.includes('sport')) return '#D8FFD8';
                    if (cat.includes('cultural') || cat.includes('art')) return '#FFD8FF';
                    if (cat.includes('tech') || cat.includes('ai')) return '#D8E6FF';
                    return '#E8E8E8';
                  };
                  
                  const eventIcon = getEventIcon(event.category);
                  const eventColor = getEventColor(event.category);
                  const eventDate = event.startDate ? formatEventDateTime(event.startDate) : 'TBA';
                  
                return (
                  <TouchableOpacity
                    key={event.id}
                    style={{
                      width: 200,
                        backgroundColor: eventColor,
                      borderRadius: 12,
                      padding: 15,
                      justifyContent: "space-between",
                      height: 150,
                    }}
                      onPress={() => setSelectedEvent(event)}
                  >
                    <View>
                        <Text style={{ fontSize: 24 }}>{eventIcon}</Text>
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "bold",
                          marginTop: 10,
                            color: colors.text,
                        }}
                          numberOfLines={2}
                      >
                        {event.title}
                      </Text>
                      <Text
                        style={{
                          fontSize: 12,
                          color: colors.text,
                          opacity: 0.7,
                          marginTop: 5,
                        }}
                      >
                          {eventDate}
                      </Text>
                    </View>

                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                    >
                        <Text style={{ fontSize: 12, color: colors.text, opacity: 0.7 }}>
                          {event.attendanceCount || 0} {event.attendanceCount === 1 ? 'student' : 'students'} {event.status === 'completed' ? 'attended' : 'registered'}
                        </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            ) : (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <Text style={{ color: colors.text, opacity: 0.6 }}>No recent events</Text>
              </View>
            )}
          </View>

          

        </ScrollView>
      </View>

      {/* Event Details Modal */}
      <Modal
        visible={selectedEvent !== null}
        animationType="slide"
        transparent={true}
        statusBarTranslucent={true}
        onRequestClose={() => {
          console.log('Modal close requested');
          setSelectedEvent(null);
          setEventDetails(null);
        }}
      >
        <View style={{ 
          flex: 1, 
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'flex-end'
        }}>
          <TouchableOpacity 
            activeOpacity={1}
            onPress={() => {
              setSelectedEvent(null);
              setEventDetails(null);
            }}
            style={{ flex: 1 }}
          />
          <View 
            style={{ 
              backgroundColor: colors.card,
              borderTopLeftRadius: 25,
              borderTopRightRadius: 25,
              maxHeight: '90%',
              paddingBottom: 20
            }}
          >
            {/* Modal Header */}
            <View style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: 20,
              borderBottomWidth: 1,
              borderBottomColor: colors.border
            }}>
              <Text style={{ 
                fontSize: 20, 
                fontWeight: 'bold', 
                color: colors.text 
              }}>
                Event Details
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setSelectedEvent(null);
                  setEventDetails(null);
                }}
                style={{
                  padding: 5
                }}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Modal Content */}
            <ScrollView style={{ padding: 20 }} showsVerticalScrollIndicator={true}>
              {loadingDetails ? (
                <View style={{ alignItems: 'center', padding: 40 }}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text style={{ marginTop: 10, color: colors.text, opacity: 0.7 }}>
                    Loading event details...
                  </Text>
                </View>
              ) : eventDetails ? (
                <>
                  {/* Event Title */}
                  <Text style={{ 
                    fontSize: 24, 
                    fontWeight: 'bold', 
                    color: colors.text,
                    marginBottom: 20
                  }}>
                    {eventDetails.title}
                  </Text>

                  {/* Status Badge */}
                  <View style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    marginBottom: 20 
                  }}>
                    <View style={{
                      backgroundColor: eventDetails.status === 'ongoing' ? '#E8F5E9' : '#FFF3E0',
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 20,
                      flexDirection: 'row',
                      alignItems: 'center'
                    }}>
                      <Ionicons 
                        name={eventDetails.status === 'ongoing' ? 'time' : 'calendar'} 
                        size={14} 
                        color={eventDetails.status === 'ongoing' ? '#4CAF50' : '#FF9800'} 
                        style={{ marginRight: 6 }}
                      />
                      <Text style={{ 
                        fontSize: 12, 
                        fontWeight: '600', 
                        color: eventDetails.status === 'ongoing' ? '#4CAF50' : '#FF9800',
                        textTransform: 'uppercase'
                      }}>
                        {eventDetails.status === 'ongoing' ? 'Ongoing Now' : 'Upcoming'}
                      </Text>
                    </View>
                  </View>

                  {/* Date and Time */}
                  <View style={{ 
                    backgroundColor: colors.surface, 
                    borderRadius: 12, 
                    padding: 16,
                    marginBottom: 15
                  }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                      <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                      <View style={{ marginLeft: 12, flex: 1 }}>
                        <Text style={{ fontSize: 12, color: colors.text, opacity: 0.6, marginBottom: 4 }}>
                          Start Date & Time
                        </Text>
                        <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text }}>
                          {eventDetails.startDate ? formatDate(eventDetails.startDate) : 'TBA'}
                        </Text>
                        <Text style={{ fontSize: 13, color: colors.text, opacity: 0.8, marginTop: 2 }}>
                          {eventDetails.startDate ? formatTime(eventDetails.startDate) : ''}
                        </Text>
                      </View>
                    </View>

                    {eventDetails.endDate && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border }}>
                        <Ionicons name="time-outline" size={20} color={colors.primary} />
                        <View style={{ marginLeft: 12, flex: 1 }}>
                          <Text style={{ fontSize: 12, color: colors.text, opacity: 0.6, marginBottom: 4 }}>
                            End Date & Time
                          </Text>
                          <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text }}>
                            {formatDate(eventDetails.endDate)}
                          </Text>
                          <Text style={{ fontSize: 13, color: colors.text, opacity: 0.8, marginTop: 2 }}>
                            {formatTime(eventDetails.endDate)}
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>

                  {/* Venue */}
                  <View style={{ 
                    backgroundColor: colors.surface, 
                    borderRadius: 12, 
                    padding: 16,
                    marginBottom: 15
                  }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="location-outline" size={20} color={colors.primary} />
                      <View style={{ marginLeft: 12, flex: 1 }}>
                        <Text style={{ fontSize: 12, color: colors.text, opacity: 0.6, marginBottom: 4 }}>
                          Venue
                        </Text>
                        <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text }}>
                          {eventDetails.venue}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Category */}
                  {eventDetails.category && (
                    <View style={{ 
                      backgroundColor: colors.surface, 
                      borderRadius: 12, 
                      padding: 16,
                      marginBottom: 15
                    }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="pricetag-outline" size={20} color={colors.primary} />
                        <View style={{ marginLeft: 12, flex: 1 }}>
                          <Text style={{ fontSize: 12, color: colors.text, opacity: 0.6, marginBottom: 4 }}>
                            Category
                          </Text>
                          <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text }}>
                            {eventDetails.category}
                          </Text>
                        </View>
                      </View>
                    </View>
                  )}

                  {/* Description */}
                  {eventDetails.description && (
                    <View style={{ 
                      backgroundColor: colors.surface, 
                      borderRadius: 12, 
                      padding: 16,
                      marginBottom: 15
                    }}>
                      <Text style={{ 
                        fontSize: 16, 
                        fontWeight: 'bold', 
                        color: colors.text,
                        marginBottom: 12
                      }}>
                        About this Event
                      </Text>
                      <Text style={{ 
                        fontSize: 14, 
                        color: colors.text, 
                        opacity: 0.8,
                        lineHeight: 22
                      }}>
                        {eventDetails.description}
                      </Text>
                    </View>
                  )}

                  {/* Target Audience */}
                  {eventDetails.target_audience && (
                    <View style={{ 
                      backgroundColor: colors.surface, 
                      borderRadius: 12, 
                      padding: 16,
                      marginBottom: 15
                    }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="people-outline" size={20} color={colors.primary} />
                        <View style={{ marginLeft: 12, flex: 1 }}>
                          <Text style={{ fontSize: 12, color: colors.text, opacity: 0.6, marginBottom: 4 }}>
                            Target Audience
                          </Text>
                          <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text }}>
                            {eventDetails.target_audience === 'all_students' 
                              ? 'All Students' 
                              : eventDetails.target_audience?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'All Students'}
                          </Text>
                        </View>
                      </View>
              </View>
                  )}
                </>
              ) : (
                <View style={{ alignItems: 'center', padding: 40 }}>
                  <Ionicons name="alert-circle-outline" size={48} color={colors.text} style={{ opacity: 0.5, marginBottom: 12 }} />
                  <Text style={{ color: colors.text, opacity: 0.7 }}>
                    Unable to load event details
                  </Text>
          </View>
              )}
        </ScrollView>
      </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

