import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { fonts } from "@/assets/themes/typography";
import SvgStrokeText from "@/components/SvgStrokeText";
import { ArrowAction } from "@/components/ui/ArrowAction";
import { Checkbox } from "@/components/ui/Checkbox";
import { PawLoader } from "@/components/ui/PawLoader";
import { Spacer } from "@/components/ui/Spacer";
import { Text } from "@/components/ui/Text";
import { Theme } from "@/design/theme";
import { useAppTheme } from "@/hooks/ThemeContext";
import { summarizeReflectionChat } from "@/lib/ai";
import { fetchSessionById, updateSession } from "@/lib/supabase";

type SessionTask = {
  id: string;
  text: string;
  minutes: number;
  status?: string | null;
  actualSeconds?: number;
  timeSeconds?: number;
};

export default function SessionSummaryScreen() {
  const { goal, tasks, status, sessionStatus, sessionId } =
    useLocalSearchParams<{
      goal?: string;
      tasks?: string;
      status?: string;
      sessionStatus?: string;
      sessionId?: string;
    }>();
  const goalText = goal ?? "";
  const [showLoader, setShowLoader] = useState(false);
  const [reflectionSummary, setReflectionSummary] = useState<string | null>(
    null
  );
  const [reflectionLoading, setReflectionLoading] = useState(false);
  const [summaryPersisted, setSummaryPersisted] = useState(false);

  console.log("[session-summary] raw tasks param", tasks);

  // 1. Get current date
  const now = new Date();

  // 2. Format as "Full day name, MM/DD/YYYY"
  const formattedDate = now.toLocaleDateString("en-US", {
    weekday: "long", // Full day name, e.g., "Tuesday"
    month: "2-digit", // "01".."12"
    day: "2-digit", // "01".."31"
    year: "numeric", // "2025"
  });

  const normalizedStatusParam = useMemo(() => {
    const raw =
      Array.isArray(sessionStatus) && sessionStatus.length > 0
        ? sessionStatus[0]
        : sessionStatus ??
          (Array.isArray(status) && status.length > 0 ? status[0] : status);
    return raw ? raw.toString().trim().toLowerCase() : null;
  }, [sessionStatus, status]);

  const sessionIdValue = useMemo(() => {
    const raw =
      Array.isArray(sessionId) && sessionId.length > 0
        ? sessionId[0]
        : sessionId;
    return raw && raw !== "null" ? raw : null;
  }, [sessionId]);

  const parsedTasks: SessionTask[] = useMemo(() => {
    if (!tasks) return [];
    try {
      const data = JSON.parse(tasks);
      if (!Array.isArray(data)) return [];
      return data
        .map((t, idx) => {
          const text = (t.text ?? t.name ?? "").toString();
          const rawSeconds =
            typeof t.actualSeconds === "number"
              ? t.actualSeconds
              : typeof t.timeSeconds === "number"
              ? t.timeSeconds
              : typeof t.time === "number"
              ? t.time
              : Number.isFinite(Number(t.minutes))
              ? Number(t.minutes) * 60
              : 0;
          const minutes = rawSeconds / 60;
          const statusValue =
            typeof t.status === "string" ? t.status.toLowerCase() : null;
          return text
            ? {
                id: t.id?.toString() ?? `task-${idx}`,
                text,
                status:
                  typeof t.status === "string" ? t.status.toLowerCase() : null,
                minutes: Number.isFinite(minutes)
                  ? Math.max(0, Math.round(minutes))
                  : 0,
                actualSeconds:
                  typeof t.actualSeconds === "number"
                    ? Math.max(0, Math.round(t.actualSeconds))
                    : undefined,
                timeSeconds: Math.max(0, Math.round(rawSeconds)),
              }
            : null;
        })
        .filter(Boolean) as SessionTask[];
    } catch {
      return [];
    }
  }, [tasks]);

  console.log("[session-summary] parsedTasks", parsedTasks);

  const totalSecondsWorked = parsedTasks.reduce((sum, t) => {
    const seconds = typeof t.actualSeconds === "number" ? t.actualSeconds : 0;
    return sum + (Number.isFinite(seconds) ? seconds : 0);
  }, 0);
  const totalMinutesAllocated = parsedTasks.reduce((sum, t) => {
    const minutes =
      typeof t.minutes === "number"
        ? t.minutes
        : typeof t.timeSeconds === "number"
        ? t.timeSeconds / 60
        : 0;
    return sum + (Number.isFinite(minutes) ? minutes : 0);
  }, 0);

  const formatMinutes = (mins: number) => {
    const hours = Math.floor(mins / 60);
    const minutes = mins % 60;
    if (hours > 0 && minutes > 0) {
      return `${hours} hr., ${minutes} min.`;
    }
    if (hours > 0) return `${hours} hr.`;
    return `${minutes} min.`;
  };
  const hours = Math.floor(totalSecondsWorked / 3600);
  const minutes = Math.floor((totalSecondsWorked % 3600) / 60);
  const allTasksSkipped =
    parsedTasks.length > 0 && parsedTasks.every((t) => t.status === "skipped");
  const sessionSkipped = normalizedStatusParam === "skipped" || allTasksSkipped;
  const sessionEnded =
    normalizedStatusParam === "ended" ||
    normalizedStatusParam === "complete" ||
    normalizedStatusParam === "completed" ||
    (!normalizedStatusParam && !sessionSkipped);
  const statusLabel =
    sessionSkipped || !sessionEnded ? "Incomplete" : "Complete";
  const { colors: palette, theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme, palette), [palette, theme]);

  useEffect(() => {
    let isMounted = true;

    const loadReflectionSummary = async () => {
      if (!sessionIdValue) return;
      try {
        setReflectionLoading(true);
        const session = await fetchSessionById(sessionIdValue);
        const reflectionChat = (session as any)?.reflection_chat;
        const summary = await summarizeReflectionChat(
          reflectionChat as unknown as any[]
        );
        if (isMounted) {
          setReflectionSummary(summary);
        }
      } catch (err) {
        console.error("[session-summary] failed to summarize reflection", err);
      } finally {
        if (isMounted) setReflectionLoading(false);
      }
    };

    loadReflectionSummary();
    return () => {
      isMounted = false;
    };
  }, [sessionIdValue]);

  useEffect(() => {
    const persistSummary = async () => {
      if (!sessionIdValue || !reflectionSummary || summaryPersisted) return;
      try {
        await updateSession(sessionIdValue, { summary: reflectionSummary });
        setSummaryPersisted(true);
      } catch (err) {
        console.error("[session-summary] failed to persist summary", err);
      }
    };

    persistSummary();
  }, [sessionIdValue, reflectionSummary, summaryPersisted]);

  const handleBackHome = () => {
    setShowLoader(true);
    setTimeout(() => router.replace("../../(tabs)/session"), 1500);
    setTimeout(() => router.push("../../"), 1500);
    setTimeout(() => setShowLoader(false), 1500);
  };

  if (showLoader) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loaderContainer}>
          <PawLoader message={"Great job! Taking you back home..."} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Spacer size="lg" />
        <View style={styles.centered}>
          <SvgStrokeText text="Session Summary" />
        </View>
        <Spacer size="lg" />

        <View style={styles.row}>
          <Text weight="bold" style={styles.label}>
            Date created:
          </Text>
          <Text weight="bold" style={styles.value}>
            {formattedDate}
          </Text>
        </View>

        {goal && (
          <View style={styles.row}>
            <Text weight="bold" style={styles.label}>
              Goal: <Text style={styles.value}>{goalText}</Text>
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
              sessionSkipped ? styles.statusValueSkipped : styles.statusValue,
            ]}
          >
            {statusLabel}
          </Text>
        </View>

        <View style={styles.row}>
          <Text weight="bold" style={styles.label}>
            Time allocated:
          </Text>
          <Text style={styles.value}>
            {Number(formatMinutes(totalMinutesAllocated)) > 0
              ? formatMinutes(totalMinutesAllocated)
              : "20 min."}
          </Text>
        </View>
        <View style={styles.row}>
          <Text weight="bold" style={styles.label}>
            Time spent:
          </Text>
          <Text style={styles.value}>
            {hours > 0 ? `${hours} hr.,` : ""}
            {minutes} min.
          </Text>
        </View>

        <Spacer size="lg" />

        <View style={{ margin: theme.spacing.xs }}>
          <Text style={styles.sectionHeading}>Breakdown:</Text>
          <Spacer size="sm" />

          <View style={styles.breakdownList}>
            {parsedTasks.map((task, index) => (
              <View key={task.id ?? index} style={styles.taskRow}>
                <Checkbox
                  checked={task.status === "completed"}
                  onChange={() => {}}
                  boxStyle={styles.checkBox}
                  containerStyle={styles.checkboxContainer}
                />
                <View style={styles.taskTextWrap}>
                  <Text style={styles.taskText}>
                    {task.text}{" "}
                    <Text style={styles.taskMinutes}>
                      (
                      {Math.max(
                        0,
                        Math.round(
                          (typeof task.actualSeconds === "number"
                            ? task.actualSeconds
                            : task.timeSeconds ?? task.minutes * 60) / 60
                        )
                      )}{" "}
                      min.)
                    </Text>
                  </Text>
                </View>
              </View>
            ))}
            {parsedTasks.length === 0 && (
              <Text style={styles.value}>No tasks recorded.</Text>
            )}
          </View>
        </View>

        <Spacer size="lg" />

        {reflectionSummary && (
          <View style={{ margin: theme.spacing.xs }}>
            <Text style={styles.sectionHeading}>Reflection summary:</Text>
            <Spacer size="sm" />
            <Text style={styles.value}>{reflectionSummary}</Text>
          </View>
        )}

        {reflectionLoading && !reflectionSummary && (
          <>
            <View style={{ margin: theme.spacing.xs }}>
              <Text style={styles.value}>Summarizing your reflection...</Text>
            </View>
            <Spacer size="lg" />
          </>
        )}

        <Spacer size="xl" />
      </ScrollView>
      <ArrowAction
        label="Return to home"
        style={{ width: "100%" }}
        onPress={handleBackHome}
      />
    </SafeAreaView>
  );
}

