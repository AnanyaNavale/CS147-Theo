import { Audio } from "expo-av";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import { Theme } from "@/design/theme";
import { useAppTheme } from "@/hooks/ThemeContext";
import { transcribeAudioFile } from "@/lib/voice";

import { BasicButton } from "../BasicButton";
import { AppModal } from "./AppModal";
import { Icon } from "./Icon";
import { Spacer } from "./Spacer";
import { Text } from "./Text";

type RecorderStatus = "idle" | "recording" | "transcribing" | "ready";

export type VoiceRecorderModalProps = {
  visible: boolean;
  onClose: () => void;
  onTranscriptReady: (text: string) => void;
  confirmLabel?: string;
  title?: string;
};

function formatMillis(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export function VoiceRecorderModal({
  visible,
  onClose,
  onTranscriptReady,
  confirmLabel = "Use transcription",
  title = "Voice input",
}: VoiceRecorderModalProps) {
  const { colors: palette, theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme, palette), [theme, palette]);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [status, setStatus] = useState<RecorderStatus>("idle");
  const [durationMs, setDurationMs] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [hasRecordedThisModal, setHasRecordedThisModal] = useState(false);
  const maxHeight = useMemo(
    () => Math.min(640, Dimensions.get("window").height * 0.9),
    []
  );

  const resetState = (preserveTranscript = false) => {
    recording?.stopAndUnloadAsync().catch(() => {});
    setRecording(null);
    setStatus("idle");
    setDurationMs(0);
    if (!preserveTranscript) setTranscript("");
    setError(null);
    setSubmitting(false);
    setHasRecordedThisModal(false);
  };

  useEffect(() => {
    if (!visible) {
      resetState(true);
      return;
    }

    // Fresh open: keep prior transcript for double-checking, but reset controls.
    setRecording(null);
    setStatus("idle");
    setDurationMs(0);
    setError(null);
    setSubmitting(false);
    setHasRecordedThisModal(false);
  }, [visible]);

  const startRecording = async () => {
    if (Platform.OS === "web") {
      setError("Voice recording isn't supported on web. Please use the app.");
      return;
    }

    setError(null);
    setTranscript("");
    setDurationMs(0);

    try {
      const perm = await Audio.requestPermissionsAsync();
      if (!perm.granted) {
        setError("Microphone permission is required.");
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const RecordingCtor: any = (Audio as any).Recording;
      if (!RecordingCtor) {
        throw new Error("Recording is not available on this platform.");
      }

      let rec: Audio.Recording | null = null;
      try {
        const createdRecording = new RecordingCtor() as Audio.Recording;
        await createdRecording.prepareToRecordAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        );
        rec = createdRecording;
      } catch (ctorErr) {
        console.warn(
          "Recording constructor failed, trying createAsync fallback",
          ctorErr
        );
        const created = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        );
        rec = created.recording;
      }

      if (!rec) {
        throw new Error("Could not start recording.");
      }

      rec.setOnRecordingStatusUpdate((update) => {
        if (update.isRecording) {
          setDurationMs(update.durationMillis ?? 0);
        }
      });
      await rec.startAsync();

      setRecording(rec);
      setStatus("recording");
    } catch (err) {
      console.error("startRecording failed", err);
      setError("Could not start recording. Please try again.");
      setStatus("idle");
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    setStatus("transcribing");
    setError(null);

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      setHasRecordedThisModal(true);

      if (!uri) {
        throw new Error("We couldn't read the recorded audio.");
      }

      const text = await transcribeAudioFile(uri);
      setTranscript(text.trim());
      setStatus("ready");
    } catch (err) {
      console.error("stopRecording/transcribe failed", err);
      setError(
        err instanceof Error
          ? err.message
          : "Could not process that audio clip."
      );
      setStatus("idle");
    }
  };

  const handleUseTranscript = async () => {
    if (!transcript.trim()) return;
    setSubmitting(true);
    try {
      onTranscriptReady(transcript.trim());
      onClose();
    } finally {
      setSubmitting(false);
      resetState(true);
    }
  };

  const canRecord = useMemo(
    () => status !== "transcribing" && !submitting,
    [status, submitting]
  );
  const showTranscriptBox = transcript.length > 0 || status === "transcribing";
  const primaryLabel = useMemo(() => {
    if (status === "recording") return "Stop recording";
    if (hasRecordedThisModal) return "Record again";
    return "Start recording";
  }, [status, hasRecordedThisModal]);

  return (
    <AppModal
      visible={visible}
      onClose={() => {
        resetState(true);
        onClose();
      }}
      variant="custom"
      title={title}
    >
      <ScrollView
        style={[styles.scroller, { maxHeight }]}
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statusRow}>
          <View
            style={[
              styles.statusPill,
              status === "recording" ? styles.pillRecording : styles.pillIdle,
            ]}
          >
            <Icon
              name="mic"
              size={20}
              tint={
                status === "recording"
                  ? theme.colors.buttonText ?? "#fff"
                  : theme.colors.body
              }
            />
            <Text
              style={[
                styles.pillText,
                status === "recording" ? styles.pillTextActive : null,
              ]}
            >
              {status === "recording" ? "Recording..." : "Ready"}
            </Text>
          </View>
          <Text style={styles.timer}>{formatMillis(durationMs)}</Text>
        </View>

        {error && (
          <Text color="tertiary" style={styles.error}>
            {error}
          </Text>
        )}
        <Spacer />
        <View style={styles.controlsRow}>
          <BasicButton
            text={primaryLabel}
            onPress={status === "recording" ? stopRecording : startRecording}
            //variant="brown"
            disabled={!canRecord}
            style={styles.controlButton}
          />
        </View>

        {showTranscriptBox && (
          <View style={styles.transcriptBox}>
            <View style={styles.transcriptHeader}>
              <Text style={styles.transcriptTitle}>Transcript</Text>
              {status === "transcribing" && (
                <ActivityIndicator size="small" color={theme.colors.primary} />
              )}
            </View>
            <ScrollView style={styles.transcriptScroll}>
              <Text style={styles.transcriptText}>
                {status === "transcribing" && !transcript
                  ? "Processing your audio..."
                  : transcript || "Your text will appear here."}
              </Text>
            </ScrollView>
          </View>
        )}

        <View style={styles.footerActions}>
          <BasicButton
            text={confirmLabel}
            //variant="brown"
            onPress={handleUseTranscript}
            disabled={!transcript || status === "transcribing" || submitting}
            style={styles.footerButton}
          />
        </View>
      </ScrollView>
    </AppModal>
  );
}

