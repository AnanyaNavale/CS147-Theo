import { Checkbox, Spacer } from "@/components";
import { AppModal } from "@/components/custom/AppModal";
import { BasicButton } from "@/components/custom/BasicButton";
import SvgStrokeText from "@/components/custom/SvgStrokeText";
import { Text } from "@/components/custom/Text";
import { Theme } from "@/design/theme";
import { fonts } from "@/design/typography";
import { useAppTheme } from "@/hooks/ThemeContext";
import {
  fetchSessionById,
  fetchTasksForSession,
  updateSession,
} from "@/lib/supabase";
import { Task, WorkSession } from "@/types/database.types";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

export default function SingleSessionScreen() {
  const router = useRouter();

  const { session: sessionId, date } = useLocalSearchParams<{
    session: string;
    date: string;
  }>();

  // TODO: Pass all these values in:
  // const hasGoal = true;
  // const isSession = true;
  // const dateCreated = "Monday, 12/01/2025";
  // const title = "Prep for CS 147 Midterm";
  // const status = "Incomplete";

  const [sessionData, setSessionData] = useState<WorkSession | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showStartConfirm, setShowStartConfirm] = useState(false);
  const [showResumeConfirm, setShowResumeConfirm] = useState(false);
  const [starting, setStarting] = useState(false);
  const [resuming, setResuming] = useState(false);
  const { colors: palette, theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme, palette), [palette, theme]);

  const [year, month, day] = date.split("-").map(Number);
  const dateObj = new Date(year, month - 1, day); // month is 0-based

  const formattedDate = dateObj.toLocaleDateString("en-US", {
    weekday: "long", // full day name
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });

  useEffect(() => {
    if (!sessionId) return;

    const loadSessionAndTasks = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch session
        const session = await fetchSessionById(sessionId);
        setSessionData(session);

        if (session) {
          // Fetch tasks for this session
          const sessionTasks = await fetchTasksForSession(sessionId);
          setTasks(sessionTasks);
        } else {
          setTasks([]);
        }
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Failed to load session";
        setError(msg);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadSessionAndTasks();
  }, [sessionId]);

  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error}</Text>;
  if (!sessionData) return <Text>Session not found</Text>;

  const headerTitle =
    sessionData?.status === "planned" ? "Plan Summary" : "Session Summary";

  function formatTimeFromSeconds(totalSeconds: number): string {
    const totalMinutes = Math.max(0, Math.round(totalSeconds / 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0 && minutes > 0) {
      return `${hours} hr., ${minutes} min.`;
    } else if (hours > 0) {
      return `${hours} hr.`;
    } else {
      return `${minutes} min.`;
    }
  }

  const isPlanned = sessionData.status === "planned";
  const spentSeconds =
    typeof sessionData.time_completed === "number"
      ? Math.max(0, sessionData.time_completed)
      : null;
  const plannedMinutes = Math.max(
    0,
    Math.round(Number(sessionData.total_time || 0))
  );
  const plannedSeconds = plannedMinutes * 60;
  const displaySeconds = isPlanned
    ? plannedSeconds
    : spentSeconds ?? plannedSeconds;

  const formatMinutes = (mins: number) => {
    const hours = Math.floor(mins / 60);
    const minutes = mins % 60;
    if (hours > 0 && minutes > 0) {
      return `${hours} hr., ${minutes} min.`;
    }
    if (hours > 0) return `${hours} hr.`;
    return `${minutes} min.`;
  };

  const handleStartSession = async () => {
    if (!sessionData) return;
    setStarting(true);
    try {
      if (sessionData.status === "planned") {
        await updateSession(sessionData.id, { status: "incomplete" });
      }

      const mappedTasks = tasks.map((t) => ({
        id: String(t.id),
        text: t.task_name,
        minutes: Number.isFinite(Number(t.time_allotted))
          ? Number(t.time_allotted)
          : t.time_completed
          ? Math.round(Number(t.time_completed) / 60)
          : 0,
        completed: Boolean(t.is_completed),
      }));

      router.push({
        pathname: "/(tabs)/session/in-session",
        params: {
          goal: sessionData.goal ?? "",
          tasks: JSON.stringify(mappedTasks),
          sessionId: sessionData.id,
        },
      });
    } catch (err) {
      console.error("Failed to start planned session", err);
      setError("Failed to start session. Please try again.");
    } finally {
      setStarting(false);
      setShowStartConfirm(false);
    }
  };

  const handleResumeSession = async () => {
    if (!sessionData) return;
    setResuming(true);
    try {
      const mappedTasks = tasks.map((t) => ({
        id: String(t.id),
        text: t.task_name,
        minutes: Number.isFinite(Number(t.time_allotted))
          ? Number(t.time_allotted)
          : t.time_completed
          ? Math.round(Number(t.time_completed) / 60)
          : 0,
        completed: Boolean(t.is_completed),
      }));

      router.push({
        pathname: "/(tabs)/session/in-session",
        params: {
          goal: sessionData.goal ?? "",
          tasks: JSON.stringify(mappedTasks),
          sessionId: sessionData.id,
        },
      });
    } catch (err) {
      console.error("Failed to resume session", err);
      setError("Failed to resume session. Please try again.");
    } finally {
      setResuming(false);
      setShowResumeConfirm(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Feather
            name={"arrow-left"}
            size={36}
            color={palette.iconsStandalone}
          />
        </TouchableOpacity>
        <View style={styles.header}>
          <SvgStrokeText text={headerTitle} />
        </View>
      </View>
      <View style={styles.shadow} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Spacer></Spacer>
        <View style={styles.row}>
          <Text weight="bold" style={styles.label}>
            {sessionData.status === "planned"
              ? "Planned for:"
              : "Date created:"}
          </Text>
          <Text weight="bold" style={styles.value}>
            {formattedDate}
          </Text>
        </View>

        {sessionData.goal && (
          <View style={styles.row}>
            <Text weight="bold" style={styles.label}>
              Goal: <Text style={styles.value}>{sessionData.goal}</Text>
            </Text>
          </View>
        )}

        <View style={styles.row}>
          <Text weight="bold" style={styles.label}>
            Status:
          </Text>
          <Text
            style={[
              styles.value,
              { fontFamily: fonts.typeface.bodyBold },
              sessionData.status === "complete"
                ? { color: palette.secondary } // or your theme color for complete
                : { color: palette.primary },
            ]}
          >
            {sessionData.status.charAt(0).toUpperCase() +
              sessionData.status.slice(1)}
          </Text>
        </View>

        {sessionData.status !== "planned" && (
          <View style={styles.row}>
            <Text weight="bold" style={styles.label}>
              Time allocated:
            </Text>
            <Text style={styles.value}>{formatMinutes(plannedMinutes)}</Text>
          </View>
        )}

        <View style={styles.row}>
          <Text weight="bold" style={styles.label}>
            {sessionData.status === "planned" ? "Time planned:" : "Time spent:"}
          </Text>
          <Text style={styles.value}>
            {formatTimeFromSeconds(displaySeconds)}
          </Text>
        </View>

        <Spacer size="lg" />

        <View style={{ margin: theme.spacing.xs, paddingHorizontal: 20 }}>
          <Text style={styles.sectionHeading}>Breakdown:</Text>

          <Spacer size="sm" />

          <View style={styles.breakdownList}>
            {tasks.length > 0 ? (
              tasks.map((task, index) => (
                <View key={task.id ?? index} style={styles.taskRow}>
                  <Checkbox
                    checked={task.is_completed}
                    onChange={() => {}}
                    boxStyle={styles.checkBox}
                    containerStyle={styles.checkboxContainer}
                  />
                  <View style={styles.taskTextWrap}>
                    <Text style={styles.taskText}>
                      {task.task_name}{" "}
                      <Text style={styles.taskMinutes}>
                        (
                        {task.is_completed
                          ? Math.max(
                              0,
                              Math.round(
                                typeof task.time_completed === "number"
                                  ? task.time_completed / 60
                                  : Number(task.time_allotted ?? 0)
                              )
                            )
                          : Math.max(
                              0,
                              Math.round(Number(task.time_allotted ?? 0))
                            )}{" "}
                        min.)
                      </Text>
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.value}>No tasks recorded.</Text>
            )}
          </View>
        </View>

        {sessionData.summary && (
          <>
            <Spacer size="lg" />
            <View style={{ margin: theme.spacing.xs, paddingHorizontal: 20 }}>
              <Text style={styles.sectionHeading}>Reflection summary:</Text>
              <Spacer size="sm" />
              <Text style={styles.value}>{sessionData.summary}</Text>
            </View>
          </>
        )}

        <AppModal
          visible={showStartConfirm}
          onClose={() => setShowStartConfirm(false)}
          title="Start session?"
          message="Begin this planned session now?"
          confirmLabel="Start"
          cancelLabel="Cancel"
          confirmVariant="brown"
          cancelVariant="ghost"
          onConfirm={handleStartSession}
        />

        <AppModal
          visible={showResumeConfirm}
          onClose={() => setShowResumeConfirm(false)}
          title="Resume session?"
          message="Resume this incomplete session from where you left off?"
          confirmLabel="Resume"
          cancelLabel="Cancel"
          confirmVariant="brown"
          cancelVariant="ghost"
          onConfirm={handleResumeSession}
        />

        {/* <View style={styles.topContent}>
          <View style={styles.subsection}>
            <Text style={styles.subheading}>Date Created:</Text>
            <Text style={styles.sectionResponse}>{dateCreated}</Text>
          </View>

          <View style={styles.subsection}>
            {hasGoal ? (
              <Text style={styles.subheading}>Goal:</Text>
            ) : (
              <Text style={styles.subheading}>Title:</Text>
            )}
            <Text style={styles.sectionResponse}>{title}</Text>
          </View>

          <View style={styles.subsection}>
            {isSession ? (
              <View style={{ flexDirection: 'row' }}>
                <Text style={styles.subheading}>Status:</Text>
                <Text
                  style={[
                    styles.sectionResponse,
                    {
                      color: palette.header2,
                      fontFamily: fonts.typeface.bodyBold,
                    },
                  ]}
                >
                  {status}
                </Text>
              </View>
            ) : null}
          </View>
        </View> */}
      </ScrollView>

      {sessionData.status === "planned" && (
        <View style={styles.bottomAction}>
          <BasicButton
            text={starting ? "Starting..." : "Begin this session"}
            onPress={() => setShowStartConfirm(true)}
            disabled={starting}
            style={{ width: "100%" }}
          />
        </View>
      )}

      {sessionData.status === "incomplete" && (
        <View style={styles.bottomAction}>
          <BasicButton
            text={resuming ? "Resuming..." : "Resume session"}
            onPress={() => setShowResumeConfirm(true)}
            disabled={resuming}
            style={{ width: "100%" }}
          />
        </View>
      )}
    </View>
  );
}

function createStyles(
  theme: Theme,
  palette: typeof import("@/design/colors").colors.light
) {
  return StyleSheet.create({
    container: {
      flex: 1,
      borderColor: "red",
      backgroundColor: palette.background,
    },
    headerContainer: {
      height: 130,
      flexDirection: "row",
      alignItems: "center",
      position: "relative",
      justifyContent: "flex-end",
      backgroundColor: palette.background,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      zIndex: 2,
    },
    backButton: {
      position: "absolute",
      left: 16,
      top: 80,
      zIndex: 2,
      backgroundColor: palette.background,
    },
    header: {
      position: "absolute",
      top: 83,
      left: 0,
      right: 0,
      alignItems: "center",
      zIndex: 1,
      width: "100%",
      backgroundColor: palette.background,
    },
    shadow: {
      height: 4,
      backgroundColor: "transparent",
      shadowColor: palette.shadowPrimary ?? palette.overlay,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 5,
      marginBottom: 5,
    },
    row: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      margin: theme.spacing.xs,
      marginHorizontal: theme.spacing.lg,
    },
    label: {
      fontSize: theme.typography.sizes.md,
      color: palette.header1,
      marginRight: 5,
    },
    value: {
      fontFamily: theme.typography.families.regular,
      fontSize: theme.typography.sizes.md,
      color: palette.header1,
    },
    scrollContent: {
      paddingBottom: theme.spacing.xxl * 2,
    },
    statusValue: {
      color: palette.secondary,
      fontFamily: fonts.typeface.bodyBold,
    },
    statusValueSkipped: {
      color: palette.primary,
      fontFamily: fonts.typeface.bodyBold,
    },
    sectionHeading: {
      fontSize: theme.typography.sizes.lg,
      color: palette.header1,
    },
    breakdownList: {
      gap: theme.spacing.sm,
    },
    taskRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: theme.spacing.sm,
      marginLeft: theme.spacing.md,
    },
    taskTextWrap: {
      flex: 1,
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "flex-end",
    },
    taskText: {
      fontFamily: theme.typography.families.regular,
      fontSize: theme.typography.sizes.md,
      color: palette.header1,
      marginRight: theme.spacing.sm,
    },
    taskMinutes: {
      fontFamily: theme.typography.families.regular,
      fontSize: theme.typography.sizes.md,
      color: palette.header2,
    },
    checkboxContainer: {
      paddingVertical: 0,
      paddingHorizontal: 0,
    },
    checkBox: {
      marginTop: theme.spacing.xs / 2,
    },
    bottomAction: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      paddingBottom: theme.spacing.lg,
      backgroundColor: palette.background,
      shadowColor: palette.shadowPrimary ?? palette.overlay,
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
      elevation: 8,
      justifyContent: "center",
      alignItems: "center",
    },
  });
}
