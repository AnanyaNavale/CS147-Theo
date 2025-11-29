import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BasicButton } from "@/components/BasicButton";
import { ArrowAction } from "@/components/ui/ArrowAction";
import { Checkbox } from "@/components/ui/Checkbox";
import { Spacer } from "@/components/ui/Spacer";
import { StepProgressIndicator } from "@/components/ui/StepProgressIndicator";
import { Text } from "@/components/ui/Text";
import { theme } from "@/design/theme";

const teddy = require("../../../assets/theo/waving.png");

type Task = {
  id: string;
  minutes: number;
  text: string;
};

export default function FinalizeSessionScreen() {
  const { goal, tasks } = useLocalSearchParams<{
    goal?: string;
    tasks?: string;
  }>();
  const goalText = goal ?? "";
  const { width } = useWindowDimensions();
  const isCompact = width < 360;
  const teddySize = isCompact ? 180 : 220;

  const parsedTasks: Task[] = useMemo(() => {
    if (!tasks) return [];
    try {
      const data = JSON.parse(tasks);
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }, [tasks]);

  const [showSettings, setShowSettings] = useState(false);
  const [reflection, setReflection] = useState(false);
  const [collab, setCollab] = useState(false);
  const [friendsOnly, setFriendsOnly] = useState(false);
  const [saveDefault, setSaveDefault] = useState(false);

  const handleSelectSettings = () => setShowSettings(true);

  const handleSavePlan = () => {
    // TODO: integrate calendar save
    console.log("Save plan to calendar not implemented yet");
  };

  const handleStartSession = () => {
    router.push({
      pathname: "./in-session",
      params: { goal: goalText, tasks: JSON.stringify(parsedTasks) },
    });
  };

  const promptText = showSettings
    ? "Select session settings"
    : "Ready to get started?";

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <StepProgressIndicator
            steps={["Setup", "Customize", "Finalize"]}
            activeCount={3}
            onPressMenu={() => {}}
          />
        </View>

        <Spacer size="md" />

        <Spacer size="xxl" />

        <Text variant="h1" style={styles.prompt}>
          {promptText}
        </Text>

        <Spacer size="lg" />

        {goalText && (
          <View style={styles.goalRow}>
            <Text variant="h2" style={styles.goalLabel}>
              GOAL:
            </Text>
            <Text style={styles.goalValue}>{goalText}</Text>
            <Spacer size="md" />
          </View>
        )}

        {!showSettings ? (
          <>
            <Spacer size="xl" />
            <BasicButton
              text="Select session settings"
              onPress={handleSelectSettings}
              style={styles.button}
            />

            <Spacer size="md" />

            <BasicButton
              text="Save plan to calendar"
              onPress={handleSavePlan}
              variant="secondary"
              style={styles.button}
            />
          </>
        ) : (
          <>
            <Spacer size="lg" />

            <View style={styles.checkboxList}>
              <Checkbox
                checked={reflection}
                onChange={setReflection}
                label="I would like periodic reflection reminders."
              />
              <Checkbox
                checked={collab}
                onChange={setCollab}
                label="Let me know if anyone requests to collaborate."
              />
              <Checkbox
                checked={friendsOnly}
                onChange={setFriendsOnly}
                label="Friends only, please!"
                containerStyle={{ marginLeft: theme.spacing.xl }}
              />
              <Spacer></Spacer>
              <Checkbox
                checked={saveDefault}
                onChange={setSaveDefault}
                label="Save as default settings for future sessions"
              />
            </View>

            <Spacer size="lg" />

            <BasicButton
              text="Start your session"
              onPress={handleStartSession}
              style={styles.button}
            />
          </>
        )}
      </ScrollView>

      <Image
        source={teddy}
        style={[styles.teddy, { width: teddySize, height: teddySize }]}
      />
      <ArrowAction label={"Start"} onPress={handleStartSession} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
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
  goalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.xs,
  },
  goalLabel: {
    color: theme.colors.accentDark,
  },
  goalValue: {
    fontFamily: theme.typography.families.regular,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text,
  },
  button: {
    alignSelf: "center",
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  settingsHeading: {
    textAlign: "center",
    fontFamily: theme.typography.families.serif,
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.text,
  },
  checkboxList: {
    gap: theme.spacing.sm,
  },
  teddy: {
    position: "absolute",
    left: theme.spacing.sm,
    bottom: theme.spacing.xl,
    resizeMode: "contain",
    zIndex: -1,
  },
});
