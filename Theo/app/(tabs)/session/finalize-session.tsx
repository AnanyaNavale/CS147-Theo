import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import { Image, StyleSheet, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppModal, Button } from "@/components";
import { BasicButton } from "@/components/custom/BasicButton";
import { Spacer } from "@/components/custom/Spacer";
import { StepProgressIndicator } from "@/components/custom/StepProgressIndicator";
import SvgStrokeText from "@/components/custom/SvgStrokeText";
import { Text } from "@/components/custom/Text";
import { colors } from "@/design/colors";
import { Theme } from "@/design/theme";
import { fonts } from "@/design/typography";
import { useAppTheme } from "@/hooks/ThemeContext";
import {
  createPlan,
  createSession,
  createTask,
  CreateTaskPayload,
  fetchTasksForSession,
  replaceTasksForSession,
  updateSession,
} from "@/lib/supabase";
import { useSupabase } from "@/providers/SupabaseProvider";
import { Feather } from "@expo/vector-icons";
import { Calendar } from "react-native-calendars";

const teddy = require("@/assets/theo/waving.png");

type Task = {
  id: string;
  minutes: number;
  text: string;
  completed?: boolean;
};

const formatLocalDate = (date: Date) => {
  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffset).toISOString().split("T")[0];
};

export default function FinalizeSessionScreen() {
  const { goal, tasks, sessionId } = useLocalSearchParams<{
    goal?: string;
    tasks?: string;
    sessionId?: string;
  }>();
  const existingSessionId = Array.isArray(sessionId) ? sessionId[0] : sessionId;
  const { session } = useSupabase();
  const goalText = goal ?? "";
  const { width } = useWindowDimensions();
  const isCompact = width < 360;
  const teddySize = isCompact ? 180 : 220;
  const todayLocal = formatLocalDate(new Date());

  const [savingPlan, setSavingPlan] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [startError, setStartError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showStartModal, setShowStartModal] = useState(false);
  const [showPlanDateModal, setShowPlanDateModal] = useState(false);
  const [selectedPlanDate, setSelectedPlanDate] = useState(todayLocal);
  const { colors: palette, theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme, palette), [palette, theme]);

  const parsedTasks: Task[] = useMemo(() => {
    if (!tasks) return [];
    try {
      const data = JSON.parse(tasks);
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }, [tasks]);

  const totalMinutes = useMemo(
    () => parsedTasks.reduce((sum, task) => sum + task.minutes, 0),
    [parsedTasks]
  );
  const taskCount = parsedTasks.length;
  const sessionSummary = useMemo(() => {
    const lines = [];
    if (goalText) lines.push(`Goal: ${goalText}`);
    if (taskCount > 0) lines.push(`Tasks: ${taskCount}`);
    if (totalMinutes > 0) lines.push(`Total time: ${totalMinutes} min`);
    return lines.join("\n");
  }, [goalText, taskCount, totalMinutes]);

  const handleSavePlan = async (planDate?: string) => {
    if (savingPlan) return;
    setSaveError(null);

    if (!session?.user) {
      setSaveError("Please sign in to save plans to your archive.");
      return;
    }

    setSavingPlan(true);
    try {
      const hasGoal = Boolean(goal && goal.trim());
      const hasTasks = parsedTasks.length > 0;
      const total_time = parsedTasks.reduce(
        (sum, task) => sum + task.minutes,
        0
      );
      const title = hasGoal ? goal! : "Plan";

      const created_at = planDate
        ? new Date(`${planDate}T00:00:00`).toISOString()
        : undefined;

      if (existingSessionId) {
        await updateSession(existingSessionId, {
          title,
          has_goal: hasGoal,
          goal: goal ?? null,
          has_tasks: hasTasks,
          total_time,
          status: "planned",
          completed_at: null,
        });

        await replaceTasksForSession(existingSessionId, parsedTasks);
      } else {
        const newPlan = await createPlan(
          session.user.id,
          hasGoal,
          hasTasks,
          total_time,
          title,
          goal ?? null,
          created_at
        );

        if (hasTasks) {
          for (let i = 0; i < parsedTasks.length; i++) {
            const t = parsedTasks[i];
            const payload: CreateTaskPayload = {
              session_id: newPlan.id,
              task_name: t.text,
              order_index: i + 1,
              time_allotted: t.minutes,
              is_completed: false,
            };

            await createTask(payload);
          }
        }
      }

      setShowSuccessModal(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save plan.";
      setSaveError(msg);
      console.error("Error saving plan:", err);
    } finally {
      setSavingPlan(false);
    }
  };

  const totalTime = parsedTasks.reduce((sum, t) => sum + t.minutes, 0);

  const handleStartSession = async () => {
    if (!session?.user) {
      setStartError("Please sign in to start a session.");
      return;
    }

    try {
      const hasGoal = Boolean(goalText && goalText.trim());
      const hasTasks = parsedTasks.length > 0;
      const title = hasGoal ? goalText : "Session";

      if (existingSessionId) {
        await updateSession(existingSessionId, {
          title,
          has_goal: hasGoal,
          goal: goalText || null,
          has_tasks: hasTasks,
          total_time: totalTime,
          status: "active",
          completed_at: null,
        });

        await replaceTasksForSession(existingSessionId, parsedTasks);

        const refreshedTasks = await fetchTasksForSession(existingSessionId);
        const tasksForClient = refreshedTasks.map((t) => ({
          id: String(t.id),
          text: t.task_name,
          minutes: Number(t.time_allotted ?? t.time_completed) || 0,
          completed: Boolean(t.is_completed),
        }));

        router.push({
          pathname: "./in-session",
          params: {
            goal: goalText,
            tasks: JSON.stringify(tasksForClient),
            sessionId: existingSessionId,
          },
        });
        return;
      }

      const newSession = await createSession(
        session.user.id,
        title,
        hasGoal,
        goalText || null,
        hasTasks,
        totalTime
      );

      const newSessionId = newSession.id;
      const tasksForClient: Task[] = [];
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

          const created = await createTask(payload);
          tasksForClient.push({
            id: String(created.id),
            text: created.task_name,
            minutes: Number(created.time_allotted ?? 0),
            completed: Boolean(created.is_completed),
          });
        }
      }

      router.push({
        pathname: "./in-session",
        params: {
          goal: goalText,
          tasks: JSON.stringify(
            tasksForClient.length ? tasksForClient : parsedTasks
          ),
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
          textStyle={{ alignSelf: "center" }}
        />

        <Spacer size="lg" />

        {goalText && (
          <View style={styles.goalRow}>
            <SvgStrokeText
              text="Goal:"
              stroke={palette.header2}
              textStyle={{ color: palette.header2 }}
            />
            <Text style={styles.goalValue}>{goalText}</Text>
            <Spacer size="md" />
          </View>
        )}

        <Spacer size="xl" />
        <BasicButton
          text="Start your session"
          onPress={() => setShowStartModal(true)}
          style={styles.button}
        />

        {startError && (
          <Text color="tertiary" style={{ textAlign: "center" }}>
            {startError}
          </Text>
        )}

        <Spacer size="md" />

        <BasicButton
          text={savingPlan ? "Saving..." : "Save plan to archive"}
          disabled={savingPlan}
          onPress={() => setShowPlanDateModal(true)}
          variant="secondary"
          style={styles.button}
        />

        {saveError && (
          <Text color="tertiary" style={{ textAlign: "center" }}>
            {saveError}
          </Text>
        )}

        {showPlanDateModal && (
          <AppModal
            visible={showPlanDateModal}
            onClose={() => setShowPlanDateModal(false)}
            variant="bottom-sheet"
            title="Pick a date"
            height={420}
          >
            <Calendar
              current={selectedPlanDate}
              renderHeader={(date) => {
                const month = date.toString("MMMM yyyy");
                return (
                  <View
                    style={{
                      backgroundColor: palette.primary,
                      paddingVertical: 4,
                      paddingTop: 7,
                      paddingHorizontal: 16,
                      borderRadius: theme.radii.md,
                      justifyContent: "center",
                      alignItems: "center",
                      alignSelf: "center",
                    }}
                  >
                    <SvgStrokeText
                      text={month}
                      stroke={palette.month}
                      strokeWidth={0.5}
                      textStyle={{ fontSize: 20, color: palette.month }}
                    />
                  </View>
                );
              }}
              style={styles.planCalendar}
              renderArrow={(direction) => (
                <Feather
                  name={direction === "left" ? "arrow-left" : "arrow-right"}
                  size={24}
                  color={palette.iconsStandalone}
                />
              )}
              minDate={todayLocal}
              markedDates={{
                [selectedPlanDate]: {
                  selected: true,
                  selectedColor: palette.header2,
                  selectedTextColor: palette.background,
                },
              }}
              onDayPress={(day) => setSelectedPlanDate(day.dateString)}
              theme={{
                textDayFontFamily: fonts.typeface.body,
                textDayHeaderFontFamily: fonts.typeface.header,
                textDayHeaderFontSize: 18,
                textDisabledColor: palette.inactive,
                backgroundColor: palette.background,
                calendarBackground: palette.background,
                dayTextColor: palette.body,
                todayTextColor: palette.body,
                monthTextColor: palette.month,
                textSectionTitleColor: palette.header1,
                arrowColor: palette.iconsStandalone,
              }}
            />
            <Spacer size="md" />
            <Button
              label={savingPlan ? "Saving..." : "Save plan"}
              variant="brown"
              onPress={() => {
                setShowPlanDateModal(false);
                handleSavePlan(selectedPlanDate);
              }}
              disabled={savingPlan}
            />
            <Spacer size="md" />
          </AppModal>
        )}

        {showSuccessModal && (
          <AppModal
            visible={showSuccessModal}
            onClose={() => setShowSuccessModal(false)}
            variant="custom"
            showClose={false}
            title="Plan saved!"
            message="Your plan is now available in your archive."
          >
            <View style={{ alignItems: "center" }}>
              <Button
                label="Visit archive"
                variant="brown"
                onPress={() => {
                  setShowSuccessModal(false);
                  router.push(`../archive`);
                }}
              />
            </View>
          </AppModal>
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

function createStyles(theme: Theme, palette: typeof colors.light) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: palette.background,
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
      color: palette.body,
    },
    goalRow: {
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: theme.spacing.xs,
      textAlign: "center",
    },
    goalLabel: {
      color: palette.header2,
    },
    goalValue: {
      fontFamily: theme.typography.families.regular,
      fontSize: theme.typography.sizes.md,
      color: palette.header1,
      alignSelf: "center",
      textAlign: "center",
    },
    button: {
      alignSelf: "center",
    },
    planCalendar: {
      width: "100%",
    },
    divider: {
      height: 1,
      backgroundColor: palette.border,
      marginHorizontal: theme.spacing.md,
      marginTop: theme.spacing.md,
    },
    settingsHeading: {
      textAlign: "center",
      fontFamily: theme.typography.families.serif,
      fontSize: theme.typography.sizes.lg,
      color: palette.header1,
    },
    teddy: {
      position: "absolute",
      left: theme.spacing.sm,
      bottom: theme.spacing.xl,
      resizeMode: "contain",
      zIndex: -1,
    },
  });
}
