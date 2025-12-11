import { useState } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CustomButton from "../../assets/components/CustomButton";
import api, { setAuthToken } from "../../constants/axios"; // Axios config

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    // Validate input
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/api/login", {
        email: email.trim().toLowerCase(),
        password,
      });

      // Laravel typical response variants
      const user = response.data?.user || response.data?.data || null;
      const token = response.data?.token || response.data?.access_token || null;

      if (token) setAuthToken(token);

      if (user || token) {
        // Convert backend field names to frontend format
        const frontendUser = {
          ...user,
          profilePic: user?.profile_pic,
          bio: user?.bio,
          educationLevel: user?.education_level,
          section: user?.section,
          strand: user?.strand,
          department: user?.department
        };
        delete frontendUser.profile_pic; // Remove the snake_case version
        delete frontendUser.education_level;
        delete frontendUser.section;
        delete frontendUser.strand;
        delete frontendUser.department;
        
        await AsyncStorage.multiSet([
          ["user", JSON.stringify(frontendUser)],
          token ? ["token", token] : ["token", ""],
        ]);
        
        router.replace("/(tabs)/home");
      } else {
        Alert.alert("Login Failed", response.data?.message || "Invalid credentials");
      }
    } catch (error) {
      console.error("Error signing in:", error);
      
      // Enhanced error handling
      let message = "An error occurred. Please try again.";
      
      if (error.response) {
        const status = error.response.status;
        if (status === 401) {
          message = "Invalid email or password. Please check your credentials.";
        } else if (status === 422) {
          message = error.response.data?.message || "Invalid input data.";
        } else if (status >= 500) {
          message = "Server error. Please try again later.";
        } else {
          message = error.response.data?.message || `Server error (${status})`;
        }
      } else if (error.request) {
        message = "Network error. Please check your internet connection.";
      } else {
        message = error.message || "An unexpected error occurred.";
      }
      
      Alert.alert("Sign In Error", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20 }}>
        {/* Back button */}
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 20 }}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>

        {/* Logo */}
        <View style={{ alignItems: "center", marginBottom: 30 }}>
          <Image
            source={require("@/assets/images/logo.png")}
            style={{ width: 100, height: 100 }}
            resizeMode="contain"
          />
          <Text style={{ fontSize: 20, fontWeight: "bold", color: "#4A56E2", marginTop: 10 }}>
            EVENTEASE
          </Text>
          <Text style={{ fontSize: 16, marginTop: 5 }}>Sign In</Text>
          
        </View>


        {/* Email Input */}
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
            autoCapitalize="none"
          />
        </View>

        {/* Password Input */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            borderWidth: 1,
            borderColor: "#E0E0E0",
            borderRadius: 8,
            paddingHorizontal: 10,
            marginBottom: 20,
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
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={20}
              color="#9E9E9E"
            />
          </TouchableOpacity>
        </View>

        {/* Forgot password */}
        <TouchableOpacity
          style={{ alignSelf: "flex-end", marginBottom: 20 }}
          onPress={() => router.push("/(auth)/forget-password")}
        >
          <Text style={{ color: "#9E9E9E" }}>Forgot Password?</Text>
        </TouchableOpacity>

        {/* Sign In Button */}
        <CustomButton
          title="SIGN IN"
          handlePress={handleSignIn}
          loading={loading}
          containerStyles={{ backgroundColor: "#4A56E2", marginBottom: 20 }}
          textStyles={{ color: "white" }}
        />

        {/* Divider */}
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
          <View style={{ flex: 1, height: 1, backgroundColor: "#E0E0E0" }} />
          <View style={{ paddingHorizontal: 10 }}>
            <Text style={{ color: "#9E9E9E" }}>OR</Text>
          </View>
          <View style={{ flex: 1, height: 1, backgroundColor: "#E0E0E0" }} />
        </View>

        {/* Social Login Buttons */}
        <View style={{ marginBottom: 20 }}>
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "white",
              padding: 12,
              borderRadius: 8,
              marginBottom: 10,
              borderWidth: 1,
              borderColor: "#E0E0E0",
            }}
            onPress={() => router.replace("/(tabs)/home")}
          >
            <Image
              source={require("@/assets/images/google.png")}
              style={{ width: 24, height: 24, marginRight: 10 }}
            />
            <Text>Login with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "white",
              padding: 12,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: "#E0E0E0",
            }}
            onPress={() => router.replace("/(tabs)/home")}
          >
            <Image
              source={require("@/assets/images/facebook.png")}
              style={{ width: 24, height: 24, marginRight: 10 }}
            />
            <Text>Login with Facebook</Text>
          </TouchableOpacity>
        </View>

        {/* Sign Up link */}
        <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
          <Text style={{ color: "#9E9E9E" }}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/sign-up")}>
            <Text style={{ color: "#4A56E2", fontWeight: "bold" }}>
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
