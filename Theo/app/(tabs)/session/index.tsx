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
import { colors } from "@/assets/themes/colors";
import { fonts } from "@/assets/themes/typography";
import SvgStrokeText from "@/components/SvgStrokeText";

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
          onPressBack={() => router.back()}
          onPressMenu={() => {}}
        />
      </View>

      <Spacer size="lg" />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <SvgStrokeText text={"How would you like to\nget started?"} />
        <Spacer size="xl" />

        <View style={styles.actionBlock}>
          <BasicButton
            text="Create a new session"
            onPress={handleCreateNew}
            width={230}
            height={60}
          />
          <Spacer size="md" />
          <Text style={styles.actionDescription}>
            Set up a fresh goal or set of tasks.
          </Text>
        </View>

        <Spacer size="xl" />
        <View style={styles.separator} />
        {/* <View style={styles.divider} /> */}
        <Spacer size="xl" />

        <View style={styles.actionBlock}>
          <BasicButton
            text="Copy a recent session"
            onPress={() => {
              // TODO: implement copy flow
            }}
            variant="secondary"
            width={230}
            height={60}
          />
          <Spacer size="md" />
          <View style={{ width: "80%" }}>
            <Text style={styles.actionDescription}>
              Duplicate & edit a past session&apos;s goals, tasks, and timings.
            </Text>
          </View>
        </View>

        <Spacer size="xl" />
        <View style={styles.separator} />
        {/* <View style={styles.divider} /> */}
        <Spacer size="xl" />

        <View style={styles.actionBlock}>
          <BasicButton
            text="Complete a session"
            onPress={() => {
              // TODO: implement complete flow
            }}
            variant="tertiary"
            width={230}
            height={60}
          />
          <Spacer size="md" />
          <View style={{ width: "80%" }}>
            <Text style={styles.actionDescription}>
              Use saved plans from the archive to begin a new session.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  content: {
    flexGrow: 1,
    //paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.lg,
    alignItems: "center",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
    // width: "30%",

    paddingHorizontal: theme.spacing.xl,
  },
  separator: {
    // marginVertical: 5,
    height: 1,
    width: "80%",
    backgroundColor: colors.light.separator,
  },
  // divider: {
  //   height: 1,
  //   backgroundColor: "#CBB7A0",
  //   marginHorizontal: theme.spacing.lg,
  // },
});
