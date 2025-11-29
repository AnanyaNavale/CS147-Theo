import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BasicButton } from "@/components/BasicButton";
import SvgStrokeText from "@/components/SvgStrokeText";
import { Icon } from "@/components/ui/Icon";
import { Spacer } from "@/components/ui/Spacer";
import { StepProgressIndicator } from "@/components/ui/StepProgressIndicator";
import { Text } from "@/components/ui/Text";
import { theme } from "@/design/theme";
import { colors } from "@/assets/themes/colors";
import { fonts } from "@/assets/themes/typography";
import { setSessionGoal } from "@/state/sessionGoal";

const teddy = require("../../../assets/theo/waving.png");

export default function GoalScreen() {
  const { breakdown } = useLocalSearchParams<{ breakdown?: string }>();

  const wantsBreakdown = breakdown === "1";

  const [goal, setGoal] = useState("");
  const [showTaskPrompt, setShowTaskPrompt] = useState(false);
  const { width } = useWindowDimensions();
  const isCompact = width < 360;
  const controlWidth = Math.min(width * 0.8, 320);

  const hasGoal = goal.trim().length > 0;
  const primaryLabel = hasGoal ? "Continue" : "Skip to Task Manager";

  const teddySize = isCompact ? 180 : 220;
  const micSize = isCompact ? 62 : 70;

  const goalInputPadding = useMemo(
    () => ({
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
    }),
    []
  );

  const handleContinue = () => {
    const trimmedGoal = goal.trim();
    setSessionGoal(trimmedGoal);

    if (!hasGoal) {
      // Skip straight to task manager when no goal is provided
      router.push("./breakdown");
      return;
    }

    // Ask whether to set up tasks for this goal
    setShowTaskPrompt(true);
  };

  const handleYesTasks = () => {
    router.push({
      pathname: "./breakdown",
      params: { goal: goal.trim() },
    });
  };

  const handleSkipTasks = () => {
    // Placeholder navigation for future flow
    console.log("Skip tasks flow not implemented yet");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <StepProgressIndicator
            steps={["Setup", "Customize", "Finalize"]}
            activeCount={2}
            onPressBack={() => router.back()}
            onPressMenu={() => {}}
          />
        </View>

        <Spacer size="xxl" />

        {!showTaskPrompt ? (
          <>
            <Text style={styles.prompt}>
              Would you like to set a goal for your work?
            </Text>

            <Spacer size="lg" />

            <Text variant="h2" style={styles.label}>
              GOAL:
            </Text>

            <Spacer size="md" />

            <View
              style={[
                styles.inputShell,
                goalInputPadding,
                { width: controlWidth, alignSelf: "center" },
              ]}
            >
              <TextInput
                value={goal}
                onChangeText={setGoal}
                placeholder="Tap to input your goal"
                placeholderTextColor="#B7B1AD"
                multiline
                style={styles.input}
                textAlignVertical="top"
              />
            </View>

            <Spacer size="xxl" />
            <Spacer size="xxl" />
            <Spacer size="xxl" />

            <View style={styles.primaryButtonWrapper}>
              <BasicButton text={primaryLabel} onPress={handleContinue} />
            </View>
          </>
        ) : (
          <>
            <Text style={styles.prompt}>
              Would you like to set up some tasks for your goal?
            </Text>

            <Spacer size="xxl" />

            <View style={styles.goalDisplayRow}>
              <Text variant="h2" style={styles.labelInline}>
                GOAL:
              </Text>
              <Text style={styles.goalValue}>{goal.trim()}</Text>
            </View>

            <Spacer size="xxl" />

            <View style={styles.primaryButtonWrapper}>
              <BasicButton text="Yes, please!" onPress={handleYesTasks} />
            </View>

            <Spacer size="lg" />

            <View style={styles.primaryButtonWrapper}>
              <BasicButton
                text="Skip this step"
                onPress={handleSkipTasks}
                variant="secondary"
              />
            </View>
          </>
        )}
      </ScrollView>

      <Image
        source={teddy}
        style={[styles.teddy, { width: teddySize, height: teddySize }]}
      />

      <TouchableOpacity
        onPress={() => {}}
        activeOpacity={0.9}
        style={[
          styles.micWrapper,
          { width: micSize, height: micSize, right: theme.spacing.md },
        ]}
      >
        <View style={styles.micBg}>
          <Icon name="mic" size={40} tint="#fff" />
        </View>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FDF6EE",
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  prompt: {
    textAlign: "center",
    fontFamily: theme.typography.families.serif,
    fontSize: theme.typography.sizes.xl,
  },
  label: {
    color: theme.colors.accentDark,
    textAlign: "center",
  },
  inputShell: {
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.accentDark,
    backgroundColor: "#FFF9F2",
  },
  input: {
    flex: 1,
    fontFamily: theme.typography.families.regular,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text,
  },
  goalDisplayRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.sm,
  },
  labelInline: {
    color: theme.colors.accentDark,
  },
  goalValue: {
    fontFamily: theme.typography.families.regular,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text,
  },
  teddy: {
    position: "absolute",
    left: theme.spacing.sm,
    bottom: theme.spacing.xl,
    resizeMode: "contain",
  },
  micWrapper: {
    position: "absolute",
    bottom: theme.spacing.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  micBg: {
    //flex: 1,
    width: 70,
    height: 70,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.accentDark,
    ...theme.shadow.soft,
  },
  primaryButtonWrapper: {
    alignItems: "center",
  },
  button: {
    paddingVertical: theme.spacing.md,
  },
});
