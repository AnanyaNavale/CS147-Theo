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
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.sm,
    }),
    []
  );

  const handleContinue = () => {
    // Get AI summarized version - remove personal references, use action verbs
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
            <SvgStrokeText
              text={"Would you like to set\na goal for your work?"}
            />

            <Spacer size="lg" />

            <SvgStrokeText
              text={"GOAL:"}
              containerStyle={{ alignSelf: "center" }}
              textStyle={{
                color: colors.light.header2,
                fontSize: fonts.sizes.header2,
              }}
              stroke={colors.light.header2}
            />

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
                placeholderTextColor={colors.light.inputPlaceholder}
                multiline
                style={[styles.input, { paddingTop: 0, paddingBottom: 0 }]}
                textAlignVertical="center"
              />
            </View>

            <Spacer size="xxl" />
            <Spacer size="xxl" />
            <Spacer size="xxl" />

            <View style={styles.primaryButtonWrapper}>
              <BasicButton
                text={primaryLabel}
                onPress={handleContinue}
                width={250}
              />
            </View>
          </>
        ) : (
          <>
            <SvgStrokeText
              text={"Would you like to set\nsome tasks for your goal?"}
              containerStyle={{ alignSelf: "center" }}
            />
            {/* <Text style={styles.prompt}>
              Would you like to set up some tasks for your goal?
            </Text> */}

            <Spacer size="xxl" />

            <View style={styles.goalDisplayRow}>
              <SvgStrokeText
                text={"GOAL:"}
                textStyle={{
                  color: colors.light.header2,
                  fontSize: fonts.sizes.header2,
                }}
                stroke={colors.light.header2}
              />
              <Text style={styles.goalValue}>{goal.trim()}</Text>
            </View>

            <Spacer size="lg" />

            <View style={styles.primaryButtonWrapper}>
              <BasicButton
                text="Yes, please!"
                onPress={handleYesTasks}
                width={250}
              />
            </View>

            <Spacer size="sm" />

            <View style={styles.primaryButtonWrapper}>
              <BasicButton
                text="Skip this step"
                onPress={handleSkipTasks}
                variant="secondary"
                width={250}
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
          {
            width: micSize,
            height: micSize,
            right: theme.spacing.xl,
            bottom: theme.spacing.xxl,
          },
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
    backgroundColor: colors.light.background,
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
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.light.border,
    backgroundColor: colors.light.background,
  },
  input: {
    flex: 1,
    fontFamily: theme.typography.families.regular,
    fontSize: theme.typography.sizes.md,
    color: colors.light.body,
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
    paddingTop: 6,
    width: "70%",
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
});
