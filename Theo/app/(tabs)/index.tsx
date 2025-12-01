import { router } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { colors } from "@/assets/themes/colors";
import { BasicButton } from "@/components/BasicButton";
import QuoteOfTheDay from "@/components/Quote";
import SvgStrokeText from "@/components/SvgStrokeText";
import MainHeader from "@/components/ui/MainHeader";
import { theme } from "@/design/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const teddyBear = require("@/assets/theo/working.png");
const HEADER_HEIGHT = 145;
const TAB_OVERLAP = 40;

// const QUOTES = [
//   `"You are braver than you believe, stronger than you seem, and smarter than you think." - Christopher Robin`,
//   `"Success is the sum of small efforts, repeated day in and day out." - Robert Collier`,
//   `"It always seems impossible until it's done." - Nelson Mandela`,
// ];

export default function HomeScreen() {
  const userName = "User";
  const today = formatHomeDate(new Date());
  const [menuOpen, setMenuOpen] = useState(false);
  const hasIncomplete = false; // TODO: Page for incomplete sessions
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();

  function formatHomeDate(date: Date) {
    const weekday = date.toLocaleDateString("en-US", { weekday: "long" });
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();

    return `${weekday}, ${month}/${day}/${year}`;
  }

  // const quote = useMemo(() => {
  //   const idx = Math.floor(Math.random() * QUOTES.length);
  //   return QUOTES[idx];
  // }, []);

  const usableHeight = Math.max(0, screenHeight - HEADER_HEIGHT - TAB_OVERLAP);

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <MainHeader />

      <View
        style={[
          styles.content,
          {
            minHeight: usableHeight,
            paddingBottom: insets.bottom + TAB_OVERLAP + theme.spacing.md,
          },
        ]}
      >
        {/* Section 1: Date + greeting + bell */}
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

        {/* Section 2: Teddy + quote */}
        <View style={styles.heroBlock}>
          <Image source={teddyBear} style={styles.heroImage} />
          <QuoteOfTheDay />
        </View>

        {/* Section 3: CTA */}
        <View style={styles.ctaRow}>
          <BasicButton
            text="Start a work session"
            style={{ alignSelf: "center" }}
            onPress={() => router.push("../(tabs)/session")}
          />
        </View>
      </View>

      {menuOpen && (
        <Pressable
          style={styles.menuOverlay}
          onPress={() => setMenuOpen(false)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    justifyContent: "space-between",
  },
  headerContainer: {
    flexDirection: "column",
    width: "100%",
    marginTop: theme.spacing.lg,
    alignItems: "flex-start",
    //paddingLeft: 0,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    width: "100%",
  },
  dateText: {
    alignSelf: "center",
    // marginBottom: theme.spacing.xs,
    marginLeft: 5,
  },
  hiText: {
    alignSelf: "flex-start",
  },
  heroBlock: {
    alignItems: "center",
    gap: theme.spacing.md,
  },
  heroImage: {
    alignSelf: "center",
    height: 240,
    aspectRatio: 1,
    resizeMode: "contain",
  },
  ctaRow: {
    alignItems: "center",
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
