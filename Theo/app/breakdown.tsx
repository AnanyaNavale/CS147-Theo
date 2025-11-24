// app/breakdown.tsx

import FontAwesome from "@expo/vector-icons/FontAwesome";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState, useRef } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DraggableFlatList, {
  RenderItemParams,
} from "react-native-draggable-flatlist";
import { Swipeable } from "react-native-gesture-handler";

import { Text } from "@/components/ui/Text";
import { Spacer } from "@/components/ui/Spacer";
import { BreakdownItem } from "@/components/ui/BreakdownItem";
import { IconButton } from "@/components/ui/IconButton";
import { AppModal } from "@/components/ui/AppModal";
import { InputField } from "@/components/ui/InputField";
import { Button } from "@/components/ui/Button";
import { theme } from "@/design/theme";

export const unstable_settings = {
  headerShown: false,
};

type Task = {
  id: string;
  minutes: number;
  text: string;
};

const MOCK_TASKS: Task[] = [
  { id: "1", minutes: 60, text: "Complete Week 1 readings" },
  { id: "2", minutes: 60, text: "Complete Week 2 readings" },
  { id: "3", minutes: 60, text: "Complete Week 3 readings" },
  { id: "4", minutes: 45, text: "Review weekly slides & lectures" },
  { id: "5", minutes: 90, text: "Take practice midterm" },
];

export default function SessionBreakdownScreen() {
  const { goal } = useLocalSearchParams<{ goal?: string }>();
  const goalText = goal ?? "";

  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);

  const swipeableRef = useRef<Swipeable | null>(null);

  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newText, setNewText] = useState("");
  const [newMinutes, setNewMinutes] = useState("");

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

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
    setShowDeleteConfirm(true);
  }

  function confirmDeleteTask() {
    if (deleteTargetId) {
      setTasks((prev) => prev.filter((t) => t.id !== deleteTargetId));
    }
    setDeleteTargetId(null);
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

  function handleDeleteAll() {
    setTasks([]);
    setShowDeleteConfirm(false);
  }

  function confirmContinue() {
    setShowContinueConfirm(false);
    router.push({
      pathname: "../(tabs)/session",
      params: { tasks: JSON.stringify(tasks) },
    });
  }

  const renderItem = ({ item, drag, isActive }: RenderItemParams<Task>) => {
    return (
      <Swipeable
        ref={swipeableRef}
        overshootRight={false}
        renderRightActions={() => (
          <View style={styles.swipeActions}>
            <TouchableOpacity
              style={[styles.swipeAction, styles.swipeEdit]}
              onPress={() => {
                swipeableRef.current?.close();
                openEditModal(item);
              }}
            >
              <FontAwesome name="pencil" size={22} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.swipeAction, styles.swipeDelete]}
              onPress={() => {
                swipeableRef.current?.close();
                requestDeleteTask(item.id);
              }}
            >
              <FontAwesome name="trash" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      >
        <TouchableOpacity
          onLongPress={drag}
          onPress={() => openEditModal(item)}
          disabled={isActive}
        >
          <BreakdownItem minutes={item.minutes} text={item.text} />
        </TouchableOpacity>
      </Swipeable>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()}>
          <FontAwesome
            name="arrow-left"
            size={26}
            color={theme.colors.accentDark}
          />
        </TouchableOpacity>

        <Text variant="h2" weight="bold" color="accentDark">
          GOAL:
        </Text>

        <View style={{ width: 26 }} />
      </View>

      <Spacer size="sm" />

      <Text style={styles.goalText} variant="h3" weight="bold">
        {goalText}
      </Text>

      <Spacer size="lg" />

      <Text
        variant="h3"
        weight="bold"
        color="accentDark"
        style={styles.taskHeader}
      >
        Tasks:
      </Text>

      <Spacer size="sm" />

      <View style={styles.listContainer}>
        {tasks.length === 0 ? (
          <Text
            variant="body"
            style={{ textAlign: "center", marginTop: theme.spacing.xl }}
          >
            No tasks added
          </Text>
        ) : (
          <DraggableFlatList
            data={tasks}
            keyExtractor={(item) => item.id}
            onDragEnd={({ data }) => setTasks(data)}
            scrollEnabled
            contentContainerStyle={{ paddingBottom: 20 }}
            renderItem={renderItem}
          />
        )}
      </View>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          onPress={() => setShowAddModal(true)}
          style={styles.addButton}
        >
          <Text style={styles.plus}>+</Text>
        </TouchableOpacity>

        <Spacer size="lg" />

        <View style={styles.actionRow}>
          <IconButton
            label="Regenerate tasks"
            icon="refresh"
            onPress={() => {}}
            style={{ flex: 1 }}
          />

          {tasks.length > 0 && (
            <IconButton
              label="Delete all"
              icon="trash"
              variant="danger"
              onPress={() => setShowDeleteConfirm(true)}
              style={{ flex: 1 }}
            />
          )}
        </View>

        <Spacer size="md" />

        <TouchableOpacity
          onPress={() => setShowContinueConfirm(true)}
          style={styles.continueArrow}
        >
          <FontAwesome
            name="long-arrow-right"
            size={34}
            color={theme.colors.accentDark}
          />
        </TouchableOpacity>
      </View>

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
        />

        <InputField
          label="Minutes"
          value={editMinutes}
          onChangeText={setEditMinutes}
        />

        <Spacer size="md" />

        <View style={styles.editButtonRow}>
          <Button label="Save Task" onPress={saveEdit} />

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
        />

        <InputField
          label="Minutes"
          keyboardType="numeric"
          value={newMinutes}
          onChangeText={setNewMinutes}
        />

        <Spacer size="md" />
        <Button label="Add Task" onPress={addTask} />
      </AppModal>

      {/* DELETE CONFIRM */}
      <AppModal
        visible={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setDeleteTargetId(null);
        }}
        variant="alert"
        title="Delete task?"
        message="This cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={confirmDeleteTask}
      />

      {/* CONTINUE CONFIRM */}
      <AppModal
        visible={showContinueConfirm}
        onClose={() => setShowContinueConfirm(false)}
        variant="alert"
        title="Start session?"
        message="Are you sure you want to begin?"
        confirmLabel="Start"
        cancelLabel="Cancel"
        onConfirm={confirmContinue}
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
  },

  taskHeader: { paddingLeft: theme.spacing.lg },

  goalText: {
    textAlign: "center",
    paddingHorizontal: theme.spacing.md,
    lineHeight: 28,
  },

  listContainer: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },

  bottomBar: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },

  addButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: theme.colors.accentDark,
    ...theme.shadow.medium,
  },

  plus: {
    fontSize: 46,
    color: theme.solidColors.white,
  },

  actionRow: {
    flexDirection: "row",
    gap: theme.spacing.md,
  },

  continueArrow: {
    alignSelf: "flex-end",
  },

  swipeActions: {
    flexDirection: "row",
    height: "93%",
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
  },
});
