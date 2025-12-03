import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { AppModal } from "@/components/ui/AppModal";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Icon } from "@/components/ui/Icon";
import { InputField } from "@/components/ui/InputField";
import { Spacer } from "@/components/ui/Spacer";
import { Text } from "@/components/ui/Text";
import { Timer } from "@/components/ui/Timer";

import SvgStrokeText from "@/components/SvgStrokeText";
import { PawLoader } from "@/components/ui/PawLoader";
import { theme } from "@/design/theme";
import { updateSession } from "@/lib/supabase";

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
  const sessionEndLoggedRef = useRef(false);

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

  const markSessionCompleted = async () => {
    if (!sessionId || sessionEndLoggedRef.current) return;
    sessionEndLoggedRef.current = true;
    try {
      await updateSession(sessionId, {
        completed_at: new Date().toISOString(),
        status: "complete",
      });
    } catch (err) {
      console.error("Failed to mark session complete", err);
    }
  };

  const goToEndSession = () => {
    markSessionCompleted();
    router.push({
      pathname: "./end-session",
      params: {
        goal: sessionGoal,
        tasks: JSON.stringify(sessionTasks),
        sessionId: sessionId ?? null,
      },
    });
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

    closeOutCurrentTask("completed");
    setShowCompleteModal(false);

    setIsBreak(true);
    setBreakAfterTaskComplete(true);
    setIsRunning(false);
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
          <Icon name="more-vertical" size={36} tint={theme.colors.accentDark} />
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
              stroke={theme.colors.accentDark}
              textStyle={{ color: theme.colors.accentDark }}
            ></SvgStrokeText>

            <Text variant="h3">{sessionGoal}</Text>
          </>
        ) : (
          <>
            <SvgStrokeText
              text="Work session"
              stroke={theme.colors.accentDark}
              textStyle={{ color: theme.colors.accentDark }}
            ></SvgStrokeText>
          </>
        )}

        <Spacer size="md" />

        {currentTask ? (
          <>
            <SvgStrokeText
              text="Task:"
              stroke={theme.colors.accentDark}
              textStyle={{ color: theme.colors.accentDark }}
            ></SvgStrokeText>

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
          <>
            <View style={styles.breakBox}>
              <Text variant="h2" weight="bold" color="accentDark">
                Break time!
              </Text>
            </View>
            <Spacer size="md" />
            <Text
              variant="body"
              color="accentDark"
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
            <Icon name={isRunning ? "pause" : "play"} size={iconSize} />
          </Pressable>
        )}

        <Pressable onPress={() => setShowStopModal(true)}>
          <Icon name="stop" size={iconSize} />
        </Pressable>

        <Pressable
          onPress={() =>
            router.push({
              pathname: "../../chat",
              params: { sessionId: sessionId ?? null, goal: sessionGoal },
            })
          }
        >
          <Icon name="chat" size={iconSize} />
        </Pressable>

        {!isBreak && currentTask && (
          <Pressable onPress={() => setShowStartBreakConfirm(true)}>
            <Icon name="break" size={iconSize} />
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
        confirmVariant="gold"
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
          variant="danger"
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
          placeholder="e.g. 10"
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
          <Icon name="plus" size={40} tint={theme.solidColors.white} />
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
          placeholder="00 : 00"
          row
          error={newTaskMinutesError}
        />

        <Spacer size="md" />

        <InputField
          keyboardType="numeric"
          value={newTaskOrder}
          onChangeText={handleAddTaskOrderChange}
          placeholder="e.g. 2"
          row
          small
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
              <Icon name="plus" size={40} tint={theme.solidColors.white} />
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
        title="Rename task"
        height={270}
      >
        <InputField
          label="Task name"
          value={editedTaskName}
          onChangeText={setEditedTaskName}
          placeholder="Task name"
        />

        <TouchableOpacity
          onPress={() => {
            if (canRenameTask) handleSaveTaskEdit();
          }}
          disabled={!canAddTime}
          style={[
            styles.actionCircle,
            styles.actionCircleNeutral,
            styles.smallActionCircle,
            !canAddTime && { opacity: 0.4 },
          ]}
        >
          <Icon name="check" size={30} tint={theme.solidColors.white} />
        </TouchableOpacity>
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
    backgroundColor: theme.colors.background,
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
    backgroundColor: theme.colors.accentDark,
    borderRadius: theme.radii.lg,
    paddingVertical: theme.spacing.xs,
    minWidth: 200,
    ...theme.shadow.medium,
    zIndex: 4,
  },
  menuItem: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  menuLabel: {
    color: theme.solidColors.white,
    fontFamily: theme.typography.families.regular,
    fontSize: theme.typography.sizes.md,
  },
  menuDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
    opacity: 0.6,
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
    backgroundColor: theme.solidColors.white,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radii.md,
    alignItems: "center",
    minWidth: 250,
    borderWidth: 2,
    borderColor: theme.colors.accentDark,
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
    backgroundColor: theme.colors.accentDark,
  },
  smallActionCircle: {
    alignSelf: "flex-end",
    width: 50,
    height: 50,
  },
});
