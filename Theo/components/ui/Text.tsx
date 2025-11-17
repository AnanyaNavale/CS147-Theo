import React from "react";
import { Text as RNText, TextProps, StyleSheet } from "react-native";
import { theme } from "../../design/theme";

type Variant = "h1" | "h2" | "h3" | "subtitle" | "body" | "small" | "caption";

type Weight = "regular" | "medium" | "bold" | "handwritten";

type Color = "default" | "accent" | "accentDark" | "muted" | "white";

interface AppTextProps extends TextProps {
  variant?: Variant;
  weight?: Weight;
  color?: Color;
}

export function Text({
  variant = "body",
  weight = "regular",
  color = "default",
  style,
  ...props
}: AppTextProps) {
  return (
    <RNText
      {...props}
      style={[
        styles.base,
        variantStyles[variant],
        weightStyles[weight],
        colorStyles[color],
        style,
      ]}
    />
  );
}

/* ----------------------------------------- */
/* Base styles                                */
/* ----------------------------------------- */

const styles = StyleSheet.create({
  base: {
    color: theme.colors.text,
    fontFamily: theme.typography.families.regular,
    fontSize: theme.typography.sizes.md,
  },
});

/* ----------------------------------------- */
/* Variant scale                              */
/* ----------------------------------------- */

const variantStyles = StyleSheet.create({
  h1: {
    fontSize: theme.typography.sizes.xl,
  },
  h2: {
    fontSize: theme.typography.sizes.lg,
  },
  h3: {
    fontSize: theme.typography.sizes.md * 1.1,
  },
  subtitle: {
    fontSize: theme.typography.sizes.md,
  },
  body: {
    fontSize: theme.typography.sizes.md,
  },
  small: {
    fontSize: theme.typography.sizes.sm,
  },
  caption: {
    fontSize: theme.typography.sizes.xs,
  },
});

/* ----------------------------------------- */
/* Weight scale                               */
/* ----------------------------------------- */

const weightStyles = StyleSheet.create({
  regular: {
    fontFamily: theme.typography.families.regular,
  },
  medium: {
    fontFamily: theme.typography.families.regular,
  },
  bold: {
    fontFamily: theme.typography.families.bold,
  },
  handwritten: {
    fontFamily: theme.typography.families.handwritten,
  },
});

/* ----------------------------------------- */
/* Color scale                                */
/* ----------------------------------------- */

const colorStyles = StyleSheet.create({
  default: {
    color: theme.colors.text,
  },
  muted: {
    color: theme.colors.mutedText,
  },
  accent: {
    color: theme.colors.accent,
  },
  accentDark: {
    color: theme.colors.accentDark,
  },
  white: {
    color: "#ffffff",
  },
});
