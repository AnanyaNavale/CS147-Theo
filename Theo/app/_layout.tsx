import FontAwesome from "@expo/vector-icons/FontAwesome";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";

import { useColorScheme } from "@/components/useColorScheme";
import { PawLoader } from "@/components/ui/PawLoader";
import { fontMap } from "@/design/fonts";
import { SupabaseProvider, useSupabase } from "@/providers/SupabaseProvider";
import { StatusBar } from "expo-status-bar";

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  initialRouteName: "auth/login",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({ ...fontMap, ...FontAwesome.font });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SupabaseProvider>
        <StatusBar style="auto" />
        <AppNavigator />
      </SupabaseProvider>
    </GestureHandlerRootView>
  );
}

function AppNavigator() {
  const colorScheme = useColorScheme();
  const { session, isSessionLoading } = useSupabase();

  if (isSessionLoading) {
    return <PawLoader message="Snuggling in while we load..." />;
  }

  if (session) {
    return (
      <ThemeProvider
        value={colorScheme === "dark" ? DefaultTheme : DefaultTheme}
      >
        <Stack
          screenOptions={{ headerShown: false }}
          key="app-stack"
          initialRouteName="(tabs)"
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="modal" options={{ presentation: "modal" }} />
          <Stack.Screen name="chat" options={{ presentation: "modal" }} />
        </Stack>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider value={DefaultTheme}>
      <Stack
        screenOptions={{ headerShown: false }}
        key="auth-stack"
        initialRouteName="auth/login"
      >
        <Stack.Screen name="auth/login" />
        <Stack.Screen name="auth/signup" />
      </Stack>
    </ThemeProvider>
  );
}
