import { Stack } from "expo-router";

export default function SessionStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, presentation: "card" }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="copy-session" />
      <Stack.Screen name="goal" />
      <Stack.Screen name="breakdown" />
      <Stack.Screen name="finalize-session" />
      <Stack.Screen name="in-session" />
      <Stack.Screen name="session-complete" />
      <Stack.Screen name="session-summary" />
      <Stack.Screen name="end-session" />
    </Stack>
  );
}
