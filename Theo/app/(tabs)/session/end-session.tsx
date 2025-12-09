import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";

import { Spacer, Text } from "@/components";
import { BasicButton } from "@/components/BasicButton";
import SvgStrokeText from "@/components/SvgStrokeText";
import { ArrowAction } from "@/components/ui/ArrowAction";
import { Theme } from "@/design/theme";
import { useAppTheme } from "@/hooks/ThemeContext";

const teddy = require("../../../assets/theo/done.png");

export default function EndSessionScreen() {
  const { goal, tasks, sessionId } = useLocalSearchParams();
  const sessionIdParam = Array.isArray(sessionId) ? sessionId[0] : sessionId;
  const sessionIdValue =
    sessionIdParam && sessionIdParam !== "null" ? sessionIdParam : null;
  const goalText = goal ?? "";
  const parsedTasks = useMemo(() => {
    if (!tasks) return [];

    // Handle string arrays
    const tasksString = Array.isArray(tasks) ? tasks[0] : tasks;

    try {
      const data = JSON.parse(tasksString);
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }, [tasks]);

  const { width } = useWindowDimensions();
  const isCompact = width < 360;
  const teddySize = isCompact ? 200 : 260;
  const { colors: palette, theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme, palette), [theme, palette]);

  const viewSummary = () => {
    router.push({
      pathname: "./session-summary",
      params: {
        goal: goalText,
        tasks: JSON.stringify(parsedTasks),
        sessionId: sessionIdValue,
      },
    });
  };

  return (
    <>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Spacer size="lg" />
        <View style={styles.centered}>
          <Spacer size="xl" />
          {goalText ? (
            <>
              <SvgStrokeText
                text="Goal:"
                stroke={palette.header2}
                textStyle={{ color: palette.header2 }}
              ></SvgStrokeText>

              <Text variant="h3" style={{ textAlign: "center" }}>
                {goalText}
              </Text>
              <Spacer />
            </>
          ) : (
            <>
              <SvgStrokeText text="Session Complete"></SvgStrokeText>
              <Spacer />
            </>
          )}
          <BasicButton
            text="All done!"
            onPress={viewSummary}
            style={styles.primaryButton}
          />

          <Spacer size="lg" />
          <Text style={styles.note}>Give yourself a pat on the back.</Text>
        </View>
        <Spacer size="sm" />

        <Image
          source={teddy}
          style={[styles.image, { width: teddySize, height: teddySize }]}
        />

        <Text style={styles.note}>
          Let&apos;s take a look at how you did in your work today!
        </Text>

        <Spacer size="xxl" />

        <ArrowAction label={`View summary`} onPress={viewSummary} />
      </ScrollView>
    </>
  );
}

function createStyles(
  theme: Theme,
  palette: typeof import("@/assets/themes/colors").colors.light
) {
  return StyleSheet.create({
    container: {
      flexGrow: 1,
      paddingHorizontal: theme.spacing.lg,
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: palette.background,
      paddingBottom: theme.spacing.xxl,
    },
    centered: { alignItems: "center" },
    goalLabel: {
      fontFamily: theme.typography.families.handwritten,
      fontSize: theme.typography.sizes.lg,
      color: theme.colors.header2,
    },
    goalValue: {
      fontFamily: theme.typography.families.regular,
      fontSize: theme.typography.sizes.md,
      color: theme.colors.header1,
      textAlign: "center",
      marginTop: theme.spacing.xs,
    },
    primaryButton: {
      width: 240,
      height: 70,
    },
    note: {
      textAlign: "center",
      paddingHorizontal: theme.spacing.lg,
      color: theme.colors.header1,
    },
    image: {
      width: 260,
      height: 260,
      resizeMode: "contain",
    },
    arrowInline: {
      position: "relative",
      right: undefined,
      bottom: undefined,
      marginTop: theme.spacing.sm,
    },
  });
}
