import { router } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Spacer } from "@/components";
import { Button } from "@/components/ui/Button";
import { StepProgressIndicator } from "@/components/ui/StepProgressIndicator";
import { Text } from "@/components/ui/Text";
import { theme } from "@/design/theme";

export default function StartSessionScreen() {
  const handleCreateNew = () => router.push("../(tabs)/session/goal");
  const { width } = useWindowDimensions();
  const buttonWidth = Math.min(width * 0.7, 340);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerRow}>
        <StepProgressIndicator
          steps={["Setup", "Customize", "Finalize"]}
          activeCount={1}
          style={styles.headerProgress}
          onPressBack={() => router.back()}
          onPressMenu={() => {}}
        />
      </View>

      <Spacer size="lg" />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text variant="h1" style={styles.subtitle}>
          How would you like to get started?
        </Text>

        <Spacer size="xxl" />

        <View style={styles.actionBlock}>
          <Button
            label="Create a new session"
            onPress={handleCreateNew}
            variant="brown"
            style={[styles.actionButton, { width: buttonWidth }]}
          />
          <Spacer size="md" />
          <Text style={styles.actionDescription}>
            Set up a fresh goal or set of tasks.
          </Text>
        </View>

        <Spacer size="xl" />
        <View style={styles.divider} />
        <Spacer size="xl" />

        <View style={styles.actionBlock}>
          <Button
            label="Copy a recent session"
            onPress={() => {
              // TODO: implement copy flow
            }}
            variant="gold"
            style={[styles.actionButton, { width: buttonWidth }]}
          />
          <Spacer size="md" />
          <Text style={styles.actionDescription}>
            Duplicate & edit a past session&apos;s goals, tasks, and timings.
          </Text>
        </View>

        <Spacer size="xl" />
        <View style={styles.divider} />
        <Spacer size="xl" />

        <View style={styles.actionBlock}>
          <Button
            label="Complete a session"
            onPress={() => {
              // TODO: implement complete flow
            }}
            variant="danger"
            style={[styles.actionButton, { width: buttonWidth }]}
          />
          <Spacer size="md" />
          <Text style={styles.actionDescription}>
            Return to unfinished work sessions or mark sessions as completed.
          </Text>
        </View>
      </ScrollView>
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
    //paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.lg,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  subtitle: {
    textAlign: "center",
    fontFamily: theme.typography.families.serif,
    fontSize: theme.typography.sizes.xl,
  },
  headerProgress: {
    flex: 1,
    marginHorizontal: theme.spacing.md,
    paddingHorizontal: 0,
  },
  actionBlock: {
    alignItems: "center",
  },
  actionButton: {
    alignSelf: "center",
    paddingVertical: theme.spacing.md,
  },
  actionDescription: {
    textAlign: "center",
    fontSize: theme.typography.sizes.sm + 2,

    paddingHorizontal: theme.spacing.xl,
  },
  divider: {
    height: 1,
    backgroundColor: "#CBB7A0",
    marginHorizontal: theme.spacing.lg,
  },
});
