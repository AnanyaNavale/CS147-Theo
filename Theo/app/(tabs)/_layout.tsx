import { Feather } from "@expo/vector-icons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs, useRouter } from "expo-router";
import React from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";

import { useColorScheme } from "@/components/useColorScheme";

type FeatherName = React.ComponentProps<typeof Feather>["name"];

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
type FontAwesomeName = React.ComponentProps<typeof FontAwesome>["name"];

function TabBarIcon({
  name,
  color,
  size = 33,
}: {
  name: FeatherName;
  color: string;
  size?: number;
}) {
  return (
    <Feather
      name={name}
      color={color}
      size={size}
      style={{ marginBottom: -2 }}
    />
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const image = require("@/assets/images/logo.png");

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
        tabBarStyle: styles.tabBar,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />

      <Tabs.Screen
        name="session"
        options={{
          title: "Session",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="book-open" color={color} size={28} />
          ),
          tabBarStyle: { display: "none" },
        }}
      />

      <Tabs.Screen
        name="archive"
        options={{
          title: "Archive",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="calendar" color={color} size={28} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 130,
    backgroundColor: "#fff",
    shadowOpacity: 0,
    elevation: 0,
    flexDirection: "row", // horizontal layout
    justifyContent: "space-between", // spread elements evenly across width
    alignItems: "flex-end", // vertically center elements
    borderColor: "red",
    // borderWidth: 1,
    paddingHorizontal: 30,
    paddingVertical: 15,
  },
  tabBar: {
    backgroundColor: "#8A5E3C",
    borderTopColor: "#8A5E3C",
    height: 88,
    paddingBottom: 10,
    paddingTop: 8,
  },
  userIcon: {
    borderRadius: 22, // half of width/height
    borderWidth: 4,
    borderColor: "#8A5E3C",
    backgroundColor: "#8A5E3C",
    width: 45,
    height: 45,
    justifyContent: "center",
    alignItems: "center",
  },
});
