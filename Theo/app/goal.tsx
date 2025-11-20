import FontAwesome from "@expo/vector-icons/FontAwesome";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Spacer } from "@/components/ui/Spacer";
import { Text } from "@/components/ui/Text";
import { theme } from "@/design/theme";
import { setSessionGoal } from "@/state/sessionGoal";

const teddy = require("../assets/theo/working.png");

export default function GoalScreen() {
  const [goal, setGoal] = useState("");
  const { width } = useWindowDimensions();
  const isCompact = width < 360;

  const disabled = goal.trim().length === 0;

  const teddySize = isCompact ? 180 : 220;
  const micSize = isCompact ? 62 : 70;

  const goalInputPadding = useMemo(
    () => ({
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
    }),
    []
  );

  const handleContinue = () => {
    if (disabled) return;
    setSessionGoal(goal.trim());
    router.push("/(tabs)/session");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <FontAwesome
              name="arrow-left"
              size={22}
              color={theme.colors.accentDark}
            />
          </TouchableOpacity>

          <View style={{ width: 22 }} />
        </View>

        <Spacer size="lg" />

        <Text style={styles.prompt}>Let's set a goal for{"\n"}your work...</Text>

        <Spacer size="lg" />

        <Text style={styles.label}>GOAL:</Text>

        <Spacer size="sm" />

        <View style={[styles.inputShell, goalInputPadding]}>
          <TextInput
            value={goal}
            onChangeText={setGoal}
            placeholder="Tap here to input your goal"
            placeholderTextColor="#B7B1AD"
            multiline
            style={styles.input}
            textAlignVertical="top"
          />
        </View>
      </ScrollView>

      <Image
        source={teddy}
        style={[styles.teddy, { width: teddySize, height: teddySize }]}
      />

      <View style={styles.bottomRow}>
        <TouchableOpacity
          onPress={handleContinue}
          disabled={disabled}
          style={[
            styles.nextButton,
            disabled && styles.nextButtonDisabled,
            { opacity: disabled ? 0.3 : 1 },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Continue to start session"
        >
          <FontAwesome
            name="arrow-right"
            size={22}
            color={theme.colors.accentDark}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {}}
          activeOpacity={0.9}
          style={[styles.micWrapper, { width: micSize, height: micSize }]}
          accessibilityRole="button"
          accessibilityLabel="Use voice input"
        >
          <LinearGradient
            colors={theme.colors.gradients.brown}
            style={styles.micBg}
          >
            <FontAwesome name="microphone" size={24} color="#fff" />
          </LinearGradient>
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
    flexGrow: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  prompt: {
    textAlign: "center",
    fontFamily: theme.typography.families.handwritten,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text,
    lineHeight: 26,
  },
  label: {
    fontFamily: theme.typography.families.handwritten,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.accentDark,
    textAlign: "center",
  },
  inputShell: {
    minHeight: 140,
    borderRadius: theme.radii.md,
    backgroundColor: "transparent",
  },
  input: {
    flex: 1,
    fontFamily: theme.typography.families.handwritten,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text,
  },
  teddy: {
    position: "absolute",
    left: theme.spacing.md,
    bottom: theme.spacing.md,
    resizeMode: "contain",
  },
  bottomRow: {
    position: "absolute",
    right: theme.spacing.md,
    bottom: theme.spacing.md,
    alignItems: "flex-end",
    gap: theme.spacing.md,
  },
  nextButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    borderColor: theme.colors.accentDark,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(138,94,60,0.08)",
  },
  nextButtonDisabled: {
    borderColor: "#B8A895",
  },
  micWrapper: {
    borderRadius: theme.radii.pill,
    overflow: "hidden",
  },
  micBg: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
