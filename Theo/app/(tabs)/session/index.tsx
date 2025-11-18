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

import { TASKS, Task } from "./tasks";

export default function SessionScreen() {
  const goal = "Complete Chapter 3 notes";

  /* PARAM: Selected task from end-session screen */
  const { task: taskParam } = useLocalSearchParams<{ task?: string }>();
  const selectedTaskName = Array.isArray(taskParam) ? taskParam[0] : taskParam;

  /* TASKS: From shared TASKS file */
  const hasTasks = TASKS.length > 0;

  const initialTaskIndex = selectedTaskName
    ? TASKS.findIndex((t) => t.name === selectedTaskName)
    : 0;

  const [currentTaskIndex, setCurrentTaskIndex] = useState(
    initialTaskIndex >= 0 ? initialTaskIndex : 0
  );

  const currentTask: Task | null = hasTasks ? TASKS[currentTaskIndex] : null;

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

  /* ---------------- TIMER ---------------- */

  useEffect(() => {
    if (isRunning && !isBreak && currentTask) {
      setTheoImage(require("../../../assets/theo/working.png"));

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
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, isBreak, currentTaskIndex, currentTask]);

  /* ---------------- END OF TASK ---------------- */

  useEffect(() => {
    if (!isBreak && currentTask && secondsLeft <= 0) {
      intervalRef.current && clearInterval(intervalRef.current);

      setIsRunning(false);
      setSavedTime(0);

      setIsBreak(true);
      setTheoImage(require("../../../assets/theo/break.png"));
      setBreakAfterTaskComplete(true);
      return;
    }

    if (!currentTask && secondsLeft <= 0) {
      router.replace("/(tabs)/session/end-session");
    }
  }, [secondsLeft, currentTask, isBreak]);

  /* LOAD A SPECIFIC TASK FROM END-SCREEN */
  useEffect(() => {
    if (!selectedTaskName) return;

    const i = TASKS.findIndex((t) => t.name === selectedTaskName);
    if (i >= 0 && i !== currentTaskIndex) {
      const time = TASKS[i].time;
      setCurrentTaskIndex(i);
      setSecondsLeft(time);
      setSavedTime(time);
      setIsRunning(true);
      setIsBreak(false);
      setTheoImage(require("../../../assets/theo/working.png"));
    }
  }, [selectedTaskName]);

  /* ---------------- HANDLERS ---------------- */

  const handlePlayPause = () => {
    if (currentTask) setIsRunning((p) => !p);
  };

  const handleStartBreak = () => {
    setSavedTime(secondsLeft);
    setIsBreak(true);
    setIsRunning(false);
    setBreakAfterTaskComplete(false);
    setTheoImage(require("../../../assets/theo/break.png"));
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
    setTheoImage(require("../../../assets/theo/working.png"));
  };

  const handleNextTask = () => {
    if (currentTaskIndex < TASKS.length - 1) {
      const next = currentTaskIndex + 1;
      const nextTime = TASKS[next].time;

      setCurrentTaskIndex(next);
      setSecondsLeft(nextTime);
      setSavedTime(nextTime);
      setIsRunning(true);
      setIsBreak(false);
      setTheoImage(require("../../../assets/theo/working.png"));
    } else {
      router.push("/(tabs)/session/end-session");
    }
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

    router.push("/(tabs)/session/end-session");
  };

  const handleApplyTime = () => {
    const m = Number(newTime);
    if (!m || m <= 0) return;

    const added = m * 60;
    const updated = secondsLeft + added;

    setSecondsLeft(updated);
    setSavedTime(updated);

    setShowAddTimeModal(false);
  };

  const handleSaveTaskEdit = () => {
    if (!editedTaskName.trim()) return;
    const updated = [...TASKS];
    updated[currentTaskIndex] = {
      ...updated[currentTaskIndex],
      name: editedTaskName.trim(),
    };
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

      {/* GOAL */}
      <View style={{ alignItems: "center", paddingTop: theme.spacing.lg }}>
        <Text variant="h2" color="accentDark">
          Goal
        </Text>

        <Text variant="h3" weight="bold">
          {goal}
        </Text>

        <Spacer size="md" />

        {/* TASK HEADER */}
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

              {!isBreak && currentTaskIndex < TASKS.length - 1 && (
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
          <Timer secondsLeft={secondsLeft} />
        ) : (
          <View style={styles.breakBox}>
            <Text variant="h2" weight="bold">
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
        {TASKS.map((t, i) => {
          const done =
            i < currentTaskIndex ||
            (i === currentTaskIndex && isBreak && breakAfterTaskComplete);

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
