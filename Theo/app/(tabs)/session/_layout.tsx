import { Stack } from "expo-router";

export default function SessionStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="end-session" />
    </Stack>
  );
}
