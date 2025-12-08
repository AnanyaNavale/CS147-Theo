import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import DraggableFlatList, {
  RenderItemParams,
} from "react-native-draggable-flatlist";
import { Swipeable } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "@/assets/themes/colors";
import { fonts } from "@/assets/themes/typography";
import { BasicButton } from "@/components/BasicButton";
import SvgStrokeText from "@/components/SvgStrokeText";
import { AppModal } from "@/components/ui/AppModal";
import { ArrowAction } from "@/components/ui/ArrowAction";
import { BreakdownItem } from "@/components/ui/BreakdownItem";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { InputField } from "@/components/ui/InputField";
import { PawLoader } from "@/components/ui/PawLoader";
import { Spacer } from "@/components/ui/Spacer";
import { StepProgressIndicator } from "@/components/ui/StepProgressIndicator";
import { Text } from "@/components/ui/Text";
import { theme } from "@/design/theme";
import { generateTasksWithAI } from "@/lib/ai";

type Task = {
  id: string;
  minutes: number;
  text: string;
  completed?: boolean;
};

type DeleteMode = "single" | "all" | null;
const teddy = require("../../../assets/theo/waving.png");

export default function SessionBreakdownScreen() {
  const {
    goal,
    tasks: tasksParam,
    sessionId,
  } = useLocalSearchParams<{
    goal?: string | string[];
    tasks?: string | string[];
    sessionId?: string | string[];
  }>();
  const goalParam = Array.isArray(goal) ? goal[0] : goal;
  const tasksParamValue = Array.isArray(tasksParam)
    ? tasksParam[0]
    : tasksParam;
  const sessionIdParam = Array.isArray(sessionId) ? sessionId[0] : sessionId;
  const initialGoal = goalParam ?? "";

  const [tasks, setTasks] = useState<Task[]>(() => {
    if (!tasksParamValue) return [];
    try {
      const parsed = JSON.parse(tasksParamValue);
      if (!Array.isArray(parsed)) return [];

      return parsed
        .map((t) => ({
          id: String(t.id ?? `temp-${Math.random().toString(36).slice(2)}`),
          text: typeof t.text === "string" ? t.text : "",
          minutes: Number(t.minutes) || 0,
          completed: Boolean(t.completed),
        }))
        .filter((t) => t.text.trim().length > 0 || t.minutes > 0);
    } catch (err) {
      console.error("Failed to parse tasks param:", err);
      return [];
    }
  });
  const [goalInput, setGoalInput] = useState(initialGoal);
  const [showMarkIncomplete, setShowMarkIncomplete] = useState(false);
  const [markIncompleteId, setMarkIncompleteId] = useState<string | null>(null);

  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newText, setNewText] = useState("");
  const [newMinutes, setNewMinutes] = useState("");
  const [newMinutesError, setNewMinutesError] = useState("");
  const [newOrder, setNewOrder] = useState("");
  const [newOrderError, setNewOrderError] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [persisting, setPersisting] = useState(false);
  const [persistError, setPersistError] = useState<string | null>(null);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteMode, setDeleteMode] = useState<DeleteMode>(null);

  const [editText, setEditText] = useState("");
  const [editMinutes, setEditMinutes] = useState("");
  const [editMinutesError, setEditMinutesError] = useState("");

  const { width, height } = useWindowDimensions();
  const isCompact = width < 360 || height < 720;
  const baseTeddySize = isCompact ? 170 : 220;
  const arrowFootprint = 160; // approx width of ArrowAction (text + icon)
  const horizontalMargin = theme.spacing.md * 2;
  const maxTeddyWidth = Math.max(
    140,
    width - arrowFootprint - horizontalMargin
  );
  const maxTeddyHeight = Math.max(140, height * 0.35);
  const teddySize = Math.min(baseTeddySize, maxTeddyWidth, maxTeddyHeight);

  function openEditModal(task: Task) {
    setEditingTask(task);
    setEditText(task.text);
    setEditMinutes(String(task.minutes));
    setEditMinutesError("");
  }

  function requestDeleteTask(id: string) {
    setDeleteTargetId(id);
    setDeleteMode("single");
    setShowDeleteConfirm(true);
  }

  function requestDeleteAll() {
    setDeleteTargetId(null);
    setDeleteMode("all");
    setShowDeleteConfirm(true);
  }

  function confirmDelete() {
    if (deleteMode === "single" && deleteTargetId) {
      setTasks((prev) => prev.filter((t) => t.id !== deleteTargetId));
    } else if (deleteMode === "all") {
      setTasks([]);
    }

    setDeleteTargetId(null);
    setDeleteMode(null);
    setShowDeleteConfirm(false);
  }

  function saveEdit() {
    if (!editingTask) return;
    const minutesVal = Number(editMinutes) || 0;
    if (!Number.isInteger(minutesVal)) {
      setEditMinutesError("Task length must be a whole number");
      return;
    }
    if (minutesVal > 120) {
      setEditMinutesError("Task length cannot exceed 120 minutes");
      return;
    }
    setEditMinutesError("");
    setTasks((prev) =>
      prev.map((t) =>
        t.id === editingTask.id
          ? {
              ...t,
              text: editText.trim(),
              minutes: minutesVal,
            }
          : t
      )
    );
    setEditingTask(null);
  }

  function addTask() {
    if (!newText.trim() || !newMinutes.trim()) return;

    const orderNumber = newOrder.trim() ? Number(newOrder) : null;
    const maxPosition = tasks.length + 1;

    if (
      orderNumber !== null &&
      (!Number.isInteger(orderNumber) ||
        orderNumber < 1 ||
        orderNumber > maxPosition)
    ) {
      setNewOrderError(`The valid order numbers are 1 to ${maxPosition}`);
      return;
    }

    const minutesVal = Number(newMinutes) || 0;
    if (!Number.isInteger(minutesVal)) {
      setNewMinutesError("Task length must be a whole number");
      return;
    }
    if (minutesVal > 120) {
      setNewMinutesError("Task length cannot exceed 120 minutes");
      return;
    }
    setNewMinutesError("");

    const newItem: Task = {
      id: Date.now().toString(),
      minutes: minutesVal,
      text: newText.trim(),
    };

    setTasks((prev) => {
      if (orderNumber == null) return [...prev, newItem];
      const insertAt = Math.max(0, Math.min(orderNumber - 1, prev.length));
      const updated = [...prev];
      updated.splice(insertAt, 0, newItem);
      return updated;
    });

    setNewText("");
    setNewMinutes("");
    setNewOrder("");
    setNewMinutesError("");
    setNewOrderError("");
    setShowAddModal(false);
  }

  async function generateAiTasks() {
    if (isGenerating) return;
    setAiError(null);
    setIsGenerating(true);
    try {
      const aiTasks = await generateTasksWithAI(goalInput || "");
      if (aiTasks.length === 0) {
        setAiError("Could not generate tasks. Try again.");
      } else {
        setTasks(
          aiTasks.map((t, idx) => ({
            id: `${Date.now()}-${idx}`,
            text: t.text,
            minutes: t.minutes,
          }))
        );
      }
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Task generation failed.";
      setAiError(msg);
    } finally {
      setIsGenerating(false);
    }
  }

  function confirmContinue() {
    router.push({
      pathname: "./finalize-session",
      params: {
        tasks: JSON.stringify(tasks),
        goal: goalInput,
        sessionId: sessionIdParam ?? undefined,
      },
    });
  }

  const renderItem = ({
    item,
    drag,
    isActive,
    getIndex,
  }: RenderItemParams<Task>) => {
    let swipeableRef: Swipeable | null = null;
    const closeSwipe = () => swipeableRef?.close();

    // Use the current list position so numbering stays sequential after reordering
    const position = getIndex?.() ?? 0;
    const taskNumber = position + 1;
    const isCompleted = Boolean(item.completed);

    const taskContent = (
      <TouchableOpacity
        onLongPress={isCompleted ? undefined : drag}
        onPress={() => {
          if (item.completed) {
            setMarkIncompleteId(item.id);
            setShowMarkIncomplete(true);
          } else {
            openEditModal(item);
          }
        }}
        disabled={isActive}
      >
        <View style={styles.taskRow}>
          <View style={styles.taskIndexCircle}>
            <Text style={styles.taskIndexText}>{taskNumber}</Text>
          </View>

          <View style={{ flex: 1 }}>
            <BreakdownItem
              minutes={item.minutes}
              text={item.text}
              completed={item.completed}
              onDelete={() => requestDeleteTask(item.id)}
            />
          </View>
        </View>
      </TouchableOpacity>
    );

    if (isCompleted) {
      return taskContent;
    }

    return (
      <Swipeable
        ref={(ref) => {
          swipeableRef = ref;
        }}
        overshootRight={false}
        renderRightActions={() => (
          <View style={styles.swipeActions}>
            <TouchableOpacity
              style={[styles.swipeAction, styles.swipeEdit]}
              onPress={() => {
                closeSwipe();
                if (item.completed) {
                  setMarkIncompleteId(item.id);
                  setShowMarkIncomplete(true);
                } else {
                  openEditModal(item);
                }
              }}
            >
              <Icon name="pencil" size={22} tint={theme.solidColors.white} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.swipeAction, styles.swipeDelete]}
              onPress={() => {
                closeSwipe();
                requestDeleteTask(item.id);
              }}
            >
              <Icon name="trash" size={22} tint={theme.solidColors.white} />
            </TouchableOpacity>
          </View>
        )}
      >
        {taskContent}
      </Swipeable>
    );
  };

  const deleteTargetText =
    deleteTargetId && tasks.find((task) => task.id === deleteTargetId)?.text;
  const markIncompleteText =
    markIncompleteId &&
    tasks.find((task) => task.id === markIncompleteId)?.text;
  let helpMessages;

  if (tasks.length === 0) {
    if (!goal) {
      // Case 1: no tasks + no goal
      helpMessages = {
        helpMessagept1:
          "Here, you may begin working in the Task Manager with manual input of tasks. Select 'Create your tasks' to manually add task descriptions and timings.",
      };
    } else {
      // Case 2: no tasks + has goal
      helpMessages = {
        helpMessagept1:
          "Here, you may select whether you would like to begin working in the Task Manager with manual input of tasks, or request AI help in generating tasks based on your goal.\n",
        helpMessagept2:
          "Select 'Create your tasks' to manually add task descriptions and timings. You may also select 'Create tasks with AI' to get AI suggestions based on your goal.",
      };
    }
  } else {
    // Case 3: has tasks
    helpMessages = {
      helpMessagept1:
        "Here, you may continue adding tasks to your work session or plan. Use the buttons in the lower bar to add tasks, regenerate tasks using AI, or delete all tasks.\n",
      helpMessagept2:
        "Swipe left on tasks to make individual edits to their description and timing or delete the selected task. Drag tasks to reorder them.\n\nWhen you are satisfied with your session, select 'Continue' to proceed.",
    };
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* TOP BAR WITH BACK + STEP PROGRESS + MENU */}
      <View style={styles.headerRow}>
        <StepProgressIndicator
          steps={["Setup", "Customize", "Finalize"]}
          activeCount={2}
          style={styles.headerProgress}
          onPressMenu={() => {}}
          {...helpMessages}
        />
      </View>

      <Spacer size="md" />

      {/* GOAL ROW */}

      <View style={styles.goalRow}>
        <Text variant="h1" color="accentDark" style={styles.goalLabel}>
          Goal:
        </Text>

        <View style={styles.goalInputWrapper}>
          <InputField
            value={goalInput}
            onChangeText={setGoalInput}
            placeholder="Tap to input your goal"
            textAlignVertical="center"
            numberOfLines={1}
            multiline={false}
            width="100%"
            containerStyle={styles.goalInputContainer}
            inputStyle={styles.goalInput}
          />
        </View>
      </View>

      <Spacer size="md" />
      {tasks.length === 0 && (
        <>
          {goalInput ? (
            <SvgStrokeText
              text={"Would you like to set\nsome tasks for your goal?"}
              containerStyle={{ alignSelf: "center", marginTop: "10%" }}
            />
          ) : (
            <SvgStrokeText
              text={"Would you like to create\ntasks for this session?"}
              containerStyle={{ alignSelf: "center", marginTop: "10%" }}
            />
          )}

          <Image
            source={teddy}
            style={[styles.teddy, { width: teddySize, height: teddySize }]}
          />
        </>
      )}
      {tasks.length > 0 && (
        <SvgStrokeText
          text={"Tasks: "}
          textStyle={{
            color: colors.light.header2,
            fontSize: fonts.sizes.header2,
          }}
          stroke={colors.light.header2}
          containerStyle={{
            //alignSelf: "flex-start",
            marginLeft: theme.spacing.sm + 4,
          }}
        />
      )}

      <Spacer size="sm" />

      {/* LIST / EMPTY STATE */}
      <View style={styles.listContainer}>
        {tasks.length === 0 ? (
          <>
            <Spacer size="md" />
            <BasicButton
              text="Create your tasks"
              onPress={() => setShowAddModal(true)}
              style={styles.primaryActionButton}
            />

            <Spacer size="lg" />

            {goalInput && (
              <>
                <BasicButton
                  text="Create tasks with AI"
                  iconName="ai"
                  iconSize={24}
                  onPress={generateAiTasks}
                  variant="secondary"
                  style={styles.primaryActionButton}
                />

                {aiError && (
                  <Text color="danger" style={styles.aiStatus}>
                    {aiError}
                  </Text>
                )}

                {persistError && (
                  <Text color="danger" style={styles.aiStatus}>
                    {persistError}
                  </Text>
                )}

                {(isGenerating || persisting) && (
                  <Text color="accentDark" style={styles.aiStatus}>
                    {isGenerating ? "Generating tasks..." : "Saving tasks..."}
                  </Text>
                )}
              </>
            )}
          </>
        ) : (
          <DraggableFlatList
            data={tasks}
            keyExtractor={(item) => item.id}
            onDragEnd={({ data }) => setTasks(data)}
            scrollEnabled
            contentContainerStyle={{ paddingBottom: 24 }}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {tasks.length > 0 && persistError && (
        <Text color="danger" style={styles.aiStatus}>
          {persistError}
        </Text>
      )}

      {/* SKIP ROW FOR EMPTY STATE */}
      {tasks.length === 0 && !isGenerating && goalInput && (
        <ArrowAction label="Skip" onPress={confirmContinue} />
      )}
      {tasks.length > 0 && !isGenerating && (
        <ArrowAction
          label={persisting ? "Saving..." : "Continue"}
          onPress={persisting ? () => {} : confirmContinue}
        />
      )}

      {/* BOTTOM ACTIONS + CONTINUE */}
      {tasks.length > 0 && (
        <View style={styles.bottomBar}>
          {/* ACTION ROW WITH THREE CIRCLES */}
          <View style={styles.actionsRow}>
            {/* Add task */}
            <View style={styles.actionItem}>
              <TouchableOpacity
                onPress={() => setShowAddModal(true)}
                style={[styles.actionCircle, styles.actionCircleNeutral]}
              >
                <Icon name="plus" size={40} tint={theme.solidColors.white} />
              </TouchableOpacity>
              <Text variant="small" weight="bold" style={styles.actionLabel}>
                Add task
              </Text>
            </View>

            {/* Regenerate */}
            <View style={styles.actionItem}>
              <TouchableOpacity
                onPress={generateAiTasks}
                style={[styles.actionCircle, styles.actionCircleGold]}
              >
                <Icon name="refresh" size={35} tint={theme.solidColors.white} />
              </TouchableOpacity>
              <Text
                variant="small"
                weight="bold"
                style={[styles.actionLabel, styles.goldText]}
              >
                Regenerate tasks
              </Text>
            </View>

            {/* Delete all */}
            <View style={styles.actionItem}>
              <TouchableOpacity
                onPress={requestDeleteAll}
                style={[styles.actionCircle, styles.actionCircleDanger]}
              >
                <Icon name="trash" size={35} tint={theme.solidColors.white} />
              </TouchableOpacity>
              <Text
                variant="small"
                weight="bold"
                style={[styles.actionLabel, { color: theme.colors.danger }]}
              >
                Delete all
              </Text>
            </View>
          </View>

          <Spacer size="lg" />
        </View>
      )}

      {/* EDIT MODAL */}
      <AppModal
        visible={!!editingTask}
        onClose={() => setEditingTask(null)}
        variant="bottom-sheet"
        title="Edit Task"
        height={340}
      >
        <InputField
          label="Description*"
          value={editText}
          onChangeText={setEditText}
          placeholder="Tap to input task description"
          noBorder
        />

        <InputField
          label="Length (minutes)*"
          keyboardType="numeric"
          value={editMinutes}
          onChangeText={(text) => {
            setEditMinutes(text);
            const minutesVal = Number(text) || 0;
            if (!Number.isInteger(minutesVal)) {
              setEditMinutesError("Task length must be a whole number");
            } else if (minutesVal > 120) {
              setEditMinutesError("Task length cannot exceed 120 minutes");
            } else {
              setEditMinutesError("");
            }
          }}
          placeholder="30"
          row
          error={editMinutesError}
        />

        <Spacer size="md" />

        <View style={styles.editButtonRow}>
          <View style={styles.editButton}>
            <Button label="Save Task" onPress={saveEdit} />
          </View>

          <View style={styles.editButton}>
            <Button
              label="Delete Task"
              variant="danger"
              onPress={() => {
                if (editingTask) {
                  requestDeleteTask(editingTask.id);
                  setEditingTask(null);
                }
              }}
            />
          </View>
        </View>
      </AppModal>

      {/* ADD TASK */}
      <AppModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        variant="bottom-sheet"
        title="Add a task"
        height={420}
        //contentStyle={styles.taskModalContent}
        //hideCloseButton
      >
        <InputField
          label="Description*"
          value={newText}
          onChangeText={setNewText}
          placeholder="Tap to input task description"
          multiline
          noBorder
          inputStyle={{
            // paddingLeft: theme.spacing.md + 6, // shift placeholder slightly right
            paddingRight: theme.spacing.md,
            textAlignVertical: "top",
          }}
        />

        <Spacer size="md" />

        <InputField
          label="Length (minutes)*"
          keyboardType="numeric"
          value={newMinutes}
          onChangeText={(text) => {
            setNewMinutes(text);
            const minutesVal = Number(text) || 0;
            if (!Number.isInteger(minutesVal)) {
              setNewMinutesError("Task length must be a whole number");
            } else if (minutesVal > 120) {
              setNewMinutesError("Task length cannot exceed 120 minutes");
            } else {
              setNewMinutesError("");
            }
          }}
          placeholder="30"
          row
          centered
          inputStyle={{
            paddingTop: -3,
            paddingLeft: 8,
            transform: [
              { translateY: -5 },
              { translateX: -3 },
              { translateY: 1 },
            ],
          }}
          error={newMinutesError}
        />

        <Spacer size="md" />

        <InputField
          keyboardType="numeric"
          value={newOrder}
          onChangeText={(text) => {
            setNewOrder(text);
            const trimmed = text.trim();
            const orderNumber = trimmed ? Number(trimmed) : null;
            const maxPosition = tasks.length + 1;

            if (
              orderNumber !== null &&
              (!Number.isInteger(orderNumber) ||
                orderNumber < 1 ||
                orderNumber > maxPosition)
            ) {
              setNewOrderError(
                `You currently have ${tasks.length} task${
                  tasks.length === 1 ? "" : "s"
                }, please \nenter a number between 1 and ${maxPosition}`
              );
            } else {
              setNewOrderError("");
            }
          }}
          placeholder={`${tasks.length + 1}`}
          row
          small
          centered
          inputStyle={{ paddingTop: 2, paddingLeft: 8 }}
          error={newOrderError}
          label="(Optional) Order number"
        />

        <Spacer size="lg" />

        {(() => {
          const canAdd =
            newText.trim().length > 0 &&
            newMinutes.trim().length > 0 &&
            !newOrderError &&
            !newMinutesError &&
            Number.isInteger(Number(newMinutes));
          return (
            <TouchableOpacity
              onPress={() => {
                if (canAdd) addTask();
              }}
              disabled={!canAdd}
              style={[
                styles.actionCircle,
                styles.actionCircleNeutral,
                styles.smallActionCircle,
                !canAdd && { opacity: 0.4 },
              ]}
            >
              <Icon name="plus" size={40} tint={theme.solidColors.white} />
            </TouchableOpacity>
          );
        })()}
      </AppModal>

      {/* DELETE CONFIRM (single or all) */}
      <AppModal
        visible={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setDeleteTargetId(null);
          setDeleteMode(null);
        }}
        variant="alert"
        title={deleteMode === "all" ? "Delete all tasks?" : "Delete task?"}
        message={
          deleteMode === "all"
            ? "This will remove every task in your list."
            : `Task: ${
                deleteTargetText ?? "this task"
              } \n \nThis cannot be undone.`
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={confirmDelete}
      />

      <AppModal
        visible={showMarkIncomplete}
        onClose={() => {
          setShowMarkIncomplete(false);
          setMarkIncompleteId(null);
        }}
        variant="alert"
        title={`Mark as\nincomplete?`}
        message={`Task: ${
          markIncompleteText ?? "this task"
        }\n\nMarking incomplete will return it to your list.`}
        cancelLabel="Cancel"
        confirmLabel="Confirm"
        confirmVariant="gold"
        onConfirm={() => {
          if (!markIncompleteId) return;
          setTasks((prev) =>
            prev.map((t) =>
              t.id === markIncompleteId ? { ...t, completed: false } : t
            )
          );
          setShowMarkIncomplete(false);
          setMarkIncompleteId(null);
        }}
      />

      {isGenerating && (
        <View style={styles.loaderOverlay}>
          <PawLoader message="Theo is thinking of tasks..." />
        </View>
      )}
    </SafeAreaView>
  );
}

