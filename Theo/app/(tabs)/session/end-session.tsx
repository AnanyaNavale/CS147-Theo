import { router } from "expo-router";
import React from "react";
import { Image, Pressable, ScrollView, StyleSheet, View } from "react-native";

import { Text, Spacer } from "../../../components";
import { Button } from "../../../components/ui/Button";
import { theme } from "../../../design/theme";
import { TASKS, Task } from "./tasks";

export default function EndSessionScreen() {
  const handleSelectTask = (task: Task) => {
    router.replace({
      pathname: "/(tabs)/session",
      params: { task: task.name },
    });
  };

  const handleExit = () => {
    router.replace("/(tabs)/session");
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Text variant="h2" weight="bold" color="accentDark">
        Congrats on finishing your session! Have a cookie!
      </Text>

      <Spacer size="md" />

      <Image
        source={require("../../../assets/theo/done.png")}
        style={styles.image}
      />

      <Spacer size="lg" />

      <Button
        label="Exit"
        variant="gold"
        size="lg"
        onPress={handleExit}
        style={styles.fullWidthButton}
      />

      <Spacer size="lg" />

      <Text weight="bold">Start new session with existing tasks</Text>

      <Spacer size="sm" />

      <View style={styles.taskList}>
        {TASKS.map((task) => (
          <Button
            key={task.name}
            label={task.name}
            variant="brown"
            size="md"
            onPress={() => handleSelectTask(task)}
            style={styles.fullWidthButton}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
  image: {
    width: 260,
    height: 260,
    resizeMode: "contain",
  },
  fullWidthButton: {
    width: "100%",
  },
  taskList: {
    width: "100%",
    gap: theme.spacing.sm,
  },
});
