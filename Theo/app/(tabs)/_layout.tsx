import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
// import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Redirect, Tabs, usePathname, useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors } from "@/assets/themes/colors";
import { fonts } from "@/assets/themes/typography";
import { useColorScheme } from "@/components/useColorScheme";
import { useSupabase } from "@/providers/SupabaseProvider";

type FeatherName = React.ComponentProps<typeof Feather>["name"];
type MaterialCommunityIconsName = React.ComponentProps<
  typeof MaterialCommunityIcons
>["name"];

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
  return <MaterialCommunityIcons name={name} color={color} size={size} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const image = require("@/assets/images/logo.png");
  const pathname = usePathname();
  const { session, isSessionLoading } = useSupabase();

  if (isSessionLoading) return null;

  if (!session) {
    // User is NOT logged in → force them out of tabs
    return <Redirect href="/auth/login" />;
  }

  // Hide on entire session stack
  const inSessionStack = pathname.startsWith("/session");

  // Hide on nested archive screens (but not archive index)
  const inNestedArchive =
    pathname.startsWith("/archive") && pathname !== "/archive";

  const hideTabBar = inSessionStack || inNestedArchive;



  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.light.navBar,
        tabBarInactiveTintColor: colors.light.navBar,
        tabBarItemStyle: {
          justifyContent: "center",
          alignItems: "center",
        },
        // tabBarStyle: styles.tabBar,
        headerShown: false,
        tabBarStyle: hideTabBar ? { display: "none" } : styles.tabBar,
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
          // tabBarStyle: { display: "none" },
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
    alignItems: "center",
    justifyContent: "center",
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
