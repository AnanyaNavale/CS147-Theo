import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "../ui/Text";
import { Icon } from "./Icon";
import { useAppTheme } from "@/hooks/ThemeContext";
import { Theme } from "@/design/theme";

type TimerProps = {
  secondsLeft: number;
  taskDuration: number;
  onToggle?: () => void;
};

type DisplayMode = "countdown" | "working" | "minutes";

export function Timer({ secondsLeft, taskDuration, onToggle }: TimerProps) {
  const { colors: palette, theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme, palette), [theme, palette]);
  const modes: DisplayMode[] = ["countdown", "working", "minutes"];
  const [modeIndex, setModeIndex] = useState(0);
  const mode = modes[modeIndex];
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

  const cycleMode = (direction: 1 | -1) => {
    setModeIndex((prev) => {
      const next = (prev + direction + modes.length) % modes.length;
      return next;
    });
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
    <View style={styles.carousel}>
      <TouchableOpacity
        onPress={() => cycleMode(-1)}
        hitSlop={10}
      style={styles.carouselButton}
    >
      <Icon name="carousel-left" size={16} tint={palette.iconsStandalone} />
    </TouchableOpacity>

      <TouchableOpacity style={styles.shell} onPress={() => cycleMode(1)}>
        <Text
          variant="h2"
          weight="bold"
          style={{ textAlign: "center", color: palette.body }}
        >
          {getLabel()}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => cycleMode(1)}
        hitSlop={10}
      style={styles.carouselButton}
    >
      <Icon name="carousel-right" size={16} tint={palette.iconsStandalone} />
    </TouchableOpacity>
  </View>
);
}

function createStyles(
  theme: Theme,
  palette: typeof import("@/assets/themes/colors").colors.light
) {
  return StyleSheet.create({
    carousel: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: theme.spacing.sm,
      alignSelf: "center",
    },
    carouselButton: {
      padding: theme.spacing.xs,
    },
    shell: {
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.xl,
      borderRadius: theme.radii.md,
      minWidth: 180,
      alignSelf: "center",
      backgroundColor: palette.background,
      borderWidth: 2,
      borderColor: palette.primary,
      ...theme.shadow.soft,
    },
  });
}
