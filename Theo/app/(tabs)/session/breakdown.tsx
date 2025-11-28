import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import DraggableFlatList, {
  RenderItemParams,
} from "react-native-draggable-flatlist";
import { Swipeable } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppModal } from "@/components/ui/AppModal";
import { BreakdownItem } from "@/components/ui/BreakdownItem";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { InputField } from "@/components/ui/InputField";
import { Spacer } from "@/components/ui/Spacer";
import { StepProgressIndicator } from "@/components/ui/StepProgressIndicator";
import { Text } from "@/components/ui/Text";
import { theme } from "@/design/theme";

type Task = {
  id: string;
  minutes: number;
  text: string;
};

type DeleteMode = "single" | "all" | null;

export default function SessionBreakdownScreen() {
  const { goal } = useLocalSearchParams<{ goal?: string }>();
  const goalText = goal ?? "";

  const [tasks, setTasks] = useState<Task[]>([]);

  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newText, setNewText] = useState("");
  const [newMinutes, setNewMinutes] = useState("");

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteMode, setDeleteMode] = useState<DeleteMode>(null);

  const [showContinueConfirm, setShowContinueConfirm] = useState(false);

  const [editText, setEditText] = useState("");
  const [editMinutes, setEditMinutes] = useState("");

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

    const newItem: Task = {
      id: Date.now().toString(),
      minutes: Number(newMinutes) || 0,
      text: newText.trim(),
    };

    setTasks((prev) => [...prev, newItem]);

    setNewText("");
    setNewMinutes("");
    setShowAddModal(false);
  }

  function confirmContinue() {
    router.push({
      pathname: "./finalize-session",
      params: { tasks: JSON.stringify(tasks), goal: goalText },
    });
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
              <Icon name="more" size={22} tint={theme.solidColors.white} />
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
              <BreakdownItem minutes={item.minutes} text={item.text} />
            </View>
          </View>
        </TouchableOpacity>
      </Swipeable>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* TOP BAR WITH BACK + STEP PROGRESS + MENU */}
      <View style={styles.headerRow}>
        <StepProgressIndicator
          steps={["Setup", "Customize", "Finalize"]}
          activeCount={2}
          style={styles.headerProgress}
          onPressBack={() => router.back()}
          onPressMenu={() => {}}
        />
      </View>

      <Spacer size="md" />

      {/* GOAL ROW */}

      {goalText && (
        <View style={styles.goalRow}>
          <Text variant="h1" color="accentDark" style={styles.goalLabel}>
            GOAL:
          </Text>

          <Text style={styles.goalValue} variant="h3">
            {goalText}
          </Text>
        </View>
      )}

      <Spacer size="sm" />

      <Text variant="h2" color="accentDark" style={styles.taskHeader}>
        Tasks:
      </Text>

      <Spacer size="sm" />

      {/* LIST / EMPTY STATE */}
      <View style={styles.listContainer}>
        {tasks.length === 0 ? (
          <>
            <Spacer size="md" />
            <Button
              label="Create tasks yourself"
              onPress={() => setShowAddModal(true)}
              variant="brown"
              style={styles.primaryActionButton}
            />

            <Spacer size="lg" />

            <Button
              label="Create tasks with AI"
              onPress={() => {
                // TODO: implement AI task generation
              }}
              variant="gold"
              style={styles.primaryActionButton}
            />
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
                onPress={() => {
                  // TODO: implement regenerate tasks
                }}
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

          {/* CONTINUE ROW */}
          <TouchableOpacity
            onPress={confirmContinue}
            style={styles.continueRow}
          >
            <Text variant="h2" style={styles.continueText}>
              Continue
            </Text>
            <Icon
              style={styles.continueArrow}
              name="arrow-right"
              size={100}
              tint={theme.colors.accentDark}
            />
          </TouchableOpacity>
        </View>
      )}

      {/* EDIT MODAL */}
      <AppModal
        visible={!!editingTask}
        onClose={() => setEditingTask(null)}
        variant="bottom-sheet"
        title="Edit Task"
        height={380}
      >
        <InputField
          label="Task description"
          value={editText}
          onChangeText={setEditText}
          placeholder="Describe the task..."
        />

        <InputField
          label="Minutes"
          keyboardType="numeric"
          value={editMinutes}
          onChangeText={setEditMinutes}
          placeholder="e.g. 45"
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
        height={340}
      >
        <InputField
          label="Task description"
          value={newText}
          onChangeText={setNewText}
          placeholder="Describe the task..."
        />

        <InputField
          label="Minutes"
          keyboardType="numeric"
          value={newMinutes}
          onChangeText={setNewMinutes}
          placeholder="e.g. 45"
        />

        <Spacer size="md" />
        <Button label="Add Task" onPress={addTask} />
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
            : "This cannot be undone."
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={confirmDelete}
      />
    </SafeAreaView>
  );
}

/* STYLES */
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
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
    justifyContent: "center",
    paddingHorizontal: theme.spacing.lg,
    flexWrap: "wrap",
  },

  goalLabel: {
    marginRight: theme.spacing.xs,
  },

  goalValue: {
    flexShrink: 1,
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
    marginBottom: theme.spacing.sm,
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
    paddingTop: theme.spacing.lg,
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },

  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
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

  primaryActionButton: {
    alignSelf: "center",
    minWidth: 220,
    paddingVertical: theme.spacing.md,
  },
  swipeActions: {
    flexDirection: "row",
    height: "85%",
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
});
