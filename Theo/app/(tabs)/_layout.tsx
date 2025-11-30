import { Feather } from "@expo/vector-icons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs, useRouter } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useColorScheme } from "@/components/useColorScheme";
import { fonts } from "@/assets/themes/typography";
import { colors } from "@/assets/themes/colors";

type FeatherName = React.ComponentProps<typeof Feather>["name"];
type MaterialCommunityIconsName = React.ComponentProps<typeof MaterialCommunityIcons>["name"];

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
type FontAwesomeName = React.ComponentProps<typeof FontAwesome>["name"];

function TabBarIcon({
  name,
  color,
  size = 32,
}: {
  name: MaterialCommunityIconsName;
  color: string;
  size?: number;
}) {
  return (
    <MaterialCommunityIcons
      name={name}
      color={color}
      size={size}
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
        tabBarActiveTintColor: colors.light.navBar,
        tabBarInactiveTintColor: colors.light.navBar,
        tabBarItemStyle: {
          justifyContent: "center",
          alignItems: "center",
        },
        // tabBarLabelStyle: {
        //   marginTop: 2,
        //   fontSize: 12,
        //   fontFamily: fonts.typeface.bodyBold,
        //   fontWeight: "700",
        //   textAlign: "center",
        // },
        tabBarStyle: styles.tabBar,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "home" : "home-outline"} // filled if focused, outline if not
              color={color}
            />
          ),
          tabBarLabel: ({ focused }) => (
            <Text
              style={[
                styles.tabBarLabel,
                {
                  fontFamily: focused
                    ? fonts.typeface.bodyBold
                    : fonts.typeface.body,
                },
              ]}
            >
              Home
            </Text>
          ),
        }}
      />

      <Tabs.Screen
        name="session"
        options={{
          title: "Session",
          headerShown: false,
          tabBarIcon: () => (
            <View style={styles.session}>
              <TabBarIcon name="book-open-blank-variant" color={"#FFFFFF"} />
            </View>
          ),
          tabBarLabel: ({ focused }) => (
            <Text
              style={[
                styles.tabBarLabel,
                {
                  fontFamily: focused
                    ? fonts.typeface.bodyBold
                    : fonts.typeface.body,
                },
              ]}
            >
              Session
            </Text>
          ),
          tabBarStyle: { display: "none" },
        }}
      />

      <Tabs.Screen
        name="archive"
        options={{
          title: "Archive",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "calendar-month" : "calendar-blank-outline"} // filled if focused, outline if not
              color={color}
            />
          ),
          tabBarLabel: ({ focused }) => (
            <Text
              style={[
                styles.tabBarLabel,
                {
                  fontFamily: focused
                    ? fonts.typeface.bodyBold
                    : fonts.typeface.body,
                },
              ]}
            >
              Archive
            </Text>
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
    paddingHorizontal: 30,
    paddingVertical: 15,
  },
  tabBar: {
    backgroundColor: colors.light.background,
    borderTopColor: colors.light.border,
    borderTopWidth: 2,
    height: 90,
  },
  session: {
    borderColor: colors.light.border,
    borderRadius: 50,
    backgroundColor: colors.light.navBar,
    width: 70,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 45,
  },
  tabBarLabel: {
    marginTop: 3,
    fontSize: 12,
    textAlign: "center",
    color: colors.light.navBar,
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
