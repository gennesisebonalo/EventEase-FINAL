import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "@/constants/axios";
import { useTheme } from "../assets/components/theme-provider";

export default function AllEvents() {
  const router = useRouter();
  const { colors } = useTheme();
  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventDetails, setEventDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

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

  // Get event icon and color based on category
  const getEventIcon = (category) => {
    const cat = (category || '').toLowerCase();
    if (cat.includes('academic') || cat.includes('school')) return '🎓';
    if (cat.includes('sport')) return '⚽';
    if (cat.includes('cultural') || cat.includes('art')) return '🎨';
    if (cat.includes('tech') || cat.includes('ai')) return '🤖';
    if (cat.includes('party') || cat.includes('celebration')) return '🎉';
    return '📅';
  };
  
  const getEventColor = (category) => {
    const cat = (category || '').toLowerCase();
    if (cat.includes('academic') || cat.includes('school')) return '#FFD8D8';
    if (cat.includes('sport')) return '#D8FFD8';
    if (cat.includes('cultural') || cat.includes('art')) return '#FFD8FF';
    if (cat.includes('tech') || cat.includes('ai')) return '#D8E6FF';
    if (cat.includes('party') || cat.includes('celebration')) return '#FFF3E0';
    return '#E8E8E8';
  };

  // Fetch all events
  useEffect(() => {
    const fetchAllEvents = async () => {
      try {
        setLoading(true);
        const userJson = await AsyncStorage.getItem('user');
        const user = userJson ? JSON.parse(userJson) : null;
        
        if (!user?.id) {
          setLoading(false);
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
          .sort((a, b) => b.startDate.getTime() - a.startDate.getTime()); // Most recent first
        
        setAllEvents(parsedEvents);
        
        // Fetch attendance counts for each event
        for (const event of parsedEvents) {
          try {
            const attendanceRes = await api.get(`/api/events/${event.id}/attendees`);
            const attendees = attendanceRes.data?.data?.attendees || attendanceRes.data?.attendees || [];
            const presentCount = attendees.filter(a => a.status === 'present').length;
            
            setAllEvents(prev => prev.map(ev => 
              ev.id === event.id ? { ...ev, attendanceCount: presentCount } : ev
            ));
          } catch (err) {
            console.log(`Error fetching attendance for event ${event.id}:`, err);
          }
        }
      } catch (error) {
        console.log("Error fetching all events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllEvents();
  }, []);

  // Fetch event details when clicked
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

        const res = await api.get("/api/events", { params: { user_id: user.id } });
        const events = res.data?.data || [];
        const event = events.find(e => e.id === selectedEvent.id);
        
        if (event) {
          const startDate = event.start_time ? new Date(event.start_time) : null;
          const endDate = event.end_time ? new Date(event.end_time) : null;
          
          setEventDetails({
            ...event,
            startDate: startDate || selectedEvent.startDate,
            endDate: endDate || selectedEvent.endDate,
            venue: event.location || event.venue?.name || selectedEvent.venue || 'TBA',
            category: event.category?.name || event.category || 'General',
            status: selectedEvent.status,
          });
        }
      } catch (error) {
        console.log("Error fetching event details:", error);
      } finally {
        setLoadingDetails(false);
      }
    };

    fetchEventDetails();
  }, [selectedEvent]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#4A56E2" }}>
      {/* Header */}
      <View style={{ padding: 16, backgroundColor: "#4A56E2", flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 10 }}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={{ fontSize: 24, fontWeight: "bold", color: "white" }}>All Events</Text>
      </View>
      <View style={{ flex: 1, backgroundColor: colors.card || "white", borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingTop: 20 }}>
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
            <ActivityIndicator size="large" color={colors.primary || "#4A56E2"} />
            <Text style={{ marginTop: 10, color: colors.text || "#666" }}>Loading events...</Text>
          </View>
        ) : allEvents.length > 0 ? (
        <ScrollView style={{ padding: 16 }}>
            {allEvents.map((event) => {
              const eventIcon = getEventIcon(event.category);
              const eventColor = getEventColor(event.category);
              const eventDate = event.startDate ? formatEventDateTime(event.startDate) : 'TBA';
              
              return (
                <TouchableOpacity
              key={event.id}
              style={{
                    backgroundColor: eventColor,
                borderRadius: 12,
                padding: 15,
                marginBottom: 18,
                flexDirection: 'row',
                alignItems: 'center',
              }}
                  onPress={() => setSelectedEvent(event)}
            >
              <View style={{ marginRight: 16, alignItems: 'center' }}>
                    <Text style={{ fontSize: 32 }}>{eventIcon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: "bold", color: colors.text || "#000" }}>{event.title}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                      <Ionicons name="calendar-outline" size={12} color={colors.text || "#666"} style={{ marginRight: 4 }} />
                      <Text style={{ fontSize: 12, color: colors.text || "#666" }}>{eventDate}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                      <Ionicons name="location-outline" size={12} color={colors.text || "#666"} style={{ marginRight: 4 }} />
                      <Text style={{ fontSize: 12, color: colors.text || "#666" }}>{event.venue}</Text>
                    </View>
                    <Text style={{ fontSize: 12, color: colors.text || "#666", marginTop: 4 }}>
                      {event.attendanceCount || 0} {event.attendanceCount === 1 ? 'student' : 'students'} {event.status === 'completed' ? 'attended' : 'registered'}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.text || "#666"} style={{ opacity: 0.5 }} />
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        ) : (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
            <Ionicons name="calendar-outline" size={48} color={colors.text || "#999"} style={{ opacity: 0.3, marginBottom: 12 }} />
            <Text style={{ color: colors.text || "#666", fontSize: 16 }}>No events found</Text>
          </View>
        )}
      </View>

      {/* Event Details Modal */}
      <Modal
        visible={selectedEvent !== null}
        animationType="slide"
        transparent={true}
        statusBarTranslucent={true}
        onRequestClose={() => {
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
              backgroundColor: colors.card || 'white',
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
              borderBottomColor: colors.border || '#E0E0E0'
            }}>
              <Text style={{ 
                fontSize: 20, 
                fontWeight: 'bold', 
                color: colors.text || '#000' 
              }}>
                Event Details
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setSelectedEvent(null);
                  setEventDetails(null);
                }}
                style={{ padding: 5 }}
              >
                <Ionicons name="close" size={24} color={colors.text || '#000'} />
              </TouchableOpacity>
            </View>

            {/* Modal Content */}
            <ScrollView style={{ padding: 20 }}>
              {loadingDetails ? (
                <View style={{ alignItems: 'center', padding: 40 }}>
                  <ActivityIndicator size="large" color={colors.primary || "#4A56E2"} />
                  <Text style={{ marginTop: 10, color: colors.text || "#666", opacity: 0.7 }}>
                    Loading event details...
                  </Text>
                </View>
              ) : eventDetails ? (
                <>
                  {/* Event Title */}
                  <Text style={{ 
                    fontSize: 24, 
                    fontWeight: 'bold', 
                    color: colors.text || '#000',
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
                      backgroundColor: eventDetails.status === 'ongoing' ? '#E8F5E9' : eventDetails.status === 'completed' ? '#E3F2FD' : '#FFF3E0',
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 20,
                      flexDirection: 'row',
                      alignItems: 'center'
                    }}>
                      <Ionicons 
                        name={eventDetails.status === 'ongoing' ? 'time' : eventDetails.status === 'completed' ? 'checkmark-circle' : 'calendar'} 
                        size={14} 
                        color={eventDetails.status === 'ongoing' ? '#4CAF50' : eventDetails.status === 'completed' ? '#2196F3' : '#FF9800'} 
                        style={{ marginRight: 6 }}
                      />
                      <Text style={{ 
                        fontSize: 12, 
                        fontWeight: '600', 
                        color: eventDetails.status === 'ongoing' ? '#4CAF50' : eventDetails.status === 'completed' ? '#2196F3' : '#FF9800',
                        textTransform: 'uppercase'
                      }}>
                        {eventDetails.status === 'ongoing' ? 'Ongoing Now' : eventDetails.status === 'completed' ? 'Completed' : 'Upcoming'}
                      </Text>
                    </View>
                  </View>

                  {/* Date and Time */}
                  <View style={{ 
                    backgroundColor: colors.surface || '#F5F5F5', 
                    borderRadius: 12, 
                    padding: 16,
                    marginBottom: 15
                  }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                      <Ionicons name="calendar-outline" size={20} color={colors.primary || "#4A56E2"} />
                      <View style={{ marginLeft: 12, flex: 1 }}>
                        <Text style={{ fontSize: 12, color: colors.text || "#666", opacity: 0.6, marginBottom: 4 }}>
                          Start Date & Time
                        </Text>
                        <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text || "#000" }}>
                          {eventDetails.startDate ? eventDetails.startDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : 'TBA'}
                        </Text>
                        <Text style={{ fontSize: 13, color: colors.text || "#666", opacity: 0.8, marginTop: 2 }}>
                          {eventDetails.startDate ? eventDetails.startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : ''}
                        </Text>
                      </View>
                    </View>

                    {eventDetails.endDate && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border || '#E0E0E0' }}>
                        <Ionicons name="time-outline" size={20} color={colors.primary || "#4A56E2"} />
                        <View style={{ marginLeft: 12, flex: 1 }}>
                          <Text style={{ fontSize: 12, color: colors.text || "#666", opacity: 0.6, marginBottom: 4 }}>
                            End Date & Time
                          </Text>
                          <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text || "#000" }}>
                            {eventDetails.endDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                          </Text>
                          <Text style={{ fontSize: 13, color: colors.text || "#666", opacity: 0.8, marginTop: 2 }}>
                            {eventDetails.endDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>

                  {/* Venue */}
                  <View style={{ 
                    backgroundColor: colors.surface || '#F5F5F5', 
                    borderRadius: 12, 
                    padding: 16,
                    marginBottom: 15
                  }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="location-outline" size={20} color={colors.primary || "#4A56E2"} />
                      <View style={{ marginLeft: 12, flex: 1 }}>
                        <Text style={{ fontSize: 12, color: colors.text || "#666", opacity: 0.6, marginBottom: 4 }}>
                          Venue
                        </Text>
                        <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text || "#000" }}>
                          {eventDetails.venue}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Category */}
                  {eventDetails.category && (
                    <View style={{ 
                      backgroundColor: colors.surface || '#F5F5F5', 
                      borderRadius: 12, 
                      padding: 16,
                      marginBottom: 15
                    }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="pricetag-outline" size={20} color={colors.primary || "#4A56E2"} />
                        <View style={{ marginLeft: 12, flex: 1 }}>
                          <Text style={{ fontSize: 12, color: colors.text || "#666", opacity: 0.6, marginBottom: 4 }}>
                            Category
                          </Text>
                          <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text || "#000" }}>
                            {eventDetails.category}
                          </Text>
                        </View>
              </View>
            </View>
                  )}

                  {/* Description */}
                  {eventDetails.description && (
                    <View style={{ 
                      backgroundColor: colors.surface || '#F5F5F5', 
                      borderRadius: 12, 
                      padding: 16,
                      marginBottom: 15
                    }}>
                      <Text style={{ 
                        fontSize: 16, 
                        fontWeight: 'bold', 
                        color: colors.text || '#000',
                        marginBottom: 12
                      }}>
                        About this Event
                      </Text>
                      <Text style={{ 
                        fontSize: 14, 
                        color: colors.text || "#666", 
                        opacity: 0.8,
                        lineHeight: 22
                      }}>
                        {eventDetails.description}
                      </Text>
                    </View>
                  )}
                </>
              ) : (
                <View style={{ alignItems: 'center', padding: 40 }}>
                  <Ionicons name="alert-circle-outline" size={48} color={colors.text || "#999"} style={{ opacity: 0.5, marginBottom: 12 }} />
                  <Text style={{ color: colors.text || "#666", opacity: 0.7 }}>
                    Unable to load event details
                  </Text>
                </View>
              )}
        </ScrollView>
      </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
} 