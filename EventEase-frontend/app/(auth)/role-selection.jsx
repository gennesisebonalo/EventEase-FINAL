import { StatusBar } from "expo-status-bar"
import { ScrollView, View, Image, ImageBackground } from "react-native"
import { router } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"
import CustomButton from "../../assets/components/CustomButton"

export default function App() {
  const logo1Size = { width: 500, height: 300 }
  const backgroundImageUrl = "https://i.pinimg.com/736x/73/24/aa/7324aa0142aed97c5eb8b8f64c7d2937.jpg"

  return (
    <ImageBackground source={{ uri: backgroundImageUrl }} style={{ flex: 1 }} resizeMode="cover">
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", alignItems: "center" }}>
          <View style={{ width: "100%", alignItems: "center", paddingHorizontal: 16 }}>
            {/* Logo */}
            <Image
              source={require("@/assets/images/logo.png")}
              style={{ width: logo1Size.width, height: logo1Size.height, marginTop: 40 }}
              resizeMode="contain"
            />

            {/* Buttons */}
            <CustomButton
              title="Explore Event"
              handlePress={() => router.push("/sign-in")}
              containerStyles={{ width: "50%", marginTop: 20, backgroundColor: "#4A56E2" }}
              textStyles={{ color: "white" }}
            />
          </View>
        </ScrollView>
        <StatusBar style="light" />
      </SafeAreaView>
    </ImageBackground>
  )
}

