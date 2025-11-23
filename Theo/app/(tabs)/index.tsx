import FontAwesome from "@expo/vector-icons/FontAwesome";
import { LinearGradient } from "expo-linear-gradient";
import { router, useNavigation } from "expo-router";
import React, { useEffect } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Spacer } from "@/components";
import { Text } from "@/components/ui/Text";
import { theme } from "@/design/theme";

const teddyBear = require("../../assets/theo/working.png");
const HERO_WIDTH = 230;
const HERO_WIDTH_COMPACT = 185;
const HERO_HEIGHT = 200;
const HERO_HEIGHT_COMPACT = 165;
const CTA_WIDTH = 230;
const BASE_WIDTH = 390;
const MIN_SCALE = 0.82;
const MAX_SCALE = 1.05;

type CTAButtonVariant = "primary" | "secondary";

type CTAButtonProps = {
  label: string;
  icon: React.ComponentProps<typeof FontAwesome>["name"];
  variant?: CTAButtonVariant;
  onPress?: () => void;
  compact?: boolean;
  width?: number;
};

function CTAButton({
  label,
  icon,
  variant = "primary",
  onPress,
  compact = false,
  width,
}: CTAButtonProps) {
  const gradient =
    variant === "primary"
      ? theme.colors.gradients.brown
      : theme.colors.gradients.gold;
  const iconSize = compact ? 16 : 18;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.88}
      style={[styles.ctaFixedWidth, width && { width }]}
    >
      <LinearGradient
        colors={gradient}
        style={[styles.ctaButtonBg, compact && styles.ctaButtonBgCompact]}
      >
        <Text style={styles.ctaLabel}>{label}</Text>

        <View
          style={[styles.ctaIconBadge, compact && styles.ctaIconBadgeCompact]}
        >
          <FontAwesome name={icon} size={iconSize} color="#fff" />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const userName = "username";
  const today = formatHomeDate(new Date());
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const isCompact = width < 360;
  const baseScale = width / BASE_WIDTH;
  const scale = Math.min(Math.max(baseScale, MIN_SCALE), MAX_SCALE);
  const heroWidth = (isCompact ? HERO_WIDTH_COMPACT : HERO_WIDTH) * scale;
  const heroHeight = (isCompact ? HERO_HEIGHT_COMPACT : HERO_HEIGHT) * scale;
  const ctaWidth = CTA_WIDTH * scale;
  const profileIconSize = isCompact ? 18 : 22;
  const logoFontSize = (isCompact ? 26 : 32) * scale;
  const dateFontSize = (isCompact ? 16 : 18) * scale;
  const greetingFontSize = (isCompact ? 26 : 32) * scale;
  const logoDotSize = (isCompact ? 6 : 8) * scale;
  const logoDotSmallSize = (isCompact ? 3 : 4) * scale;
  const logoDotsGap = (isCompact ? 3 : 4) * scale;
  const logoDotsMarginTop = (isCompact ? -4 : -6) * scale;

  // useEffect(() => {
  //   navigation.setOptions({ headerShown: false });
  // }, [navigation]);

  const handleOpenProfile = () => router.push("/(tabs)/profile");

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.content, isCompact && styles.contentCompact]}>
        <View style={[styles.section, styles.headerSection]}>
          <View
            style={[styles.headerRow, isCompact && styles.headerRowCompact]}
          >
            <View style={styles.logoWrap}>
              <Text
                style={[
                  styles.logoText,
                  isCompact && styles.logoTextCompact,
                  { fontSize: logoFontSize },
                ]}
              >
                theo
              </Text>
              <View
                style={[
                  styles.logoDots,
                  isCompact && styles.logoDotsCompact,
                  { gap: logoDotsGap, marginTop: logoDotsMarginTop },
                ]}
              >
                <View
                  style={[
                    styles.logoDot,
                    isCompact && styles.logoDotCompact,
                    { width: logoDotSize, height: logoDotSize },
                  ]}
                />
                <View
                  style={[
                    styles.logoDot,
                    styles.logoDotSmall,
                    isCompact && styles.logoDotSmallCompact,
                    {
                      width: logoDotSmallSize,
                      height: logoDotSmallSize,
                    },
                  ]}
                />
              </View>
            </View>

            <Pressable
              style={[styles.headerIcon, isCompact && styles.headerIconCompact]}
              accessibilityRole="button"
              onPress={handleOpenProfile}
            >
              <FontAwesome name="user" size={profileIconSize} color="#fff" />
            </Pressable>
          </View>

          <View
            style={[styles.greetingBlock, isCompact && styles.greetingCompact]}
          >
            <Text
              style={[
                styles.dateText,
                isCompact && styles.dateTextCompact,
                { fontSize: dateFontSize },
              ]}
            >
              {today}
            </Text>
            <Text
              style={[
                styles.greetingText,
                isCompact && styles.greetingTextCompact,
                { fontSize: greetingFontSize },
              ]}
            >
              Hi, {userName}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.section,
            styles.heroSection,
            isCompact && styles.heroSectionCompact,
          ]}
        >
          <Image
            source={teddyBear}
            style={[styles.heroImage, { width: heroWidth, height: heroHeight }]}
          />
        </View>

        <View
          style={[
            styles.section,
            styles.actionSection,
            isCompact && styles.actionSectionCompact,
          ]}
        >
          <CTAButton
            label="Start a work session"
            icon="pencil"
            variant="primary"
            compact={isCompact}
            width={ctaWidth}
            onPress={() => router.push("/start-session")}
          />

          <Spacer size={isCompact ? "sm" : "md"} />

          <CTAButton
            label="Get help with a goal"
            icon="list-ul"
            variant="secondary"
            compact={isCompact}
            width={ctaWidth}
          />
        </View>
      </View>
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
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  contentCompact: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  section: {
    flex: 1,
  },
  headerSection: {
    justifyContent: "space-between",
  },
  heroSection: {
    justifyContent: "center",
    alignItems: "center",
    paddingTop: theme.spacing.sm,
  },
  heroSectionCompact: {
    paddingTop: theme.spacing.xs,
  },
  actionSection: {
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: theme.spacing.lg,
  },
  actionSectionCompact: {
    paddingBottom: theme.spacing.md,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerRowCompact: {
    paddingTop: theme.spacing.xs,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.accentDark,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  headerIconCompact: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  logoWrap: {
    alignItems: "center",
  },
  logoText: {
    fontSize: 32,
    fontFamily: theme.typography.families.handwritten,
    color: theme.colors.text,
  },
  logoTextCompact: {
    fontSize: 26,
  },
  logoDots: {
    flexDirection: "row",
    gap: 4,
    marginTop: -6,
  },
  logoDotsCompact: {
    gap: 3,
    marginTop: -4,
  },
  logoDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: theme.colors.accentDark,
  },
  logoDotCompact: {
    width: 6,
    height: 6,
  },
  logoDotSmall: {
    width: 4,
    height: 4,
    marginTop: 2,
  },
  logoDotSmallCompact: {
    width: 3,
    height: 3,
    marginTop: 1,
  },
  greetingBlock: {
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.xs,
    paddingBottom: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  greetingCompact: {
    marginTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  dateText: {
    fontFamily: theme.typography.families.handwritten,
    color: theme.colors.accentDark,
    fontSize: 18,
    marginBottom: theme.spacing.md,
  },
  dateTextCompact: {
    fontSize: 16,
    marginBottom: theme.spacing.sm,
  },
  greetingText: {
    fontFamily: theme.typography.families.handwritten,
    fontSize: 32,
    color: theme.colors.text,
  },
  greetingTextCompact: {
    fontSize: 26,
  },
  heroImage: {
    resizeMode: "contain",
    marginTop: theme.spacing.sm,
  },
  ctaButtonBg: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: theme.radii.lg,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  ctaFixedWidth: {
    width: CTA_WIDTH,
    alignSelf: "center",
  },
  ctaButtonBgCompact: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
  },
  ctaLabel: {
    color: "#fff",
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.families.bold,
  },
  ctaIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.6)",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  ctaIconBadgeCompact: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
});
