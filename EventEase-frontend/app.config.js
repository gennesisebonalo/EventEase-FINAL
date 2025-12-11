// app.config.js - Expo configuration with environment variables
export default {
  expo: {
    name: "EventEase",
    slug: "eventease",
    scheme: "eventease",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/logo.png",
    userInterfaceStyle: "automatic",
    ios: {
      supportsTablet: true,
      newArchEnabled: true,
      bundleIdentifier: "com.eventease.app"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/logo.png",
        backgroundColor: "#ffffff"
      },
      permissions: [
        "INTERNET"
      ],
      newArchEnabled: true,
      package: "com.eventease.app",
      versionCode: 1
    },
    // Web platform removed - mobile only
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/logo.png",
          imageWidth: 300,
          resizeMode: "contain",
          backgroundColor: "#ffffff"
        }
      ],
      "expo-font"
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      // API URL - can be overridden by EAS build environment variables
      apiUrl: process.env.API_URL || process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000",
      environment: process.env.ENVIRONMENT || process.env.EXPO_PUBLIC_ENVIRONMENT || "development",
      eas: {
        projectId: "90332279-1162-4739-bbaa-2e3659247acc"
      }
    }
  }
};

