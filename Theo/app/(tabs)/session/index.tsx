import { router } from "expo-router";
import React, { useMemo } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Spacer } from "@/components";
import { AppModal } from "@/components/custom/AppModal";
import { BasicButton } from "@/components/custom/BasicButton";
import { StepProgressIndicator } from "@/components/custom/StepProgressIndicator";
import SvgStrokeText from "@/components/custom/SvgStrokeText";
import { Text } from "@/components/custom/Text";
import { Theme } from "@/design/theme";
import { useAppTheme } from "@/hooks/ThemeContext";

export default function StartSessionScreen() {
  const handleCreateNew = () => router.push("../(tabs)/session/goal");
  const handleCopy = () => router.push("../(tabs)/session/copy-session");
  const handleComplete = () =>
    router.push("../(tabs)/session/complete-session");
  const { width } = useWindowDimensions();
  const [showComingSoon, setShowComingSoon] = React.useState(false);
  const { colors: palette, theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme, palette), [palette, theme]);

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
            onPress={handleCopy}
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
            onPress={handleComplete}
            variant="tertiary"
            //style={[styles.actionButton, { width: buttonWidth }]}
          />
          <Spacer size="md" />
          <Text style={styles.actionDescription}>
            Use saved plans from the archive to begin a new session.
          </Text>
        </View>
      </ScrollView>
      <AppModal
        visible={showComingSoon}
        onClose={() => setShowComingSoon(false)}
        variant="custom"
        title="Coming soon!"
        showClose
      >
        <Text style={styles.modalMessage}>
          Copying and completing sessions isn't ready yet.
        </Text>
        <Spacer size="md" />
        <Text style={styles.modalMessage}>
          Please create a new session to get started.
        </Text>
        <Spacer size="md" />
        <BasicButton
          style={styles.center}
          text="Create a new session"
          onPress={() => {
            setShowComingSoon(false);
            handleCreateNew();
          }}
          textStyle={{ flexWrap: "nowrap" }}
        />
      </AppModal>
    </SafeAreaView>
  );
}

function createStyles(
  theme: Theme,
  palette: typeof import("@/design/colors").colors.light
) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: palette.background,
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
      color: palette.body,
      paddingHorizontal: theme.spacing.xl,
    },
    divider: {
      height: 1,
      backgroundColor: palette.separator,
      marginHorizontal: theme.spacing.lg,
    },
    modalMessage: {
      textAlign: "center",
      marginTop: theme.spacing.sm,
      fontSize: theme.typography.sizes.md,
      color: theme.colors.quote,
    },
    center: {
      alignSelf: "center",
      width: "100%",
      maxWidth: "100%",
    },
  });
}
