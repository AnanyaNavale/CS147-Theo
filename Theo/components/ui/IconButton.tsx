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
  const backgroundColor =
    variant === "gold" ? theme.colors.accent : theme.colors.danger;
  const textColor = theme.solidColors.white;

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={style}>
      <View style={[styles.button, { backgroundColor }]}>
        <Text style={[styles.label, { color: textColor }]}>{label}</Text>

        <FontAwesome
          name={icon}
          size={20}
          color={textColor}
          style={{ marginLeft: 10 }}
        />
      </View>
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
