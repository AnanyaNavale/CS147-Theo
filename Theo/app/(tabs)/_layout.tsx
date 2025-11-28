import React from "react";
import { Feather } from "@expo/vector-icons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter, Link, Tabs } from "expo-router";
import { Image, Pressable, StyleSheet, TouchableOpacity, View } from "react-native";

import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import { useClientOnlyValue } from "@/components/useClientOnlyValue";


type FeatherName = React.ComponentProps<typeof Feather>["name"];

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
type FontAwesomeName = React.ComponentProps<typeof FontAwesome>["name"];

function TabBarIcon({
  name,
  color,
  size = 33,
}: {
  // name: FontAwesomeName;
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
    // <FontAwesome
    //   name={name}
    //   color={color}
    //   size={size}
    //   style={{ marginBottom: -2 }}
    // />
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();

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
        headerStyle: styles.header,
        headerLeftContainerStyle: { paddingLeft: 30 },
        headerRightContainerStyle: { paddingRight: 30 },
        headerTitle: () => (
          <Image
            source={require("../../assets/images/logo.png")}
            style={{ width: 90, height: 40 }}
          />
        ),
        headerLeft: () => (
          <TouchableOpacity onPress={() => console.log("menu")}>
            <TabBarIcon name="menu" color="#8A5E3C" size={36} />
          </TouchableOpacity>
        ),
        headerRight: () => (
          <TouchableOpacity onPress={() => router.push("../profile")}>
            <View style={styles.userIcon}>
              <TabBarIcon name="user" color="white" size={36} />
            </View>
          </TouchableOpacity>
        ),
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
        name="example"
        options={{
          title: "Styles",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="code" color={color} size={28} />
          ),
        }}
      />

      <Tabs.Screen
        name="session"
        options={{
          title: "Session",
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
    height: 130, // increase header height
    backgroundColor: "#fff",
    // shadowColor: "transparent", // iOS shadow
    shadowOpacity: 0,
    elevation: 0, // Android shadow
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
