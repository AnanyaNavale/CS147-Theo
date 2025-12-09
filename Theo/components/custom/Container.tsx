import { useAppTheme } from "@/hooks/ThemeContext";
import React, { ReactNode } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
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
  bg,
}: ContainerProps) {
  const { colors: palette } = useAppTheme();
  const Wrapper = safe ? SafeAreaView : View;

  return (
    <Wrapper
      style={[
        styles.base,
        { backgroundColor: bg ?? palette.background },
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
