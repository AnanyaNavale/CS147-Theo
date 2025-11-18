import React from "react";
import { Text as RNText, TextProps, StyleSheet } from "react-native";
import { theme } from "../../design/theme";

type Variant = "h1" | "h2" | "h3" | "body" | "subtle" | "small" | "label";

type Weight = "regular" | "medium" | "bold";

// Only allow solid colors, not gradients
type TextColor = keyof typeof theme.solidColors;

interface AppTextProps extends TextProps {
  variant?: Variant;
  weight?: Weight;
  color?: TextColor;
}

export function Text({
  style,
  variant = "body",
  weight = "regular",
  color = "text",
  ...props
}: AppTextProps) {
  return (
    <RNText
      {...props}
      style={[
        baseStyles.text,
        variantStyles[variant],
        weightStyles[weight],
        { color: theme.solidColors[color] },
        style,
      ]}
    />
  );
}

const baseStyles = StyleSheet.create({
  text: {
    fontFamily: theme.typography.families.regular,
  },
});

const variantStyles = StyleSheet.create({
  h1: {
    fontSize: theme.typography.sizes.xl,
    lineHeight: theme.typography.sizes.xl * 1.2,
  },
  h2: {
    fontSize: theme.typography.sizes.lg,
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

const weightStyles = StyleSheet.create({
  regular: { fontFamily: theme.typography.families.regular },
  medium: { fontFamily: theme.typography.families.regular },
  bold: { fontFamily: theme.typography.families.bold },
});

/* ----------------------------------------- */
/* Variant scale                              */
/* ----------------------------------------- */

/* ----------------------------------------- */
/* Weight scale                               */
/* ----------------------------------------- */

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