/* STYLES */
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  prompt: {
    textAlign: "center",
    fontFamily: theme.typography.families.serif,
    fontSize: theme.typography.sizes.xl,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerProgress: {
    flex: 1,
    marginHorizontal: theme.spacing.lg,
    paddingHorizontal: 0,
  },

  goalRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg,
    flexWrap: "wrap",
  },

  goalLabel: {
    marginRight: theme.spacing.xs,
  },

  goalValue: {
    flexShrink: 1,
  },
  goalInputWrapper: {
    flex: 1,
    marginLeft: theme.spacing.sm,
    justifyContent: "center",
  },
  goalInputContainer: {
    marginBottom: 0,
    paddingBottom: 0,
  },
  goalInput: {
    textAlignVertical: "center",
    paddingRight: theme.spacing.md,
  },

  taskHeader: {
    paddingLeft: theme.spacing.lg,
  },

  goalText: {
    textAlign: "left",
    paddingHorizontal: theme.spacing.md,
    lineHeight: 28,
  },

  listContainer: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },

  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },

  taskIndexCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: theme.colors.accentDark,
    alignItems: "center",
    marginRight: theme.spacing.md,
  },

  goldText: {
    color: theme.colors.accent,
  },
  taskIndexText: {
    color: theme.colors.accentDark,
  },

  bottomBar: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    backgroundColor: theme.colors.background,
    shadowColor: theme.colors.accentDark,
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: -6 },
    elevation: 8,
  },

  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: theme.spacing.xxl,
  },

  actionItem: {
    flex: 1,
    alignItems: "center",
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

  actionCircleGold: {
    backgroundColor: theme.colors.accent,
  },

  actionCircleDanger: {
    backgroundColor: theme.colors.danger,
  },

  actionLabel: {
    marginTop: theme.spacing.sm,
    color: theme.colors.accentDark,
    textAlign: "center",
  },

  continueRow: {
    position: "absolute",
    bottom: theme.spacing.lg,
    right: theme.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: theme.spacing.md,
  },

  continueText: {
    color: theme.colors.text,
  },

  continueArrow: {
    marginVertical: -35,
  },
  aiStatus: {
    marginTop: theme.spacing.sm,
    textAlign: "center",
  },

  primaryActionButton: {
    alignSelf: "center",
  },

  bottomButton: {
    alignSelf: "center",
    position: "absolute",
    bottom: theme.spacing.xl * 2,
  },

  swipeActions: {
    flexDirection: "row",
    alignSelf: "stretch",
    marginBottom: theme.spacing.md,
    borderRadius: theme.radii.lg,
    overflow: "hidden",
  },

  swipeAction: {
    width: 72,
    justifyContent: "center",
    alignItems: "center",
  },

  swipeEdit: {
    backgroundColor: theme.colors.accent,
  },

  swipeDelete: {
    backgroundColor: theme.colors.danger,
  },

  editButtonRow: {
    flexDirection: "row",
    gap: theme.spacing.md,
    width: "100%",
  },

  editButton: {
    flex: 1,
  },
  smallActionCircle: {
    alignSelf: "flex-end",
    width: 50,
    height: 50,
  },

  taskModalContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  modalHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing.md,
  },
  modalTitle: {
    fontFamily: theme.typography.families.serif,
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.text,
  },
  closeGlyph: {
    fontSize: 28,
    color: theme.colors.accentDark,
    fontFamily: theme.typography.families.serif,
  },
  modalField: {
    gap: theme.spacing.xs,
  },
  rowField: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalLabel: {
    fontFamily: theme.typography.families.regular,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.accentDark,
  },
  teddy: {
    position: "absolute",
    left: theme.spacing.sm,
    bottom: theme.spacing.xl,
    resizeMode: "contain",
    zIndex: -1,
  },
  loaderOverlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: theme.solidColors.white,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.spacing.lg,
  },
});
