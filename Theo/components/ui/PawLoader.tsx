import { theme } from "@/design/theme";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { Text } from "./Text";

type PawLoaderProps = {
  message?: string;
};

export function PawLoader({
  message = "Getting your session ready...",
}: PawLoaderProps) {
  const anims = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];

  useEffect(() => {
    anims.forEach((a, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 150),
          Animated.timing(a, {
            toValue: 1,
            duration: 350,
            useNativeDriver: true,
          }),
          Animated.timing(a, {
            toValue: 0,
            duration: 350,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  }, []);

  const scale = (a: Animated.Value) => ({
    transform: [
      {
        scale: a.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.5],
        }),
      },
    ],
  });

  return (
    <View style={styles.container}>
      <View style={styles.pawContainer}>
        {/* Toe positions inside fixed-ratio paw */}
        <Animated.View style={[styles.toe, styles.toe1, scale(anims[0])]} />
        <Animated.View style={[styles.toe, styles.toe2, scale(anims[1])]} />
        <Animated.View style={[styles.toe, styles.toe3, scale(anims[2])]} />
        <Animated.View style={[styles.toe, styles.toe4, scale(anims[3])]} />

        {/* Main pad */}
        <View style={styles.mainPad} />
      </View>

      <Text variant="h3">{message}</Text>
    </View>
  );
}

const brown = theme.colors.accentDark;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: "center",
    alignItems: "center",
  },

  pawContainer: {
    width: "55%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },

  mainPad: {
    width: "68%",
    height: "68%",
    borderRadius: 999,
    backgroundColor: brown,
    position: "absolute",
    bottom: "8%",
  },

  toe: {
    position: "absolute",
    width: "15%",
    height: "15%",
    borderRadius: 999,
    backgroundColor: brown,
  },

  // Relative to pawContainer, not screen
  toe1: { top: "10%", left: "20%" },
  toe2: { top: "3%", left: "40%" },
  toe3: { top: "10%", right: "20%" },
  toe4: { top: "22%", right: "6%" },

  message: {
    marginTop: theme.spacing.md,
    textAlign: "center",
  },
});
