// components/ui/IconButton.tsx

import React from "react";
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  ViewStyle,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { theme } from "@/design/theme";

export type FAIconName = React.ComponentProps<typeof FontAwesome>["name"];

type IconButtonProps = {
  label: string;
  icon: FAIconName;
  onPress: () => void;

  variant?: "gold" | "danger";
  style?: ViewStyle | ViewStyle[];
};

export function IconButton({
  label,
  icon,
  onPress,
  style,
  variant = "gold",
}: IconButtonProps) {
  const gradient =
    variant === "gold"
      ? theme.colors.gradients.gold
      : theme.colors.gradients.danger;

  const textColor = "#fff";

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={style}>
      <LinearGradient
        colors={gradient}
        start={[0, 0]}
        end={[1, 1]}
        style={styles.button}
      >
        <Text style={[styles.label, { color: textColor }]}>{label}</Text>

        <FontAwesome
          name={icon}
          size={20}
          color={textColor}
          style={{ marginLeft: 10 }}
        />
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xs,
    borderRadius: theme.radii.lg,
    width: "100%",
    ...theme.shadow.soft,
  },

  label: {
    fontFamily: theme.typography.families.handwritten,
    fontSize: theme.typography.sizes.sm,
  },
});
