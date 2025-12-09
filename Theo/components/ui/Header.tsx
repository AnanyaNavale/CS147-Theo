import React, { ReactNode } from "react";
import { View, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";
import { theme } from "../../design/theme";
import { useAppTheme } from "@/hooks/ThemeContext";

type HeaderProps = {
  title?: string;
  left?: ReactNode;
  right?: ReactNode;
  style?: ViewStyle | ViewStyle[];
  titleStyle?: TextStyle | TextStyle[];
};

export function Header({ title, left, right, style, titleStyle }: HeaderProps) {
  const { colors: palette } = useAppTheme();
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: palette.background },
        style,
      ]}
    >
      <View style={styles.side}>{left}</View>

      {title ? (
        <Text
          style={[styles.title, { color: palette.body }, titleStyle]}
          numberOfLines={1}
        >
          {title}
        </Text>
      ) : (
        <View style={styles.titlePlaceholder} />
      )}

      <View style={styles.side}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.md,
  },

  title: {
    fontSize: theme.typography.sizes.lg,
    fontFamily: theme.typography.families.handwritten,
    flexShrink: 1,
    textAlign: "center",
  },

  side: {
    width: 48,
    justifyContent: "center",
    alignItems: "center",
  },

  titlePlaceholder: {
    width: 48,
  },
});
