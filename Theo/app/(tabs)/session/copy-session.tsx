import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    FlatList,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { fetchRecentSessions } from "@/lib/supabase"; // adjust path
import { colors } from "@/assets/themes/colors";
import { Spacer } from "@/components";
import { BasicButton } from "@/components/BasicButton";
import SvgStrokeText from "@/components/SvgStrokeText";
import { AppModal } from "@/components/ui/AppModal";
import { StepProgressIndicator } from "@/components/ui/StepProgressIndicator";
import { Text } from "@/components/ui/Text";
import { theme } from "@/design/theme";
import CopySessionBox from "@/components/CopySessionBox";
import { WorkSession } from "@/types/database.types";
import { useSupabase } from "@/providers/SupabaseProvider";

export default function StartSessionScreen() {
  const { session } = useSupabase();
  const userId = session?.user?.id;
  const handleCopy = () => router.push("../(tabs)/session/goal");
  const [sessions, setSessions] = useState<WorkSession[]>([]);
  const [showSessionModal, setShowSessionModal] = useState(false);

  useEffect(() => {
    if (!userId) {
      console.error("User not logged in.");
      return;
    }

    async function load() {
        try {
        const data = await fetchRecentSessions(userId!);
        setSessions(data);
        } catch (e) {
        console.error("Failed to load sessions:", e);
        }
    }

    load();
  }, [userId]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerRow}>
        <StepProgressIndicator
          steps={["Setup", "Customize", "Finalize"]}
          activeCount={1}
          style={styles.headerProgress}
          onPressBack={() => router.back()}
          onPressMenu={() => {}}
          helpMessagept1={
            "This is the first step of your session setup.\nHere, you may choose from one of three options:\n"
          }
          helpMessagept2={
            "(1) Create a new session: This allows you to input a goal or set of tasks you would like to complete.\n\n(2) Copy a recent session: This allows you to select from your 10 most recent completed sessions to duplicate its goals and/or tasks.\n\n(3) Complete a session: This allows you to select a plan from your archive to convert into a session."
          }
        />
      </View>

      <Spacer size="lg" />
      {/* <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      > */}
      <SvgStrokeText
        text={"Select a recent session"}
        containerStyle={{ alignSelf: "center" }}
      />
      <Spacer size="md" />
      <Text style={styles.actionDescription}>
        Choose from up to 10 of your most recent sessions listed below.
      </Text>

      <Spacer size="lg" />

      {/* <ScrollView
        style={{ borderColor: "red", borderWidth: 1, width: "90%" }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={true}
      > */}
      {/* <FlatList data={undefined} renderItem={undefined}> */}
      <FlatList
        data={sessions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CopySessionBox
            title={item.title}
            goal={item.goal}
            time={item.total_time}
            onPress={() => setShowSessionModal(true)}
          />
        )}
        style={{ width: "100%" }}
        contentContainerStyle={{ padding: 16, alignItems: "center" }}
      />

      {showSessionModal && (
        <View>
          <AppModal
            visible={showSessionModal}
            variant="custom"
            onClose={() => setShowSessionModal(false)}
            showClose={true}
            title="Under construction!"
            message={"Ah, you got us!\n\nWe're still working on implementing this, so we have a placeholder for now.\n\nStay tuned for when we do!"}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: "center",
  },
  content: {
    flexGrow: 1,
    // paddingVertical: theme.spacing.sm,
    paddingBottom: theme.spacing.xxl * 1.5,
    alignItems: "center",
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
    width: "80%",
    alignSelf: "center",
  },
  divider: {
    height: 1,
    backgroundColor: colors.light.separator,
    marginHorizontal: theme.spacing.lg,
  },
  modalMessage: {
    textAlign: "center",
    marginTop: theme.spacing.sm,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.mutedText,
  },
  center: {
    alignSelf: "center",
    width: "100%",
    maxWidth: "100%",
  },
});
