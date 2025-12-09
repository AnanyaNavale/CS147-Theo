// components/ui/IconButton.tsx

import { theme } from "@/design/theme";
import { useAppTheme } from "@/hooks/ThemeContext";
import { FontAwesome } from "@expo/vector-icons";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

export type FAIconName = React.ComponentProps<typeof FontAwesome>["name"];

type IconButtonProps = {
  label: string;
  icon: FAIconName;
  onPress: () => void;

  variant?: "gold" | "tertiary";
  style?: ViewStyle | ViewStyle[];
};

export function IconButton({
  label,
  icon,
  onPress,
  style,
  variant = "gold",
}: IconButtonProps) {
  const { colors: palette } = useAppTheme();
  const backgroundColor =
    variant === "gold"
      ? palette.secondary
      : palette.error ?? palette.tertiary ?? "#7C3030";
  const textColor = palette.buttonText ?? palette.user ?? "#fff";

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
