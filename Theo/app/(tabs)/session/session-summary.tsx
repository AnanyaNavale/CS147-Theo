import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
};

export default function SessionSummaryScreen() {
  const { goal, tasks } = useLocalSearchParams<{
    goal?: string;
    tasks?: string;
  }>();
  const goalText = goal ?? "";
  const [showLoader, setShowLoader] = useState(false);

  const parsedTasks: SessionTask[] = useMemo(() => {
    if (!tasks) return [];
    try {
      const data = JSON.parse(tasks);
      if (!Array.isArray(data)) return [];
      return data
        .map((t, idx) => {
          const text = (t.text ?? t.name ?? "").toString();
          const minutes = Number(
            t.minutes ?? (t.time != null ? t.time / 60 : 0)
          );
          return text
            ? {
                id: t.id?.toString() ?? `task-${idx}`,
                text,
                minutes: Number.isFinite(minutes)
                  ? Math.max(0, Math.round(minutes))
                  : 0,
              }
            : null;
        })
        .filter(Boolean) as SessionTask[];
    } catch {
      return [];
    }
  }, [tasks]);

  const totalMinutes = parsedTasks.reduce(
    (sum, t) => sum + (t.minutes || 0),
    0
  );
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

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
          <SvgStrokeText
            text="Session summary"
            stroke={theme.colors.accentDark}
            textStyle={[styles.title, { color: theme.colors.accentDark }]}
          ></SvgStrokeText>
        </View>
        <Spacer size="lg" />

        <View style={styles.row}>
          <Text style={styles.label}>Goal:</Text>
          <Text style={styles.value}>{goalText}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Status:</Text>
          <Text style={[styles.value, styles.statusValue]}>Complete</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Time spent:</Text>
          <Text style={styles.value}>
            {hours > 0 ? `${hours} hr${hours > 1 ? "s" : ""}, ` : ""}
            {minutes} min
          </Text>
        </View>

        <Spacer size="lg" />

        <Text style={styles.sectionHeading}>Breakdown:</Text>

        <Spacer size="sm" />

        <View style={styles.breakdownList}>
          {parsedTasks.map((task, index) => (
            <View key={task.id ?? index} style={styles.taskRow}>
              <Checkbox
                checked
                onChange={() => {}}
                boxStyle={styles.checkBox}
                containerStyle={styles.checkboxContainer}
              />
              <View style={styles.taskTextWrap}>
                <Text style={styles.taskText}>
                  {index + 1}. {task.text}
                </Text>
                <Text style={styles.taskMinutes}>({task.minutes} min.)</Text>
              </View>
            </View>
          ))}
          {parsedTasks.length === 0 && (
            <Text style={styles.value}>No tasks recorded.</Text>
          )}
        </View>

        <Spacer size="lg" />

        <Text style={styles.sectionHeading}>Reflections:</Text>
        <Spacer size="sm" />
        <Text style={styles.value}>AI Summary:</Text>

        <Spacer size="xl" />
      </ScrollView>
      <ArrowAction label="Back home" onPress={handleBackHome} />
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
    marginBottom: theme.spacing.xs,
  },
  label: {
    fontFamily: theme.typography.families.handwritten,
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.text,
  },
  value: {
    fontFamily: theme.typography.families.regular,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text,
  },
  statusValue: {
    color: theme.colors.accent,
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
  },
  taskTextWrap: {
    flex: 1,
  },
  taskText: {
    fontFamily: theme.typography.families.regular,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text,
  },
  taskMinutes: {
    fontFamily: theme.typography.families.regular,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text,
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
