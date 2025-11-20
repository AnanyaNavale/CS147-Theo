import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { theme } from "../../design/theme";

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
  style?: ViewStyle | ViewStyle[];
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
}: ButtonProps) {
  const sizeTokens = sizeStyles[size];
  // const isGradient = GRADIENT_VARIANTS.includes(variant);
  const isGradient = false;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
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
                fontFamily: theme.typography.families.bold,
              },
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
                fontFamily: getFontFamily(variant),
              },
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
  return "transparent";
}

function getLabelColor(v: ButtonVariant) {
  if (v === "outlineBrown") return theme.colors.text;
  if (v === "outlineGold") return theme.colors.accentLight;
  if (v === "ghost") return theme.colors.text;
  if (v === "subtle") return theme.colors.mutedText;
  return "#fff";
}

function getFontFamily(v: ButtonVariant) {
  if (v === "ghost" || v === "outlineGold") {
    return theme.typography.families.handwritten;
  }
  return theme.typography.families.regular;
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
  },
  label: {},
});
