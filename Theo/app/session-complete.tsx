import FontAwesome from "@expo/vector-icons/FontAwesome";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Text } from "@/components/ui/Text";
import { theme } from "@/design/theme";
import { getSessionGoal } from "@/state/sessionGoal";

const teddy = require("../assets/theo/working.png");

export default function SessionCompleteScreen() {
  const goal = getSessionGoal() || "Prep for CS 147 Midterm";

  const handleAllDone = () => {
    router.replace("/(tabs)");
  };

  const handleViewSummary = () => {
    router.push("/session-summary");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={10}
            style={styles.back}
          >
            <FontAwesome
              name="arrow-left"
              size={22}
              color={theme.colors.accentDark}
            />
          </TouchableOpacity>

          <Text style={styles.label}>GOAL:</Text>

          <View style={{ width: 22 }} />
        </View>

        <Text style={styles.goal}>{goal}</Text>

        <TouchableOpacity activeOpacity={0.9} onPress={handleAllDone}>
          <LinearGradient
            colors={theme.colors.gradients.brown}
            style={styles.doneButton}
          >
            <Text style={styles.doneText}>All done!</Text>
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.praise}>Give yourself a pat{"\n"}on the back.</Text>

        <Image source={teddy} style={styles.teddy} />

        <Text style={styles.lookText}>
          Let's take a look at how{"\n"}you did in your work today!
        </Text>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleViewSummary}
          style={styles.summaryRow}
        >
          <Text style={styles.summaryText}>View session summary</Text>
          <FontAwesome
            name="long-arrow-right"
            size={22}
            color={theme.colors.accentDark}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FDF6EE",
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },
  back: {
    alignSelf: "flex-start",
  },
  headerRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing.sm,
  },
  label: {
    fontFamily: theme.typography.families.handwritten,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.accentDark,
    textAlign: "center",
  },
  goal: {
    fontFamily: theme.typography.families.handwritten,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text,
    textAlign: "center",
    marginBottom: theme.spacing.lg,
  },
  doneButton: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.radii.lg,
    minWidth: 200,
    alignItems: "center",
    justifyContent: "center",
    ...theme.shadow.soft,
  },
  doneText: {
    fontFamily: theme.typography.families.handwritten,
    fontSize: theme.typography.sizes.md,
    color: "#fff",
  },
  praise: {
    textAlign: "center",
    fontFamily: theme.typography.families.handwritten,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text,
    marginVertical: theme.spacing.lg,
  },
  teddy: {
    width: 200,
    height: 200,
    resizeMode: "contain",
    marginBottom: theme.spacing.lg,
  },
  lookText: {
    textAlign: "center",
    fontFamily: theme.typography.families.handwritten,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    gap: theme.spacing.sm,
  },
  summaryText: {
    fontFamily: theme.typography.families.handwritten,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.accentDark,
  },
});
