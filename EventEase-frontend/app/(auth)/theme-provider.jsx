import { View } from "react-native"

export function ThemeProvider({ children }) {
  // This is a simple theme provider for React Native
  // You can extend this with context if you need theme switching functionality
  return <View style={{ flex: 1 }}>{children}</View>
}

export default ThemeProvider

