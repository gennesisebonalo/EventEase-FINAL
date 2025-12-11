// app/_layout.js
import { Stack } from "expo-router"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { ThemeProvider } from "../assets/components/theme-provider" // adjust if needed
import api, { getServerInfo } from "../constants/axios"
import { useEffect } from "react"

export default function RootLayout() {
  useEffect(() => {
    try {
      const info = getServerInfo?.();
      console.log("[BOOT] Axios baseURL:", api?.defaults?.baseURL);
      console.log("[BOOT] Server info:", info);
    } catch (e) {}
  }, []);
  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </SafeAreaProvider>
    </ThemeProvider>
  )
}
