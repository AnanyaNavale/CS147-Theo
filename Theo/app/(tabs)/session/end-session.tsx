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
import { theme } from "@/design/theme";

const teddy = require("../../../assets/theo/done.png");

export default function EndSessionScreen() {
  const { goal, tasks } = useLocalSearchParams<{
    goal?: string;
    tasks?: string;
  }>();
  const goalText = goal ?? "";
  const parsedTasks = useMemo(() => {
    if (!tasks) return [];
    try {
      const data = JSON.parse(tasks);
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }, [tasks]);
  const { width } = useWindowDimensions();
  const isCompact = width < 360;
  const teddySize = isCompact ? 200 : 260;

  const viewSummary = () => {
    router.push({
      pathname: "./session-summary",
      params: { goal: goalText, tasks: JSON.stringify(parsedTasks) },
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
          {goalText && (
            <>
              <Text style={styles.goalLabel}>GOAL:</Text>
              <Text style={styles.goalValue}>{goalText}</Text>
            </>
          )}

          <Spacer size="xl" />
          {goalText ? (
            <>
              <SvgStrokeText
                text="Goal:"
                stroke={theme.colors.accentDark}
                textStyle={{ color: theme.colors.accentDark }}
              ></SvgStrokeText>

              <Text variant="h3" weight="bold">
                {goalText}
              </Text>
              <Spacer />
            </>
          ) : (
            <>
              <SvgStrokeText
                text="Work session"
                stroke={theme.colors.accentDark}
                textStyle={{ color: theme.colors.accentDark }}
              ></SvgStrokeText>
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
        <Spacer size="lg" />

        <Image
          source={teddy}
          style={[styles.image, { width: teddySize, height: teddySize }]}
        />

        <Text style={styles.note}>
          Let&apos;s take a look at how you did in your work today!
        </Text>

        <Spacer size="xxl" />

        <ArrowAction label="View session summary" onPress={viewSummary} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.lg,
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.colors.background,
    paddingBottom: theme.spacing.xxl,
  },
  centered: { alignItems: "center" },
  goalLabel: {
    fontFamily: theme.typography.families.handwritten,
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.accentDark,
  },
  goalValue: {
    fontFamily: theme.typography.families.regular,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text,
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
