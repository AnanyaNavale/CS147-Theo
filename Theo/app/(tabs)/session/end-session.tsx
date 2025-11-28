import { router } from "expo-router";
import React, { useState } from "react";
import { Image, ScrollView, StyleSheet, View } from "react-native";

import { Spacer, Text } from "@/components";
import { AppModal } from "@/components/ui/AppModal";
import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";
import { colors } from "@/assets/themes/colors";
import { fonts } from "@/assets/themes/typography";
import { theme } from "@/design/theme";
import { TASKS, Task } from "./tasks";

export default function EndSessionScreen() {
  const [showExitModal, setShowExitModal] = useState(false);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);

  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskTime, setNewTaskTime] = useState("");

  const [newTaskNameError, setNewTaskNameError] = useState("");
  const [newTaskTimeError, setNewTaskTimeError] = useState("");

  const recentTasks = TASKS.slice(-2); // last two tasks

  const handleSelectTask = (task: Task) => {
    router.replace({
      pathname: "../(tabs)/session",
      params: { task: task.name },
    });
  };

  const handleStartNewTask = () => {
    let valid = true;

    if (!newTaskName.trim()) {
      setNewTaskNameError("Please enter a task name.");
      valid = false;
    }

    const minutes = Number(newTaskTime);
    if (!minutes || minutes <= 0) {
      setNewTaskTimeError("Enter a valid number of minutes.");
      valid = false;
    }

    if (!valid) return;

    // If valid, start session with this new task
    setShowNewTaskModal(false);

    router.replace({
      pathname: "../(tabs)/session",
      params: {
        task: newTaskName.trim(),
        time: minutes * 60,
      },
    });

    // Optional: Clear fields for next time
    setNewTaskName("");
    setNewTaskTime("");
  };

  const confirmExit = () => {
    setShowExitModal(false);
    router.replace("../(tabs)/session");
    router.replace("../");
  };

  return (
    <>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Spacer size="xl" />
        <Text variant="h2" weight="bold" color="accentDark">
          Congrats on finishing the session!
        </Text>

        <Spacer size="md" />

        <Image
          source={require("../../../assets/theo/done.png")}
          style={styles.image}
        />

        <Spacer size="lg" />

        {/* EXIT */}
        <Button
          label="Go back home"
          variant="danger"
          size="lg"
          onPress={() => setShowExitModal(true)}
          style={styles.exitButton}
        />

        <Spacer size="xl" />
        <Spacer size="xl" />

        {/* START FROM RECENT TASKS */}
        <Text
          variant="h1"
          weight="bold"
          color="accentDark"
          style={styles.taskHeading}
        >
          Work on next task?{" "}
        </Text>

        <Spacer size="xs" />

        <View style={styles.taskList}>
          {recentTasks.map((task) => (
            <Button
              key={task.name}
              label={`${task.name} (${task.time / 60} min)`}
              variant="brown"
              size="md"
              onPress={() => handleSelectTask(task)}
              style={styles.taskButton}
            />
          ))}
          {/* NEW TASK BUTTON */}
          <Button
            label="Create a new task"
            variant="gold"
            size="md"
            onPress={() => setShowNewTaskModal(true)}
            style={styles.taskButton}
          />
        </View>
      </ScrollView>

      {/* EXIT CONFIRMATION MODAL */}
      <AppModal
        visible={showExitModal}
        onClose={() => setShowExitModal(false)}
        variant="alert"
        title="Leave session?"
        message="Are you sure you want to go back home?"
        cancelLabel="Stay"
        confirmLabel="Exit"
        onConfirm={confirmExit}
      />

      {/* NEW TASK BOTTOM SHEET */}
      <AppModal
        visible={showNewTaskModal}
        onClose={() => setShowNewTaskModal(false)}
        variant="bottom-sheet"
        title="Create a new task"
        height={360}
      >
        <InputField
          label="Task name"
          placeholder="e.g. Outline notes"
          value={newTaskName}
          onChangeText={(text) => {
            setNewTaskName(text);
            setNewTaskNameError(""); // clear on edit
          }}
          error={newTaskNameError}
        />

        <Spacer size="md" />

        <InputField
          label="Duration (minutes)"
          placeholder="e.g. 25"
          keyboardType="numeric"
          value={newTaskTime}
          onChangeText={(text) => {
            setNewTaskTime(text);
            setNewTaskTimeError(""); // clear on edit
          }}
          error={newTaskTimeError}
        />

        <Spacer size="lg" />

        <Button
          label="Start session"
          variant="gold"
          onPress={handleStartNewTask}
        />
      </AppModal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
    paddingTop: 85,
    alignItems: "center",
    backgroundColor: theme.colors.background,
    justifyContent: "flex-start",
  },
  image: {
    width: 260,
    height: 260,
    resizeMode: "contain",
  },
  exitButton: {
    width: "80%",
  },
  taskHeading: {
    textAlign: "center",
    alignSelf: "center",
    marginBottom: theme.spacing.xs / 2,
  },
  taskList: {
    width: "80%",
    alignSelf: "center",
    alignItems: "stretch",
    gap: theme.spacing.md,
  },
  taskButton: {
    alignSelf: "stretch",
  },
});
