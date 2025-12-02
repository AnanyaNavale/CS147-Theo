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
import { createSession, createTask } from "@/lib/supabase";
import { useSupabase } from "@/providers/SupabaseProvider";

type Task = {
  id: string;
  minutes: number;
  text: string;
};

type DeleteMode = "single" | "all" | null;
const teddy = require("../../../assets/theo/waving.png");

export default function SessionBreakdownScreen() {
  const { goal } = useLocalSearchParams<{ goal?: string }>();
  const initialGoal = goal ?? "";
  const { session: authSession } = useSupabase();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [goalInput, setGoalInput] = useState(initialGoal);

  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newText, setNewText] = useState("");
  const [newMinutes, setNewMinutes] = useState("");
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
    setTasks((prev) =>
      prev.map((t) =>
        t.id === editingTask.id
          ? {
              ...t,
              text: editText.trim(),
              minutes: Number(editMinutes) || 0,
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

    const newItem: Task = {
      id: Date.now().toString(),
      minutes: Number(newMinutes) || 0,
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

  async function confirmContinue() {
    let sessionId: string | undefined = undefined;

    if (authSession?.user) {
      setPersisting(true);
      setPersistError(null);
      try {
        const session = await createSession(
          authSession.user.id,
          !!goalInput,
          goalInput || null,
          tasks.length > 0
        );
        sessionId = session.id;

        if (tasks.length > 0) {
          const ordered = tasks.map((t, idx) => ({
            session_id: session.id,
            task_name: t.text,
            order_index: idx + 1,
            time_allotted: t.minutes,
            is_completed: false,
          }));

          for (const payload of ordered) {
            await createTask(payload as any);
          }
        }
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Failed to save tasks.";
        setPersistError(msg);
      } finally {
        setPersisting(false);
      }
    }

    const nextRoute = {
      pathname: "./finalize-session",
      params: {
        tasks: JSON.stringify(tasks),
        goal: goalInput,
        sessionId,
      },
    } as const;

    router.push(nextRoute);
  }

  const renderItem = ({
    item,
    drag,
    isActive,
    getIndex,
  }: RenderItemParams<Task>) => {
    // Use the current list position so numbering stays sequential after reordering
    const position = getIndex?.() ?? 0;
    const taskNumber = position + 1;

    return (
      <Swipeable
        overshootRight={false}
        renderRightActions={() => (
          <View style={styles.swipeActions}>
            <TouchableOpacity
              style={[styles.swipeAction, styles.swipeEdit]}
              onPress={() => openEditModal(item)}
            >
              <Icon name="pencil" size={22} tint={theme.solidColors.white} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.swipeAction, styles.swipeDelete]}
              onPress={() => requestDeleteTask(item.id)}
            >
              <Icon name="trash" size={22} tint={theme.solidColors.white} />
            </TouchableOpacity>
          </View>
        )}
      >
        <TouchableOpacity
          onLongPress={drag}
          onPress={() => openEditModal(item)}
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
                onDelete={() => requestDeleteTask(item.id)}
              />
            </View>
          </View>
        </TouchableOpacity>
      </Swipeable>
    );
  };

  const deleteTargetText =
    deleteTargetId && tasks.find((task) => task.id === deleteTargetId)?.text;

  return (
    <SafeAreaView style={styles.safe}>
      {/* TOP BAR WITH BACK + STEP PROGRESS + MENU */}
      <View style={styles.headerRow}>
        <StepProgressIndicator
          steps={["Setup", "Customize", "Finalize"]}
          activeCount={2}
          style={styles.headerProgress}
          onPressMenu={() => {}}
        />
      </View>

      <Spacer size="md" />

      {/* GOAL ROW */}

      <View style={styles.goalRow}>
        <Text variant="h1" color="accentDark" style={styles.goalLabel}>
          GOAL:
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

      <Spacer size="xxl" />
      {tasks.length === 0 && (
        <>
          {goalInput ? (
            <SvgStrokeText
              text={"Would you like to set\nsome tasks for your goal?"}
            />
          ) : (
            <SvgStrokeText
              text={"Would you like to create\ntasks for this session?"}
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
          containerStyle={{ alignSelf: "flex-start" }}
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
              <Text color="mutedText" style={styles.aiStatus}>
                {isGenerating ? "Generating tasks..." : "Saving tasks..."}
              </Text>
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
      {tasks.length === 0 && !isGenerating && (
        <ArrowAction label="Skip" onPress={confirmContinue} />
      )}
      {tasks.length > 0 && !isGenerating && (
        <ArrowAction
          label={persisting ? "Saving..." : "Continue"}
          onPress={persisting ? undefined : confirmContinue}
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
          noBorder={true}
        />

        <InputField
          label="Length*"
          keyboardType="numeric"
          value={editMinutes}
          onChangeText={setEditMinutes}
          placeholder="00 : 00"
          row
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
        title="Add Task"
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
        />

        <Spacer size="md" />

        <InputField
          label="Length*"
          keyboardType="numeric"
          value={newMinutes}
          onChangeText={setNewMinutes}
          placeholder="00 : 00"
          row
        />

        <Spacer size="md" />

        <InputField
          keyboardType="numeric"
          value={newOrder}
          onChangeText={(text) => {
            setNewOrder(text);
            setNewOrderError("");
          }}
          placeholder="e.g. 2"
          row
          small
          error={newOrderError}
          label="(Optional) Order number"
        />

        <Spacer size="lg" />

        {(() => {
          const canAdd =
            newText.trim().length > 0 &&
            newMinutes.trim().length > 0 &&
            !newOrderError;
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
  },
  goalInputContainer: {
    marginBottom: 0,
  },
  goalInput: {
    textAlignVertical: "center",
  },

  taskHeader: {
    paddingLeft: theme.spacing.lg,
  },

  goalText: {
    textAlign: "center",
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
    marginBottom: theme.spacing.md,
  },

  taskIndexCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: theme.colors.accentDark,
    alignItems: "center",
    justifyContent: "center",
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
    paddingTop: theme.spacing.xl,
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
