import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "@/assets/themes/colors";
import { fonts } from "@/assets/themes/typography";
import SvgStrokeText from "@/components/SvgStrokeText";
import { ArrowAction } from "@/components/ui/ArrowAction";
import { Checkbox } from "@/components/ui/Checkbox";
import { PawLoader } from "@/components/ui/PawLoader";
import { Spacer } from "@/components/ui/Spacer";
import { Text } from "@/components/ui/Text";
import { theme } from "@/design/theme";

type SessionTask = {
  id: string;
  text: string;
  minutes: number;
  status?: string | null;
  actualSeconds?: number;
  timeSeconds?: number;
};

export default function SessionSummaryScreen() {
  const { goal, tasks, status, sessionStatus } = useLocalSearchParams<{
    goal?: string;
    tasks?: string;
    status?: string;
    sessionStatus?: string;
  }>();
  const goalText = goal ?? "";
  const [showLoader, setShowLoader] = useState(false);

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

  const totalSecondsWorked = parsedTasks.reduce((sum, t) => {
    if (t.status !== "completed") return sum;
    const seconds =
      typeof t.actualSeconds === "number"
        ? t.actualSeconds
        : t.timeSeconds ?? t.minutes * 60;
    return sum + (Number.isFinite(seconds) ? seconds : 0);
  }, 0);
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
          <SvgStrokeText text="Session summary" />
        </View>
        <Spacer size="lg" />

        <View style={styles.row}>
          <Text style={styles.label}>Date created:</Text>
          <Text style={styles.value}>{formattedDate}</Text>
        </View>

        {goal && (
          <View style={styles.row}>
            <Text style={styles.label}>Goal:</Text>
            <Text style={styles.value}>{goalText}</Text>
          </View>
        )}

        <View style={styles.row}>
          <Text style={styles.label}>Status:</Text>
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
          <Text style={styles.label}>Time spent:</Text>
          <Text style={styles.value}>
            {hours > 0 ? `${hours} hr${hours > 1 ? "s" : ""}, ` : ""}
            {minutes} min
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
                    {index + 1}. {task.text}{" "}
                    {/* <Text style={styles.taskMinutes}>
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
                    </Text> */}
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

        <Spacer size="xl" />
      </ScrollView>
      <ArrowAction label="Return to home" onPress={handleBackHome} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
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
    color: theme.colors.text,
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
    fontFamily: theme.typography.families.handwritten,
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.text,
    marginRight: 5,
  },
  value: {
    fontFamily: theme.typography.families.regular,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text,
  },
  statusValue: {
    color: colors.light.secondary,
    fontFamily: fonts.typeface.bodyBold,
  },
  statusValueSkipped: {
    color: colors.light.primary,
    fontFamily: fonts.typeface.bodyBold,
  },
  sectionHeading: {
    fontFamily: theme.typography.families.handwritten,
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.text,
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
    //flexWrap: "wrap",
    alignItems: "flex-end",
  },
  taskText: {
    fontFamily: theme.typography.families.regular,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text,
    marginRight: theme.spacing.sm,
    paddingLeft: theme.spacing.sm,
  },
  taskMinutes: {
    fontFamily: theme.typography.families.regular,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.accentDark,
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
