import React from "react";
import {
  Text as RNText,
  StyleSheet,
  TextProps,
  TextStyle,
} from "react-native";
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
  const flattened = StyleSheet.flatten<TextStyle>(style);
  const autoLineHeightStyle =
    typeof flattened?.fontSize === "number" && flattened.lineHeight == null
      ? { lineHeight: flattened.fontSize * 1.2 }
      : null;

  return (
    <RNText
      {...props}
      style={[
        baseStyles.text,
        variantStyles[variant],
        weightStyles[weight],
        { color: theme.solidColors[color] },
        autoLineHeightStyle,
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

const weightStyles = StyleSheet.create({
  regular: {},
  medium: {},
  bold: { fontFamily: theme.typography.families.bold },
});
