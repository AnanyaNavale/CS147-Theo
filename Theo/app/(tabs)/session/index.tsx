// app/(tabs)/session/index.tsx

import React, { useEffect, useRef, useState } from "react";
import { View, Image, StyleSheet, Pressable } from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { Spacer } from "@/components/ui/Spacer";
import { AppModal } from "@/components/ui/AppModal";
import { Timer } from "@/components/ui/Timer";
import { Menu } from "@/components/ui/Menu";
import { Icon } from "@/components/ui/Icon";
import { Checkbox } from "@/components/ui/Checkbox";
import { InputField } from "@/components/ui/InputField";

import { theme } from "@/design/theme";
import { TASKS, Task, TaskStatus } from "./tasks";

type SessionTask = Task & { status: TaskStatus };

export default function SessionScreen() {
  const goal = "Complete Chapter 3 notes";

  /* ---------------- PARAM: task selected from end-session ---------------- */

  const { task: taskParam } = useLocalSearchParams<{ task?: string }>();
  const selectedTaskName = Array.isArray(taskParam) ? taskParam[0] : taskParam;

  /* ---------------- INITIAL TASK INDEX ---------------- */

  const hasTasks = TASKS.length > 0;

  const initialTaskIndex = selectedTaskName
    ? TASKS.findIndex((t) => t.name === selectedTaskName)
    : 0;

  const safeInitialIndex = initialTaskIndex >= 0 ? initialTaskIndex : 0;

  /* ---------------- SESSION TASKS (WITH STATUS) ---------------- */

  const [sessionTasks, setSessionTasks] = useState<SessionTask[]>(() =>
    TASKS.map((t, idx) => ({
      ...t,
      status: idx === safeInitialIndex ? "in_progress" : "pending",
    }))
  );

  const [currentTaskIndex, setCurrentTaskIndex] = useState(safeInitialIndex);

  const currentTask: SessionTask | null =
    hasTasks && sessionTasks[currentTaskIndex]
      ? sessionTasks[currentTaskIndex]
      : null;

  /* ---------------- TIMER / SESSION STATE ---------------- */

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
    require("../../../assets/theo/working.png")
  );

  /* ---------------- MODALS ---------------- */

  const [showStopModal, setShowStopModal] = useState(false);

  const [showAddTimeModal, setShowAddTimeModal] = useState(false);
  const [newTime, setNewTime] = useState("");

  const [showProgressModal, setShowProgressModal] = useState(false);

  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [editedTaskName, setEditedTaskName] = useState("");

  const [showCompleteModal, setShowCompleteModal] = useState(false);

  /* ---------------- HELPERS ---------------- */

  const updateTaskStatus = (index: number, status: TaskStatus) => {
    setSessionTasks((prev) =>
      prev.map((t, i) => (i === index ? { ...t, status } : t))
    );
  };

  const startWorkingTheo = () =>
    setTheoImage(require("../../../assets/theo/working.png"));

  const startBreakTheo = () =>
    setTheoImage(require("../../../assets/theo/break.png"));

  const goToEndSession = () => {
    router.push("/(tabs)/session/end-session");
  };

  /* ---------------- TIMER EFFECT ---------------- */

  useEffect(() => {
    if (isRunning && !isBreak && currentTask) {
      startWorkingTheo();

      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => Math.max(prev - 1, 0));
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, isBreak, currentTaskIndex, currentTask]);

  /* ---------------- END-OF-TASK DETECTION ---------------- */

  useEffect(() => {
    if (!currentTask) {
      if (secondsLeft <= 0) {
        goToEndSession();
      }
      return;
    }

    if (!isBreak && secondsLeft <= 0) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      setIsRunning(false);
      // Do NOT assume the task is "done" here.
      // Instead, open the explicit completion modal.
      setShowCompleteModal(true);
    }
  }, [secondsLeft, currentTask, isBreak]);

  /* ---------------- LOAD SPECIFIC TASK FROM END-SCREEN ---------------- */

  useEffect(() => {
    if (!selectedTaskName) return;

    const i = TASKS.findIndex((t) => t.name === selectedTaskName);
    if (i < 0 || i === currentTaskIndex) return;

    const time = TASKS[i].time;

    setCurrentTaskIndex(i);
    setSecondsLeft(time);
    setSavedTime(time);
    setIsRunning(true);
    setIsBreak(false);
    startWorkingTheo();

    setSessionTasks((prev) =>
      prev.map((t, idx) => {
        if (idx === i) return { ...t, status: "in_progress" };
        // Keep existing status for all others
        return t;
      })
    );
  }, [selectedTaskName]);

  /* ---------------- HANDLERS: CORE ---------------- */

  const handlePlayPause = () => {
    if (!currentTask) return;

    setIsRunning((prev) => {
      const next = !prev;
      if (next && currentTask.status === "pending") {
        updateTaskStatus(currentTaskIndex, "in_progress");
      }
      return next;
    });
  };

  const handleStartBreak = () => {
    setSavedTime(secondsLeft);
    setIsBreak(true);
    setIsRunning(false);
    setBreakAfterTaskComplete(false);
    startBreakTheo();
  };

  const handleEndBreak = () => {
    setIsBreak(false);

    if (breakAfterTaskComplete) {
      setBreakAfterTaskComplete(false);
      handleNextTask();
      return;
    }

    setSecondsLeft(savedTime);
    setIsRunning(true);
    startWorkingTheo();
  };

  const handleNextTask = () => {
    const isLastTask = currentTaskIndex >= sessionTasks.length - 1;

    if (isLastTask) {
      goToEndSession();
      return;
    }

    const nextIndex = currentTaskIndex + 1;
    const nextTask = sessionTasks[nextIndex];

    setCurrentTaskIndex(nextIndex);
    setSecondsLeft(nextTask.time);
    setSavedTime(nextTask.time);
    setIsRunning(true);
    setIsBreak(false);
    startWorkingTheo();

    updateTaskStatus(nextIndex, "in_progress");
  };

  const confirmStop = () => {
    setShowStopModal(false);
    setIsRunning(false);

    if (currentTask) {
      setSecondsLeft(currentTask.time);
      setSavedTime(currentTask.time);
    }

    setIsBreak(false);
    setBreakAfterTaskComplete(false);

    goToEndSession();
  };

  /* ---------------- HANDLERS: COMPLETION MODAL ---------------- */

  const handleMarkTaskDoneAndBreak = () => {
    if (!currentTask) return;

    updateTaskStatus(currentTaskIndex, "completed");
    setShowCompleteModal(false);

    // Start a break and move to next task after break
    setIsBreak(true);
    setBreakAfterTaskComplete(true);
    setIsRunning(false);
    startBreakTheo();
  };

  const handleNeedMoreTimeFromComplete = () => {
    setShowCompleteModal(false);
    setNewTime("5"); // sensible default
    setShowAddTimeModal(true);
  };

  const handleSkipTask = () => {
    if (!currentTask) return;

    updateTaskStatus(currentTaskIndex, "skipped");
    setShowCompleteModal(false);
    setIsBreak(false);
    setBreakAfterTaskComplete(false);
    startWorkingTheo();

    const isLastTask = currentTaskIndex >= sessionTasks.length - 1;
    if (isLastTask) {
      goToEndSession();
      return;
    }

    const nextIndex = currentTaskIndex + 1;
    const nextTask = sessionTasks[nextIndex];

    setCurrentTaskIndex(nextIndex);
    setSecondsLeft(nextTask.time);
    setSavedTime(nextTask.time);
    setIsRunning(true);
    updateTaskStatus(nextIndex, "in_progress");
  };

  /* ---------------- MODAL ACTIONS ---------------- */

  const handleApplyTime = () => {
    const m = Number(newTime);
    if (!m || m <= 0) return;

    const extraSeconds = m * 60;
    const updated = secondsLeft + extraSeconds;

    setSecondsLeft(updated);
    setSavedTime(updated);

    setShowAddTimeModal(false);
  };

  const handleSaveTaskEdit = () => {
    if (!editedTaskName.trim()) return;

    const trimmed = editedTaskName.trim();

    setSessionTasks((prev) =>
      prev.map((t, idx) =>
        idx === currentTaskIndex ? { ...t, name: trimmed } : t
      )
    );

    setShowEditTaskModal(false);
  };

  /* ---------------- RENDER ---------------- */

  return (
    <View style={styles.container}>
      {/* MENU */}
      <View style={{ position: "absolute", top: 60, right: 20 }}>
        <Menu
          options={[
            {
              label: "Mark task done",
              onPress: () => {
                if (!currentTask) return;
                setShowCompleteModal(true);
              },
            },
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

      {/* GOAL + TASK */}
      <View style={{ alignItems: "center", paddingTop: theme.spacing.lg }}>
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
              <Text variant="h3">
                {isBreak
                  ? "Take a break! You’ve been working really hard."
                  : currentTask.name}
              </Text>

              {!isBreak && currentTaskIndex < sessionTasks.length - 1 && (
                <Pressable onPress={handleNextTask}>
                  <Icon name="fast-forward" size={28} />
                </Pressable>
              )}
            </View>

            <Spacer size="md" />
          </>
        )}

        {/* TIMER / BREAK BOX */}
        {!isBreak ? (
          <Timer
            secondsLeft={secondsLeft}
            taskDuration={currentTask?.time ?? 0}
          />
        ) : (
          <View style={styles.breakBox}>
            <Text variant="h2" weight="bold" color="white">
              Break time!
            </Text>

            <Spacer size="sm" />

            <Button
              size="sm"
              label="End break"
              variant="gold"
              onPress={handleEndBreak}
            />
          </View>
        )}
      </View>

      {/* THEO */}
      <Image source={theoImage} style={styles.theo} />

      {/* CONTROLS */}
      <View style={styles.row}>
        {!isBreak && (
          <Pressable onPress={handlePlayPause}>
            <Icon name={isRunning ? "pause" : "play"} size={48} />
          </Pressable>
        )}

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

      {/* -------- STOP MODAL -------- */}
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

      {/* -------- TASK COMPLETION MODAL -------- */}
      <AppModal
        visible={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        variant="bottom-sheet"
        title="How did this task go?"
        height={320}
      >
        <Spacer size="sm" />

        <Button
          label="Need more time"
          variant="outlineGold"
          onPress={handleNeedMoreTimeFromComplete}
        />
        <Spacer size="sm" />
        <Button
          label="Mark task done & start break"
          variant="gold"
          onPress={handleMarkTaskDoneAndBreak}
        />
        <Spacer size="sm" />
        <Button
          label="Stop and reflect"
          variant="gold"
          onPress={() => router.push("/chat")}
        />
        <Spacer size="sm" />

        <Button
          label="End session"
          variant="danger"
          onPress={() => {
            setShowCompleteModal(false);
            setShowStopModal(true);
          }}
        />

        <Spacer size="sm" />
      </AppModal>

      {/* -------- ADD TIME MODAL -------- */}
      <AppModal
        visible={showAddTimeModal}
        onClose={() => setShowAddTimeModal(false)}
        variant="bottom-sheet"
        title="Add time to task"
        height={350}
      >
        <InputField
          label="Minutes to add"
          value={newTime}
          onChangeText={setNewTime}
          placeholder="e.g. 10"
          keyboardType="numeric"
        />

        <Button label="Add Time" variant="gold" onPress={handleApplyTime} />
        <Spacer size="sm" />
      </AppModal>

      {/* -------- PROGRESS MODAL -------- */}
      <AppModal
        visible={showProgressModal}
        onClose={() => setShowProgressModal(false)}
        variant="bottom-sheet"
        title="Session progress"
        height={300}
      >
        {sessionTasks.map((t, i) => {
          const done = t.status === "completed" || t.status === "skipped";

          return (
            <Checkbox
              key={i}
              checked={done}
              onChange={() => {}}
              label={t.name}
              containerStyle={{ width: "100%" }}
            />
          );
        })}
      </AppModal>

      {/* -------- EDIT TASK MODAL -------- */}
      <AppModal
        visible={showEditTaskModal}
        onClose={() => setShowEditTaskModal(false)}
        variant="bottom-sheet"
        title="Edit task"
        height={270}
      >
        <InputField
          label="Task name"
          value={editedTaskName}
          onChangeText={setEditedTaskName}
          placeholder="Task name"
        />

        <Button label="Save" variant="gold" onPress={handleSaveTaskEdit} />
      </AppModal>
    </View>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 65,
    paddingBottom: theme.spacing.lg,
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.colors.background,
  },

  row: {
    flexDirection: "row",
    gap: theme.spacing.md,
  },

  theo: {
    width: 250,
    height: 250,
    resizeMode: "contain",
  },

  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
  },

  breakBox: {
    backgroundColor: theme.colors.accentDark,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radii.md,
    alignItems: "center",
    minWidth: 250,
  },
});
