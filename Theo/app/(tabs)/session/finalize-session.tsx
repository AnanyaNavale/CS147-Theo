import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppModal, Button } from "@/components";
import { BasicButton } from "@/components/BasicButton";
import SvgStrokeText from "@/components/SvgStrokeText";
import { Checkbox } from "@/components/ui/Checkbox";
import { Spacer } from "@/components/ui/Spacer";
import { StepProgressIndicator } from "@/components/ui/StepProgressIndicator";
import { Text } from "@/components/ui/Text";
import { theme } from "@/design/theme";
import { createPlan, createSession, createTask, CreateTaskPayload } from "@/lib/supabase";
import { useSupabase } from "@/providers/SupabaseProvider";

const teddy = require("@/assets/theo/waving.png");

type Task = {
  id: string;
  minutes: number;
  text: string;
};

export default function FinalizeSessionScreen() {
  const { goal, tasks, sessionId } = useLocalSearchParams<{
    goal?: string;
    tasks?: string;
    sessionId?: string;
  }>();
  const { session } = useSupabase();
  const goalText = goal ?? "";
  const { width } = useWindowDimensions();
  const isCompact = width < 360;
  const teddySize = isCompact ? 180 : 220;

  const [savingPlan, setSavingPlan] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showStartModal, setShowStartModal] = useState(false);

  const parsedTasks: Task[] = useMemo(() => {
    if (!tasks) return [];
    try {
      const data = JSON.parse(tasks);
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }, [tasks]);

  // NOT USING
  // const [showSettings, setShowSettings] = useState(false);
  // const [reflection, setReflection] = useState(false);
  // const [collab, setCollab] = useState(false);
  // const [friendsOnly, setFriendsOnly] = useState(false);
  // const [saveDefault, setSaveDefault] = useState(false);

  // const handleSelectSettings = () => setShowSettings(true);

  const handleSavePlan = async () => {
    if (savingPlan) return;
    setSaveError(null);

    if (!session?.user) {
      setSaveError("Please sign in to save plans to your archive.");
      return;
    }

    setSavingPlan(true);
    try {
      // Determine if we have a goal
      const hasGoal = Boolean(goal && goal.trim());

      // Determine if we have tasks
      const hasTasks = parsedTasks.length > 0;

      // Sum total minutes from tasks
      const total_time = parsedTasks.reduce(
        (sum, task) => sum + task.minutes,
        0
      );

      // Title can be anything you want; for now, we can default it
      const title = hasGoal ? goal! : "Plan";

      // Call your createPlan function with the authenticated user id
      const newPlan = await createPlan(
        session.user.id,
        hasGoal,
        hasTasks,
        total_time,
        title,
        goal ?? null
      );

      console.log("Plan saved:", newPlan);
      setShowConfirmationModal(true);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to save plan.";
      setSaveError(msg);
      console.error("Error saving plan:", err);
    } finally {
      setSavingPlan(false);
    }
  };

  const totalTime = parsedTasks.reduce((sum, t) => sum + t.minutes, 0);

  const handleStartSession = async () => {
    console.log("handleStartSession called");
    if (!session?.user) {
      console.error("No authenticated user");
      return;
    }

    try {
      // 1. CREATE THE SESSION
      const hasGoal = Boolean(goalText && goalText.trim());
      const hasTasks = parsedTasks.length > 0;

      const newSession = await createSession(
        session.user.id,
        hasGoal,
        goalText || null,
        hasTasks,
        totalTime, 
      );

      console.log("📌 newSession:", newSession);
      const newSessionId = newSession.id;

      // 2. CREATE TASK ROWS (ordered)
      if (parsedTasks.length > 0) {
        for (let i = 0; i < parsedTasks.length; i++) {
          const t = parsedTasks[i];

          const payload: CreateTaskPayload = {
            session_id: newSessionId,
            task_name: t.text,
            order_index: i + 1,
            time_allotted: t.minutes,
            is_completed: false,
          };

          await createTask(payload);
        }
      }

      console.log("Tasks entered");

      // 3. NAVIGATE TO IN-SESSION SCREEN
      router.push({
        pathname: "./in-session",
        params: {
          goal: goalText,
          tasks: JSON.stringify(parsedTasks),
          sessionId: newSessionId,
        },
      });
    } catch (err) {
      console.error("Failed to start session:", err);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <StepProgressIndicator
            steps={["Setup", "Customize", "Finalize"]}
            activeCount={3}
            onPressMenu={() => {}}
            helpMessagept1={
              "You're almost there!\n\nHere, you may select whether you would like to start working on your prepared plan in a session or save it for another time in your archive.\n"
            }
            helpMessagept2={
              "Starting your session will launch you into the session space. Saving will redirect you to your archive to view your stored plan."
            }
          />
        </View>

        <Spacer size="md" />

        <Spacer size="xxl" />

        <SvgStrokeText
          text="Ready to get started?"
          containerStyle={{ alignSelf: "center" }}
        />

        <Spacer size="lg" />

        {goalText && (
          <View style={styles.goalRow}>
            <Text variant="h2" style={styles.goalLabel}>
              GOAL:
            </Text>
            <Text style={styles.goalValue}>{goalText}</Text>
            <Spacer size="md" />
          </View>
        )}

        <Spacer size="xl" />
        <BasicButton
          text="Start session"
          onPress={() => setShowStartModal(true)}
          style={styles.button}
        />

        <Spacer size="md" />

        <BasicButton
          text={savingPlan ? "Saving..." : "Save plan to archive"}
          disabled={savingPlan}
          onPress={handleSavePlan}
          variant="secondary"
          style={styles.button}
        />

        {saveError && (
          <Text color="danger" style={{ textAlign: "center" }}>
            {saveError}
          </Text>
        )}

        {showConfirmationModal && (
          <AppModal
            visible={showConfirmationModal}
            onClose={() => setShowConfirmationModal(false)}
            variant="custom"
            showClose={false}
            title="Plan saved!"
            message="Your plan is now available in your archive."
            children={
              <View style={{ alignItems: "center" }}>
                <Button
                  label="Visit archive"
                  variant="brown"
                  onPress={() => {
                    const today = new Date();
                    const yyyy = today.getFullYear();
                    const mm = String(today.getMonth() + 1).padStart(2, "0"); // months are 0-based
                    const dd = String(today.getDate()).padStart(2, "0");
                    const todayStr = `${yyyy}-${mm}-${dd}`;

                    setShowConfirmationModal(false);

                    router.push(`../archive/${todayStr}/index`);
                  }}
                />
              </View>
            }
          />
        )}

        {showStartModal && (
          <AppModal
            visible={showStartModal}
            onClose={() => setShowStartModal(false)}
            variant="alert"
            showClose={false}
            title="Start session?"
            message="Do you want to start this session now?"
            confirmLabel="Yes"
            confirmVariant="brown"
            onConfirm={handleStartSession}
          />
        )}
      </View>

      <Image
        source={teddy}
        style={[styles.teddy, { width: teddySize, height: teddySize }]}
      />
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
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  prompt: {
    textAlign: "center",
    fontFamily: theme.typography.families.serif,
    fontSize: theme.typography.sizes.xl,
  },
  goalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.xs,
  },
  goalLabel: {
    color: theme.colors.accentDark,
  },
  goalValue: {
    fontFamily: theme.typography.families.regular,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text,
  },
  button: {
    alignSelf: "center",
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  settingsHeading: {
    textAlign: "center",
    fontFamily: theme.typography.families.serif,
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.text,
  },
  checkboxList: {
    gap: theme.spacing.sm,
    width: "90%",
    alignSelf: "center",
  },
  teddy: {
    position: "absolute",
    left: theme.spacing.sm,
    bottom: theme.spacing.xl,
    resizeMode: "contain",
    zIndex: -1,
  },
});
