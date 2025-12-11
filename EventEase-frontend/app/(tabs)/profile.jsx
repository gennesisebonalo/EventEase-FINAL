import React, { useCallback, useState, useEffect } from "react";
import { View, Text, ScrollView, Image, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "@/constants/axios";
import { useTheme } from "../../assets/components/theme-provider";

export default function Profile() {
  const router = useRouter();
  const { colors } = useTheme();
  const [user, setUser] = useState(null);
  const [attendanceStats, setAttendanceStats] = useState({
    total: 0,
    present: 0,
    absent: 0,
    pending: 0
  });

  const loadAttendanceStats = async (userId) => {
    try {
      const response = await api.get('/api/attendance/user-history', {
        params: { user_id: userId }
      });
      
      if (response.data.success) {
        const attendance = response.data.data;
        const stats = {
          total: attendance.length,
          present: attendance.filter(a => a.status === 'present').length,
          absent: attendance.filter(a => a.status === 'absent').length,
          pending: attendance.filter(a => a.status === 'pending').length
        };
        setAttendanceStats(stats);
      }
    } catch (error) {
      console.log("Error loading attendance stats:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const loadUser = async () => {
        try {
          const storedUser = await AsyncStorage.getItem("user");
          if (storedUser && isActive) {
            const userData = JSON.parse(storedUser);
            
            // Ensure profilePic is properly set (handle both profilePic and profile_pic)
            if (!userData.profilePic && userData.profile_pic) {
              userData.profilePic = userData.profile_pic;
            }
            
            setUser(userData);
            if (userData?.id) {
              loadAttendanceStats(userData.id);
            }
          }
        } catch (error) {
          console.log("Error loading user:", error);
        }
      };
      loadUser();
      return () => {
        isActive = false;
      };
    }, [])
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.headerBg }}>
      {/* Header */}
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
          Profile
        </Text>
        <TouchableOpacity onPress={() => router.push("/settings") }>
          <Ionicons name="settings-outline" size={24} color={colors.headerText} />
        </TouchableOpacity>
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
          {/* Profile Header */}
          <View
            style={{ alignItems: "center", marginTop: 20, marginBottom: 30 }}
          >
            <Image
              source={
                user?.profilePic && (user.profilePic.startsWith('data:') || user.profilePic.startsWith('http') || user.profilePic.startsWith('file://'))
                  ? { uri: user.profilePic }
                  : require("../../assets/images/profile-pic.png")
              }
              style={{ width: 80, height: 80, borderRadius: 40, marginBottom: 10 }}
              onError={(error) => {
                console.log("Profile image load error:", error);
                // If image fails to load, it will fall back to default
              }}
            />
            <Text style={{ fontSize: 20, fontWeight: "bold", color: colors.text }}>
              {user ? user.name : "Loading..."}
            </Text>
            <Text style={{ color: colors.text, opacity: 0.7, fontSize: 12 }}>
              {user ? user.email : ""}
            </Text>
            
            {/* Bio Information */}
            {user?.bio && (
              <View style={{ marginTop: 10, paddingHorizontal: 20 }}>
                <Text style={{ color: colors.text, opacity: 0.8, fontSize: 14, textAlign: "center", fontStyle: "italic" }}>
                  "{user.bio}"
                </Text>
              </View>
            )}
            
            {/* Education Information */}
            {user?.educationLevel && (
              <View style={{ marginTop: 15, paddingHorizontal: 20 }}>
                <View style={{ 
                  backgroundColor: colors.surface, 
                  padding: 15, 
                  borderRadius: 10,
                  alignItems: "center"
                }}>
                  <Text style={{ fontSize: 16, fontWeight: "bold", color: colors.primary, marginBottom: 5 }}>
                    {user.educationLevel}
                  </Text>
                  
                  {user.section && (
                    <Text style={{ color: colors.text, opacity: 0.8, fontSize: 14 }}>
                      Section: {user.section}
                    </Text>
                  )}
                  
                  {user.strand && (
                    <Text style={{ color: colors.text, opacity: 0.8, fontSize: 14 }}>
                      Strand: {user.strand}
                    </Text>
                  )}
                  
                  {user.department && (
                    <Text style={{ color: colors.text, opacity: 0.8, fontSize: 14 }}>
                      Department: {user.department}
                    </Text>
                  )}
                </View>
              </View>
            )}
          </View>

          {/* Profile Actions */}
          <View
            style={{
              flexDirection: "row",
              gap: 10,
              marginBottom: 25,
              paddingHorizontal: 20,
            }}
          >
            <TouchableOpacity
              onPress={() => router.push("/edit-profile")}
              style={{
                flex: 1,
                backgroundColor: "#F5F5F5",
                padding: 12,
                borderRadius: 8,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#4A56E2", fontWeight: "bold" }}>
                Edit Profile
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: "#4A56E2",
                padding: 12,
                borderRadius: 8,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "white", fontWeight: "bold" }}>
                Share Profile
              </Text>
            </TouchableOpacity>
          </View>

          {/* Contact Information */}
          <View style={{ marginBottom: 30 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  backgroundColor: "#F5F5F5",
                  borderRadius: 20,
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 15,
                }}
              >
                <Ionicons name="mail-outline" size={20} color="#666" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: "#666" }}>
                  {user ? user.email : "No email"}
                </Text>
                <Text style={{ fontSize: 12, color: "#999" }}>
                  Emails sent to this address will be received
                </Text>
                <Text style={{ fontSize: 12, color: "#4A56E2" }}>
                  Primary Email
                </Text>
              </View>
              <TouchableOpacity>
                <Ionicons name="pencil-outline" size={20} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Attendance Statistics */}
          <View>
            <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 15 }}>
              Attendance Statistics
            </Text>
            <View style={{ 
              backgroundColor: "#F5F5F5", 
              padding: 20, 
              borderRadius: 12,
              marginBottom: 20
            }}>
              <View style={{ 
                flexDirection: "row", 
                justifyContent: "space-around",
                marginBottom: 15
              }}>
                <View style={{ alignItems: "center" }}>
                  <Text style={{ fontSize: 24, fontWeight: "bold", color: "#4CAF50" }}>
                    {attendanceStats.present}
                  </Text>
                  <Text style={{ fontSize: 12, color: "#666" }}>Present</Text>
                </View>
                <View style={{ alignItems: "center" }}>
                  <Text style={{ fontSize: 24, fontWeight: "bold", color: "#F44336" }}>
                    {attendanceStats.absent}
            </Text>
                  <Text style={{ fontSize: 12, color: "#666" }}>Absent</Text>
                </View>
                <View style={{ alignItems: "center" }}>
                  <Text style={{ fontSize: 24, fontWeight: "bold", color: "#FF9800" }}>
                    {attendanceStats.pending}
                  </Text>
                  <Text style={{ fontSize: 12, color: "#666" }}>Pending</Text>
                </View>
              </View>
              <View style={{ 
                borderTopWidth: 1, 
                borderTopColor: "#E0E0E0", 
                paddingTop: 15,
                alignItems: "center"
              }}>
                <Text style={{ fontSize: 16, fontWeight: "bold", color: "#4A56E2" }}>
                  Total Events: {attendanceStats.total}
                  </Text>
                </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View
            style={{
              flexDirection: "row",
              gap: 10,
              marginTop: 30,
              marginBottom: 20,
              paddingHorizontal: 20,
            }}
          >
            <TouchableOpacity
              onPress={() => router.push("/attendance")}
              style={{
                flex: 1,
                backgroundColor: "#4A56E2",
                padding: 12,
                borderRadius: 8,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "white", fontWeight: "bold" }}>
                Attendance
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: "#F5F5F5",
                padding: 12,
                borderRadius: 8,
                alignItems: "center",
              }}
              onPress={async () => {
                await AsyncStorage.clear();
                router.replace("/(auth)/sign-in");
              }}
            >
              <Text style={{ color: "#666", fontWeight: "bold" }}>Log out</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
