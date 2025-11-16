import React, { useEffect, useRef, useState } from "react";
import { View, Text, Pressable, Image, Modal, StyleSheet } from "react-native";
import { router } from "expo-router";

interface Task {
  name: string;
  time: number;
}

// TODO: pass in goal + tasks
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

  // Timer effect
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
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, currentTaskIndex, isBreak, currentTask]);

  // Detect end of task
  useEffect(() => {
    if (!isBreak && currentTask && secondsLeft <= 0) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setIsRunning(false);
      setSavedTime(0);
      setIsBreak(true);
      setTheoImage(require("../../assets/theo/break.png"));
      setBreakAfterTaskComplete(true);
    }

    // End session if no tasks and timer reaches 0
    if (!currentTask && secondsLeft <= 0) {
      console.log("Session ended (no tasks left)");
    }
  }, [secondsLeft, isBreak, currentTask]);

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
      {/* Goal + Task */}
      <View style={styles.infoContainer}>
        <Text style={styles.goalLabel}>Goal</Text>
        <Text style={styles.goalText}>{goal}</Text>

        {hasTasks && (
          <>
            <Text style={styles.taskLabel}>Task</Text>
            <View style={styles.taskRow}>
              <Text style={styles.taskText}>
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

        {!isBreak && (
          <View style={styles.timerContainer}>
            {showTimer && (
              <Text style={styles.timer}>{formatTime(secondsLeft)}</Text>
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

        {isBreak && (
          <View style={styles.breakBox}>
            <Text style={styles.breakText}>Break time!</Text>
            <Pressable style={styles.endBreakBtn} onPress={handleEndBreak}>
              <Text style={styles.endBreakText}>End break</Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* Theo */}
      <Image source={theoImage} style={styles.theo} />

      {/* Buttons */}
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

      {/* Stop Modal */}
      <Modal visible={showStopModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalText}>End session?</Text>
            <View style={styles.modalButtons}>
              <Pressable style={styles.cancelBtn} onPress={cancelStop}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.confirmBtn} onPress={confirmStop}>
                <Text style={styles.confirmText}>End</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// TODO: adjust styles for consistency
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-around",
    paddingTop: 50,
    backgroundColor: "#fff",
    paddingBottom: 50,
  },
  infoContainer: { alignItems: "center" },
  goalLabel: { fontSize: 18, fontWeight: "600", color: "#8b5e3c" },
  goalText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#8b5e3c",
    marginBottom: 12,
  },
  taskLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#3c3c3c",
    marginTop: 8,
  },
  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  taskText: { fontSize: 18, color: "#3c3c3c" },
  fastForwardIcon: { width: 24, height: 24, resizeMode: "contain" },
  theo: { width: 250, height: 250, resizeMode: "contain", marginBottom: 20 },
  timerContainer: { flexDirection: "row" },
  timer: { fontSize: 48, fontWeight: "700", color: "#3c3c3c" },
  expandCollapseBtn: {
    padding: 8,
    borderRadius: 12,
    alignSelf: "center",
    marginBottom: 8,
  },
  expandCollapseIcon: { width: 38, height: 38, resizeMode: "contain" },
  row: { flexDirection: "row", gap: 20, marginTop: 10 },
  button: {},
  icon: { width: 48, height: 48, resizeMode: "contain" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalBox: {
    width: 280,
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  modalText: { fontSize: 18, marginBottom: 16, fontWeight: "500" },
  modalButtons: { flexDirection: "row", gap: 16 },
  cancelBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: "#ddd",
    borderRadius: 8,
  },
  confirmBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: "#ff5a5a",
    borderRadius: 8,
  },
  cancelText: { fontSize: 16 },
  confirmText: { color: "white", fontSize: 16 },
  breakBox: {
    backgroundColor: "#8b5e3c",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
  },
  breakText: {
    color: "white",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
  },
  endBreakBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#d4a373",
    borderRadius: 8,
  },
  endBreakText: { color: "white", fontWeight: "600", fontSize: 16 },
});
