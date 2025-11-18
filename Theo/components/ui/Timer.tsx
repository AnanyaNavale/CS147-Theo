import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Text } from "../ui/Text";
import { theme } from "../../design/theme";

type TimerProps = {
  secondsLeft: number;
  onToggle?: () => void;
};

export function Timer({ secondsLeft, onToggle }: TimerProps) {
  const [showTime, setShowTime] = useState(true);
  const [dots, setDots] = useState("");

  useEffect(() => {
    if (showTime) return;

    const interval = setInterval(() => {
      setDots((prev) => (prev === "..." ? "" : prev + "."));
    }, 500);

    return () => clearInterval(interval);
  }, [showTime]);

  const format = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? "0" + s : s}`;
  };

  const handlePress = () => {
    setShowTime((prev) => !prev);
    onToggle?.();
  };

  return (
    <Pressable onPress={handlePress} style={{ width: "100%" }}>
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
          {showTime ? format(secondsLeft) : `Working${dots}`}
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
