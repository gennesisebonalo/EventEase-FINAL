import React, { createContext, useContext, useEffect, useMemo, useState } from "react"
import { View } from "react-native"
import { StatusBar } from "expo-status-bar"
import AsyncStorage from "@react-native-async-storage/async-storage"

const light = {
  background: "#FFFFFF",
  surface: "#F5F5F5",
  text: "#111111",
  primary: "#4A56E2",
  card: "#FFFFFF",
  border: "#E0E0E0",
  headerText: "#FFFFFF",
  headerBg: "#4A56E2",
}

const dark = {
  background: "#0B0B0F",
  surface: "#151823",
  text: "#E7E7EA",
  primary: "#8893FF",
  card: "#0F111A",
  border: "#2A2E39",
  headerText: "#E7E7EA",
  headerBg: "#0F111A",
}

const ThemeContext = createContext({ darkMode: false, colors: light, setDarkMode: () => {} })

export function ThemeProvider({ children }) {
  const [darkMode, setDarkModeState] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem("settings_prefs")
        if (stored) {
          const parsed = JSON.parse(stored)
          if (parsed?.theme?.darkMode != null) setDarkModeState(!!parsed.theme.darkMode)
        }
      } catch (_) {}
    }
    load()
  }, [])

  const setDarkMode = async (value) => {
    setDarkModeState(value)
    try {
      const stored = (await AsyncStorage.getItem("settings_prefs")) || "{}"
      const parsed = JSON.parse(stored)
      const next = {
        notifications: { eventReminders: true, announcements: true, ...(parsed.notifications || {}) },
        privacy: { showEmail: true, ...(parsed.privacy || {}) },
        theme: { darkMode: value, ...(parsed.theme || {}) },
      }
      await AsyncStorage.setItem("settings_prefs", JSON.stringify(next))
    } catch (_) {}
  }

  const colors = useMemo(() => (darkMode ? dark : light), [darkMode])
  const value = useMemo(() => ({ darkMode, colors, setDarkMode }), [darkMode, colors])

  return (
    <ThemeContext.Provider value={value}>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <StatusBar style={darkMode ? "light" : "dark"} />
        {children}
      </View>
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)

