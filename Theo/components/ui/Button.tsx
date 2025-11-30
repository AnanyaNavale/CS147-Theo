import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  StyleProp,
  StyleSheet,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { theme } from "../../design/theme";
import { Text } from "./Text";

type ButtonSize = "sm" | "md" | "lg";
type ButtonVariant =
  | "gold"
  | "brown"
  | "danger"
  | "outlineBrown"
  | "outlineGold"
  | "ghost"
  | "subtle";

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
};

// Which variants use a gradient background
const GRADIENT_VARIANTS: ButtonVariant[] = ["gold", "brown", "danger"];

// Safely map only gradient variants
const gradientMap: Record<
  "gold" | "brown" | "danger",
  readonly [string, string]
> = {
  gold: theme.colors.gradients.gold,
  brown: theme.colors.gradients.brown,
  danger: theme.colors.gradients.danger,
};

const sizeStyles = {
  sm: {
    paddingV: theme.spacing.xs,
    paddingH: theme.spacing.sm,
    fontSize: theme.typography.sizes.sm,
  },
  md: {
    paddingV: theme.spacing.sm,
    paddingH: theme.spacing.md,
    fontSize: theme.typography.sizes.md,
  },
  lg: {
    paddingV: theme.spacing.md,
    paddingH: theme.spacing.lg,
    fontSize: theme.typography.sizes.lg,
  },
} as const;

export function Button({
  label,
  onPress,
  variant = "gold",
  size = "md",
  style,
  labelStyle,
  disabled = false,
}: ButtonProps) {
  const sizeTokens = sizeStyles[size];
  // const isGradient = GRADIENT_VARIANTS.includes(variant);
  const isGradient = false;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      disabled={disabled}
      style={disabled ? styles.disabledTouchable : undefined}
    >
      {isGradient ? (
        <LinearGradient
          colors={gradientMap[variant as "gold" | "brown" | "danger"]}
          start={[0, 0]}
          end={[1, 1]}
          style={[
            styles.base,
            {
              paddingVertical: sizeTokens.paddingV,
              paddingHorizontal: sizeTokens.paddingH,
              borderRadius: theme.radii.md,
            },
            style,
          ]}
        >
          <Text
            style={[
              styles.label,
              {
                color: "#fff",
                fontSize: sizeTokens.fontSize,
                fontFamily: theme.typography.families.regular,
              },
              labelStyle,
            ]}
          >
            {label}
          </Text>
        </LinearGradient>
      ) : (
        <View
          style={[
            styles.base,
            {
              paddingVertical: sizeTokens.paddingV,
              paddingHorizontal: sizeTokens.paddingH,
              borderRadius: theme.radii.md,
              borderWidth: getBorderWidth(variant),
              borderColor: getBorderColor(variant),
              backgroundColor: getBackground(variant),
              opacity: disabled ? 0.6 : 1,
            },
            style,
          ]}
        >
          <Text
            style={[
              styles.label,
              {
                fontSize: sizeTokens.fontSize,
                color: getLabelColor(variant),
              },
              labelStyle,
            ]}
          >
            {label}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

/* ---------------- Helpers ---------------- */

function getBorderWidth(v: ButtonVariant) {
  return v === "outlineBrown" || v === "outlineGold" ? 3 : 0;
}

function getBorderColor(v: ButtonVariant) {
  if (v === "outlineBrown") return theme.colors.text;
  if (v === "outlineGold") return theme.colors.accentLight;
  return "transparent";
}

function getBackground(v: ButtonVariant) {
  if (v === "gold") return theme.colors.accent;
  if (v === "brown") return theme.colors.accentDark;
  if (v === "danger") return theme.colors.danger;
  if (v === "subtle") return "rgba(0,0,0,0.05)";
  return theme.colors.ghost;
}

function getLabelColor(v: ButtonVariant) {
  if (v === "outlineBrown") return theme.colors.text;
  if (v === "outlineGold") return theme.colors.accentLight;
  if (v === "ghost") return theme.colors.text;
  if (v === "subtle") return theme.colors.mutedText;
  return "#fff";
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
  },
  label: {},
  disabledTouchable: {
    opacity: 0.9,
  },
});
