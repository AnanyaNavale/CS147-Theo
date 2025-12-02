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
import { BasicButton } from "@/components/BasicButton";
import { StepProgressIndicator } from "@/components/ui/StepProgressIndicator";
import { Text } from "@/components/ui/Text";
import { theme } from "@/design/theme";
import SvgStrokeText from "@/components/SvgStrokeText";
import { colors } from "@/assets/themes/colors";

export default function StartSessionScreen() {
  const handleCreateNew = () => router.push("../(tabs)/session/goal");
  const { width } = useWindowDimensions();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerRow}>
        <StepProgressIndicator
          steps={["Setup", "Customize", "Finalize"]}
          activeCount={1}
          style={styles.headerProgress}
          onPressMenu={() => {}}
          firstPage={true}
          helpMessagept1={
            "This is the first step of your session setup.\nHere, you may choose from one of three options:\n"
          }
          helpMessagept2={
            "(1) Create a new session: This allows you to input a goal or set of tasks you would like to complete.\n\n(2) Copy a recent session: This allows you to select from your 10 most recent completed sessions to duplicate its goals and/or tasks.\n\n(3) Complete a session: This allows you to select a plan from your archive to convert into a session."
          }
        />
      </View>

      <Spacer size="lg" />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <SvgStrokeText
          text={"How would you like to\nget started?"}
          containerStyle={{ alignSelf: "center" }}
        />

        <Spacer size="xxl" />

        <View style={styles.actionBlock}>
          <BasicButton text="Create a new session" onPress={handleCreateNew} />
          <Spacer size="md" />
          <Text style={styles.actionDescription}>
            Set up a fresh goal or set of tasks.
          </Text>
        </View>

        <Spacer size="xl" />
        <View style={styles.divider} />
        <Spacer size="xl" />

        <View style={styles.actionBlock}>
          <BasicButton
            text="Copy a recent session"
            onPress={() => {
              // TODO: implement copy flow
            }}
            variant="secondary"
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
          <BasicButton
            text="Complete a session"
            onPress={() => {
              // TODO: implement complete flow
            }}
            variant="tertiary"
            //style={[styles.actionButton, { width: buttonWidth }]}
          />
          <Spacer size="md" />
          <Text style={styles.actionDescription}>
            Use saved plans from the archive to begin a new session.
          </Text>
        </View>
      </ScrollView>
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
    paddingVertical: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl * 1.5,
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
    backgroundColor: colors.light.separator,
    marginHorizontal: theme.spacing.lg,
  },
});
