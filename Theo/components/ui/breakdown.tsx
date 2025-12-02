import { ArrowAction } from "@/components/ui/ArrowAction";
import { BreakdownItem } from "@/components/ui/BreakdownItem";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Header } from "@/components/ui/Header";
import { InputField } from "@/components/ui/InputField";
import { PawLoader } from "@/components/ui/PawLoader";
import { Text } from "@/components/ui/Text";
import { theme } from "@/design/theme";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { generateTasksWithAI } from "@/lib/ai";

type Task = {
  text: string;
  minutes: number;
};

export default function BreakdownScreen() {
  const { goal } = useLocalSearchParams<{ goal: string }>();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskMinutes, setNewTaskMinutes] = useState("");

  const router = useRouter();
  const navigation = useNavigation();

  useEffect(() => {
    if (!goal) {
      setError("No goal was provided.");
      setIsLoading(false);
      return;
    }

    const generateTasks = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const generated = await generateTasksWithAI(goal);
        if (!generated.length) {
          throw new Error("AI returned no tasks. Try again.");
        }
        setTasks(generated);
      } catch (e: any) {
        setError(e.message || "An error occurred while generating tasks.");
      } finally {
        setIsLoading(false);
      }
    };

    generateTasks();
  }, [goal]);

  const handleDeleteTask = (index: number) => {
    setTasks((currentTasks) => currentTasks.filter((_, i) => i !== index));
  };

  const handleAddTask = () => {
    if (!newTaskText.trim() || !newTaskMinutes.trim()) {
      Alert.alert("Missing info", "Please provide both a task and minutes.");
      return;
    }
    const minutes = parseInt(newTaskMinutes, 10);
    if (isNaN(minutes) || minutes <= 0) {
      Alert.alert("Invalid time", "Please enter a valid number of minutes.");
      return;
    }

    setTasks([...tasks, { text: newTaskText, minutes }]);
    setNewTaskText("");
    setNewTaskMinutes("");
  };

  const handleStartSession = () => {
    if (tasks.length === 0) {
      Alert.alert("No tasks", "Add at least one task to start a session.");
      return;
    }
    // 1. Save tasks to Supabase (Session Archive)
    console.log("Saving tasks to Supabase:", tasks);
    // TODO: Implement Supabase insert logic here.

    // 2. Navigate to the session screen with the first task
    const firstTask = tasks[0];
    console.log("Starting session with:", firstTask);
    // TODO: Replace with your actual session start navigation.
    // This might involve clearing the stack and pushing the session screen.
    router.replace({
      pathname: "/(tabs)/session/goal", // Corrected path based on TS error
      params: { task: firstTask.text, duration: firstTask.minutes * 60 },
    });
  };

  if (isLoading) {
    return <PawLoader message="Theo is thinking of tasks..." />;
  }

  return (
    <Container>
      <Header title="Review Your Tasks" left={<View />} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {error && <Text color="danger">{error}</Text>}
        {tasks.map((task, index) => (
          <BreakdownItem
            key={`${task.text}-${index}`}
            text={task.text}
            minutes={task.minutes}
            onDelete={() => handleDeleteTask(index)}
          />
        ))}

        <View style={styles.manualAddContainer}>
          <Text variant="h3" style={{ marginBottom: theme.spacing.sm }}>
            Add a task manually
          </Text>
          <InputField
            placeholder="Task description"
            value={newTaskText}
            onChangeText={setNewTaskText}
          />
          <View style={styles.row}>
            <InputField
              placeholder="Mins"
              value={newTaskMinutes}
              onChangeText={setNewTaskMinutes}
              keyboardType="number-pad"
              small
              containerStyle={{ marginBottom: 0 }}
            />
            <Button label="Add Task" onPress={handleAddTask} size="sm" />
          </View>
        </View>
      </ScrollView>
      <ArrowAction label="Start Session" onPress={handleStartSession} />
    </Container>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: 150, // Space for ArrowAction
  },
  manualAddContainer: {
    marginTop: theme.spacing.lg,
    padding: theme.spacing.md,
    backgroundColor: theme.solidColors.white,
    borderRadius: theme.radii.lg,
    ...theme.shadow.soft,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
