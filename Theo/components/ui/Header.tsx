import React, { ReactNode } from "react";
import { View, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";
import { theme } from "../../design/theme";

type HeaderProps = {
  title?: string;
  left?: ReactNode;
  right?: ReactNode;
  style?: ViewStyle | ViewStyle[];
  titleStyle?: TextStyle | TextStyle[];
};

export function Header({ title, left, right, style, titleStyle }: HeaderProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.side}>{left}</View>

      {title ? (
        <Text style={[styles.title, titleStyle]} numberOfLines={1}>
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
    backgroundColor: theme.colors.background,
  },

  title: {
    fontSize: theme.typography.sizes.lg,
    fontFamily: theme.typography.families.handwritten,
    color: theme.colors.text,
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
