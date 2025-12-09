import { colors } from "@/design/colors";
import { Theme } from "@/design/theme";
import { useAppTheme } from "@/hooks/ThemeContext";
import React, { useMemo } from "react";
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
  const { colors: palette, theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme, palette), [theme, palette]);
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
          <Icon name="drag" size={24} tint={palette.border} />
        </View>
      </View>
    </View>
  );
}

const createStyles = (theme: Theme, palette: typeof colors.light) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      width: "100%",
      height: 100,
      borderRadius: theme.radii.lg,
      ...theme.shadow.soft,
      backgroundColor: palette.background,
    },

    rowCompleted: {
      opacity: 0.6,
    },

    timeBox: {
      width: 100,
      backgroundColor: palette.primary,
      borderTopLeftRadius: theme.radii.md,
      borderBottomLeftRadius: theme.radii.md,
      alignItems: "center",
      paddingVertical: theme.spacing.md,
      zIndex: 2,
    },

    timeBoxCompleted: {
      backgroundColor: palette.border,
    },

    timeText: {
      color: palette.buttonText ?? palette.user ?? "#fff",
      fontSize: theme.typography.sizes.md,
    },

    taskBox: {
      flex: 1,
      backgroundColor: palette.background,
      borderWidth: 2,
      borderColor: palette.primary,
      borderTopRightRadius: theme.radii.md,
      borderBottomRightRadius: theme.radii.md,
      paddingVertical: theme.spacing.md - 5,
      paddingRight: theme.spacing.xl,
      paddingLeft: theme.spacing.md,
      alignItems: "center",
    },

    taskText: {
      color: palette.body,
      fontSize: theme.typography.sizes.sm,
      width: "100%",
      textAlign: "left",
    },

    taskTextCompleted: {
      color: palette.quote ?? palette.inactive ?? palette.body,
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
