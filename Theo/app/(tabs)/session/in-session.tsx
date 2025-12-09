import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { AppModal } from "@/components/custom/AppModal";
import { Button } from "@/components/custom/Button";
import { Checkbox } from "@/components/custom/Checkbox";
import { Icon } from "@/components/custom/Icon";
import { InputField } from "@/components/custom/InputField";
import { Spacer } from "@/components/custom/Spacer";
import { Text } from "@/components/custom/Text";
import { Timer } from "@/components/custom/Timer";

import { PawLoader } from "@/components/custom/PawLoader";
import SvgStrokeText from "@/components/custom/SvgStrokeText";
import { Theme } from "@/design/theme";
import { useAppTheme } from "@/hooks/ThemeContext";
import {
  fetchSessionById,
  fetchTasksForSession,
  updateSession,
  updateTaskCompletionStates,
} from "@/lib/supabase";

type Task = {
  id: string;
  text: string;
  minutes: number;
  completed?: boolean;
};

type TaskStatus = "pending" | "in_progress" | "completed" | "skipped";

type SessionTask = {
  id: string;
  name: string;
  time: number;
  status: TaskStatus;
  actualSeconds?: number;
};

const iconSize = 54;

export default function SessionScreen() {
  /* ---------------------------------------------------------
   * GET PASSED-IN GOAL + TASKS
   * --------------------------------------------------------- */
  const {
    goal,
    tasks: tasksParam,
    sessionId,
  } = useLocalSearchParams<{
    goal?: string;
    tasks?: string;
    sessionId?: string;
  }>();

  const sessionGoal = goal ?? "";
  const { colors: palette, theme, mode } = useAppTheme();
  const styles = useMemo(() => createStyles(theme, palette), [theme, palette]);
  const isDark = mode === "dark";
  const playIcon = isDark ? "play-dark" : "play";
  const pauseIcon = isDark ? "pause-dark" : "pause";
  const stopIcon = isDark ? "stop-dark" : "stop";
  const chatIcon = isDark ? "chat-dark" : "chat";
  const breakIcon = isDark ? "break-dark" : "break";

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
        text: `Work towards anything you need!`,
        minutes: 20,
      },
    ];
  }

  const hasTasks = parsedTasks.length > 0;

  // Convert incoming tasks to SessionTask format, keeping completed tasks marked
  const firstIncompleteIndex = parsedTasks.findIndex((t) => !t.completed);
  const convertedSessionTasks: SessionTask[] = parsedTasks.map((t, idx) => {
    let status: TaskStatus;
    if (t.completed) {
      status = "completed";
    } else if (firstIncompleteIndex === -1) {
      status = "completed";
    } else if (idx === firstIncompleteIndex) {
      status = "in_progress";
    } else {
      status = "pending";
    }

    return {
      id: t.id,
      name: t.text,
      time: t.minutes * 60,
      status,
    };
  });

  /* ---------------------------------------------------------
   * INITIAL STATE
   * --------------------------------------------------------- */
  const initialCurrentIndex =
    firstIncompleteIndex === -1 ? 0 : Math.max(0, firstIncompleteIndex);
  const [sessionTasks, setSessionTasks] = useState<SessionTask[]>(
    convertedSessionTasks
  );

  const [currentTaskIndex, setCurrentTaskIndex] = useState(initialCurrentIndex);
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

  const [isRunning, setIsRunning] = useState(
    hasTasks && currentTask?.status !== "completed"
  );
  const [isBreak, setIsBreak] = useState(false);
  const [breakAfterTaskComplete, setBreakAfterTaskComplete] = useState(false);
  const [workSecondsSinceBreak, setWorkSecondsSinceBreak] = useState(0);

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
  const [newTimeError, setNewTimeError] = useState("");
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskMinutes, setNewTaskMinutes] = useState("");
  const [newTaskMinutesError, setNewTaskMinutesError] = useState("");
  const [newTaskOrder, setNewTaskOrder] = useState("");
  const [newTaskOrderError, setNewTaskOrderError] = useState("");
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [editedTaskName, setEditedTaskName] = useState("");
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showMarkDoneConfirm, setShowMarkDoneConfirm] = useState(false);
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);
  const [showStartBreakConfirm, setShowStartBreakConfirm] = useState(false);
  const [showEndBreakConfirm, setShowEndBreakConfirm] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isSavingForLater, setIsSavingForLater] = useState(false);
  const [isPersistingTasks, setIsPersistingTasks] = useState(false);
  const sessionEndLoggedRef = useRef(false);
  const [baseSessionTimeCompleted, setBaseSessionTimeCompleted] = useState(0);
  const [baseTaskTimes, setBaseTaskTimes] = useState<Record<string, number>>(
    {}
  );

  /* ANIMATION VALUES */
  const contentOpacity = useRef(new Animated.Value(1)).current;
  const timerScale = useRef(new Animated.Value(1)).current;

  /* HELPERS */
  const updateTaskStatus = (
    index: number,
    status: TaskStatus,
    timeSpentSeconds?: number
  ) => {
    setSessionTasks((prev) =>
      prev.map((t, i) =>
        i === index
          ? {
              ...t,
              status,
              time: timeSpentSeconds != null ? timeSpentSeconds : t.time,
              actualSeconds:
                timeSpentSeconds != null ? timeSpentSeconds : t.actualSeconds,
            }
          : t
      )
    );
  };

  const currentTaskTimeSpent = () =>
    Math.max(0, Math.round(savedTime - secondsLeft));

  const closeOutCurrentTask = (status: TaskStatus) => {
    if (!currentTask) return 0;
    const spent = currentTaskTimeSpent();
    updateTaskStatus(currentTaskIndex, status, spent);
    return spent;
  };

  // If timer has hit zero, make sure the task is marked complete before leaving it.
  const finalizeTimedOutTask = () => {
    if (!currentTask) return;
    if (secondsLeft <= 0 && currentTask.status !== "completed") {
      closeOutCurrentTask("completed");
    }
  };

  const computeTaskProgress = (tasksSnapshot: SessionTask[] = sessionTasks) => {
    const taskPayload = tasksSnapshot.map((t, idx) => {
      const isCompleted =
        t.status === "completed" ||
        t.status === "skipped" ||
        (idx === currentTaskIndex && secondsLeft <= 0 && !isBreak);
      const spentSeconds =
        typeof t.actualSeconds === "number"
          ? Math.max(0, t.actualSeconds)
          : idx === currentTaskIndex
          ? currentTaskTimeSpent()
          : 0;
      const prevTime = baseTaskTimes[t.id] ?? 0;
      const updatedTime = Math.max(0, prevTime + spentSeconds);
      return {
        id: t.id,
        is_completed: Boolean(isCompleted),
        time_completed: updatedTime,
      };
    });

    const addedSeconds = taskPayload.reduce(
      (sum, t) => sum + (t.time_completed ?? 0) - (baseTaskTimes[t.id] ?? 0),
      0
    );
    const totalSpentSeconds = baseSessionTimeCompleted + addedSeconds;

    return { taskPayload, totalSpentSeconds };
  };

  const persistTaskCompletion = async (
    tasksSnapshot: SessionTask[] = sessionTasks
  ) => {
    if (!sessionId || isPersistingTasks) return { totalSpentSeconds: 0 };
    setIsPersistingTasks(true);
    try {
      const { taskPayload, totalSpentSeconds } =
        computeTaskProgress(tasksSnapshot);
      await updateTaskCompletionStates(sessionId, taskPayload);
      return { totalSpentSeconds };
    } catch (err) {
      console.error("Failed to persist task completion states:", err);
      return { totalSpentSeconds: 0 };
    } finally {
      setIsPersistingTasks(false);
    }
  };

  const markSessionCompleted = async (totalSpentSeconds?: number) => {
    if (!sessionId || sessionEndLoggedRef.current) return;
    sessionEndLoggedRef.current = true;
    try {
      await updateSession(sessionId, {
        completed_at: new Date().toISOString(),
        status: "complete",
        time_completed: totalSpentSeconds ?? null,
      });
    } catch (err) {
      console.error("Failed to mark session complete", err);
    }
  };

  const goToEndSession = async () => {
    finalizeTimedOutTask();
    const { totalSpentSeconds } = await persistTaskCompletion();
    await markSessionCompleted(totalSpentSeconds);

    const summaryTasks = sessionTasks.map((t, idx) => {
      const spentSeconds =
        typeof t.actualSeconds === "number"
          ? Math.max(0, t.actualSeconds)
          : idx === currentTaskIndex
          ? currentTaskTimeSpent()
          : 0;

      return {
        id: t.id,
        text: t.name,
        status: t.status,
        actualSeconds: spentSeconds,
        timeSeconds: Math.max(0, typeof t.time === "number" ? t.time : 0),
        minutes: Math.max(0, Math.round(spentSeconds / 60)),
      };
    });

    router.push({
      pathname: "./end-session",
      params: {
        goal: sessionGoal,
        tasks: JSON.stringify(summaryTasks),
        sessionId: sessionId ?? null,
      },
    });
  };

  const handleSaveSessionForLater = async () => {
    if (!sessionId || isSavingForLater) return;
    setIsSavingForLater(true);
    try {
      finalizeTimedOutTask();
      const { totalSpentSeconds } = await persistTaskCompletion();

      await updateSession(sessionId, {
        status: "incomplete",
        completed_at: null,
        time_completed: totalSpentSeconds,
      });
      setShowStopModal(false);
      setIsRunning(false);
      setIsBreak(false);
      router.replace("/(tabs)/session");
      router.replace("../../");
    } catch (err) {
      console.error("Failed to save session for later:", err);
    } finally {
      setIsSavingForLater(false);
    }
  };

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  /* PRELOAD IMAGES */
  useEffect(() => {
    workingFrames.forEach((img) =>
      Image.prefetch(Image.resolveAssetSource(img).uri)
    );
    breakFrames.forEach((img) =>
      Image.prefetch(Image.resolveAssetSource(img).uri)
    );
  }, []);

  // Load existing time_completed for session/tasks to ensure we add, not replace
  useEffect(() => {
    let isMounted = true;
    const loadExisting = async () => {
      if (!sessionId) return;
      try {
        const session = await fetchSessionById(sessionId);
        if (isMounted && session?.time_completed != null) {
          setBaseSessionTimeCompleted(Number(session.time_completed) || 0);
        }

        const existingTasks = await fetchTasksForSession(sessionId);
        if (isMounted) {
          const map: Record<string, number> = {};
          existingTasks.forEach((t) => {
            map[t.id] = Number(t.time_completed) || 0;
          });
          setBaseTaskTimes(map);
        }
      } catch (err) {
        console.error("Failed to load existing session/task times", err);
      }
    };

    loadExisting();
    return () => {
      isMounted = false;
    };
  }, [sessionId]);

  /* TIMER LOGIC */
  useEffect(() => {
    if (isRunning && !isBreak && currentTask) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => Math.max(prev - 1, 0));
        setWorkSecondsSinceBreak((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [isRunning, isBreak, currentTask]);

  // Force a short break after 60 minutes of active work time.
  useEffect(() => {
    if (!isBreak && isRunning && currentTask && workSecondsSinceBreak >= 3600) {
      setSavedTime(secondsLeft);
      setIsBreak(true);
      setIsRunning(false);
      setBreakAfterTaskComplete(false);
      setWorkSecondsSinceBreak(0);
    }
  }, [isBreak, isRunning, currentTask, workSecondsSinceBreak, secondsLeft]);

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

    if (currentTask.status !== "in_progress") return;

    if (!isBreak && secondsLeft <= 0) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setIsRunning(false);
      const isLastTask = currentTaskIndex >= sessionTasks.length - 1;

      if (isLastTask) {
        closeOutCurrentTask("completed");
        setIsBreak(false);
        setBreakAfterTaskComplete(false);
        goToEndSession();
        return;
      }

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
    setWorkSecondsSinceBreak(0);
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
    finalizeTimedOutTask();
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

    closeOutCurrentTask("completed");
    setShowCompleteModal(false);

    setIsBreak(true);
    setBreakAfterTaskComplete(true);
    setIsRunning(false);
    setWorkSecondsSinceBreak(0);
  };

  const handleNeedMoreTimeFromComplete = () => {
    setShowCompleteModal(false);
    setNewTime("5");
    setNewTimeError("");
    setShowAddTimeModal(true);
  };

  const getMinAddOrder = () => {
    const lastCompletedIndex = sessionTasks.reduce(
      (last, task, idx) =>
        task.status === "completed" || task.status === "skipped" ? idx : last,
      -1
    );
    const byCompletion = lastCompletedIndex >= 0 ? lastCompletedIndex + 2 : 1;
    const byProgress = currentTask ? currentTaskIndex + 2 : 1; // must come after current task
    return Math.max(byCompletion, byProgress);
  };

  const handleAddTaskOrderChange = (text: string) => {
    setNewTaskOrder(text);
    const trimmed = text.trim();
    const orderNumber = trimmed ? Number(trimmed) : null;
    const maxPosition = sessionTasks.length + 1;
    const minPosition = getMinAddOrder();

    if (
      orderNumber !== null &&
      (!Number.isInteger(orderNumber) ||
        orderNumber < minPosition ||
        orderNumber > maxPosition)
    ) {
      setNewTaskOrderError(
        `Enter a number ${minPosition} - ${maxPosition} so the new\ntask stays after the current one`
      );
    } else {
      setNewTaskOrderError("");
    }
  };

  const handleAddTask = () => {
    if (!newTaskName.trim() || !newTaskMinutes.trim()) return;

    const minutesVal = Number(newTaskMinutes) || 0;
    if (!Number.isInteger(minutesVal)) {
      setNewTaskMinutesError("Task length must be a whole number");
      return;
    }
    if (minutesVal > 120) {
      setNewTaskMinutesError("Task length cannot exceed 120 minutes");
      return;
    }
    setNewTaskMinutesError("");

    const maxPosition = sessionTasks.length + 1;
    const minPosition = getMinAddOrder();
    const orderNumber = newTaskOrder.trim()
      ? Number(newTaskOrder.trim())
      : maxPosition;

    if (
      !Number.isInteger(orderNumber) ||
      orderNumber < minPosition ||
      orderNumber > maxPosition
    ) {
      setNewTaskOrderError(
        `Enter a number ${minPosition} - ${maxPosition} so the new task stays after the current one`
      );
      return;
    }

    const insertAt = orderNumber - 1;
    const newTask: SessionTask = {
      id: Date.now().toString(),
      name: newTaskName.trim(),
      time: minutesVal * 60,
      status: "pending",
    };

    setSessionTasks((prev) => {
      const updated = [...prev];
      updated.splice(insertAt, 0, newTask);
      return updated;
    });

    setCurrentTaskIndex((prev) => (insertAt <= prev ? prev + 1 : prev));

    setShowAddTaskModal(false);
    setNewTaskName("");
    setNewTaskMinutes("");
    setNewTaskOrder("");
    setNewTaskMinutesError("");
    setNewTaskOrderError("");
  };

  const advanceToNextTask = () => {
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

  const handleConfirmMarkTaskDone = () => {
    if (!currentTask) return;

    closeOutCurrentTask("completed");
    setShowMarkDoneConfirm(false);
    setShowCompleteModal(false);
    setIsBreak(false);
    setBreakAfterTaskComplete(false);

    advanceToNextTask();
  };

  /* SKIP */
  const handleSkipTaskConfirmed = () => {
    if (!currentTask) return;

    closeOutCurrentTask("skipped");
    setShowSkipConfirm(false);
    setShowCompleteModal(false);
    setIsBreak(false);
    setBreakAfterTaskComplete(false);

    advanceToNextTask();
  };

  /* ADD TIME */
  const handleApplyTime = () => {
    const m = Number(newTime);
    if (!m || m <= 0) return;
    if (!Number.isInteger(m)) {
      setNewTimeError("Time must be a whole number");
      return;
    }
    if (m > 120) {
      setNewTimeError("Additional time cannot exceed 120 minutes");
      return;
    }
    setNewTimeError("");
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
  const canAddTime =
    newTime.trim().length > 0 &&
    !newTimeError &&
    Number(newTime) > 0 &&
    Number(newTime) <= 120 &&
    Number.isInteger(Number(newTime));
  const canRenameTask = editedTaskName.trim().length > 0;

  /* ---------------- RENDER ---------------- */

  if (loading) return <PawLoader />;

  return (
    <View style={styles.container}>
      {/* MENU */}
      <View style={styles.menuAnchor}>
        <TouchableOpacity onPress={toggleMenu} hitSlop={12}>
          <Icon name="more-vertical" size={36} tint={palette.iconsStandalone} />
        </TouchableOpacity>
      </View>

      {menuOpen && (
        <Modal
          transparent
          visible
          animationType="fade"
          onRequestClose={() => setMenuOpen(false)}
        >
          <View style={StyleSheet.absoluteFillObject}>
            <Pressable
              style={styles.menuOverlay}
              onPress={() => setMenuOpen(false)}
            />

            <View style={styles.menuAnchor}>
              <View style={styles.menuCard}>
                {(currentTask
                  ? [
                      {
                        label: "Mark task done",
                        onPress: () => {
                          setShowMarkDoneConfirm(true);
                        },
                      },
                      {
                        label: "Add time to task",
                        onPress: () => {
                          setNewTime("");
                          setNewTimeError("");
                          setShowAddTimeModal(true);
                        },
                      },
                      {
                        label: "Add task",
                        onPress: () => {
                          setNewTaskName("");
                          setNewTaskMinutes("");
                          setNewTaskOrder("");
                          setNewTaskMinutesError("");
                          setNewTaskOrderError("");
                          setShowAddTaskModal(true);
                        },
                      },
                      {
                        label: "Skip task",
                        onPress: () => setShowSkipConfirm(true),
                      },
                      {
                        label: "Rename task",
                        onPress: () => {
                          setEditedTaskName(currentTask.name);
                          setShowEditTaskModal(true);
                        },
                      },
                      {
                        label: "View progress",
                        onPress: () => setShowProgressModal(true),
                      },
                      {
                        label: "End session",
                        onPress: () => setShowStopModal(true),
                      },
                    ]
                  : [
                      {
                        label: "View progress",
                        onPress: () => setShowProgressModal(true),
                      },
                    ]
                ).map((opt, idx, arr) => (
                  <View key={opt.label}>
                    <TouchableOpacity
                      onPress={() => {
                        setMenuOpen(false);
                        opt.onPress();
                      }}
                      style={styles.menuItem}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.menuLabel}>{opt.label}</Text>
                    </TouchableOpacity>
                    {idx < arr.length - 1 && (
                      <View style={styles.menuDivider} />
                    )}
                  </View>
                ))}
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* GOAL + TASK */}
      <Animated.View
        style={{
          alignItems: "center",
          paddingTop: theme.spacing.lg,
          opacity: contentOpacity,
        }}
      >
        {sessionGoal ? (
          <>
            <SvgStrokeText
              text="Goal:"
              stroke={palette.header2}
              textStyle={{ color: palette.header2 }}
            ></SvgStrokeText>

            <Text
              variant="h3"
              style={{
                textAlign: "center",
                paddingHorizontal: theme.spacing.lg,
              }}
            >
              {sessionGoal}
            </Text>
          </>
        ) : (
          <>
            <SvgStrokeText
              text="Work session"
              stroke={palette.header2}
              textStyle={{ color: palette.header2 }}
            ></SvgStrokeText>
          </>
        )}

        <Spacer size="md" />

        {currentTask ? (
          <>
            <SvgStrokeText
              text="Task:"
              stroke={palette.header2}
              textStyle={{ color: palette.header2 }}
            ></SvgStrokeText>

            <View style={styles.taskRow}>
              <Text
                variant="h3"
                style={{
                  textAlign: "center",
                  paddingHorizontal: theme.spacing.lg,
                }}
              >
                {isBreak
                  ? "Take a break. You've been working hard."
                  : currentTask.name}
              </Text>
            </View>

            <Spacer size="md" />

            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text variant="body" color="header2">
                Task {taskPosition} of {totalTasks}
              </Text>

              {!isBreak && currentTaskIndex <= sessionTasks.length - 1 && (
                <>
                  <Text variant="body" color="header2">
                    {" • "}
                  </Text>

                  {currentTaskIndex < sessionTasks.length - 1 && (
                    <Pressable onPress={() => setShowSkipConfirm(true)}>
                      <Text
                        variant="body"
                        color="header2"
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
                        color="header2"
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
          <Text variant="h3" weight="bold" color="header2">
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
          <>
            <View style={styles.breakBox}>
              <Text variant="h2" weight="bold" color="header2">
                Break time!
              </Text>
            </View>
            <Spacer size="md" />
            <Text
              variant="body"
              color="header2"
              style={{ textDecorationLine: "underline" }}
              onPress={() => setShowEndBreakConfirm(true)}
            >
              End break
            </Text>
          </>
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
            <Icon name={isRunning ? pauseIcon : playIcon} size={iconSize} />
          </Pressable>
        )}

        <Pressable onPress={() => setShowStopModal(true)}>
          <Icon name={stopIcon} size={iconSize} />
        </Pressable>

        <Pressable
          onPress={() =>
            router.push({
              pathname: "../../chat",
              params: { sessionId: sessionId ?? null, goal: sessionGoal },
            })
          }
        >
          <Icon name={chatIcon} size={iconSize} />
        </Pressable>

        {!isBreak && currentTask && (
          <Pressable onPress={() => setShowStartBreakConfirm(true)}>
            <Icon name={breakIcon} size={iconSize} />
          </Pressable>
        )}
      </View>

      {/* MODALS */}
      <AppModal
        visible={showStopModal}
        onClose={() => setShowStopModal(false)}
        variant="custom"
        title="End session?"
        message={
          "Are you sure you want to end your work session?\n\nYou may also mark the session 'Incomplete' to return to it later."
        }
      >
        <View style={{ width: "100%", marginTop: theme.spacing.lg }}>
          <Button
            variant="ghost"
            label={isSavingForLater ? "Saving..." : "Save session for later"}
            onPress={handleSaveSessionForLater}
            disabled={isSavingForLater}
            style={{ marginBottom: theme.spacing.sm }}
          />
          <Button
            variant="tertiary"
            label="End session"
            onPress={confirmStop}
          />
        </View>
      </AppModal>

      <AppModal
        visible={showStartBreakConfirm}
        onClose={() => setShowStartBreakConfirm(false)}
        variant="alert"
        title="Start a break?"
        message="Pause the current task and take a break."
        cancelLabel="Cancel"
        confirmLabel="Start"
        onConfirm={() => {
          setShowStartBreakConfirm(false);
          handleStartBreak();
        }}
        confirmVariant="brown"
      />

      <AppModal
        visible={showEndBreakConfirm}
        onClose={() => setShowEndBreakConfirm(false)}
        variant="alert"
        title="End break?"
        message="Resume your task and end the break."
        cancelLabel="Cancel"
        confirmLabel="End"
        onConfirm={() => {
          setShowEndBreakConfirm(false);
          handleEndBreak();
        }}
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
        visible={showMarkDoneConfirm}
        onClose={() => setShowMarkDoneConfirm(false)}
        variant="alert"
        title="Mark task done?"
        message="We’ll mark this task complete and move to the next one."
        cancelLabel="Cancel"
        confirmLabel="Done"
        confirmVariant="brown"
        onConfirm={handleConfirmMarkTaskDone}
      />

      <AppModal
        visible={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        variant="bottom-sheet"
        title="Time is up. How did this task go?"
        height={400}
      >
        <Text variant="h3">Task options</Text>
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

        <Spacer size="lg" />

        <Text variant="h3">Session options</Text>
        <Spacer size="sm" />

        <Button
          label="Stop and reflect"
          variant="gold"
          onPress={() => {
            setShowCompleteModal(false);
            router.push({
              pathname: "../chat",
              params: { sessionId: sessionId ?? null, goal: sessionGoal },
            });
          }}
        />
        <Spacer size="sm" />

        <Button
          label="End session"
          variant="tertiary"
          onPress={() => {
            setShowCompleteModal(false);
            setShowStopModal(true);
          }}
        />
      </AppModal>

      <AppModal
        visible={showAddTimeModal}
        onClose={() => {
          setShowAddTimeModal(false);
          setNewTimeError("");
        }}
        variant="bottom-sheet"
        title="Add time to task"
        height={220}
      >
        <InputField
          label="Minutes to add:"
          value={newTime}
          onChangeText={(text) => {
            setNewTime(text);
            const m = Number(text);
            if (!Number.isInteger(m)) {
              setNewTimeError("Time must be a whole number");
            } else if (m > 120) {
              setNewTimeError("Additional time cannot exceed 120 minutes");
            } else {
              setNewTimeError("");
            }
          }}
          placeholder="10"
          keyboardType="numeric"
          row
          error={newTimeError}
        />

        <TouchableOpacity
          onPress={() => {
            if (canAddTime) handleApplyTime();
          }}
          disabled={!canAddTime}
          style={[
            styles.actionCircle,
            styles.actionCircleNeutral,
            styles.smallActionCircle,
            !canAddTime && { opacity: 0.4 },
          ]}
        >
          <Icon name="plus" size={40} tint={palette.background} />
        </TouchableOpacity>
      </AppModal>

      <AppModal
        visible={showAddTaskModal}
        onClose={() => {
          setShowAddTaskModal(false);
          setNewTaskMinutesError("");
          setNewTaskOrderError("");
        }}
        variant="bottom-sheet"
        title="Add a task"
        height={360}
      >
        <InputField
          label="Description*"
          value={newTaskName}
          onChangeText={setNewTaskName}
          placeholder="Tap to input task description"
          multiline
          noBorder
          inputStyle={{
            paddingLeft: 0,
            paddingRight: theme.spacing.md,
            textAlignVertical: "top",
          }}
        />

        <Spacer size="md" />

        <InputField
          label="Length*"
          keyboardType="numeric"
          value={newTaskMinutes}
          onChangeText={(text) => {
            setNewTaskMinutes(text);
            const minutesVal = Number(text) || 0;
            if (!Number.isInteger(minutesVal)) {
              setNewTaskMinutesError("Task length must be a whole number");
            } else if (minutesVal > 120) {
              setNewTaskMinutesError("Task length cannot exceed 120 minutes");
            } else {
              setNewTaskMinutesError("");
            }
          }}
          placeholder="30"
          row
          centered
          inputStyle={{
            paddingLeft: 8,
            transform: [{ translateX: -3 }, { translateY: 1 }],
          }}
          error={newTaskMinutesError}
        />

        <Spacer size="md" />

        <InputField
          keyboardType="numeric"
          value={newTaskOrder}
          onChangeText={handleAddTaskOrderChange}
          placeholder="2"
          row
          small
          centered
          inputStyle={{ paddingLeft: 8, transform: [{ translateX: 3 }] }}
          error={newTaskOrderError}
          label="(Optional) Order number"
        />

        <Spacer size="lg" />

        {(() => {
          const canAddTask =
            newTaskName.trim().length > 0 &&
            newTaskMinutes.trim().length > 0 &&
            !newTaskOrderError &&
            !newTaskMinutesError &&
            Number.isInteger(Number(newTaskMinutes));
          return (
            <TouchableOpacity
              onPress={() => {
                if (canAddTask) handleAddTask();
              }}
              disabled={!canAddTask}
              style={[
                styles.actionCircle,
                styles.actionCircleNeutral,
                styles.smallActionCircle,
                !canAddTask && { opacity: 0.4 },
              ]}
            >
              <Icon name="plus" size={40} tint={palette.background} />
            </TouchableOpacity>
          );
        })()}
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
              labelStyle={done ? styles.completedTaskLabel : undefined}
              containerStyle={{ width: "100%" }}
            />
          );
        })}

        <Spacer size="sm" />

        <Text variant="body" color="secondary">
          {completedCount} of {totalTasks} tasks complete
        </Text>
      </AppModal>

      <AppModal
        visible={showEditTaskModal}
        onClose={() => setShowEditTaskModal(false)}
        variant="bottom-sheet"
        title="Rename task"
        height={270}
      >
        <InputField
          label="Task name"
          value={editedTaskName}
          onChangeText={setEditedTaskName}
          placeholder="Task name"
          style={{ paddingRight: theme.spacing.md }}
        />

        <TouchableOpacity
          onPress={() => {
            if (canRenameTask) handleSaveTaskEdit();
          }}
          disabled={!canRenameTask}
          style={[
            styles.actionCircle,
            styles.actionCircleNeutral,
            styles.smallActionCircle,
            !canRenameTask && { opacity: 0.4 },
          ]}
        >
          <Icon name="check" size={30} tint={palette.background} />
        </TouchableOpacity>
      </AppModal>
    </View>
  );
}

/* STYLES */
function createStyles(
  theme: Theme,
  palette: typeof import("@/design/colors").colors.light
) {
  return StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 65,
      paddingBottom: theme.spacing.lg,
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: palette.background,
    },
    menuAnchor: {
      position: "absolute",
      top: 60,
      right: 20,
      zIndex: 3,
    },
    menuOverlay: {
      position: "absolute",
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 2,
    },
    menuCard: {
      position: "absolute",
      top: 40,
      right: 0,
      backgroundColor: palette.primary,
      borderRadius: theme.radii.lg,
      paddingVertical: theme.spacing.xs,
      minWidth: 200,
      ...theme.shadow.medium,
      zIndex: 4,
      borderWidth: 1,
      borderColor: palette.border,
    },
    menuItem: {
      paddingVertical: theme.spacing.sm + 3,
      paddingHorizontal: theme.spacing.md,
    },
    menuLabel: {
      color: palette.background,
      fontFamily: theme.typography.families.regular,
      fontSize: theme.typography.sizes.md,
    },
    menuDivider: {
      height: 1,
      backgroundColor: palette.background,
      opacity: 0.3,
      marginHorizontal: theme.spacing.sm,
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
      backgroundColor: palette.background,
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.radii.md,
      alignItems: "center",
      minWidth: 250,
      borderWidth: 2,
      borderColor: palette.border,
      ...theme.shadow.soft,
    },
    actionCircle: {
      width: 70,
      height: 70,
      borderRadius: 40,
      alignItems: "center",
      justifyContent: "center",
      ...theme.shadow.medium,
    },

    actionCircleNeutral: {
      backgroundColor: palette.header2,
    },
    smallActionCircle: {
      alignSelf: "flex-end",
      width: 50,
      height: 50,
    },
    completedTaskLabel: {
      color: palette.quote,
    },
  });
}
