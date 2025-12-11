import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image } from "react-native"
import { router } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import CustomButton from "../../assets/components/CustomButton"

export default function ForgetPassword() {
  const [email, setEmail] = useState("")

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20 }}>
        {/* Back button */}
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 20 }}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>

        {/* Forget Password UI */}
        <View style={{ alignItems: "center", marginBottom: 30 }}>
          <Image
            source={require("../../assets/images/user-icon.png")}
            style={{ width: 100, height: 100 }}
            resizeMode="contain"
          />
          <Text
            style={{
              fontSize: 20,
              fontWeight: "bold",
              marginTop: 20,
            }}
          >
            Forget Password?
          </Text>
          <Text
            style={{
              textAlign: "center",
              color: "#9E9E9E",
              marginTop: 10,
            }}
          >
            Enter your email address. You'll receive an email with a link to reset your password.
          </Text>
        </View>

        {/* Email input */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            borderWidth: 1,
            borderColor: "#E0E0E0",
            borderRadius: 8,
            paddingHorizontal: 10,
            marginBottom: 30,
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

        {/* Send Reset Link button */}
        <CustomButton
          title="SEND RESET LINK"
          containerStyles={{
            backgroundColor: "#4A56E2",
            marginBottom: 20,
          }}
          textStyles={{ color: "white" }}
          handlePress={() => {}}
        />

        {/* Login link */}
        <TouchableOpacity style={{ alignSelf: "center" }} onPress={() => router.push("/sign-in")}>
          <Text style={{ color: "#4A56E2" }}>Login</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

