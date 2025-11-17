import React, { useEffect, useRef, useState } from "react";
import { View, Pressable, Image, StyleSheet } from "react-native";
import { router } from "expo-router";

import { Text, AppModal, Spacer } from "../../components";
import { theme } from "../../design/theme";

interface Task {
  name: string;
  time: number;
}

export default function SessionScreen() {
  const goal = "Complete Chapter 3 notes";

  const tasks: Task[] = [
    { name: "Read pages 20–30", time: 10 },
    { name: "Write summary", time: 15 },
    { name: "Create flashcards", time: 8 * 60 },
  ];

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
  const [showTimer, setShowTimer] = useState(hasTasks);
  const [isBreak, setIsBreak] = useState(false);
  const [breakAfterTaskComplete, setBreakAfterTaskComplete] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [theoImage, setTheoImage] = useState(
    require("../../assets/theo/working.png")
  );

  const [showStopModal, setShowStopModal] = useState(false);

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s < 10 ? "0" + s : s}`;
  };

  /* TIMER LOOP */
  useEffect(() => {
    if (isRunning && !isBreak && currentTask) {
      setTheoImage(require("../../assets/theo/working.png"));

      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, currentTaskIndex, isBreak, currentTask]);

  /* DETECT END OF TASK */
  useEffect(() => {
    if (!isBreak && currentTask && secondsLeft <= 0) {
      if (intervalRef.current) clearInterval(intervalRef.current);

      setIsRunning(false);
      setSavedTime(0);

      setIsBreak(true);
      setTheoImage(require("../../assets/theo/break.png"));

      setBreakAfterTaskComplete(true);
    }

    if (!currentTask && secondsLeft <= 0) {
      console.log("Session ended (no tasks left)");
    }
  }, [secondsLeft, isBreak, currentTask]);

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

    setTheoImage(require("../../assets/theo/working.png"));
    setIsBreak(false);
    setBreakAfterTaskComplete(false);

    console.log("session complete");
  };

  const handleNextTask = () => {
    if (!hasTasks) return;

    if (currentTaskIndex < tasks.length - 1) {
      const nextIndex = currentTaskIndex + 1;

      setCurrentTaskIndex(nextIndex);
      setSecondsLeft(tasks[nextIndex].time);
      setSavedTime(tasks[nextIndex].time);

      setIsRunning(true);
      setIsBreak(false);

      setTheoImage(require("../../assets/theo/working.png"));
    } else {
      console.log("Session ended (all tasks completed)");
    }
  };

  const handleStartBreak = () => {
    if (!currentTask) return;

    setSavedTime(secondsLeft);
    setIsBreak(true);
    setIsRunning(false);
    setTheoImage(require("../../assets/theo/break.png"));
    setBreakAfterTaskComplete(false);
  };

  const handleEndBreak = () => {
    setIsBreak(false);

    if (breakAfterTaskComplete) {
      setBreakAfterTaskComplete(false);
      handleNextTask();
    } else if (currentTask) {
      setSecondsLeft(savedTime);
      setIsRunning(true);
      setTheoImage(require("../../assets/theo/working.png"));
    }
  };

  return (
    <View style={styles.container}>
      {/* GOAL + TASK */}
      <View style={styles.infoContainer}>
        <Text variant="h2" weight="bold" color="accentDark">
          Goal
        </Text>

        <Text variant="subtitle" weight="bold" color="accentDark">
          {goal}
        </Text>
        <Spacer size="md" />

        {hasTasks && (
          <>
            <Text variant="h2" weight="bold">
              Task
            </Text>

            <View style={styles.taskRow}>
              <Text variant="body">
                {isBreak
                  ? "Take a break! You’ve been working really hard."
                  : currentTask?.name}
              </Text>

              {!isBreak &&
                currentTask &&
                currentTaskIndex < tasks.length - 1 && (
                  <Pressable onPress={handleNextTask}>
                    <Image
                      source={require("../../assets/icons/fast-forward.png")}
                      style={styles.fastForwardIcon}
                    />
                  </Pressable>
                )}
            </View>
          </>
        )}

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
                    ? require("../../assets/icons/collapse.png")
                    : require("../../assets/icons/expand.png")
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
          <View style={styles.breakBox}>
            <Text variant="h2" weight="bold" color="white">
              Break time!
            </Text>

            <Pressable style={styles.endBreakBtn} onPress={handleEndBreak}>
              <Text variant="body" weight="bold" color="white">
                End break
              </Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* THEO IMAGE */}
      <Image source={theoImage} style={styles.theo} />

      {/* ICON BUTTONS */}
      <View style={styles.row}>
        <Pressable style={styles.button} onPress={handlePlayPause}>
          <Image
            source={
              isRunning
                ? require("../../assets/icons/pause.png")
                : require("../../assets/icons/play.png")
            }
            style={styles.icon}
          />
        </Pressable>

        <Pressable style={styles.button} onPress={handleStop}>
          <Image
            source={require("../../assets/icons/stop.png")}
            style={styles.icon}
          />
        </Pressable>

        <Pressable style={styles.button} onPress={() => router.push("/chat")}>
          <Image
            source={require("../../assets/icons/chat.png")}
            style={styles.icon}
          />
        </Pressable>

        {hasTasks && !isBreak && (
          <Pressable style={styles.button} onPress={handleStartBreak}>
            <Image
              source={require("../../assets/icons/break.png")}
              style={styles.icon}
            />
          </Pressable>
        )}
      </View>

      {/* STOP CONFIRMATION MODAL */}
      <AppModal
        visible={showStopModal}
        onClose={cancelStop}
        variant="alert"
        title="End session?"
        message="Are you sure you want to stop now?"
        cancelLabel="Cancel"
        confirmLabel="End"
        onConfirm={confirmStop}
      />
    </View>
  );
}

/* ------------------------------------------------ */
/* --------------------- STYLES -------------------- */
/* ------------------------------------------------ */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: theme.colors.background,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
  },

  infoContainer: {
    alignItems: "center",
  },

  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },

  fastForwardIcon: {
    width: 24,
    height: 24,
    resizeMode: "contain",
  },

  theo: {
    width: 250,
    height: 250,
    resizeMode: "contain",
    marginBottom: theme.spacing.md,
  },

  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  expandCollapseBtn: {
    padding: theme.spacing.xs,
  },

  expandCollapseIcon: {
    width: 38,
    height: 38,
    resizeMode: "contain",
  },

  row: {
    flexDirection: "row",
    gap: theme.spacing.lg,
    marginTop: theme.spacing.sm,
  },

  button: {},

  icon: {
    width: 48,
    height: 48,
    resizeMode: "contain",
  },

  breakBox: {
    backgroundColor: theme.colors.accentDark,
    padding: theme.spacing.md,
    borderRadius: theme.radii.md,
    alignItems: "center",
    marginTop: theme.spacing.sm,
  },

  endBreakBtn: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radii.sm,
  },
});
