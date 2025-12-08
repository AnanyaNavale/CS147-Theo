import { Stack } from "expo-router";

export default function DateStackLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index" // single session page
        options={{
          headerShown: false,
          // tabBarStyle: { display: "none" },
        }}
      />
      <Stack.Screen
        name="[session]" // single session page
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
