import { router } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { InputField } from "@/components";
import SvgStrokeText from "@/components/SvgStrokeText";
import { ArrowAction } from "@/components/ui/ArrowAction";
import { Icon } from "@/components/ui/Icon";
import { Spacer } from "@/components/ui/Spacer";
import { StepProgressIndicator } from "@/components/ui/StepProgressIndicator";
import { VoiceRecorderModal } from "@/components/ui/VoiceRecorderModal";
import { theme } from "@/design/theme";

const teddy = require("../../../assets/theo/waving.png");

export default function GoalScreen() {
  const [goal, setGoal] = useState("");
  const showTaskPrompt = false;
  const { width, height } = useWindowDimensions();
  const isCompact = width < 360;

  const hasGoal = goal.trim().length > 0;
  const primaryLabel = hasGoal ? "Next" : "Skip";

  const baseTeddySize = isCompact ? 170 : 220;
  const arrowFootprint = 160; // approx width of ArrowAction (text + icon)
  const horizontalMargin = theme.spacing.md * 2;
  const maxTeddyWidth = Math.max(
    140,
    width - arrowFootprint - horizontalMargin
  );
  const maxTeddyHeight = Math.max(140, height * 0.35);
  const teddySize = Math.min(baseTeddySize, maxTeddyWidth, maxTeddyHeight);
  const micSize = isCompact ? 20 : 26;
  const [showRecorder, setShowRecorder] = useState(false);

  const handleContinue = () => {
    router.push({
      pathname: "./breakdown",
      params: { goal: goal.trim() },
    });
    return;
  };

  const handleTranscriptReady = (text: string) => {
    setGoal(text);
    setShowRecorder(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerRow}>
            <StepProgressIndicator
              steps={["Setup", "Customize", "Finalize"]}
              activeCount={2}
              onPressMenu={() => {}}
              helpMessagept1={
                "Here, you may enter a goal for your plan or work session. There are text and voice input options for your convenience.\n"
              }
              helpMessagept2={
                "If you would like to skip this step and move to the Task Manager to enter tasks, you may select the 'Skip' option at the bottom of the screen."
              }
            />
          </View>

          <Spacer size="xxl" />

          <View>
            <SvgStrokeText
              text={"Would you like to set\na goal for your work?"}
              containerStyle={{ alignSelf: "center" }}
            />

            <Spacer size="lg" />

            <SvgStrokeText
              text="Goal:"
              stroke={theme.colors.accentDark}
              textStyle={{
                color: theme.colors.accentDark,
              }}
              containerStyle={{ alignSelf: "center" }}
            ></SvgStrokeText>

            <Spacer size="md" />

            <View style={styles.inputContainer}>
              <InputField
                value={goal}
                onChangeText={setGoal}
                placeholder="Tap to input your goal"
                textAlignVertical="center"
                width="100%"
                style={[styles.goalInput]}
                inputStyle={{ paddingRight: theme.spacing.xl * 2 }}
                rightAccessory={
                  <TouchableOpacity
                    onPress={() => {
                      setShowRecorder(true);
                    }}
                    activeOpacity={0.9}
                    style={[
                      styles.micWrapper,
                      {
                        width: micSize,
                        height: micSize,
                      },
                    ]}
                  >
                    <Icon
                      name="mic"
                      size={micSize}
                      tint={theme.colors.accentDark}
                    />
                  </TouchableOpacity>
                }
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Image
        source={teddy}
        style={[styles.teddy, { width: teddySize, height: teddySize }]}
      />

      {!showTaskPrompt && (
        <ArrowAction label={primaryLabel} onPress={handleContinue} />
      )}

      <VoiceRecorderModal
        visible={showRecorder}
        onClose={() => setShowRecorder(false)}
        onTranscriptReady={handleTranscriptReady}
        confirmLabel="Use this goal"
        title={undefined}
      />
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
  goalInput: {
    //textAlignVertical: "center",
    //paddingVertical: theme.spacing.sm,
  },
  inputShell: {
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.accentDark,
    backgroundColor: theme.colors.background,
  },
  goalDisplayRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xl,
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
    alignItems: "center",
    justifyContent: "center",
    marginLeft: theme.spacing.md,
  },
  button: {
    paddingVertical: theme.spacing.md,
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    paddingHorizontal: theme.spacing.lg,
  },
});
