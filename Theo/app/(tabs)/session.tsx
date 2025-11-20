import React, { useEffect, useRef, useState } from "react";
import { View, Image, StyleSheet, Pressable, TextInput } from "react-native";
import { router } from "expo-router";

import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { Spacer } from "@/components/ui/Spacer";
import { AppModal } from "@/components/ui/AppModal";
import { Timer } from "@/components/ui/Timer";
import { Menu } from "@/components/ui/Menu";
import { Icon } from "@/components/ui/Icon";
import { Checkbox } from "@/components/ui/Checkbox";

import { theme } from "@/design/theme";
import {
  getSessionGoal,
  subscribeSessionGoal,
} from "@/state/sessionGoal";

interface Task {
  name: string;
  time: number; // seconds
}

export default function SessionScreen() {
  const [goal, setGoal] = useState(getSessionGoal() || "Complete Chapter 3 notes");
  const [tasks, setTasks] = useState<Task[]>([
    { name: "Read pages 20-30", time: 10 },
    { name: "Write summary", time: 15 },
    { name: "Create flashcards", time: 8 * 60 },
  ]);

  const hasTasks = tasks.length > 0;
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const currentTask = hasTasks ? tasks[currentTaskIndex] : null;

  const [secondsLeft, setSecondsLeft] = useState(
    currentTask ? currentTask.time : 0
  );
  const [savedTime, setSavedTime] = useState(
    currentTask ? currentTask.time : 0
  );

  const [isRunning, setIsRunning] = useState(hasTasks);
  const [isBreak, setIsBreak] = useState(false);
  const [breakAfterTaskComplete, setBreakAfterTaskComplete] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [theoImage, setTheoImage] = useState(
    require("../../assets/theo/working.png")
  );
  useEffect(() => {
    const unsubscribe = subscribeSessionGoal((updated) => {
      setGoal(updated || "Complete Chapter 3 notes");
    });
    return unsubscribe;
  }, []);
  const [showStopModal, setShowStopModal] = useState(false);
  const [showAddTimeModal, setShowAddTimeModal] = useState(false);
  const [newTime, setNewTime] = useState("");
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [editedTaskName, setEditedTaskName] = useState("");

  useEffect(() => {
    if (isRunning && !isBreak && currentTask) {
      setTheoImage(require("../../assets/theo/working.png"));

      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, currentTaskIndex, isBreak, currentTask]);

  useEffect(() => {
    if (!isBreak && currentTask && secondsLeft <= 0) {
      if (intervalRef.current) clearInterval(intervalRef.current);

      setIsRunning(false);
      setSavedTime(0);

      setIsBreak(true);
      setTheoImage(require("../../assets/theo/break.png"));
      setBreakAfterTaskComplete(true);
    }
  }, [secondsLeft, isBreak, currentTask]);

  const handleNextTask = () => {
    if (currentTaskIndex < tasks.length - 1) {
      const nextIndex = currentTaskIndex + 1;
      setCurrentTaskIndex(nextIndex);

      const next = tasks[nextIndex];
      setSecondsLeft(next.time);
      setSavedTime(next.time);

      setIsRunning(true);
      setIsBreak(false);
      setTheoImage(require("../../assets/theo/working.png"));
      return;
    }

    console.log("Session complete");
  };

  const handlePlayPause = () => {
    if (!currentTask) return;
    if (isBreak) {
      handleEndBreak();
      return;
    }
    // If currently running, pressing pause should start a break.
    if (isRunning) {
      handleStartBreak();
      return;
    }
    setIsRunning(true);
  };

  const handleStartBreak = () => {
    setSavedTime(secondsLeft);
    setIsBreak(true);
    setIsRunning(false);
    setTheoImage(require("../../assets/theo/break.png"));
  };

  const handleEndBreak = () => {
    setIsBreak(false);

    if (breakAfterTaskComplete) {
      setBreakAfterTaskComplete(false);
      handleNextTask();
    } else {
      setSecondsLeft(savedTime);
      setIsRunning(true);
      setTheoImage(require("../../assets/theo/working.png"));
    }
  };

  const confirmStop = () => {
    setShowStopModal(false);
    setIsRunning(false);

    const reset = currentTask?.time ?? 0;
    setSecondsLeft(reset);
    setSavedTime(reset);

    setTheoImage(require("../../assets/theo/working.png"));
    setIsBreak(false);

    console.log("Session ended");
  };

  const handleApplyTime = () => {
    const extraMinutes = Number(newTime);
    if (!extraMinutes || extraMinutes <= 0) return;

    const extraSeconds = extraMinutes * 60;
    const updated = secondsLeft + extraSeconds;

    setSecondsLeft(updated);
    setSavedTime(updated);
    setShowAddTimeModal(false);
  };

  const handleSaveTaskEdit = () => {
    if (!editedTaskName.trim()) return;

    setTasks((prev) => {
      const copy = [...prev];
      copy[currentTaskIndex] = {
        ...copy[currentTaskIndex],
        name: editedTaskName.trim(),
      };
      return copy;
    });

    setShowEditTaskModal(false);
  };

  return (
    <View style={styles.container}>
      <View style={{ position: "absolute", top: 28, right: 20 }}>
        <Menu
          options={[
            {
              label: "Add time to task",
              onPress: () => {
                setNewTime("");
                setShowAddTimeModal(true);
              },
            },
            {
              label: "View progress",
              onPress: () => setShowProgressModal(true),
            },
            {
              label: "Edit task",
              onPress: () => {
                setEditedTaskName(currentTask?.name ?? "");
                setShowEditTaskModal(true);
              },
            },
          ]}
        />
      </View>

      <View style={styles.content}>
        <Text variant="h2" color="accentDark">
          Goal
        </Text>

        <Text variant="h3" weight="bold">
          {goal}
        </Text>

        <Spacer size="md" />

        {currentTask && (
          <>
            <Text variant="h2" color="accentDark">
              Task
            </Text>

            <Spacer size="xs" />

            <View style={styles.taskRow}>
              <Text variant="h3" style={styles.taskDescription}>
                {isBreak
                  ? "Take a break! You've been working really hard."
                  : currentTask.name}
              </Text>

              {!isBreak && currentTaskIndex < tasks.length - 1 && (
                <Pressable onPress={handleNextTask}>
                  <Icon name="fast-forward" size={28} />
                </Pressable>
              )}
            </View>

            <Spacer size="md" />
          </>
        )}

        {!isBreak ? (
          <Timer secondsLeft={secondsLeft} />
        ) : (
          <View style={styles.breakBox}>
            <Text variant="h3" weight="bold" color="accent">
              Break time!
            </Text>

            <Spacer size="sm" />

            <Button label="End break" variant="gold" onPress={handleEndBreak} />
          </View>
        )}
      </View>

      <Spacer size="lg" />

      <Image source={theoImage} style={styles.theo} />

      <View style={styles.row}>
        <Pressable onPress={handlePlayPause}>
          <Icon name={isRunning ? "pause" : "play"} size={48} />
        </Pressable>

        <Pressable onPress={() => setShowStopModal(true)}>
          <Icon name="stop" size={48} />
        </Pressable>

        <Pressable onPress={() => router.push("/chat")}>
          <Icon name="chat" size={48} />
        </Pressable>

        {!isBreak && (
          <Pressable onPress={handleStartBreak}>
            <Icon name="break" size={48} />
          </Pressable>
        )}
      </View>

      <AppModal
        visible={showStopModal}
        onClose={() => setShowStopModal(false)}
        variant="alert"
        title="End session?"
        message="Are you sure you want to end your work session?"
        cancelLabel="Cancel"
        confirmLabel="End"
        onConfirm={confirmStop}
      />

      <AppModal
        visible={showAddTimeModal}
        onClose={() => setShowAddTimeModal(false)}
        variant="bottom-sheet"
        title="Add time to task"
        height={260}
      >
        <Text variant="h3">Minutes to add</Text>

        <Spacer size="sm" />

        <View style={styles.inputShell}>
          <TextInput
            value={newTime}
            onChangeText={setNewTime}
            placeholder="e.g. 10"
            keyboardType="numeric"
            style={styles.input}
          />
        </View>

        <Spacer size="lg" />

        <Button label="Add Time" variant="gold" onPress={handleApplyTime} />
      </AppModal>

      <AppModal
        visible={showProgressModal}
        onClose={() => setShowProgressModal(false)}
        variant="bottom-sheet"
        title="Session progress"
        height={350}
      >
        {tasks.map((t, i) => {
          const isDone =
            i < currentTaskIndex ||
            (i === currentTaskIndex && isBreak && breakAfterTaskComplete);

          return (
            <Checkbox
              key={i}
              checked={isDone}
              onChange={() => {}}
              label={t.name}
              containerStyle={{ width: "100%" }}
            />
          );
        })}
      </AppModal>

      <AppModal
        visible={showEditTaskModal}
        onClose={() => setShowEditTaskModal(false)}
        variant="bottom-sheet"
        title="Edit task"
        height={270}
      >
        <Text variant="h3">Task name</Text>

        <Spacer size="sm" />

        <View style={styles.inputShell}>
          <TextInput
            value={editedTaskName}
            onChangeText={setEditedTaskName}
            placeholder="Task name"
            style={styles.input}
          />
        </View>

        <Spacer size="lg" />

        <Button label="Save" variant="gold" onPress={handleSaveTaskEdit} />
      </AppModal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: theme.colors.background,
  },
  content: {
    alignItems: "center",
    paddingTop: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
  },
  row: {
    flexDirection: "row",
    gap: theme.spacing.md,
    position: "absolute",
    bottom: theme.spacing.md,
    left: 0,
    right: 0,
    justifyContent: "space-evenly",
  },
  theo: {
    width: 200,
    height: 200,
    resizeMode: "contain",
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
  },
  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
  },
  breakBox: {
    backgroundColor: theme.colors.accentDark,
    padding: theme.spacing.md,
    borderRadius: theme.radii.md,
    alignItems: "center",
  },
  taskDescription: {
    paddingHorizontal: theme.spacing.sm,
  },
  inputShell: {
    backgroundColor: "#fff",
    borderRadius: theme.radii.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.accentLight,
    width: "100%",
  },
  input: {
    fontSize: 20,
    fontFamily: theme.typography.families.regular,
  },
});
