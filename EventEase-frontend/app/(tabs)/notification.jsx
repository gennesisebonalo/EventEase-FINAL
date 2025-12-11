import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import api from "@/constants/axios";
import { useFocusEffect } from "@react-navigation/native";
import { useTheme } from "../../assets/components/theme-provider";

// Save attendance status to AsyncStorage
async function setAttendanceStatus(eventId, statusObj) {
  try {
    const existing = await AsyncStorage.getItem("attendanceStatus");
    let attendanceStatus = existing ? JSON.parse(existing) : {};
    attendanceStatus[eventId] = statusObj;
    await AsyncStorage.setItem(
      "attendanceStatus",
      JSON.stringify(attendanceStatus)
    );
  } catch (e) {
    console.log("Error saving attendance status", e);
  }
}

export default function Notification() {
  const router = useRouter();
  const { colors } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError("");
      const userJson = await AsyncStorage.getItem('user');
      const user = userJson ? JSON.parse(userJson) : null;
      
      // Debug logging
      console.log('Current user:', user);
      console.log('User ID:', user?.id);
      
      if (!user?.id) {
        setError("No user found. Please log in again.");
        return;
      }
      
      console.log('Fetching notifications for user:', user.id);
      const res = await api.get("/api/notifications", { params: { user_id: user.id } });
      console.log('API Response:', res.data);
      
      // Helper: parse "YYYY-MM-DD HH:mm:ss" as LOCAL time (Laravel default)
      const parseLocal = (str) => {
        if (!str || typeof str !== 'string') return null;
        // Normalize to "YYYY-MM-DDTHH:mm:ss"
        const norm = str.includes('T') ? str : str.replace(' ', 'T');
        const [datePart, timePart] = norm.split('T');
        if (!datePart || !timePart) return new Date(norm);
        const [y, m, d] = datePart.split('-').map((v) => parseInt(v, 10));
        const [hh, mm, ss] = timePart.split(':').map((v) => parseInt(v, 10));
        return new Date(y, (m || 1) - 1, d || 1, hh || 0, mm || 0, ss || 0);
      };

      let data = (res.data?.data || []).map((n) => {
        const created = parseLocal(n.created_at) || new Date();
        const now = new Date();
        const startTime = n.event?.start_time ? parseLocal(n.event.start_time) : null;
        const endTime = n.event?.end_time ? parseLocal(n.event.end_time) : null;
        
        let timeStatus = 'upcoming';
        if (startTime && endTime) {
          if (now < startTime) {
            timeStatus = 'upcoming';
          } else if (now >= startTime && now <= endTime) {
            timeStatus = 'ongoing';
          } else {
            timeStatus = 'ended';
          }
        } else if (startTime && !endTime) {
          // If only start time exists, consider it ended after the start moment passes
          timeStatus = now < startTime ? 'upcoming' : 'ended';
        }
        
        return {
          id: String(n.id),
          title: n.title,
          // Prefer event start date for display; fallback to notification created date
          displayDate: startTime
            ? startTime.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })
            : created.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }),
          description: n.message || "",
          isRead: n.is_read,
          eventId: n.event?.id || null,
          startTime: startTime ? startTime.toISOString() : null,
          endTime: endTime ? endTime.toISOString() : null,
          timeStatus: timeStatus,
        };
      });

      // Also fetch events and merge any upcoming/ongoing events without a notification
      try {
        const eventsRes = await api.get('/api/events', { params: { user_id: user.id } });
        const events = Array.isArray(eventsRes.data?.data) ? eventsRes.data.data : [];
        const haveEventIds = new Set(data.filter(d => d.eventId != null).map(d => String(d.eventId)));
        
        // Fetch user's attendance records to filter out events they've already joined/declined
        let joinedEventIds = new Set();
        try {
          const attendanceRes = await api.get('/api/attendance/user-history', { params: { user_id: user.id } });
          console.log('Attendance history response:', attendanceRes.data);
          if (attendanceRes.data?.success && attendanceRes.data?.data && Array.isArray(attendanceRes.data.data)) {
            joinedEventIds = new Set(
              attendanceRes.data.data
                .filter(a => a.status === 'present' || a.status === 'absent')
                .map(a => {
                  // Handle event.id format from getUserAttendance API
                  const eventId = a.event?.id || a.event_id || a.eventId;
                  return eventId ? String(eventId) : null;
                })
                .filter(id => id !== null)
            );
            console.log('Joined event IDs from attendance:', Array.from(joinedEventIds));
          }
        } catch (attendanceErr) {
          console.log('Could not fetch attendance history:', attendanceErr);
        }
        
        // Also filter out events from the main notifications data that user has joined
        // BUT: Always show "Event Updated" notifications even if user has joined (they need to know about updates)
        data = data.filter(n => {
          const eventIdStr = n.eventId ? String(n.eventId) : null;
          // Show if: no event ID, OR event not joined, OR it's an "Event Updated" notification
          const isUpdateNotification = n.title && n.title.startsWith('Event Updated:');
          return !eventIdStr || !joinedEventIds.has(eventIdStr) || isUpdateNotification;
        });
        
        const now2 = new Date();
        // Normalizer for college department names (handles common variations)
        const normalizeDept = (d) => {
          const x = String(d || '').toLowerCase().replaceAll('.', '').trim();
          if (!x) return '';
          if (x === 'bsit' || x === 'it' || x.includes('information technology')) return 'bsit';
          if (x === 'bshm' || x.includes('hospitality')) return 'bshm';
          if (x === 'bsentrep' || x.includes('entrepreneur')) return 'bsentrep';
          if (x === 'education' || x === 'bse' || x === 'bed' || x.includes('education')) return 'education';
          return x;
        };

        const synthetic = events.filter((e) => {
          // Client-side audience guard (defensive): must match user targeting
          const lvl = (user?.educationLevel || user?.education_level || '').toLowerCase();
          const dept = normalizeDept(user?.department);
          const ta = (e.target_audience || '').toLowerCase();
          const course = (e.course || '').toLowerCase();
          if (ta === 'all_students') return true;
          if (ta === 'elementary') return lvl === 'elementary';
          if (ta === 'high_school') return lvl === 'high school';
          if (ta === 'senior_high') return lvl === 'senior high school';
          if (ta === 'college') {
            // Allowed if course is null/empty (all college) or matches user's department
            return !course || course === dept;
          }
          return false;
        }).map((e) => {
          const s = e.start_time ? parseLocal(e.start_time) : null;
          const en = e.end_time ? parseLocal(e.end_time) : null;
          let timeStatus = 'upcoming';
          if (s && en) {
            if (now2 < s) timeStatus = 'upcoming';
            else if (now2 >= s && now2 <= en) timeStatus = 'ongoing';
            else timeStatus = 'ended';
          } else if (s && !en) {
            timeStatus = now2 < s ? 'upcoming' : 'ended';
          }
          return {
            id: `evt-${e.id}`,
            title: e.title,
            displayDate: s ? s.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : '',
            description: e.description || '',
            isRead: true,
            eventId: e.id,
            startTime: s ? s.toISOString() : null,
            endTime: en ? en.toISOString() : null,
            timeStatus,
          };
        })
        .filter(n => {
          // Filter out ended events, events that already have notifications, and events user has joined/declined
          const eventIdStr = String(n.eventId);
          return n.timeStatus !== 'ended' 
            && !haveEventIds.has(eventIdStr)
            && !joinedEventIds.has(eventIdStr);
        });

        data = [...data, ...synthetic];
        // Sort by start time (or display date) ascending
        data.sort((a, b) => {
          const ta = a.startTime ? Date.parse(a.startTime) : 0;
          const tb = b.startTime ? Date.parse(b.startTime) : 0;
          return ta - tb;
        });
      } catch (mergeErr) {
        console.log('Event merge skipped:', mergeErr?.message || mergeErr);
      }

      console.log('Processed notifications:', data);
      setNotifications(data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError("Failed to load notifications: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Lightweight polling to keep notifications up-to-date without manual refresh
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchNotifications();
    }, 30000); // 30 seconds

    return () => clearInterval(intervalId);
  }, []);

  // Periodically recompute timeStatus locally so items drop off in real time without waiting for server
  useEffect(() => {
    const recompute = () => {
      setNotifications((prev) => {
        const now = new Date();
        return prev.map((n) => {
          const startTime = n.startTime ? new Date(n.startTime) : null;
          const endTime = n.endTime ? new Date(n.endTime) : null;
          let timeStatus = n.timeStatus;
          if (startTime && endTime) {
            if (now < startTime) timeStatus = 'upcoming';
            else if (now >= startTime && now <= endTime) timeStatus = 'ongoing';
            else timeStatus = 'ended';
          } else if (startTime && !endTime) {
            timeStatus = now < startTime ? 'upcoming' : 'ended';
          }
          return { ...n, timeStatus };
        });
      });
    };
    const id = setInterval(recompute, 15000); // 15s local refresh
    return () => clearInterval(id);
  }, []);

  // Refresh notifications when tab is focused
  useFocusEffect(
    React.useCallback(() => {
      fetchNotifications();
    }, [])
  );

  const [modalVisible, setModalVisible] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [evidenceImage, setEvidenceImage] = useState(null);

  const openDeclineModal = (id) => {
    setSelectedEventId(id);
    setDeclineReason("");
    setEvidenceImage(null);
    setModalVisible(true);
  };

  const handleDeclineConfirm = async () => {
    if (!declineReason.trim()) {
      Alert.alert("Reason Required", "Please provide a reason for declining.");
      return;
    }

    try {
      const userJson = await AsyncStorage.getItem('user');
      const user = userJson ? JSON.parse(userJson) : null;
      
      if (!user?.id) {
        Alert.alert("Error", "No user found. Please log in again.");
        return;
      }

      // Find the notification to get event_id
      const notification = notifications.find(n => n.id === selectedEventId);
      if (!notification) {
        Alert.alert("Error", "Notification not found");
        return;
      }

      // Check if event is currently ongoing
      if (notification.timeStatus !== 'ongoing') {
        setModalVisible(false);
        if (notification.timeStatus === 'upcoming') {
          Alert.alert(
            "Event Not Started", 
            "This event has not started yet. Attendance will be available from " + 
            (notification.startTime ? new Date(notification.startTime).toLocaleString('en-US', {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }) : 'the scheduled start time') + 
            " to " + 
            (notification.endTime ? new Date(notification.endTime).toLocaleString('en-US', {
              hour: '2-digit',
              minute: '2-digit'
            }) : 'the scheduled end time') + "."
          );
        } else {
          Alert.alert(
            "Event Ended", 
            "This event has already ended. Attendance was available until " + 
            (notification.endTime ? new Date(notification.endTime).toLocaleString('en-US', {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }) : 'the scheduled end time') + "."
          );
        }
        return;
      }

      // Call the decline event API
      const response = await api.post('/api/attendance/decline', {
        user_id: Number(user.id),
        event_id: Number(notification.eventId || selectedEventId),
        reason: String(declineReason || ''),
        evidence_image: evidenceImage ? String(evidenceImage) : null,
      });

      if (response.data.success) {
    setModalVisible(false);
        
        const eventIdToRemove = notification.eventId;
        
        // Remove the notification from the list immediately by eventId
        setNotifications(prev => prev.filter(n => {
          // Remove if it matches the eventId (handle both string and number comparisons)
          const nEventId = n.eventId ? String(n.eventId) : null;
          const targetEventId = eventIdToRemove ? String(eventIdToRemove) : null;
          return nEventId !== targetEventId;
        }));
        
        Alert.alert("Success", "Your decline has been recorded.");
        
        // Refresh notifications to ensure consistency (this will filter out declined events via API)
        setTimeout(() => {
        fetchNotifications();
        }, 500);
      } else {
        Alert.alert("Error", response.data.message || "Failed to decline event");
      }
    } catch (error) {
      console.error('Decline event error:', error);
      Alert.alert(
        "Error", 
        error.response?.data?.message || "Failed to decline event"
      );
    }
  };

  const handleJoinNow = async (notificationId) => {
    try {
      const userJson = await AsyncStorage.getItem('user');
      const user = userJson ? JSON.parse(userJson) : null;
      
      if (!user?.id) {
        Alert.alert("Error", "No user found. Please log in again.");
        return;
      }

      // Find the notification to get event_id
      const notification = notifications.find(n => n.id === notificationId);
      if (!notification) {
        Alert.alert("Error", "Notification not found");
        return;
      }

      // Check if event is currently ongoing
      if (notification.timeStatus !== 'ongoing') {
        if (notification.timeStatus === 'upcoming') {
          Alert.alert(
            "Event Not Started", 
            "This event has not started yet. Attendance will be available from " + 
            (notification.startTime ? new Date(notification.startTime).toLocaleString('en-US', {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }) : 'the scheduled start time') + 
            " to " + 
            (notification.endTime ? new Date(notification.endTime).toLocaleString('en-US', {
              hour: '2-digit',
              minute: '2-digit'
            }) : 'the scheduled end time') + "."
          );
        } else {
          Alert.alert(
            "Event Ended", 
            "This event has already ended. Attendance was available until " + 
            (notification.endTime ? new Date(notification.endTime).toLocaleString('en-US', {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }) : 'the scheduled end time') + "."
          );
        }
        return;
      }

      // Call the join event API
      const response = await api.post('/api/attendance/join', {
        user_id: Number(user.id),
        event_id: Number(notification.eventId || notificationId) // backend expects numeric IDs
      });

      if (response.data.success) {
        const eventIdToRemove = notification.eventId;
        
        // Remove the notification from the list immediately by eventId
        setNotifications(prev => prev.filter(n => {
          // Remove if it matches the eventId (handle both string and number comparisons)
          const nEventId = n.eventId ? String(n.eventId) : null;
          const targetEventId = eventIdToRemove ? String(eventIdToRemove) : null;
          return nEventId !== targetEventId;
        }));
        
        // Store event ID for RFID tapping (AsyncStorage requires a string value)
        const toStoreId = String(notification.eventId || notificationId);
        await AsyncStorage.setItem('currentEventId', toStoreId);
        
        // Refresh notifications to ensure consistency (this will filter out joined events via API)
        setTimeout(() => {
          fetchNotifications();
        }, 500);
        
        // Navigate directly to RFID tapping screen, passing the eventId param
        router.push({ pathname: '/rfid-tap', params: { eventId: toStoreId } });
      } else {
        Alert.alert("Error", response.data.message || "Failed to join event");
      }
    } catch (error) {
      console.error('Join event error:', error);
      Alert.alert(
        "Error", 
        error.response?.data?.message || "Failed to join event"
      );
    }
  };

  const pickImage = async () => {
    const { granted } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) {
      Alert.alert(
        "Permission Required",
        "You need to allow access to your gallery to upload evidence."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      setEvidenceImage(result.assets[0].uri);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.headerBg }}>
      {/* Header */}
      <View style={{ padding: 16, backgroundColor: colors.headerBg }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text
            style={{
              fontSize: 24,
              fontWeight: "bold",
              color: colors.headerText,
              marginBottom: 20,
            }}
          >
            Notification
          </Text>
          <TouchableOpacity
            onPress={fetchNotifications}
            style={{
              backgroundColor: "rgba(255,255,255,0.2)",
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 15,
            }}
          >
            <Text style={{ color: colors.headerText, fontSize: 12 }}>Refresh</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <View
        style={{
          flex: 1,
          backgroundColor: colors.card,
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
        }}
      >
        <ScrollView style={{ padding: 16 }}>
          {(() => {
            // Filter out ended events and also check if user has joined (defensive check)
            const visible = (loading ? [] : notifications).filter(n => {
              return n.timeStatus !== 'ended';
            });
            return visible.map((notification) => (
            <View
              key={notification.id}
              style={{
                backgroundColor: notification.isRead ? colors.card : colors.surface,
                borderRadius: 12,
                padding: 15,
                marginBottom: 15,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <Image
                  source={require("@/assets/images/notification-icon.png")}
                  style={{ width: 40, height: 40, marginRight: 10 }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: "bold", color: colors.text }}>
                    {notification.title}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.text, opacity: 0.6 }}>
                    {notification.displayDate}
                  </Text>
                </View>
              </View>

              <Text style={{ marginBottom: 10, color: colors.text }}>
                {notification.description}
              </Text>

              {/* Event Time Information */}
              {notification.startTime && notification.endTime && (
                <View style={{ marginBottom: 15, padding: 10, backgroundColor: colors.surface, borderRadius: 8 }}>
                  <Text style={{ fontSize: 12, color: colors.text, opacity: 0.7, marginBottom: 5 }}>
                    Event Time:
                  </Text>
                  <Text style={{ fontSize: 14, fontWeight: "bold", color: colors.text }}>
                    {new Date(notification.startTime).toLocaleString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })} - {new Date(notification.endTime).toLocaleString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Text>
                  <Text style={{ 
                    fontSize: 12, 
                    color: notification.timeStatus === 'ongoing' ? '#4CAF50' : 
                           notification.timeStatus === 'upcoming' ? '#FF9800' : '#F44336',
                    fontWeight: 'bold',
                    marginTop: 5
                  }}>
                    {notification.timeStatus === 'ongoing' ? '🟢 Event is ongoing' :
                     notification.timeStatus === 'upcoming' ? '🟡 Event not started yet' :
                     '🔴 Event has ended'}
                  </Text>
                </View>
              )}


              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <TouchableOpacity
                  style={{
                    backgroundColor: colors.primary,
                    paddingVertical: 8,
                    paddingHorizontal: 15,
                    borderRadius: 20,
                  }}
                  onPress={() => handleJoinNow(notification.id)}
                >
                  <Text style={{ color: "white", fontSize: 12 }}>Join Now</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => openDeclineModal(notification.id)}
                >
                  <Text style={{ color: colors.text, opacity: 0.6, fontSize: 12 }}>Decline</Text>
                </TouchableOpacity>
              </View>
            </View>
          ));
          })()}
          {loading && (
            <View style={{ padding: 20, alignItems: "center" }}>
              <Text style={{ color: colors.text, opacity: 0.7 }}>Loading notifications...</Text>
            </View>
          )}
          
          {!loading && notifications.length === 0 && !error && (
            <View style={{ padding: 20, alignItems: "center" }}>
              <Text style={{ color: colors.text, opacity: 0.7, fontSize: 16 }}>No notifications</Text>
              <Text style={{ color: colors.text, opacity: 0.6, fontSize: 12, marginTop: 5 }}>
                New events will appear here
              </Text>
            </View>
          )}
          
          {error && (
            <View style={{ padding: 20, alignItems: "center" }}>
              <Text style={{ color: "#ff6b6b", fontSize: 16 }}>Error</Text>
              <Text style={{ color: colors.text, opacity: 0.7, fontSize: 12, marginTop: 5, textAlign: "center" }}>
                {error}
              </Text>
              <TouchableOpacity
                onPress={fetchNotifications}
                style={{
                  backgroundColor: colors.primary,
                  paddingHorizontal: 15,
                  paddingVertical: 8,
                  borderRadius: 20,
                  marginTop: 10,
                }}
              >
                <Text style={{ color: "white", fontSize: 12 }}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>

      {/* Decline Reason Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          <View
            style={{
              backgroundColor: colors.card,
              padding: 20,
              borderRadius: 12,
              width: "100%",
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "bold",
                marginBottom: 10,
                color: colors.text,
              }}
            >
              Reason for Declining
            </Text>

            {/* Reason Input */}
            <TextInput
              placeholder="Type your reason..."
              value={declineReason}
              onChangeText={setDeclineReason}
              multiline
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 8,
                padding: 10,
                height: 80,
                marginBottom: 15,
                textAlignVertical: "top",
                color: colors.text,
                backgroundColor: colors.surface,
              }}
            />

            {/* Image Picker */}
            <TouchableOpacity
              onPress={pickImage}
              style={{
                backgroundColor: colors.surface,
                padding: 10,
                borderRadius: 8,
                marginBottom: 10,
                alignItems: "center",
              }}
            >
              <Text style={{ color: colors.primary }}>
                {evidenceImage
                  ? "Change Evidence Image"
                  : "Upload Evidence Image"}
              </Text>
            </TouchableOpacity>

            {/* Preview Image */}
            {evidenceImage && (
              <Image
                source={{ uri: evidenceImage }}
                style={{
                  width: "100%",
                  height: 150,
                  borderRadius: 8,
                  marginBottom: 10,
                }}
                resizeMode="cover"
              />
            )}

            {/* Modal Actions */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-end",
                gap: 20,
              }}
            >
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={{ color: colors.text, opacity: 0.6 }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDeclineConfirm}>
                <Text style={{ color: colors.primary, fontWeight: "bold" }}>
                  Submit
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
