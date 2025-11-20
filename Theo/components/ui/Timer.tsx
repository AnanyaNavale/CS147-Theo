import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Text } from "../ui/Text";
import { theme } from "../../design/theme";

type TimerProps = {
  secondsLeft: number;
  taskDuration: number; // NEW: full original task time in seconds
  onToggle?: () => void;
};

type DisplayMode = "countdown" | "working" | "minutes";

export function Timer({ secondsLeft, taskDuration, onToggle }: TimerProps) {
  const [mode, setMode] = useState<DisplayMode>("countdown");
  const [dots, setDots] = useState("");

  /* animate dots only in working mode */
  useEffect(() => {
    if (mode !== "working") return;

    const interval = setInterval(() => {
      setDots((prev) => (prev === "..." ? "" : prev + "."));
    }, 500);

    return () => clearInterval(interval);
  }, [mode]);

  const formatCountdown = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? "0" + s : s}`;
  };

  const formatMinutes = (sec: number) => {
    const m = Math.max(1, Math.round(sec / 60));
    return `${m} minute${m === 1 ? "" : "s"}`;
  };

  const cycleMode = () => {
    setMode((prev) =>
      prev === "countdown"
        ? "working"
        : prev === "working"
        ? "minutes"
        : "countdown"
    );
    onToggle?.();
  };

  const getLabel = () => {
    switch (mode) {
      case "countdown":
        return formatCountdown(secondsLeft);
      case "working":
        return `Working${dots}`;
      case "minutes":
        return formatMinutes(taskDuration); // always the full duration
    }
  };

  return (
    <Pressable onPress={cycleMode} style={{ width: "100%" }}>
      <LinearGradient
        colors={theme.colors.gradients.gold}
        start={[0, 0]}
        end={[1, 1]}
        style={styles.gradient}
      >
        <Text
          variant="h2"
          weight="bold"
          color="white"
          style={{ textAlign: "center" }}
        >
          {getLabel()}
        </Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  gradient: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.radii.md,
    minWidth: 180,
    alignSelf: "center",
  },
});
