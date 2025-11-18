import React, { useEffect, useRef, useState } from "react";
<<<<<<< Updated upstream:Theo/app/(tabs)/session.tsx
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

interface Task {
  name: string;
  time: number; // seconds
}
=======
import { View, Pressable, Image, StyleSheet } from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import { Text, AppModal, Spacer } from "../../../components";
import { theme } from "../../../design/theme";
import { TASKS, Task } from "./tasks";
>>>>>>> Stashed changes:Theo/app/(tabs)/session/index.tsx

export default function SessionScreen() {
  const goal = "Complete Chapter 3 notes";

<<<<<<< Updated upstream:Theo/app/(tabs)/session.tsx
  /* ---------------------------------------------- */
  /*                     STATE                       */
  /* ---------------------------------------------- */

  const [tasks, setTasks] = useState<Task[]>([
    { name: "Read pages 20–30", time: 10 },
    { name: "Write summary", time: 15 },
    { name: "Create flashcards", time: 8 * 60 },
  ]);

  const hasTasks = tasks.length > 0;

  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);

  const currentTask = hasTasks ? tasks[currentTaskIndex] : null;
=======
  const { task: taskParam } = useLocalSearchParams<{ task?: string }>();
  const selectedTaskName = Array.isArray(taskParam) ? taskParam[0] : taskParam;

  const hasTasks = TASKS.length > 0;
  const initialTaskIndex = selectedTaskName
    ? TASKS.findIndex((task) => task.name === selectedTaskName)
    : 0;

  const [currentTaskIndex, setCurrentTaskIndex] = useState(
    initialTaskIndex >= 0 ? initialTaskIndex : 0
  );
  const currentTask = hasTasks ? TASKS[currentTaskIndex] : null;
