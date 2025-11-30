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
import { MainHeader } from "@/components/ui/MainHeader";
import { Text } from "@/components/ui/Text";
import { theme } from "@/design/theme";
import { signOut } from "@/lib/supabase";

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
  const hasIncomplete = true; // placeholder for incomplete session badge

  const quote = useMemo(() => {
    const idx = Math.floor(Math.random() * QUOTES.length);
    return QUOTES[idx];
  }, []);

  const handleLogout = async () => {
    setMenuOpen(false);
    try {
      await signOut();
      router.replace("../auth/login");
    } catch (err) {
      console.warn("Failed to log out", err);
    }
  };

  const menuOptions = [
    {
      label: "Settings",
      onPress: () => {
        setMenuOpen(false);
        router.push("../profile");
      },
    },
    { label: "Log out", onPress: handleLogout },
  ];

  return (
    <View style={styles.container}>
      <MainHeader
        onMenuPress={() => setMenuOpen((p) => !p)}
        onProfilePress={() => router.push("../profile")}
        showBellDot={hasIncomplete}
        paddingHorizontal={0}
        iconSize={28}
      />

      <View style={styles.headerText}>
        <SvgStrokeText
          text={today}
          stroke={colors.light.date}
          textStyle={{ color: colors.light.date, fontSize: 20 }}
          containerStyle={styles.dateText}
        />
        <SvgStrokeText
          text={`Hi, ${userName}`}
          containerStyle={styles.hiText}
        />
      </View>

      <View style={styles.heroWrapper}>
        <Image source={teddyBear} style={styles.heroImage} />
      </View>

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
      {menuOpen && (
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
      )}
    </View>
  );
}

function formatHomeDate(date: Date) {
  const weekday = date.toLocaleDateString("en-US", { weekday: "long" });
  const month = date.toLocaleDateString("en-US", { month: "long" });
  const day = date.getDate();
  return `${weekday}, ${month} ${day}`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
  },
  headerText: {
    width: "100%",
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
    alignItems: "flex-start",
    paddingLeft: 0,
  },
  dateText: {
    alignSelf: "flex-start",
    marginBottom: theme.spacing.xs,
  },
  hiText: {
    alignSelf: "flex-start",
    marginLeft: 3, // manually fixing alignment
  },
  heroWrapper: {
    alignItems: "center",
  },
  heroImage: {
    alignSelf: "center",
    marginTop: theme.spacing.md,
    width: 220,
    height: 240,
    resizeMode: "contain",
  },
  quoteCard: {
    marginTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    alignItems: "center",
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
    top: 32,
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
