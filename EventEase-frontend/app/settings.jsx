import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, ScrollView, Switch, TextInput, TouchableOpacity, Alert, Linking, Modal, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "@/constants/axios";
import { useTheme } from "../assets/components/theme-provider";
import { useRouter } from "expo-router";

export default function Settings() {
  const { darkMode, setDarkMode, colors } = useTheme();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [prefs, setPrefs] = useState({
    notifications: {
      eventReminders: true,
      announcements: true,
    },
    privacy: {
      showEmail: true,
    },
    theme: {
      darkMode: false,
    },
  });

  const [feedback, setFeedback] = useState({ rating: 0, comment: "" });
  const [user, setUser] = useState(null);
  const [showFAQs, setShowFAQs] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [contactForm, setContactForm] = useState({ subject: "", message: "" });
  const [storageInfo, setStorageInfo] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem("settings_prefs");
        if (stored) setPrefs(JSON.parse(stored));
        const u = await AsyncStorage.getItem("user");
        if (u) setUser(JSON.parse(u));
        loadStorageInfo();
      } catch (e) {}
    };
    load();
  }, []);

  const loadStorageInfo = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const items = await AsyncStorage.multiGet(keys);
      const totalSize = items.reduce((acc, [key, value]) => {
        return acc + (value ? value.length : 0);
      }, 0);
      setStorageInfo({
        keysCount: keys.length,
        totalSize: (totalSize / 1024).toFixed(2) + " KB",
      });
    } catch (e) {
      setStorageInfo({ keysCount: 0, totalSize: "0 KB" });
    }
  };

  const savePrefs = async (next) => {
    try {
      const merged = typeof next === "function" ? next(prefs) : next;
      setPrefs(merged);
      await AsyncStorage.setItem("settings_prefs", JSON.stringify(merged));
      Alert.alert("Saved", "Your settings have been updated.");
    } catch (e) {
      Alert.alert("Error", "Failed to save settings.");
    }
  };

  const submitFeedback = async () => {
    if (!feedback.rating) {
      Alert.alert("Rate the app", "Please select a star rating.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/api/feedback", {
        user_id: user?.id ?? null,
        rating: feedback.rating,
        comment: feedback.comment,
      });
      setFeedback({ rating: 0, comment: "" });
      Alert.alert("Thank you!", "Your feedback was submitted.");
    } catch (e) {
      try {
        const offline = (await AsyncStorage.getItem("pending_feedback")) || "[]";
        const arr = JSON.parse(offline);
        arr.push({ ...feedback, user_id: user?.id ?? null, at: Date.now() });
        await AsyncStorage.setItem("pending_feedback", JSON.stringify(arr));
        setFeedback({ rating: 0, comment: "" });
        Alert.alert("Saved offline", "No server yet. We'll try again later.");
      } catch (_) {
        Alert.alert("Error", "Couldn't submit feedback.");
      }
    } finally {
      setLoading(false);
    }
  };

  const Star = ({ index }) => (
    <TouchableOpacity
      onPress={() => setFeedback((f) => ({ ...f, rating: index }))}
      style={{ padding: 4 }}
    >
      <Ionicons
        name={feedback.rating >= index ? "star" : "star-outline"}
        size={28}
        color={feedback.rating >= index ? "#F5C518" : "#999"}
      />
    </TouchableOpacity>
  );

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              router.replace("/(auth)/sign-in");
            } catch (e) {
              Alert.alert("Error", "Failed to logout. Please try again.");
            }
          },
        },
      ]
    );
  };

  const openLink = (url) => {
    Linking.openURL(url).catch(() => {
      Alert.alert("Error", "Could not open link.");
    });
  };

  const handleClearCache = () => {
    Alert.alert(
      "Clear Cache",
      "This will clear all cached data. You'll need to log in again. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            try {
              const userData = await AsyncStorage.getItem("user");
              const settingsData = await AsyncStorage.getItem("settings_prefs");
              await AsyncStorage.clear();
              if (userData) await AsyncStorage.setItem("user", userData);
              if (settingsData) await AsyncStorage.setItem("settings_prefs", settingsData);
              loadStorageInfo();
              Alert.alert("Success", "Cache cleared successfully.");
            } catch (e) {
              Alert.alert("Error", "Failed to clear cache.");
            }
          },
        },
      ]
    );
  };

  const handleSubmitContact = async () => {
    if (!contactForm.subject || !contactForm.message) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      const emailBody = `Subject: ${contactForm.subject}\n\nMessage:\n${contactForm.message}\n\nFrom: ${user?.email || "Unknown"}`;
      await Linking.openURL(`mailto:support@eventease.com?subject=${encodeURIComponent(contactForm.subject)}&body=${encodeURIComponent(emailBody)}`);
      setContactForm({ subject: "", message: "" });
      setShowContact(false);
      Alert.alert("Success", "Email app opened. Please send your message.");
    } catch (e) {
      Alert.alert("Error", "Could not open email app.");
    } finally {
      setLoading(false);
    }
  };

  const SettingItem = ({ icon, title, onPress, showArrow = true }) => (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
    >
      <Ionicons name={icon} size={20} color={colors.primary} style={{ marginRight: 12 }} />
      <Text style={{ flex: 1, fontSize: 16, color: colors.text }}>{title}</Text>
      {showArrow && <Ionicons name="chevron-forward" size={20} color={colors.text} opacity={0.5} />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.headerBg }}>
      <View
        style={{
          padding: 16,
          backgroundColor: colors.headerBg,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 24, fontWeight: "bold", color: colors.headerText }}>
          Settings
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
        <ScrollView style={{ padding: 16 }}>
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 8, color: colors.text }}>
              Account
            </Text>
            <View style={{ backgroundColor: colors.surface, padding: 16, borderRadius: 12 }}>
              <Text style={{ fontSize: 14, color: colors.text, opacity: 0.7 }}>Name</Text>
              <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 8, color: colors.text }}>
                {user?.name || "—"}
              </Text>
              <Text style={{ fontSize: 14, color: colors.text, opacity: 0.7 }}>Email</Text>
              <Text style={{ fontSize: 16, fontWeight: "600", color: colors.text }}>{user?.email || "—"}</Text>
              <View style={{ height: 12 }} />
              <TouchableOpacity
                onPress={() => router.push("/edit-profile")}
                style={{ backgroundColor: colors.primary, padding: 12, borderRadius: 8, alignItems: "center" }}
              >
                <Text style={{ color: "white", fontWeight: "bold" }}>Edit Profile</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 8, color: colors.text }}>
              Notifications
            </Text>
            <View style={{ backgroundColor: colors.surface, padding: 16, borderRadius: 12, gap: 16 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ fontSize: 16, color: colors.text }}>Event reminders</Text>
                <Switch
                  value={prefs.notifications.eventReminders}
                  onValueChange={(v) => savePrefs((p) => ({
                    ...p,
                    notifications: { ...p.notifications, eventReminders: v },
                  }))}
                />
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ fontSize: 16, color: colors.text }}>Announcements</Text>
                <Switch
                  value={prefs.notifications.announcements}
                  onValueChange={(v) => savePrefs((p) => ({
                    ...p,
                    notifications: { ...p.notifications, announcements: v },
                  }))}
                />
              </View>
            </View>
          </View>

          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 8, color: colors.text }}>
              Privacy
            </Text>
            <View style={{ backgroundColor: colors.surface, padding: 16, borderRadius: 12 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ fontSize: 16, color: colors.text }}>Show email on profile</Text>
                <Switch
                  value={prefs.privacy.showEmail}
                  onValueChange={(v) => savePrefs((p) => ({
                    ...p,
                    privacy: { ...p.privacy, showEmail: v },
                  }))}
                />
              </View>
            </View>
          </View>

          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 8, color: colors.text }}>
              Appearance
            </Text>
            <View style={{ backgroundColor: colors.surface, padding: 16, borderRadius: 12 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ fontSize: 16, color: colors.text }}>Dark mode</Text>
                <Switch value={darkMode} onValueChange={(v) => setDarkMode(v)} />
              </View>
            </View>
          </View>

          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 8, color: colors.text }}>
              Feedback
            </Text>
            <View style={{ backgroundColor: colors.surface, padding: 16, borderRadius: 12 }}>
              <Text style={{ fontSize: 16, marginBottom: 8, color: colors.text }}>Rate your experience</Text>
              <View style={{ flexDirection: "row", marginBottom: 12 }}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} index={i} />
                ))}
              </View>
              <TextInput
                placeholder="Any suggestions to improve the app?"
                multiline
                numberOfLines={4}
                value={feedback.comment}
                onChangeText={(t) => setFeedback((f) => ({ ...f, comment: t }))}
                style={{
                  backgroundColor: darkMode ? colors.card : "white",
                  borderColor: colors.border,
                  borderWidth: 1,
                  borderRadius: 8,
                  padding: 12,
                  minHeight: 90,
                  textAlignVertical: "top",
                  color: colors.text,
                }}
              />
              <View style={{ height: 12 }} />
              <TouchableOpacity
                disabled={loading}
                onPress={submitFeedback}
                style={{ backgroundColor: colors.primary, padding: 12, borderRadius: 8, alignItems: "center", opacity: loading ? 0.7 : 1 }}
              >
                <Text style={{ color: "white", fontWeight: "bold" }}>{loading ? "Submitting..." : "Submit Feedback"}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 8, color: colors.text }}>
              Help & Support
            </Text>
            <View style={{ backgroundColor: colors.surface, padding: 16, borderRadius: 12 }}>
              <SettingItem
                icon="help-circle-outline"
                title="FAQs"
                onPress={() => setShowFAQs(true)}
              />
              <SettingItem
                icon="mail-outline"
                title="Contact Support"
                onPress={() => setShowContact(true)}
              />
              <SettingItem
                icon="document-text-outline"
                title="Terms of Service"
                onPress={() => setShowTerms(true)}
              />
              <SettingItem
                icon="shield-checkmark-outline"
                title="Privacy Policy"
                onPress={() => setShowPrivacy(true)}
                showArrow={false}
              />
            </View>
          </View>

          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 8, color: colors.text }}>
              About
            </Text>
            <View style={{ backgroundColor: colors.surface, padding: 16, borderRadius: 12 }}>
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 14, color: colors.text, opacity: 0.7 }}>App Name</Text>
                <Text style={{ fontSize: 16, fontWeight: "600", color: colors.text }}>EventEase</Text>
              </View>
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 14, color: colors.text, opacity: 0.7 }}>Version</Text>
                <Text style={{ fontSize: 16, fontWeight: "600", color: colors.text }}>1.0.0</Text>
              </View>
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 14, color: colors.text, opacity: 0.7 }}>Description</Text>
                <Text style={{ fontSize: 14, color: colors.text, marginTop: 4 }}>
                  EventEase helps you manage and attend events seamlessly. Stay connected with your community and never miss an important event.
                </Text>
              </View>
              {storageInfo && (
                <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border }}>
                  <Text style={{ fontSize: 14, color: colors.text, opacity: 0.7 }}>Storage</Text>
                  <Text style={{ fontSize: 14, color: colors.text, marginTop: 4 }}>
                    {storageInfo.keysCount} items • {storageInfo.totalSize}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 8, color: colors.text }}>
              Data & Storage
            </Text>
            <View style={{ backgroundColor: colors.surface, padding: 16, borderRadius: 12 }}>
              <SettingItem
                icon="trash-outline"
                title="Clear Cache"
                onPress={handleClearCache}
                showArrow={false}
              />
            </View>
          </View>

          <View style={{ marginBottom: 24 }}>
            <TouchableOpacity
              onPress={handleLogout}
              style={{
                backgroundColor: "#FF3B30",
                padding: 16,
                borderRadius: 12,
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
              }}
            >
              <Ionicons name="log-out-outline" size={20} color="white" style={{ marginRight: 8 }} />
              <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>Logout</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 24 }} />
        </ScrollView>
      </View>

      {/* FAQs Modal */}
      <Modal visible={showFAQs} animationType="slide" transparent={true}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: colors.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: "80%", padding: 20 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <Text style={{ fontSize: 20, fontWeight: "bold", color: colors.text }}>Frequently Asked Questions</Text>
              <Pressable onPress={() => setShowFAQs(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </Pressable>
            </View>
            <ScrollView>
              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 16, fontWeight: "600", color: colors.text, marginBottom: 8 }}>How do I join an event?</Text>
                <Text style={{ fontSize: 14, color: colors.text, opacity: 0.8 }}>
                  You can join an event by tapping on it from the home screen or events list, then clicking the "Join Now" button.
                </Text>
              </View>
              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 16, fontWeight: "600", color: colors.text, marginBottom: 8 }}>Can I cancel my attendance?</Text>
                <Text style={{ fontSize: 14, color: colors.text, opacity: 0.8 }}>
                  Yes, you can decline an event you've joined by going to the event details and selecting "Decline".
                </Text>
              </View>
              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 16, fontWeight: "600", color: colors.text, marginBottom: 8 }}>How do I update my profile?</Text>
                <Text style={{ fontSize: 14, color: colors.text, opacity: 0.8 }}>
                  Go to Settings → Account → Edit Profile to update your information including name, email, year level, and block.
                </Text>
              </View>
              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 16, fontWeight: "600", color: colors.text, marginBottom: 8 }}>Why am I not receiving notifications?</Text>
                <Text style={{ fontSize: 14, color: colors.text, opacity: 0.8 }}>
                  Check your notification settings in Settings → Notifications. Make sure event reminders and announcements are enabled.
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Terms of Service Modal */}
      <Modal visible={showTerms} animationType="slide" transparent={true}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: colors.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: "80%", padding: 20 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <Text style={{ fontSize: 20, fontWeight: "bold", color: colors.text }}>Terms of Service</Text>
              <Pressable onPress={() => setShowTerms(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </Pressable>
            </View>
            <ScrollView>
              <Text style={{ fontSize: 14, color: colors.text, lineHeight: 22, marginBottom: 12 }}>
                <Text style={{ fontWeight: "600" }}>1. Acceptance of Terms</Text>{"\n"}
                By using EventEase, you agree to be bound by these Terms of Service. If you do not agree, please do not use the service.
              </Text>
              <Text style={{ fontSize: 14, color: colors.text, lineHeight: 22, marginBottom: 12 }}>
                <Text style={{ fontWeight: "600" }}>2. User Accounts</Text>{"\n"}
                You are responsible for maintaining the confidentiality of your account and password. You agree to notify us immediately of any unauthorized use.
              </Text>
              <Text style={{ fontSize: 14, color: colors.text, lineHeight: 22, marginBottom: 12 }}>
                <Text style={{ fontWeight: "600" }}>3. Event Participation</Text>{"\n"}
                When you join an event, you agree to attend and follow the event guidelines. Cancellation policies may apply.
              </Text>
              <Text style={{ fontSize: 14, color: colors.text, lineHeight: 22, marginBottom: 12 }}>
                <Text style={{ fontWeight: "600" }}>4. Prohibited Activities</Text>{"\n"}
                You may not use EventEase for any illegal purpose or to transmit harmful content. Violations may result in account termination.
              </Text>
              <Text style={{ fontSize: 14, color: colors.text, lineHeight: 22 }}>
                <Text style={{ fontWeight: "600" }}>5. Limitation of Liability</Text>{"\n"}
                EventEase is provided "as is" without warranties. We are not liable for any damages arising from your use of the service.
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Privacy Policy Modal */}
      <Modal visible={showPrivacy} animationType="slide" transparent={true}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: colors.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: "80%", padding: 20 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <Text style={{ fontSize: 20, fontWeight: "bold", color: colors.text }}>Privacy Policy</Text>
              <Pressable onPress={() => setShowPrivacy(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </Pressable>
            </View>
            <ScrollView>
              <Text style={{ fontSize: 14, color: colors.text, lineHeight: 22, marginBottom: 12 }}>
                <Text style={{ fontWeight: "600" }}>1. Information We Collect</Text>{"\n"}
                We collect information you provide directly, including name, email, year level, block, and event attendance records.
              </Text>
              <Text style={{ fontSize: 14, color: colors.text, lineHeight: 22, marginBottom: 12 }}>
                <Text style={{ fontWeight: "600" }}>2. How We Use Your Information</Text>{"\n"}
                Your information is used to manage events, send notifications, and improve our services. We do not sell your personal data.
              </Text>
              <Text style={{ fontSize: 14, color: colors.text, lineHeight: 22, marginBottom: 12 }}>
                <Text style={{ fontWeight: "600" }}>3. Data Security</Text>{"\n"}
                We implement security measures to protect your information. However, no method of transmission over the internet is 100% secure.
              </Text>
              <Text style={{ fontSize: 14, color: colors.text, lineHeight: 22, marginBottom: 12 }}>
                <Text style={{ fontWeight: "600" }}>4. Your Rights</Text>{"\n"}
                You have the right to access, update, or delete your personal information at any time through the Settings page.
              </Text>
              <Text style={{ fontSize: 14, color: colors.text, lineHeight: 22 }}>
                <Text style={{ fontWeight: "600" }}>5. Contact Us</Text>{"\n"}
                For privacy concerns, contact us at support@eventease.com. We will respond to your inquiry within 48 hours.
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Contact Support Modal */}
      <Modal visible={showContact} animationType="slide" transparent={true}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: colors.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: "80%", padding: 20 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <Text style={{ fontSize: 20, fontWeight: "bold", color: colors.text }}>Contact Support</Text>
              <Pressable onPress={() => setShowContact(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </Pressable>
            </View>
            <ScrollView>
              <Text style={{ fontSize: 14, color: colors.text, marginBottom: 8 }}>Subject</Text>
              <TextInput
                placeholder="Enter subject"
                value={contactForm.subject}
                onChangeText={(text) => setContactForm({ ...contactForm, subject: text })}
                style={{
                  backgroundColor: darkMode ? colors.surface : "white",
                  borderColor: colors.border,
                  borderWidth: 1,
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 16,
                  color: colors.text,
                }}
              />
              <Text style={{ fontSize: 14, color: colors.text, marginBottom: 8 }}>Message</Text>
              <TextInput
                placeholder="Describe your issue or question"
                multiline
                numberOfLines={6}
                value={contactForm.message}
                onChangeText={(text) => setContactForm({ ...contactForm, message: text })}
                style={{
                  backgroundColor: darkMode ? colors.surface : "white",
                  borderColor: colors.border,
                  borderWidth: 1,
                  borderRadius: 8,
                  padding: 12,
                  minHeight: 120,
                  textAlignVertical: "top",
                  color: colors.text,
                  marginBottom: 20,
                }}
              />
              <TouchableOpacity
                onPress={handleSubmitContact}
                disabled={loading}
                style={{
                  backgroundColor: colors.primary,
                  padding: 14,
                  borderRadius: 8,
                  alignItems: "center",
                  opacity: loading ? 0.7 : 1,
                }}
              >
                <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>
                  {loading ? "Opening Email..." : "Open Email App"}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
