import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
// import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Redirect, Tabs, usePathname } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors } from "@/assets/themes/colors";
import { fonts } from "@/assets/themes/typography";
import { useAppTheme } from "@/hooks/ThemeContext";
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
  const { colors: palette } = useAppTheme();
  const styles = React.useMemo(() => createStyles(palette), [palette]);
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
        tabBarActiveTintColor: palette.navBar,
        tabBarInactiveTintColor: palette.navBar,
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
              <TabBarIcon
                name="book-open-blank-variant"
                color={palette.buttonText ?? palette.header1 ?? "#FFFFFF"}
              />
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

function createStyles(palette: typeof colors.light) {
  return StyleSheet.create({
    tabBar: {
      backgroundColor: palette.background,
      borderTopColor: palette.border,
      borderTopWidth: 2,
      height: 90,
    },
    session: {
      borderColor: palette.border,
      borderRadius: 50,
      backgroundColor: palette.navBar,
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
      color: palette.navBar,
    },
  });
}