>>>>>>> Stashed changes:Theo/app/(tabs)/session/index.tsx

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

  /* ---------------------------------------------- */
  /*                     MODALS                     */
  /* ---------------------------------------------- */
  const [showStopModal, setShowStopModal] = useState(false);

  const [showAddTimeModal, setShowAddTimeModal] = useState(false);
  const [newTime, setNewTime] = useState("");

  const [showProgressModal, setShowProgressModal] = useState(false);

  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [editedTaskName, setEditedTaskName] = useState("");

  /* ---------------------------------------------- */
  /*                  TIMER EFFECT                  */
  /* ---------------------------------------------- */
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
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, currentTaskIndex, isBreak, currentTask]);

  /* ---------------------------------------------- */
  /*               END-OF-TASK DETECTION            */
  /* ---------------------------------------------- */
  useEffect(() => {
    if (!isBreak && currentTask && secondsLeft <= 0) {
      if (intervalRef.current) clearInterval(intervalRef.current);

      setIsRunning(false);
      setSavedTime(0);

      setIsBreak(true);
      setTheoImage(require("../../../assets/theo/break.png"));

      setBreakAfterTaskComplete(true);
    }
<<<<<<< Updated upstream:Theo/app/(tabs)/session.tsx
  }, [secondsLeft, isBreak, currentTask]);

  /* ---------------------------------------------- */
  /*                   HANDLERS                     */
  /* ---------------------------------------------- */

  const handleNextTask = () => {
    if (currentTaskIndex < tasks.length - 1) {
      const nextIndex = currentTaskIndex + 1;

      setCurrentTaskIndex(nextIndex);

      const next = tasks[nextIndex];
      setSecondsLeft(next.time);
      setSavedTime(next.time);
=======

    if (!currentTask && secondsLeft <= 0) {
      router.replace("/(tabs)/session/end-session");
    }
  }, [secondsLeft, isBreak, currentTask]);

  /* HANDLE TASK SELECTED FROM END SCREEN */
  useEffect(() => {
    if (!selectedTaskName) return;
    const nextIndex = TASKS.findIndex((task) => task.name === selectedTaskName);

    if (nextIndex >= 0 && nextIndex !== currentTaskIndex) {
      const nextTaskTime = TASKS[nextIndex].time;
      setCurrentTaskIndex(nextIndex);
      setSecondsLeft(nextTaskTime);
      setSavedTime(nextTaskTime);
      setIsBreak(false);
      setIsRunning(true);
      setTheoImage(require("../../../assets/theo/working.png"));
    }
  }, [selectedTaskName, currentTaskIndex]);

  /* BUTTON HANDLERS */
  const handlePlayPause = () => {
    if (!currentTask) return;
    setIsRunning((prev) => !prev);
  };

  const handleStop = () => setShowStopModal(true);
  const cancelStop = () => setShowStopModal(false);

  const confirmStop = () => {
    setShowStopModal(false);
    setIsRunning(false);

    if (currentTask) {
      setSecondsLeft(currentTask.time);
      setSavedTime(currentTask.time);
    }

    setTheoImage(require("../../../assets/theo/working.png"));
    setIsBreak(false);
    setBreakAfterTaskComplete(false);

    router.push("/(tabs)/session/end-session");
  };

  const handleNextTask = () => {
    if (!hasTasks) return;

    if (currentTaskIndex < TASKS.length - 1) {
      const nextIndex = currentTaskIndex + 1;

      setCurrentTaskIndex(nextIndex);
      setSecondsLeft(TASKS[nextIndex].time);
      setSavedTime(TASKS[nextIndex].time);
>>>>>>> Stashed changes:Theo/app/(tabs)/session/index.tsx

      setIsRunning(true);
      setIsBreak(false);

<<<<<<< Updated upstream:Theo/app/(tabs)/session.tsx
      setTheoImage(require("../../assets/theo/working.png"));
      return;
=======
      setTheoImage(require("../../../assets/theo/working.png"));
    } else {
      router.push("/(tabs)/session/end-session");
>>>>>>> Stashed changes:Theo/app/(tabs)/session/index.tsx
    }

    console.log("Session complete");
  };

  const handlePlayPause = () => {
    if (!currentTask) return;
    setIsRunning((p) => !p);
  };

  const handleStartBreak = () => {
    setSavedTime(secondsLeft);
    setIsBreak(true);
    setIsRunning(false);
<<<<<<< Updated upstream:Theo/app/(tabs)/session.tsx
    setTheoImage(require("../../assets/theo/break.png"));
=======
    setTheoImage(require("../../../assets/theo/break.png"));
    setBreakAfterTaskComplete(false);
>>>>>>> Stashed changes:Theo/app/(tabs)/session/index.tsx
  };

  const handleEndBreak = () => {
    setIsBreak(false);

    if (breakAfterTaskComplete) {
      setBreakAfterTaskComplete(false);
      handleNextTask();
    } else {
      setSecondsLeft(savedTime);
      setIsRunning(true);
      setTheoImage(require("../../../assets/theo/working.png"));
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

  /* ---------------------------------------------- */
  /*                  MODAL ACTIONS                 */
  /* ---------------------------------------------- */

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

  /* ---------------------------------------------- */
  /*                     RENDER                     */
  /* ---------------------------------------------- */

  return (
    <View style={styles.container}>
      {/* MENU */}
      <View style={{ position: "absolute", top: 20, right: 20 }}>
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

        {/* CURRENT TASK */}
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

<<<<<<< Updated upstream:Theo/app/(tabs)/session.tsx
              {!isBreak && currentTaskIndex < tasks.length - 1 && (
                <Pressable onPress={handleNextTask}>
                  <Icon name="fast-forward" size={28} />
                </Pressable>
              )}
=======
              {!isBreak &&
                currentTask &&
                currentTaskIndex < TASKS.length - 1 && (
                  <Pressable onPress={handleNextTask}>
                    <Image
                      source={require("../../../assets/icons/fast-forward.png")}
                      style={styles.fastForwardIcon}
                    />
                  </Pressable>
                )}
>>>>>>> Stashed changes:Theo/app/(tabs)/session/index.tsx
            </View>

            <Spacer size="md" />
          </>
        )}

<<<<<<< Updated upstream:Theo/app/(tabs)/session.tsx
        {/* TIMER OR BREAK MODE */}
        {!isBreak ? (
          <Timer secondsLeft={secondsLeft} />
        ) : (
=======
        {/* TIMER */}
        {!isBreak && (
          <View style={styles.timerContainer}>
            {showTimer && (
              <Text variant="h1" weight="bold">
                {formatTime(secondsLeft)}
              </Text>
            )}

            <Pressable
              style={styles.expandCollapseBtn}
              onPress={() => setShowTimer((p) => !p)}
            >
              <Image
                source={
                  showTimer
                    ? require("../../../assets/icons/collapse.png")
                    : require("../../../assets/icons/expand.png")
                }
                style={[
                  styles.expandCollapseIcon,
                  { transform: [{ rotate: showTimer ? "0deg" : "180deg" }] },
                ]}
              />
            </Pressable>
          </View>
        )}

        {/* BREAK MODE */}
        {isBreak && (
>>>>>>> Stashed changes:Theo/app/(tabs)/session/index.tsx
          <View style={styles.breakBox}>
            <Text variant="h3" weight="bold" color="accent">
              Break time!
            </Text>

            <Spacer size="sm" />

            <Button label="End break" variant="gold" onPress={handleEndBreak} />
          </View>
        )}
      </View>

      {/* THEO */}
      <Image source={theoImage} style={styles.theo} />

      {/* BUTTON ROW */}
      <View style={styles.row}>
<<<<<<< Updated upstream:Theo/app/(tabs)/session.tsx
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
=======
        <Pressable style={styles.button} onPress={handlePlayPause}>
          <Image
            source={
              isRunning
                ? require("../../../assets/icons/pause.png")
                : require("../../../assets/icons/play.png")
            }
            style={styles.icon}
          />
        </Pressable>

        <Pressable style={styles.button} onPress={handleStop}>
          <Image
            source={require("../../../assets/icons/stop.png")}
            style={styles.icon}
          />
        </Pressable>

        <Pressable style={styles.button} onPress={() => router.push("/chat")}>
          <Image
            source={require("../../../assets/icons/chat.png")}
            style={styles.icon}
          />
        </Pressable>

        {hasTasks && !isBreak && (
          <Pressable style={styles.button} onPress={handleStartBreak}>
            <Image
              source={require("../../../assets/icons/break.png")}
              style={styles.icon}
            />
>>>>>>> Stashed changes:Theo/app/(tabs)/session/index.tsx
          </Pressable>
        )}
      </View>

      {/* ---------------- STOP MODAL ---------------- */}
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

      {/* ---------------- ADD TIME MODAL ---------------- */}
      <AppModal
        visible={showAddTimeModal}
        onClose={() => setShowAddTimeModal(false)}
        variant="bottom-sheet"
        title="Add time to task"
        height={260}
      >
        <Text variant="h3">Minutes to add</Text>

        <Spacer size="sm" />

        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: theme.radii.md,
            padding: theme.spacing.md,
            borderWidth: 1,
            borderColor: theme.colors.accentLight,
            width: "100%",
          }}
        >
          <TextInput
            value={newTime}
            onChangeText={setNewTime}
            placeholder="e.g. 10"
            keyboardType="numeric"
            style={{
              fontSize: 20,
              fontFamily: theme.typography.families.regular,
            }}
          />
        </View>

        <Spacer size="lg" />

        <Button label="Add Time" variant="gold" onPress={handleApplyTime} />
      </AppModal>

      {/* ---------------- PROGRESS MODAL ---------------- */}
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

      {/* ---------------- EDIT TASK MODAL ---------------- */}
      <AppModal
        visible={showEditTaskModal}
        onClose={() => setShowEditTaskModal(false)}
        variant="bottom-sheet"
        title="Edit task"
        height={270}
      >
        <Text variant="h3">Task name</Text>

        <Spacer size="sm" />

        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: theme.radii.md,
            padding: theme.spacing.md,
            borderWidth: 1,
            borderColor: theme.colors.accentLight,
            width: "100%",
          }}
        >
          <TextInput
            value={editedTaskName}
            onChangeText={setEditedTaskName}
            placeholder="Task name"
            style={{
              fontSize: 20,
              fontFamily: theme.typography.families.regular,
            }}
          />
        </View>

        <Spacer size="lg" />

        <Button label="Save" variant="gold" onPress={handleSaveTaskEdit} />
      </AppModal>
    </View>
  );
}

/* ---------------------------------------------- */
/*                     STYLES                     */
/* ---------------------------------------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: theme.spacing.lg,
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
    padding: theme.spacing.md,
    borderRadius: theme.radii.md,
    alignItems: "center",
  },
});
