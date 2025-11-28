import { theme } from "@/design/theme";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "./Text";

export type BreakdownItemProps = {
  minutes: number;
  text: string;
};

export function BreakdownItem({ minutes, text }: BreakdownItemProps) {
  return (
    <View style={styles.row}>
      <View style={styles.timeBox}>
        <Text style={styles.timeText}>{minutes} min.</Text>
      </View>

      <View style={styles.taskBox}>
        <Text style={styles.taskText}>{text}</Text>
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
    marginBottom: theme.spacing.sm,
  },

  timeBox: {
    width: 100,
    backgroundColor: theme.colors.accentDark,
    borderTopLeftRadius: theme.radii.lg,
    borderBottomLeftRadius: theme.radii.lg,
    // justifyContent: "center",
    alignItems: "center",
    paddingVertical: theme.spacing.md,
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
    borderTopRightRadius: theme.radii.lg,
    borderBottomRightRadius: theme.radii.lg,
    paddingVertical: theme.spacing.md - 5,
    paddingHorizontal: theme.spacing.md,
    //justifyContent: "center",
  },

  taskText: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.sm,
    //lineHeight: 22,
  },
});