function createStyles(
  theme: Theme,
  palette: typeof import("@/assets/themes/colors").colors.light
) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: palette.background,
    },
    container: {
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.xl,
    },
    centered: {
      alignItems: "center",
    },
    title: {
      textAlign: "center",
      fontFamily: theme.typography.families.handwritten,
      fontSize: theme.typography.sizes.xl,
      color: theme.colors.header1,
    },
    loaderContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    row: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      margin: theme.spacing.xs,
    },
    label: {
      fontSize: theme.typography.sizes.md,
      color: theme.colors.header1,
      marginRight: 5,
    },
    value: {
      fontFamily: theme.typography.families.regular,
      fontSize: theme.typography.sizes.md,
      color: theme.colors.header1,
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
      color: theme.colors.header1,
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
      alignItems: "flex-end",
    },
    taskText: {
      fontFamily: theme.typography.families.regular,
      fontSize: theme.typography.sizes.md,
      color: theme.colors.header1,
      marginRight: theme.spacing.sm,
      paddingLeft: theme.spacing.sm,
    },
    taskMinutes: {
      fontFamily: theme.typography.families.regular,
      fontSize: theme.typography.sizes.md,
      color: theme.colors.header1,
    },
    faded: {
      opacity: 0.55,
    },
    summaryRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.md,
    },
    summaryItem: {
      flex: 1,
      backgroundColor: palette.background,
      borderRadius: theme.radii.lg,
      padding: theme.spacing.md,
      ...theme.shadow.soft,
    },
    checkboxContainer: {
      paddingVertical: 0,
      paddingHorizontal: 0,
    },
    checkBox: {
      marginTop: theme.spacing.xs / 2,
    },
    arrowInline: {
      position: "relative",
      right: undefined,
      bottom: undefined,
      marginTop: theme.spacing.lg,
      alignSelf: "flex-start",
    },
  });
}
