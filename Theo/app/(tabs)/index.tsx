import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { colors } from "@/assets/themes/colors";
import { BasicButton } from "@/components/BasicButton";
import SvgStrokeText from "@/components/SvgStrokeText";
import { Spacer } from "@/components";
import MainHeader from "@/components/ui/MainHeader";
import { Text } from "@/components/ui/Text";
import { theme } from "@/design/theme";
// import { signOut } from "@/lib/supabase";
import { Feather } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const teddyBear = require("@/assets/theo/working.png");

const QUOTES = [
  `"You are braver than you believe, stronger than you seem, and smarter than you think." - Christopher Robin`,
  `"Success is the sum of small efforts, repeated day in and day out." - Robert Collier`,
  `"It always seems impossible until it's done." - Nelson Mandela`,
];

export default function HomeScreen() {
  const userName = "User";
  const today = formatHomeDate(new Date());
  const [menuOpen, setMenuOpen] = useState(false);
  const hasIncomplete = false; // TODO: Page for incomplete sessions

  function formatHomeDate(date: Date) {
    const weekday = date.toLocaleDateString("en-US", { weekday: "long" });
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();

    return `${weekday}, ${month}/${day}/${year}`;
  }

  const quote = useMemo(() => {
    const idx = Math.floor(Math.random() * QUOTES.length);
    return QUOTES[idx];
  }, []);

  // const handleLogout = async () => {
  //   setMenuOpen(false);
  //   try {
  //     await signOut();
  //     router.replace("../auth/login");
  //   } catch (err) {
  //     console.warn("Failed to log out", err);
  //   }
  // };

  // const menuOptions = [
  //   {
  //     label: "Settings",
  //     onPress: () => {
  //       setMenuOpen(false);
  //       router.push("../profile");
  //     },
  //   },
  //   { label: "Log out", onPress: handleLogout },
  // ];

  return (
    <View style={styles.container}>
      <MainHeader
        // onMenuPress={() => setMenuOpen((p) => !p)}
        // onProfilePress={() => router.push("../profile")}
        // onLayout={(event) => {
        //   setHeaderHeight(event.nativeEvent.layout.height);
        // }}
      />

      <View style={styles.headerContainer}>
        <View style={styles.dateContainer}>
          <SvgStrokeText
            text={today}
            stroke={colors.light.date}
            textStyle={{ color: colors.light.date, fontSize: 20 }}
            containerStyle={styles.dateText}
          />
          <TouchableOpacity>
            {hasIncomplete ? (
              <MaterialCommunityIcons
                name="bell-badge"
                size={36}
                color={colors.light.notificationActive}
              />
            ) : (
              <MaterialCommunityIcons
                name="bell-outline"
                size={36}
                color={colors.light.notificationInactive}
              />
            )}
          </TouchableOpacity>
        </View>
        <SvgStrokeText
          text={`Hi, ${userName}`}
          containerStyle={styles.hiText}
        />
      </View>

      <View style={styles.heroWrapper}>
        <Image source={teddyBear} style={styles.heroImage} />
      </View>
      <Spacer size="xl" />

      <View style={styles.quoteCard}>
        <Text style={styles.quoteText}>{quote}</Text>
      </View>

      <Spacer size="lg" />

      <BasicButton
        text="Start a work session"
        style={{ alignSelf: "center", marginTop: 20 }}
        onPress={() => router.push("../(tabs)/session")}
      />

      {menuOpen && (
        <Pressable
          style={styles.menuOverlay}
          onPress={() => setMenuOpen(false)}
        />
      )}
      {/* {menuOpen && (
        <View style={styles.menuAnchor}>
          <View style={styles.menuCard}>
            {menuOptions.map((opt, idx) => (
              <TouchableOpacity
                key={opt.label}
                style={styles.menuItem}
                onPress={opt.onPress}
              >
                <Text style={styles.menuLabel}>{opt.label}</Text>
                {idx < menuOptions.length - 1 && (
                  <View style={styles.menuDivider} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )} */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
    // paddingHorizontal: theme.spacing.lg,
    // paddingTop: theme.spacing.lg,
  },
  headerContainer: {
    flexDirection: "column",
    width: "100%",
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
    alignItems: "flex-start",
    paddingLeft: 0,
    marginHorizontal: 16,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    width: "85%",
    borderColor: "red",
    // borderWidth: 1,
  },
  dateText: {
    alignSelf: "center",
    // marginBottom: theme.spacing.xs,
    marginLeft: 5,
    borderColor: "blue",
    // borderWidth: 1,
  },
  hiText: {
    alignSelf: "flex-start",
  },
  heroWrapper: {
    alignItems: "center",
  },
  heroImage: {
    alignSelf: "center",
    marginTop: theme.spacing.md,
    height: 240,
    aspectRatio: 1,
    resizeMode: "contain",
  },
  quoteCard: {
    width: "80%",
    marginTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    alignItems: "center",
    alignSelf: "center",
  },
  quoteText: {
    fontStyle: "italic",
    color: "#888",
    fontFamily: theme.typography.families.regular,
    fontSize: theme.typography.sizes.md,
    textAlign: "center",
  },
  menuOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 2,
  },
  menuAnchor: {
    position: "absolute",
    top: 120,
    left: theme.spacing.lg,
    zIndex: 3,
  },
  menuCard: {
    backgroundColor: theme.colors.accentDark,
    borderRadius: theme.radii.lg,
    paddingVertical: theme.spacing.xs,
    minWidth: 200,
    ...theme.shadow.medium,
  },
  menuItem: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  menuLabel: {
    color: theme.solidColors.white,
    fontFamily: theme.typography.families.regular,
    fontSize: theme.typography.sizes.md,
  },
  menuDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
    opacity: 0.6,
    marginHorizontal: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
});
