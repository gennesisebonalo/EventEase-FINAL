import { useState, useEffect } from "react"
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert, ScrollView } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import * as ImagePicker from "expo-image-picker"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useRouter } from "expo-router"
import CustomButton from "../assets/components/CustomButton"
import api from "../constants/axios"


export default function EditProfile() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [profilePic, setProfilePic] = useState(null)
  const [bio, setBio] = useState("")
  const [educationLevel, setEducationLevel] = useState("")
  const [section, setSection] = useState("")
  const [strand, setStrand] = useState("")
  const [department, setDepartment] = useState("")
  const [printedId, setPrintedId] = useState("")
  const [loading, setLoading] = useState(false)

  // Load user data
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user")
        if (storedUser) {
          const parsed = JSON.parse(storedUser)
          setName(parsed.name || "")
          // Handle both profilePic and profile_pic, and validate it's a valid image format
          const pic = parsed.profilePic || parsed.profile_pic || null
          setProfilePic(pic && (pic.startsWith('data:') || pic.startsWith('http') || pic.startsWith('file://')) ? pic : null)
          setBio(parsed.bio || "")
          setEducationLevel(parsed.educationLevel || "")
          setSection(parsed.section || "")
          setStrand(parsed.strand || "")
          setDepartment(parsed.department || "")
          setPrintedId(parsed.printed_id || "")
        }
      } catch (error) {
        console.log("Error loading user:", error)
      }
    }
    loadUser()
  }, [])

  // Pick image and convert to base64
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5, // Reduced quality to make base64 smaller
        base64: true, // Enable base64 encoding
      })

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0]
        if (asset.base64) {
          // Store base64 for saving
          const base64Image = `data:image/jpeg;base64,${asset.base64}`
          setProfilePic(base64Image)
        } else {
          // Fallback to URI if base64 is not available
          setProfilePic(asset.uri)
        }
      }
    } catch (error) {
      console.log("Error picking image:", error)
      Alert.alert("Error", "Failed to pick image. Please try again.")
    }
  }

  // Save changes
  const handleSave = async () => {
    if (!name) {
      Alert.alert("Error", "Name cannot be empty")
      return
    }

    try {
      setLoading(true)
      
      // Get current user data
      const storedUser = await AsyncStorage.getItem("user")
      const parsed = storedUser ? JSON.parse(storedUser) : {}
      
      // Only send profile_pic if it's a base64 string (starts with data:)
      // Skip if it's a local file URI that wasn't converted
      let profilePicToSend = null
      if (profilePic && profilePic.startsWith('data:')) {
        profilePicToSend = profilePic
      } else if (profilePic && !profilePic.startsWith('file://')) {
        // If it's already a valid URL or base64, use it
        profilePicToSend = profilePic
      }
      
      // Update profile on server
      const response = await api.put("/api/profile", {
        name: name,
        email: parsed.email,
        profile_pic: profilePicToSend,
        bio: bio || null,
        education_level: educationLevel || null,
        section: section || null,
        strand: strand || null,
        department: department || null,
        printed_id: printedId || null
      })
      
      if (response.data?.user) {
        // Update local storage with server response
        const updatedUser = { 
          ...parsed, 
          name: response.data.user.name, 
          profilePic: response.data.user.profile_pic || null, // Use backend value, ensure it's not undefined
          bio: response.data.user.bio,
          educationLevel: response.data.user.education_level,
          section: response.data.user.section,
          strand: response.data.user.strand,
          department: response.data.user.department,
          printed_id: response.data.user.printed_id
        }
        // Remove old profile_pic field if it exists to avoid confusion
        delete updatedUser.profile_pic;
        await AsyncStorage.setItem("user", JSON.stringify(updatedUser))
        Alert.alert("Success", "Profile updated successfully!")
        router.back() // go back to profile
      }
    } catch (error) {
      console.log("Error saving user:", error)
      console.log("Error response:", error.response?.data)
      
      // Handle validation errors
      let errorMessage = "Failed to update profile. Please try again."
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.response?.data?.errors) {
        // Laravel validation errors
        const errors = error.response.data.errors
        const firstError = Object.values(errors)[0]
        errorMessage = Array.isArray(firstError) ? firstError[0] : firstError
      } else if (error.message) {
        errorMessage = error.message
      }
      
      Alert.alert("Error", errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20, padding: 20, paddingBottom: 10 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 10 }}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: "bold" }}>Edit Profile</Text>
      </View>

      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingTop: 0 }}
        showsVerticalScrollIndicator={true}
      >

      {/* Profile Picture */}
      <View style={{ alignItems: "center", marginBottom: 30 }}>
        <TouchableOpacity onPress={pickImage}>
          <Image
            source={
              profilePic && (profilePic.startsWith('data:') || profilePic.startsWith('http') || profilePic.startsWith('file://'))
                ? { uri: profilePic }
                : require("../assets/images/profile-pic.png")
            }
            style={{ width: 100, height: 100, borderRadius: 50 }}
            onError={(error) => {
              console.log("Image load error:", error);
              setProfilePic(null);
            }}
          />
          <View
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              backgroundColor: "#4A56E2",
              borderRadius: 20,
              padding: 6,
            }}
          >
            <Ionicons name="camera" size={16} color="white" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Name Input */}
      <Text style={{ marginBottom: 8, fontWeight: "bold" }}>Full Name</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        style={{
          borderWidth: 1,
          borderColor: "#E0E0E0",
          borderRadius: 8,
          padding: 12,
          marginBottom: 20,
        }}
        placeholder="Enter your name"
      />

      {/* Bio Input */}
      <Text style={{ marginBottom: 8, fontWeight: "bold" }}>Bio</Text>
      <TextInput
        value={bio}
        onChangeText={setBio}
        style={{
          borderWidth: 1,
          borderColor: "#E0E0E0",
          borderRadius: 8,
          padding: 12,
          marginBottom: 20,
          height: 80,
          textAlignVertical: "top",
        }}
        placeholder="Tell us about yourself..."
        multiline
        numberOfLines={3}
      />

      {/* Printed ID Number Input */}
      <Text style={{ marginBottom: 8, fontWeight: "bold" }}>ID Number (Printed on Card)</Text>
      <TextInput
        value={printedId}
        onChangeText={setPrintedId}
        style={{
          borderWidth: 1,
          borderColor: "#E0E0E0",
          borderRadius: 8,
          padding: 12,
          marginBottom: 8,
        }}
        placeholder="Enter your ID number (e.g., 20111111)"
        keyboardType="numeric"
      />
      <Text style={{ 
        fontSize: 12, 
        color: "#666", 
        marginBottom: 20,
        fontStyle: "italic"
      }}>
        💡 Enter the ID number printed on your school ID card (e.g., 20111111). The system will automatically link it to your RFID chip when you tap your card at events.
      </Text>

      {/* Education Level */}
      <Text style={{ marginBottom: 8, fontWeight: "bold" }}>Education Level</Text>
      <View style={{
        borderWidth: 1,
        borderColor: "#E0E0E0",
        borderRadius: 8,
        marginBottom: 20,
      }}>
        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            padding: 12,
            backgroundColor: educationLevel === "Basic Education" ? "#4A56E2" : "transparent",
          }}
          onPress={() => setEducationLevel("Basic Education")}
        >
          <View style={{
            width: 20,
            height: 20,
            borderRadius: 10,
            borderWidth: 2,
            borderColor: educationLevel === "Basic Education" ? "white" : "#4A56E2",
            backgroundColor: educationLevel === "Basic Education" ? "white" : "transparent",
            marginRight: 10,
          }} />
          <Text style={{
            color: educationLevel === "Basic Education" ? "white" : "black",
            fontWeight: educationLevel === "Basic Education" ? "bold" : "normal",
          }}>Basic Education</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            padding: 12,
            backgroundColor: educationLevel === "College" ? "#4A56E2" : "transparent",
          }}
          onPress={() => setEducationLevel("College")}
        >
          <View style={{
            width: 20,
            height: 20,
            borderRadius: 10,
            borderWidth: 2,
            borderColor: educationLevel === "College" ? "white" : "#4A56E2",
            backgroundColor: educationLevel === "College" ? "white" : "transparent",
            marginRight: 10,
          }} />
          <Text style={{
            color: educationLevel === "College" ? "white" : "black",
            fontWeight: educationLevel === "College" ? "bold" : "normal",
          }}>College</Text>
        </TouchableOpacity>
      </View>

      {/* Section (for Basic Education) */}
      {educationLevel === "Basic Education" && (
        <>
          <Text style={{ marginBottom: 8, fontWeight: "bold" }}>Section</Text>
          <TextInput
            value={section}
            onChangeText={setSection}
            style={{
              borderWidth: 1,
              borderColor: "#E0E0E0",
              borderRadius: 8,
              padding: 12,
              marginBottom: 20,
            }}
            placeholder="e.g., Grade 10 - Einstein"
          />
        </>
      )}

      {/* Strand (for Senior High) */}
      {educationLevel === "Basic Education" && (
        <>
          <Text style={{ marginBottom: 8, fontWeight: "bold" }}>Strand (if Senior High)</Text>
          <TextInput
            value={strand}
            onChangeText={setStrand}
            style={{
              borderWidth: 1,
              borderColor: "#E0E0E0",
              borderRadius: 8,
              padding: 12,
              marginBottom: 20,
            }}
            placeholder="e.g., STEM, ABM, HUMSS, GAS"
          />
        </>
      )}

      {/* Department (for College) */}
      {educationLevel === "College" && (
        <>
          <Text style={{ marginBottom: 8, fontWeight: "bold" }}>Department</Text>
          <TextInput
            value={department}
            onChangeText={setDepartment}
            style={{
              borderWidth: 1,
              borderColor: "#E0E0E0",
              borderRadius: 8,
              padding: 12,
              marginBottom: 20,
            }}
            placeholder="e.g., Computer Science, Engineering, Business"
          />
        </>
      )}

      {/* Save Button */}
      <CustomButton
        title="Save Changes"
        handlePress={handleSave}
        containerStyles={{ backgroundColor: "#4A56E2", marginTop: 10, marginBottom: 20 }}
        textStyles={{ color: "white" }}
        loading={loading}
      />
      </ScrollView>
    </SafeAreaView>
  )
}