function createStyles(
  theme: Theme,
  palette: typeof import("@/assets/themes/colors").colors.light
) {
  return StyleSheet.create({
  scroller: {
    width: "100%",
  },
  body: {
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: 999,
    backgroundColor: palette.background,
    borderWidth: 1.5,
    borderColor: palette.border,
    gap: theme.spacing.xs,
  },
  pillRecording: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
  },
  pillIdle: {
    backgroundColor: palette.background,
  },
  pillText: {
    fontFamily: theme.typography.families.regular,
    color: palette.body,
  },
  pillTextActive: {
    color: palette.buttonText ?? "#fff",
  },
  timer: {
    fontFamily: theme.typography.families.regular,
    color: palette.body,
  },
  controlsRow: {
    width: "100%",
    alignItems: "center",
    marginBottom: -theme.spacing.md,
  },
  controlButton: {
    width: "100%",
  },
  transcriptBox: {
    borderWidth: 2,
    borderColor: palette.primary,
    borderRadius: theme.radii.md,
    padding: theme.spacing.sm,
    backgroundColor: palette.background,
    maxHeight: 220,
  },
  transcriptHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing.xs,
  },
  transcriptTitle: {
    fontFamily: theme.typography.families.serif,
    fontSize: theme.typography.sizes.md,
    color: palette.body,
  },
  transcriptScroll: {
    maxHeight: 180,
  },
  transcriptText: {
    color: palette.body,
    fontFamily: theme.typography.families.regular,
    fontSize: theme.typography.sizes.md,
    lineHeight: theme.typography.sizes.md * 1.4,
  },
  footerActions: {
    flexDirection: "column",
    gap: theme.spacing.sm,
    alignItems: "center",
  },
  footerButton: {
    width: "100%",
  },
  error: {
    textAlign: "center",
    color: palette.error,
  },
  });
}
