import React, { ReactNode } from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "../../design/theme";

type ContainerProps = {
  children: ReactNode;
  style?: ViewStyle | ViewStyle[];
  padded?: boolean; // toggle default padding
  safe?: boolean; // toggle SafeAreaView
  bg?: string; // override background
};

export function Container({
  children,
  style,
  padded = true,
  safe = true,
  bg = theme.colors.background,
}: ContainerProps) {
  const Wrapper = safe ? SafeAreaView : View;

  return (
    <Wrapper
      style={[
        styles.base,
        { backgroundColor: bg },
        padded && styles.padded,
        style,
      ]}
    >
      {children}
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  base: {
    flex: 1,
  },
  padded: {
    padding: theme.spacing.lg,
  },
});
