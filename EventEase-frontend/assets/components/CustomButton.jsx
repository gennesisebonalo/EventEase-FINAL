import { Text, TouchableOpacity, StyleSheet, ActivityIndicator, View } from "react-native";

export default function CustomButton({
  title,
  handlePress,
  containerStyles,
  textStyles,
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
}) {
  return (
    <TouchableOpacity
      style={[styles.button, containerStyles, disabled && { opacity: 0.6 }]}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          {leftIcon}
          <Text style={[styles.buttonText, textStyles]}>{title}</Text>
          {rightIcon}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#4A56E2",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
});
