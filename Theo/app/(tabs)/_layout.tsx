import React from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Link, Tabs } from "expo-router";
import { Pressable } from "react-native";

import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import { useClientOnlyValue } from "@/components/useClientOnlyValue";

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
type FontAwesomeName = React.ComponentProps<typeof FontAwesome>["name"];

function TabBarIcon({
  name,
  color,
  size = 33,
}: {
  name: FontAwesomeName;
  color: string;
  size?: number;
}) {
  return (
    <FontAwesome
      name={name}
      color={color}
      size={size}
      style={{ marginBottom: -2 }}
    />
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#ffffff",
        tabBarInactiveTintColor: "#F3DDB4",
        tabBarLabelStyle: {
          marginTop: 4,
        },
        tabBarItemStyle: {
          paddingVertical: 2,
        },
        tabBarStyle: {
          backgroundColor: "#8A5E3C",
          borderTopColor: "#8A5E3C",
          height: 88,
          paddingBottom: 10,
          paddingTop: 8,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />

      <Tabs.Screen
        name="session"
        options={{
          title: "Session",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="calendar" color={color} size={28} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
        }}
      />

      <Tabs.Screen
        name="example"
        options={{
          title: "Styles",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="code" color={color} size={28} />
          ),
        }}
      />
    </Tabs>
  );
}
