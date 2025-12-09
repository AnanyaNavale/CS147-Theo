import { useAppTheme } from "@/hooks/ThemeContext";
import React, { useMemo } from "react";
import {
  StyleProp,
  StyleSheet,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { Theme } from "../../design/theme";
import { Text } from "./Text";

type ButtonSize = "sm" | "md" | "lg";
export type ButtonVariant =
  | "gold"
  | "brown"
  | "tertiary"
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

export function Button({
  label,
  onPress,
  variant = "gold",
  size = "md",
  style,
  labelStyle,
  disabled = false,
}: ButtonProps) {
  const { theme, colors: palette } = useAppTheme();
  const sizeTokens = useMemo(() => sizeStyles(theme)[size], [size, theme]);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      disabled={disabled}
      style={disabled ? styles.disabledTouchable : undefined}
    >
      <View
        style={[
          styles.base,
          {
            paddingVertical: sizeTokens.paddingV,
            paddingHorizontal: sizeTokens.paddingH,
            borderRadius: theme.radii.md,
            borderWidth: getBorderWidth(variant),
            borderColor: getBorderColor(variant, theme, palette),
            backgroundColor: getBackground(variant, theme, palette),
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
              color: getLabelColor(variant, theme, palette),
            },
            labelStyle,
          ]}
        >
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

/* ---------------- Helpers ---------------- */

function getBorderWidth(v: ButtonVariant) {
  return v === "outlineBrown" || v === "outlineGold" ? 3 : 0;
}

function getBorderColor(
  v: ButtonVariant,
  theme: Theme,
  palette: typeof import("@/assets/themes/colors").colors.light
) {
  if (v === "outlineBrown") return palette.body;
  if (v === "outlineGold") return palette.secondary;
  return "transparent";
}

function getBackground(
  v: ButtonVariant,
  theme: Theme,
  palette: typeof import("@/assets/themes/colors").colors.light
) {
  if (v === "gold") return palette.secondary;
  if (v === "brown") return palette.primary;
  if (v === "tertiary") return palette.error ?? palette.tertiary ?? "#7C3030";
  if (v === "subtle") return palette.overlay;
  return palette.background;
}

function getLabelColor(
  v: ButtonVariant,
  theme: Theme,
  palette: typeof import("@/assets/themes/colors").colors.light
) {
  if (v === "outlineBrown") return palette.body;
  if (v === "outlineGold") return palette.secondary;
  if (v === "ghost") return palette.body;
  if (v === "subtle") return palette.quote ?? palette.inactive ?? palette.body;
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

const sizeStyles = (theme: Theme) =>
  ({
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
  } as const);
