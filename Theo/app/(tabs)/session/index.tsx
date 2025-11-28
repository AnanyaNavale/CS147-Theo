import React, { useEffect, useRef, useState } from "react";
import { View, Image, StyleSheet, Pressable, Animated } from "react-native";
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

import { colors } from "@/assets/themes/colors";
import { fonts } from "@/assets/themes/typography";
import { theme } from "@/design/theme";
import { PawLoader } from "@/components/ui/PawLoader";

type Task = {
  id: string;
  text: string;
  minutes: number;
};

type TaskStatus = "pending" | "in_progress" | "completed" | "skipped";

type SessionTask = {
  id: string;
  name: string;
  time: number;
  status: TaskStatus;
};

export default function SessionScreen() {
  /* ---------------------------------------------------------
   * GET PASSED-IN GOAL + TASKS
   * --------------------------------------------------------- */
  const { goal, tasks: tasksParam } = useLocalSearchParams<{
    goal?: string;
    tasks?: string;
  }>();

  const sessionGoal = goal ?? "";

  // tasks may not exist OR may not parse
  let parsedTasks: Task[] = [];
  try {
    if (tasksParam) {
      parsedTasks = JSON.parse(tasksParam);
    }
  } catch {}

  // If there are no parsed tasks, add a default 20-minute task
  if (parsedTasks.length === 0) {
    parsedTasks = [
      {
        id: Date.now().toString(),
        text: `Work on: ${sessionGoal || "Goal"}`,
        minutes: 20,
      },
    ];
  }

  const hasTasks = parsedTasks.length > 0;

  // Convert incoming tasks to SessionTask format
  const convertedSessionTasks: SessionTask[] = parsedTasks.map((t, idx) => ({
    id: t.id,
    name: t.text,
    time: t.minutes * 60,
    status: idx === 0 ? "in_progress" : "pending",
  }));

  /* ---------------------------------------------------------
   * INITIAL STATE
   * --------------------------------------------------------- */
  const [sessionTasks, setSessionTasks] = useState<SessionTask[]>(
    convertedSessionTasks
  );

  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const currentTask: SessionTask | null =
    hasTasks && sessionTasks[currentTaskIndex]
      ? sessionTasks[currentTaskIndex]
      : null;

  /* TIMER */
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

  /* THEO ANIMATION */
  const workingFrames = [
    require("../../../assets/theo/working2.png"),
    require("../../../assets/theo/working3.png"),
  ];
  const breakFrames = [require("../../../assets/theo/break.png")];

  const [frameIndex, setFrameIndex] = useState(0);
  const frameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(t);
  }, []);

  /* MODALS */
  const [showStopModal, setShowStopModal] = useState(false);
  const [showAddTimeModal, setShowAddTimeModal] = useState(false);
  const [newTime, setNewTime] = useState("");
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [editedTaskName, setEditedTaskName] = useState("");
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);

  /* ANIMATION VALUES */
  const contentOpacity = useRef(new Animated.Value(1)).current;
  const timerScale = useRef(new Animated.Value(1)).current;

  /* HELPERS */
  const updateTaskStatus = (index: number, status: TaskStatus) => {
    setSessionTasks((prev) =>
      prev.map((t, i) => (i === index ? { ...t, status } : t))
    );
  };

  const goToEndSession = () => {
    router.push("../(tabs)/session/end-session");
  };

  /* PRELOAD IMAGES */
  useEffect(() => {
    workingFrames.forEach((img) =>
      Image.prefetch(Image.resolveAssetSource(img).uri)
    );
    breakFrames.forEach((img) =>
      Image.prefetch(Image.resolveAssetSource(img).uri)
    );
  }, []);

  /* TIMER LOGIC */
  useEffect(() => {
    if (isRunning && !isBreak && currentTask) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => Math.max(prev - 1, 0));
      }, 1000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [isRunning, isBreak, currentTask]);

  /* FRAME ANIMATION */
  useEffect(() => {
    if (frameLoopRef.current) {
      clearInterval(frameLoopRef.current);
      frameLoopRef.current = null;
    }

    if (!isRunning || isBreak) {
      setFrameIndex(0);
      return;
    }

    frameLoopRef.current = setInterval(() => {
      setFrameIndex((i) => (i + 1) % workingFrames.length);
    }, 250);

    return () => {
      if (frameLoopRef.current) clearInterval(frameLoopRef.current);
    };
  }, [isRunning, isBreak]);

  /* TASK COMPLETION CHECK */
  useEffect(() => {
    if (!currentTask) {
      if (secondsLeft <= 0) goToEndSession();
      return;
    }

    if (!isBreak && secondsLeft <= 0) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setIsRunning(false);
      setShowCompleteModal(true);
    }
  }, [secondsLeft, currentTask, isBreak]);

  /* ANIMATIONS */
  useEffect(() => {
    contentOpacity.setValue(0);
    Animated.timing(contentOpacity, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [currentTaskIndex, isBreak]);

  useEffect(() => {
    if (isRunning && !isBreak && currentTask) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(timerScale, {
            toValue: 1.05,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(timerScale, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => {
        pulse.stop();
        timerScale.setValue(1);
      };
    } else {
      timerScale.setValue(1);
    }
  }, [isRunning, isBreak, currentTask]);

  /* CONTROLS */
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
  };

  const handleNextTask = () => {
    const isLast = currentTaskIndex >= sessionTasks.length - 1;
    if (isLast) {
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

  /* COMPLETION MODAL */
  const handleMarkTaskDoneAndBreak = () => {
    if (!currentTask) return;

    updateTaskStatus(currentTaskIndex, "completed");
    setShowCompleteModal(false);

    setIsBreak(true);
    setBreakAfterTaskComplete(true);
    setIsRunning(false);
  };

  const handleNeedMoreTimeFromComplete = () => {
    setShowCompleteModal(false);
    setNewTime("5");
    setShowAddTimeModal(true);
  };

  /* SKIP */
  const handleSkipTaskConfirmed = () => {
    if (!currentTask) return;

    updateTaskStatus(currentTaskIndex, "skipped");
    setShowSkipConfirm(false);
    setShowCompleteModal(false);
    setIsBreak(false);
    setBreakAfterTaskComplete(false);

    const isLast = currentTaskIndex >= sessionTasks.length - 1;
    if (isLast) {
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

  /* ADD TIME */
  const handleApplyTime = () => {
    const m = Number(newTime);
    if (!m || m <= 0) return;
    const extraSeconds = m * 60;

    const updated = secondsLeft + extraSeconds;
    setSecondsLeft(updated);
    setSavedTime(updated);
    setShowAddTimeModal(false);
  };

  /* EDIT TASK */
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

  /* PROGRESS */
  const totalTasks = sessionTasks.length;
  const completedCount = sessionTasks.filter(
    (t) => t.status === "completed" || t.status === "skipped"
  ).length;

  const taskPosition = currentTask ? currentTaskIndex + 1 : totalTasks;

  /* ---------------- RENDER ---------------- */

  if (loading) return <PawLoader />;

  return (
    <View style={styles.container}>
      {/* MENU */}
      <View style={{ position: "absolute", top: 60, right: 20 }}>
        <Menu
          options={
            [
              currentTask
                ? {
                    label: "Mark task done",
                    onPress: () => setShowCompleteModal(true),
                  }
                : null,
              currentTask
                ? {
                    label: "Add time to task",
                    onPress: () => {
                      setNewTime("");
                      setShowAddTimeModal(true);
                    },
                  }
                : null,
              currentTask
                ? {
                    label: "Skip task",
                    onPress: () => setShowSkipConfirm(true),
                  }
                : null,
              currentTask
                ? {
                    label: "Edit task",
                    onPress: () => {
                      setEditedTaskName(currentTask.name);
                      setShowEditTaskModal(true);
                    },
                  }
                : null,
              {
                label: "View progress",
                onPress: () => setShowProgressModal(true),
              },
            ].filter(Boolean) as any
          }
        />
      </View>

      {/* GOAL + TASK */}
      <Animated.View
        style={{
          alignItems: "center",
          paddingTop: theme.spacing.lg,
          opacity: contentOpacity,
        }}
      >
        <Text variant="h2" color="accentDark">
          Goal
        </Text>

        <Text variant="h3" weight="bold">
          {sessionGoal || "No goal provided"}
        </Text>

        <Spacer size="md" />

        {currentTask ? (
          <>
            <Text variant="h2" color="accentDark">
              Task
            </Text>

            <View style={styles.taskRow}>
              <Text variant="h3">
                {isBreak
                  ? "Take a break. You've been working hard."
                  : currentTask.name}
              </Text>
            </View>

            <Spacer size="md" />

            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text variant="body" color="accentDark">
                Task {taskPosition} of {totalTasks}
              </Text>

              {!isBreak && currentTaskIndex <= sessionTasks.length - 1 && (
                <>
                  <Text variant="body" color="accentDark">
                    {" • "}
                  </Text>

                  {currentTaskIndex < sessionTasks.length - 1 && (
                    <Pressable onPress={() => setShowSkipConfirm(true)}>
                      <Text
                        variant="body"
                        color="accentDark"
                        style={{ textDecorationLine: "underline" }}
                      >
                        Skip to next task
                      </Text>
                    </Pressable>
                  )}
                  {currentTaskIndex == sessionTasks.length - 1 && (
                    <Pressable onPress={() => setShowStopModal(true)}>
                      <Text
                        variant="body"
                        color="accentDark"
                        style={{ textDecorationLine: "underline" }}
                      >
                        End session
                      </Text>
                    </Pressable>
                  )}
                </>
              )}
            </View>

            <Spacer size="lg" />
          </>
        ) : (
          <Text variant="h3" weight="bold" color="accentDark">
            No tasks provided
          </Text>
        )}

        {/* TIMER */}
        {!isBreak ? (
          <Timer
            secondsLeft={secondsLeft}
            taskDuration={currentTask?.time ?? 0}
          />
        ) : (
          <View style={styles.breakBox}>
            <Text variant="h2" weight="bold" color="white">
              Break time
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
      </Animated.View>

      {/* THEO ANIMATION */}
      <Image
        source={isBreak ? breakFrames[0] : workingFrames[frameIndex]}
        style={styles.theo}
      />

      {/* CONTROLS */}
      <View style={styles.row}>
        {!isBreak && currentTask && (
          <Pressable onPress={handlePlayPause}>
            <Icon name={isRunning ? "pause" : "play"} size={48} />
          </Pressable>
        )}

        <Pressable onPress={() => setShowStopModal(true)}>
          <Icon name="stop" size={48} />
        </Pressable>

        <Pressable onPress={() => router.push("../chat")}>
          <Icon name="chat" size={48} />
        </Pressable>

        {!isBreak && currentTask && (
          <Pressable onPress={handleStartBreak}>
            <Icon name="break" size={48} />
          </Pressable>
        )}
      </View>

      {/* MODALS */}
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
        visible={showSkipConfirm}
        onClose={() => setShowSkipConfirm(false)}
        variant="alert"
        title="Skip task?"
        message="Are you sure you want to skip this task?"
        cancelLabel="Cancel"
        confirmLabel="Skip"
        onConfirm={handleSkipTaskConfirmed}
      />

      <AppModal
        visible={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        variant="bottom-sheet"
        title="Time is up. How did this task go?"
        height={360}
      >
        <Text variant="h3" weight="bold">
          Task options
        </Text>
        <Spacer size="sm" />

        <Button
          label="Need more time"
          variant="gold"
          onPress={handleNeedMoreTimeFromComplete}
        />
        <Spacer size="sm" />

        <Button
          label="Mark task done and start break"
          variant="gold"
          onPress={handleMarkTaskDoneAndBreak}
        />

        <Spacer size="md" />

        <Text variant="h3" weight="bold">
          Session options
        </Text>
        <Spacer size="sm" />

        <Button
          label="Stop and reflect"
          variant="gold"
          onPress={() => {
            setShowCompleteModal(false);
            router.push("../chat");
          }}
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
      </AppModal>

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
      </AppModal>

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
              label={t.name + (t.status === "skipped" ? " (skipped)" : "")}
              containerStyle={{ width: "100%" }}
            />
          );
        })}

        <Spacer size="sm" />

        <Text variant="body" color="accent">
          {completedCount} of {totalTasks} tasks complete
        </Text>
      </AppModal>

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

/* STYLES */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 65,
    paddingBottom: theme.spacing.lg,
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.light.background,
  },
  row: {
    flexDirection: "row",
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  theo: {
    width: 300,
    height: 300,
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
