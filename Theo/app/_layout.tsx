import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { useColorScheme } from "@/components/useColorScheme";
import { SupabaseProvider } from "@/providers/SupabaseProvider";

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    "AnticDidone-Regular": require("../assets/fonts/AnticDidone-Regular.ttf"),
    "Raleway-Regular": require("../assets/fonts/Raleway-Regular.ttf"),
    "Raleway-SemiBold": require("../assets/fonts/Raleway-SemiBold.ttf"),
    "Raleway-MediumItalic": require("../assets/fonts/Raleway-MediumItalic.ttf"),
    "Raleway-Medium": require("../assets/fonts/Raleway-Medium.ttf"),
    ...FontAwesome.font,
  });

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
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SupabaseProvider>
        <ThemeProvider
          value={colorScheme === "dark" ? DefaultTheme : DefaultTheme}
        >
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="modal" options={{ presentation: "modal" }} />

            <Stack.Screen name="start-session" />
            <Stack.Screen name="new-session" />
            <Stack.Screen name="goal" />
            <Stack.Screen name="session-complete" />
            <Stack.Screen name="session-summary" />

            <Stack.Screen
              name="chat"
              options={{
                presentation: "modal",
              }}
            />

            <Stack.Screen name="breakdown" />
          </Stack>
        </ThemeProvider>
      </SupabaseProvider>
    </GestureHandlerRootView>
  );
}
