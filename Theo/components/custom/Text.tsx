import React, { useMemo } from "react";
import { Text as RNText, StyleSheet, TextProps, TextStyle } from "react-native";

import { Theme } from "@/design/theme";
import { useAppTheme } from "@/hooks/ThemeContext";

type Variant = "h1" | "h2" | "h3" | "body" | "subtle" | "small" | "label";

type Weight = "regular" | "medium" | "bold";

type TextColor = keyof typeof import("@/design/colors").colors.light;

interface AppTextProps extends TextProps {
  variant?: Variant;
  weight?: Weight;
  color?: TextColor;
}

export function Text({
  style,
  variant = "body",
  weight = "regular",
  color = "header1",
  ...props
}: AppTextProps) {
  const { colors: palette, theme } = useAppTheme();
  const variantStyles = useMemo(() => createVariantStyles(theme), [theme]);
  const weightStyles = useMemo(() => createWeightStyles(theme), [theme]);
  const baseStyle = useMemo(
    () => ({
      fontFamily: theme.typography.families.regular,
    }),
    [theme.typography.families.regular]
  );

  const flattened = StyleSheet.flatten<TextStyle>(style);
  const autoLineHeightStyle =
    typeof flattened?.fontSize === "number" && flattened.lineHeight == null
      ? { lineHeight: flattened.fontSize * 1.2 }
      : null;

  return (
    <RNText
      {...props}
      style={[
        baseStyle,
        variantStyles[variant],
        weightStyles[weight],
        { color: palette[color] ?? palette.body },
        autoLineHeightStyle,
        style,
      ]}
    />
  );
}

function createVariantStyles(theme: Theme) {
  return StyleSheet.create({
    h1: {
      fontSize: theme.typography.sizes.xl,
      fontFamily: theme.typography.families.handwritten,
      lineHeight: theme.typography.sizes.xl * 1.2,
    },
    h2: {
      fontSize: theme.typography.sizes.lg,
      fontFamily: theme.typography.families.serif,
      lineHeight: theme.typography.sizes.lg * 1.25,
    },
    h3: {
      fontSize: theme.typography.sizes.md,
      lineHeight: theme.typography.sizes.md * 1.25,
    },
    body: {
      fontSize: theme.typography.sizes.md,
      lineHeight: theme.typography.sizes.md * 1.3,
    },
    subtle: {
      fontSize: theme.typography.sizes.sm,
      opacity: 0.7,
    },
    small: {
      fontSize: theme.typography.sizes.xs,
      lineHeight: theme.typography.sizes.xs * 1.1,
    },
    label: {
      fontSize: theme.typography.sizes.sm,
      textTransform: "uppercase",
      letterSpacing: 1,
    },
  });
}

function createWeightStyles(theme: Theme) {
  return StyleSheet.create({
    regular: {
      fontFamily: theme.typography.families.regular,
    },
    medium: { fontFamily: theme.typography.families.medium },
    bold: { fontFamily: theme.typography.families.bold },
  });
}
