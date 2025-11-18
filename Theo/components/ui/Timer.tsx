import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "../ui/Text";
import { theme } from "../../design/theme";

type TimerProps = {
  secondsLeft: number;
  onToggle?: () => void; // optional callback if parent wants to know
};

export function Timer({ secondsLeft, onToggle }: TimerProps) {
  const [showTime, setShowTime] = useState(true);
  const [dots, setDots] = useState("");

  // Animate dots: ., .., ... cycles every 500ms
  useEffect(() => {
    if (showTime) return;

    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev === "...") return "";
        return prev + ".";
      });
    }, 500);

    return () => clearInterval(interval);
  }, [showTime]);

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s < 10 ? "0" + s : s}`;
  };

  const handlePress = () => {
    setShowTime((prev) => !prev);
    if (onToggle) onToggle();
  };

  return (
    <Pressable onPress={handlePress}>
      <View style={styles.box}>
        <Text variant="h2" weight="bold" color="textPrimary">
          {showTime ? formatTime(secondsLeft) : `Working${dots}`}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: theme.colors.accentLight,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.radii.lg,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 180,
  },
});
