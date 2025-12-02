import { Audio } from "expo-av";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "@/assets/themes/colors";
import { fonts } from "@/assets/themes/typography";
import { InputField } from "@/components";
import SvgStrokeText from "@/components/SvgStrokeText";
import { ArrowAction } from "@/components/ui/ArrowAction";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Spacer } from "@/components/ui/Spacer";
import { StepProgressIndicator } from "@/components/ui/StepProgressIndicator";
import { theme } from "@/design/theme";

const teddy = require("../../../assets/theo/waving.png");

export default function GoalScreen() {
  const { breakdown } = useLocalSearchParams<{ breakdown?: string }>();

  const wantsBreakdown = breakdown === "1";

  const [goal, setGoal] = useState("");
  const [showTaskPrompt, setShowTaskPrompt] = useState(false);
  const { width, height } = useWindowDimensions();
  const isCompact = width < 360 || height < 720;

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
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordError, setRecordError] = useState<string | null>(null);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [recordingStatus, setRecordingStatus] = useState<
    "idle" | "recording" | "stopped"
  >("idle");
  const [requestingPerms, setRequestingPerms] = useState(false);

  const goalInputPadding = useMemo(
    () => ({
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
    }),
    []
  );

  const handleContinue = () => {
    router.push({
      pathname: "./breakdown",
      params: { goal: goal.trim() },
    });
    return;
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
              text={"GOAL: "}
              stroke={colors.light.header2}
              textStyle={{
                color: colors.light.header2,
                fontSize: fonts.sizes.header2,
              }}
              containerStyle={{ alignSelf: "center" }}
            />

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
                      setRecordError(null);
                      setAudioUri(null);
                      setRecordingStatus("idle");
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
            <Spacer size="xxl" />
            <Spacer size="xxl" />
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

      <Modal
        visible={showRecorder}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRecorder(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.recorderCard}>
            <Text variant="h2" style={styles.modalTitle}>
              Voice note
            </Text>
            {recordError && (
              <Text color="danger" style={styles.modalMessage}>
                {recordError}
              </Text>
            )}
            {audioUri && (
              <Text color="accentDark" style={styles.modalMessage}>
                Recorded clip ready.
              </Text>
            )}

            <View style={styles.recorderRow}>
              <Button
                label={
                  recordingStatus === "recording"
                    ? "Stop recording"
                    : "Start recording"
                }
                variant="brown"
                size="md"
                onPress={async () => {
                  if (recordingStatus === "recording") {
                    await stopRecording();
                  } else {
                    await startRecording();
                  }
                }}
                disabled={requestingPerms}
              />
            </View>

            <Spacer />

            <Button
              label="Close"
              variant="outlineBrown"
              onPress={() => {
                if (recordingStatus === "recording") {
                  recording?.stopAndUnloadAsync().catch(() => {});
                }
                setRecording(null);
                setShowRecorder(false);
              }}
            />
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },
  recorderCard: {
    width: "80%",
    backgroundColor: theme.colors.background,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.lg,
    ...theme.shadow.medium,
  },
  modalTitle: {
    textAlign: "center",
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  modalMessage: {
    textAlign: "center",
    marginTop: theme.spacing.xs,
  },
  recorderRow: {
    alignItems: "center",
    marginTop: theme.spacing.md,
  },
});
const startRecording = async () => {
  setRecordError(null);
  setAudioUri(null);
  setRequestingPerms(true);
  try {
    const perm = await Audio.requestPermissionsAsync();
    if (!perm.granted) {
      setRecordError("Microphone permission is required.");
      return;
    }
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });
    const rec = new Audio.Recording();
    await rec.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
    await rec.startAsync();
    setRecording(rec);
    setRecordingStatus("recording");
  } catch (err) {
    setRecordError("Could not start recording.");
  } finally {
    setRequestingPerms(false);
  }
};

const stopRecording = async () => {
  try {
    await recording?.stopAndUnloadAsync();
    const uri = recording?.getURI() || null;
    setAudioUri(uri);
  } catch (err) {
    setRecordError("Could not stop recording.");
  } finally {
    setRecording(null);
    setRecordingStatus("stopped");
  }
};
