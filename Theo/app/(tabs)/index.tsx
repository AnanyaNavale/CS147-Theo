import FontAwesome from "@expo/vector-icons/FontAwesome";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Spacer } from "@/components";
import { Text } from "@/components/ui/Text";
import { theme } from "@/design/theme";

const teddyBear = require("../../assets/theo/working.png");
const HERO_WIDTH = 280;

type CTAButtonVariant = "primary" | "secondary";

type CTAButtonProps = {
  label: string;
  icon: React.ComponentProps<typeof FontAwesome>["name"];
  variant?: CTAButtonVariant;
  onPress?: () => void;
};

function CTAButton({
  label,
  icon,
  variant = "primary",
  onPress,
}: CTAButtonProps) {
  const gradient =
    variant === "primary"
      ? theme.colors.gradients.brown
      : theme.colors.gradients.gold;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.88}
      style={styles.ctaFixedWidth}
    >
      <LinearGradient colors={gradient} style={styles.ctaButtonBg}>
        <Text style={styles.ctaLabel}>{label}</Text>

        <View style={styles.ctaIconBadge}>
          <FontAwesome name={icon} size={18} color="#fff" />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const userName = "username";
  const today = formatHomeDate(new Date());

  const handleOpenProfile = () => router.push("/(tabs)/profile");

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <View style={styles.logoWrap}>
            <Text style={styles.logoText}>theo</Text>
            <View style={styles.logoDots}>
              <View style={styles.logoDot} />
              <View style={[styles.logoDot, styles.logoDotSmall]} />
            </View>
          </View>

          <Pressable
            style={styles.headerIcon}
            accessibilityRole="button"
            onPress={handleOpenProfile}
          >
            <FontAwesome name="user" size={22} color="#fff" />
          </Pressable>
        </View>

        <View style={styles.greetingBlock}>
          <Text style={styles.dateText}>{today}</Text>
          <Text style={styles.greetingText}>Hi, {userName}</Text>
        </View>

        <Spacer size="md" />

        <View style={styles.heroWrapper}>
          <Image source={teddyBear} style={styles.heroImage} />
        </View>

        <Spacer size="xl" />

        <CTAButton
          label="Start a work session"
          icon="pencil"
          variant="primary"
        />

        <Spacer size="md" />

        <CTAButton
          label="Get help with a goal"
          icon="list-ul"
          variant="secondary"
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function formatHomeDate(date: Date) {
  const weekday = date.toLocaleDateString("en-US", { weekday: "long" });
  const month = date.toLocaleDateString("en-US", { month: "long" });
  const day = date.getDate();
  return `${weekday}, ${month} ${day}${getOrdinalSuffix(day)}`;
}

function getOrdinalSuffix(day: number) {
  if (day % 100 >= 11 && day % 100 <= 13) {
    return "th";
  }

  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FDF6EE",
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
    paddingTop: 0,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.accentDark,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  logoWrap: {
    alignItems: "center",
  },
  logoText: {
    fontSize: 40,
    fontFamily: theme.typography.families.handwritten,
    color: theme.colors.text,
  },
  logoDots: {
    flexDirection: "row",
    gap: 4,
    marginTop: -6,
  },
  logoDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: theme.colors.accentDark,
  },
  logoDotSmall: {
    width: 6,
    height: 6,
    marginTop: 3,
  },
  greetingBlock: {
    marginTop: theme.spacing.lg,
    paddingTop: theme.spacing.xs,
    paddingBottom: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  dateText: {
    fontFamily: theme.typography.families.handwritten,
    color: theme.colors.accentDark,
    fontSize: 18,
    marginBottom: theme.spacing.lg,
  },
  greetingText: {
    fontFamily: theme.typography.families.handwritten,
    fontSize: 34,
    color: theme.colors.text,
  },
  heroWrapper: {
    paddingVertical: theme.spacing.xs / 2,
  },
  heroImage: {
    width: HERO_WIDTH,
    height: 280,
    resizeMode: "contain",
    alignSelf: "center",
    marginTop: theme.spacing.sm,
  },
  ctaButtonBg: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: theme.radii.lg,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  ctaFixedWidth: {
    width: HERO_WIDTH,
    alignSelf: "center",
  },
  ctaLabel: {
    color: "#fff",
    fontSize: theme.typography.sizes.md,
    fontFamily: theme.typography.families.bold,
  },
  ctaIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.6)",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
  },
});
