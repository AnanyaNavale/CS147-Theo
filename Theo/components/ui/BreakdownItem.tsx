import { theme } from "@/design/theme";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Icon } from "./Icon";
import { Text } from "./Text";

export type BreakdownItemProps = {
  minutes: number;
  text: string;
  completed?: boolean;
  onDelete?: () => void;
};

export function BreakdownItem({
  minutes,
  text,
  completed,
}: BreakdownItemProps) {
  return (
    <View style={[styles.row, completed && styles.rowCompleted]}>
      <View style={[styles.timeBox, completed && styles.timeBoxCompleted]}>
        <Text style={styles.timeText}>{minutes} min.</Text>
      </View>

      <View style={styles.taskBox}>
        <Text
          style={[styles.taskText, completed && styles.taskTextCompleted]}
          numberOfLines={4}
          ellipsizeMode="tail"
        >
          {text}
        </Text>
        <View style={styles.grip}>
          <Icon name="drag" size={24} tint={theme.colors.border} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    width: "100%",
    height: 100,
    borderRadius: theme.radii.lg,
    //marginBottom: theme.spacing.sm,
    ...theme.shadow.soft,
  },

  rowCompleted: {
    opacity: 0.6,
  },

  timeBox: {
    width: 100,
    backgroundColor: theme.colors.accentDark,
    borderTopLeftRadius: theme.radii.md,
    borderBottomLeftRadius: theme.radii.md,
    alignItems: "center",
    paddingVertical: theme.spacing.md,
    zIndex: 2,
  },

  timeBoxCompleted: {
    backgroundColor: theme.colors.border,
  },

  timeText: {
    color: theme.solidColors.white,
    fontSize: theme.typography.sizes.md,
  },

  taskBox: {
    flex: 1,
    backgroundColor: theme.solidColors.white,
    borderWidth: 2,
    borderColor: theme.colors.accentDark,
    borderTopRightRadius: theme.radii.md,
    borderBottomRightRadius: theme.radii.md,
    paddingVertical: theme.spacing.md - 5,
    paddingRight: theme.spacing.xl,
    paddingLeft: theme.spacing.md,
    //justifyContent: "center",
    alignItems: "center",
  },

  taskText: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.sm,
    width: "100%",
    textAlign: "left",
    //lineHeight: 22,
  },

  taskTextCompleted: {
    color: theme.colors.mutedText,
    textDecorationLine: "line-through",
  },

  grip: {
    position: "absolute",
    right: theme.spacing.xs,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },
});
