import { router } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { BasicButton } from "@/components/custom/BasicButton";
import MainHeader from "@/components/custom/MainHeader";
import QuoteOfTheDay from "@/components/custom/Quote";
import SvgStrokeText from "@/components/custom/SvgStrokeText";
import { colors } from "@/design/colors";
import { Theme } from "@/design/theme";
import { useAppTheme } from "@/hooks/ThemeContext";
import { fetchUserProfile } from "@/lib/supabase";
import { useSupabase } from "@/providers/SupabaseProvider";
import { useFocusEffect } from "@react-navigation/native";

const teddyBear = require("@/assets/theo/working.png");
const HEADER_HEIGHT = 145; // size of main header (fixed) including its padding
const TAB_OVERLAP = 35; // size of the portion of the "session" circle in the tab bar that exceeds the actual tab bar

export default function HomeScreen() {
  const [displayName, setDisplayName] = useState<string | null>(null);
  const today = formatHomeDate(new Date());
  const [menuOpen, setMenuOpen] = useState(false);
  const hasIncomplete = false; // TODO: Page for incomplete sessions
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();
  const { session } = useSupabase();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const { colors: palette, theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme, palette), [theme, palette]);

  const loadAvatar = useCallback(() => {
    let isActive = true;

    if (!session?.user) {
      setAvatarUrl(null);
      return () => {
        isActive = false;
      };
    }

    const fromMetadata =
      (session.user.user_metadata?.avatar_url as string | undefined) ?? null;
    setAvatarUrl(fromMetadata);

    fetchUserProfile(session.user.id)
      .then((profile) => {
        if (isActive && profile?.avatar_url) {
          setAvatarUrl(profile.avatar_url);
        }
      })
      .catch((error) => {
        console.warn("Failed to load avatar", error);
      });

    return () => {
      isActive = false;
    };
  }, [session?.user?.id]);

  // Refresh when auth session changes
  useEffect(() => {
    return loadAvatar();
  }, [loadAvatar]);

  // Refresh when the home screen regains focus (e.g., after updating profile photo)
  useFocusEffect(loadAvatar);

  useEffect(() => {
    if (!session?.user) return;

    fetchUserProfile(session.user.id)
      .then((profile) => setDisplayName(profile?.display_name ?? null))
      .catch((err) => {
        console.error("Failed to fetch display name:", err);
        setDisplayName(null);
      });
  }, [session]);

  function capitalizeFirst(str: string | null | undefined): string {
    if (!str || str.length === 0) return "";
    return str[0].toUpperCase() + str.slice(1);
  }

  const formattedName = capitalizeFirst(displayName);

  function formatHomeDate(date: Date) {
    const weekday = date.toLocaleDateString("en-US", { weekday: "long" });
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();

    return `${weekday}, ${month}/${day}/${year}`;
  }

  const usableHeight = screenHeight - HEADER_HEIGHT - TAB_OVERLAP; // subract out header + overlap for height content can occupy

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <MainHeader avatarUrl={avatarUrl} />

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
              stroke={palette.date}
              textStyle={{ color: palette.date, fontSize: 20 }}
              containerStyle={styles.dateText}
              textAnchor="start"
            />
            {/* <TouchableOpacity>
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
            </TouchableOpacity> */}
          </View>
          <SvgStrokeText
            text={`Hi, ${formattedName}`}
            containerStyle={styles.hiText}
            textAnchor="start"
          />
        </View>

        {/* Section 2: Teddy + quote */}
        <View style={styles.heroBlock}>
          <Image source={teddyBear} style={styles.heroImage} />
          <View style={{ width: "70%" }}>
            <QuoteOfTheDay />
          </View>
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

function createStyles(theme: Theme, palette: typeof colors.light) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: palette.background,
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
      marginLeft: theme.spacing.md,
      alignItems: "flex-start",
    },
    dateContainer: {
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent: "space-between",
      width: "100%",
    },
    dateText: {
      alignSelf: "center",
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
      marginBottom: "10%",
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
      backgroundColor: palette.background,
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
      color: palette.header1,
      fontFamily: theme.typography.families.regular,
      fontSize: theme.typography.sizes.md,
    },
    menuDivider: {
      height: 1,
      backgroundColor: palette.border,
      opacity: 0.6,
      marginHorizontal: theme.spacing.sm,
      marginTop: theme.spacing.sm,
    },
  });
}
