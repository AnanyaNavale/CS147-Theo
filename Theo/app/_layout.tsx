import FontAwesome from "@expo/vector-icons/FontAwesome";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useCallback, useEffect, useRef } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";

import { PawLoader } from "@/components/ui/PawLoader";
import { useColorScheme } from "@/components/useColorScheme";
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
  const splashHidden = useRef(false);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  const onLayoutRootView = useCallback(async () => {
    if (loaded && !splashHidden.current) {
      splashHidden.current = true;
      try {
        await SplashScreen.hideAsync();
      } catch {
        // safely ignore
      }
    }
  }, [loaded]);

  if (!loaded) return null;

  return <RootLayoutNav onReady={onLayoutRootView} />;
}

function RootLayoutNav({ onReady }: { onReady: () => void }) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onReady}>
      <SupabaseProvider>
        <StatusBar style="dark" />
        <AppNavigator />
      </SupabaseProvider>
    </GestureHandlerRootView>
  );
}

function AppNavigator() {
  const colorScheme = useColorScheme();
  const { session, isSessionLoading } = useSupabase();

  // While Supabase is checking the session → show loader
  if (isSessionLoading) {
    return <PawLoader message="Snuggling in while we load..." />;
  }

  // Logged-in navigation stack
  if (session) {
    return (
      <ThemeProvider value={DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }} key="app-stack">
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="modal" options={{ presentation: "modal" }} />
          <Stack.Screen name="chat" options={{ presentation: "modal" }} />
        </Stack>
      </ThemeProvider>
    );
  }

  // Logged-out navigation stack
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
