import { useState } from "react"
import { View, Text, Image, TextInput, TouchableOpacity, ScrollView, Alert } from "react-native"
import { Picker } from '@react-native-picker/picker'
import { router } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import api, { setAuthToken } from "../../constants/axios"
import CustomButton from "../../assets/components/CustomButton"

export default function SignUp() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [educationLevel, setEducationLevel] = useState("")
  const [yearLevel, setYearLevel] = useState("")
  const [block, setBlock] = useState("")
  const [department, setDepartment] = useState("")

  const handleSignUp = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields")
      return
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match")
      return
    }

    try {
      setLoading(true)
      // 1) Register user in backend (Laravel)
      const registerResponse = await api.post("/api/register", {
        fullname: fullName,
        email,
        password,
        education_level: educationLevel,
        year_level: yearLevel,
        block: block,
        department: educationLevel === 'College' ? department : null,
      })

      if (!registerResponse?.data?.success) {
        const message = registerResponse?.data?.message || "Registration failed"
        Alert.alert("Sign Up Failed", message)
        setLoading(false)
        return
      }

      // 2) Immediately sign in
      const loginResponse = await api.post("/api/login", { email, password })
      if (!loginResponse?.data?.success) {
        const message = loginResponse?.data?.message || "Login after sign up failed"
        Alert.alert("Login Failed", message)
        setLoading(false)
        return
      }

      // 3) Persist user and navigate
      const user = loginResponse.data?.user || loginResponse.data?.data || {}
      const token = loginResponse.data?.token || loginResponse.data?.access_token || ""
      if (token) setAuthToken(token)
      await AsyncStorage.multiSet([["user", JSON.stringify(user)], ["token", token]])
      router.replace("/(tabs)/home")
    } catch (error) {
      console.log("Error during sign up:", error)
      const resp = error?.response
      let message = error?.message || "Network or server error"
      if (resp?.data?.message) {
        message = resp.data.message
      }
      if (resp?.status === 422 && resp?.data?.errors && typeof resp.data.errors === 'object') {
        const firstKey = Object.keys(resp.data.errors)[0]
        const firstMsg = resp.data.errors[firstKey]?.[0] || JSON.stringify(resp.data.errors)
        message = firstMsg
      }
      Alert.alert("Error", message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20 }}>
        {/* Back button */}
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 20 }}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>

        {/* Sign Up text */}
        <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 30 }}>Sign Up</Text>

        {/* Input fields */}
        {/* Full Name */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            borderWidth: 1,
            borderColor: "#E0E0E0",
            borderRadius: 8,
            paddingHorizontal: 10,
            marginBottom: 15,
          }}
        >
          <Ionicons name="person-outline" size={20} color="#9E9E9E" />
          <TextInput
            placeholder="Full name"
            value={fullName}
            onChangeText={setFullName}
            style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 10 }}
          />
        </View>

        {/* Academic Level */}
        <Text style={{ marginBottom: 6, color: "#555" }}>Academic Level</Text>
        <View
          style={{
            borderWidth: 1,
            borderColor: "#E0E0E0",
            borderRadius: 8,
            paddingHorizontal: 10,
            marginBottom: 15,
          }}
        >
          <Picker
            selectedValue={educationLevel}
            onValueChange={(v) => {
              setEducationLevel(v)
              if (v !== 'College') setDepartment("")
            }}
          >
            <Picker.Item label="Select level" value="" />
            <Picker.Item label="Elementary" value="Elementary" />
            <Picker.Item label="High School" value="High School" />
            <Picker.Item label="Senior High School" value="Senior High School" />
            <Picker.Item label="College" value="College" />
          </Picker>
        </View>

        {/* Course (when College) */}
        {educationLevel === 'College' && (
          <>
            <Text style={{ marginBottom: 6, color: "#555" }}>Course</Text>
            <View
              style={{
                borderWidth: 1,
                borderColor: "#E0E0E0",
                borderRadius: 8,
                paddingHorizontal: 10,
                marginBottom: 15,
              }}
            >
              <Picker selectedValue={department} onValueChange={setDepartment}>
                <Picker.Item label="Select course" value="" />
                <Picker.Item label="BSIT" value="BSIT" />
                <Picker.Item label="BSHM" value="BSHM" />
                <Picker.Item label="BSENTREP" value="BSENTREP" />
                <Picker.Item label="EDUCATION" value="EDUCATION" />
              </Picker>
            </View>

            {/* Year Level */}
            <Text style={{ marginTop: 15, marginBottom: 6, color: "#555" }}>Year Level</Text>
            <View
              style={{
                borderWidth: 1,
                borderColor: "#E0E0E0",
                borderRadius: 8,
                marginBottom: 15,
              }}
            >
              <Picker
                selectedValue={yearLevel}
                onValueChange={setYearLevel}
              >
                <Picker.Item label="Select year level" value="" />
                <Picker.Item label="1st Year" value="1st Year" />
                <Picker.Item label="2nd Year" value="2nd Year" />
                <Picker.Item label="3rd Year" value="3rd Year" />
                <Picker.Item label="4th Year" value="4th Year" />
                <Picker.Item label="5th Year" value="5th Year" />
              </Picker>
            </View>

            {/* Block */}
            <Text style={{ marginBottom: 6, color: "#555" }}>Block</Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                borderWidth: 1,
                borderColor: "#E0E0E0",
                borderRadius: 8,
                paddingHorizontal: 10,
                marginBottom: 15,
              }}
            >
              <Ionicons name="grid-outline" size={20} color="#9E9E9E" />
              <TextInput
                placeholder="Enter your block (e.g., A, B, C)"
                value={block}
                onChangeText={setBlock}
                style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 10 }}
                maxLength={5}
                textTransform="uppercase"
              />
            </View>
          </>
        )}

        {/* Email */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            borderWidth: 1,
            borderColor: "#E0E0E0",
            borderRadius: 8,
            paddingHorizontal: 10,
            marginBottom: 15,
          }}
        >
          <Ionicons name="mail-outline" size={20} color="#9E9E9E" />
          <TextInput
            placeholder="abc@example.com"
            value={email}
            onChangeText={setEmail}
            style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 10 }}
            keyboardType="email-address"
          />
        </View>

        {/* Password */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            borderWidth: 1,
            borderColor: "#E0E0E0",
            borderRadius: 8,
            paddingHorizontal: 10,
            marginBottom: 15,
          }}
        >
          <Ionicons name="lock-closed-outline" size={20} color="#9E9E9E" />
          <TextInput
            placeholder="Your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 10 }}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#9E9E9E" />
          </TouchableOpacity>
        </View>

        {/* Confirm Password */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            borderWidth: 1,
            borderColor: "#E0E0E0",
            borderRadius: 8,
            paddingHorizontal: 10,
          }}
        >
          <Ionicons name="lock-closed-outline" size={20} color="#9E9E9E" />
          <TextInput
            placeholder="Confirm password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 10 }}
          />
          <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
            <Ionicons name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#9E9E9E" />
          </TouchableOpacity>
        </View>

        {/* Sign Up button */}
        <CustomButton
          title="SIGN UP"
          containerStyles={{
            backgroundColor: "#4A56E2",
            marginVertical: 20,
          }}
          textStyles={{ color: "white" }}
          handlePress={handleSignUp}
          loading={loading}
        />

        {/* Already have an account */}
        <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
          <Text style={{ color: "#9E9E9E" }}>Already have an account? </Text>
          <Text style={{ color: "#4A56E2", fontWeight: "bold" }} onPress={() => router.push("/(auth)/sign-in")}>
            Sign In
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
