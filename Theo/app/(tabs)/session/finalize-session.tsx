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
import { Checkbox } from "@/components/ui/Checkbox";
import { Spacer } from "@/components/ui/Spacer";
import { StepProgressIndicator } from "@/components/ui/StepProgressIndicator";
import { Text } from "@/components/ui/Text";
import { theme } from "@/design/theme";
import { colors } from "@/assets/themes/colors";
import SvgStrokeText from "@/components/SvgStrokeText";
import { fonts } from "@/assets/themes/typography";

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

  const parsedTasks: Task[] = useMemo(() => {
    if (!tasks) return [];
    try {
      const data = JSON.parse(tasks);
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }, [tasks]);

  const { width } = useWindowDimensions();
  const controlWidth = Math.min(width * 0.8, 320);

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
    ? "Starting a Work Session"
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
            onPressBack={() => router.back()}
            onPressMenu={() => {}}
          />
        </View>

        <Spacer size="xl" />

        <SvgStrokeText
          text={promptText}
          containerStyle={{ alignSelf: "center" }}
        />
        <Spacer size="lg" />

        {goalText && (
          <View style={styles.goalRow}>
            <SvgStrokeText
              text={"GOAL:"}
              textStyle={{
                color: colors.light.header2,
                fontSize: fonts.sizes.header2,
              }}
              stroke={colors.light.header2}
            />
            <Text style={styles.goalValue}>{goalText}</Text>
          </View>
        )}

        <Spacer size="md" />

        {!showSettings ? (
          <>
            <Spacer size="xl" />
            <BasicButton
              text="Select session settings"
              onPress={handleSelectSettings}
              style={styles.button}
              width={250}
            />

            <Spacer size="md" />

            <BasicButton
              text="Save plan to calendar"
              onPress={handleSavePlan}
              variant="secondary"
              style={styles.button}
              width={250}
            />
          </>
        ) : (
          <>
            <View style={styles.divider} />
            <Spacer size="md" />
            <SvgStrokeText
              text="Select Your Settings"
              containerStyle={{ alignSelf: "center" }}
            />
            {/* <Text variant="h1" style={styles.prompt}>
              Select Your Settings
            </Text> */}
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
              />
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
              width={250}
            />
          </>
        )}
      </ScrollView>

      <Image source={teddy} style={styles.teddy} />
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
    color: colors.light.body,
    paddingTop: 6,
  },
  button: {
    alignSelf: "center",
  },
  divider: {
    height: 1,
    backgroundColor: colors.light.separator,
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
    width: "90%",
    borderColor: 'red',
    // borderWidth: 1,
    alignSelf: 'center',
  },
  teddy: {
    position: "absolute",
    left: theme.spacing.sm,
    bottom: theme.spacing.lg,
    width: 160,
    height: 200,
    resizeMode: "contain",
  },
});
