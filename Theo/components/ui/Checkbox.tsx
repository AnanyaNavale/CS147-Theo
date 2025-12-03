import React from "react";
import {
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { theme } from "../../design/theme";
import { Icon } from "./Icon";

export type CheckboxProps = {
  checked: boolean;
  onChange: (value: boolean) => void;
  label?: string;
  size?: number; // overrides theme.checkbox.size
  containerStyle?: ViewStyle;
  boxStyle?: ViewStyle;
  labelStyle?: TextStyle;
  checkStyle?: TextStyle;
};

export function Checkbox({
  checked,
  onChange,
  label,
  size = theme.checkbox.size,
  containerStyle,
  boxStyle,
  labelStyle,
  checkStyle,
}: CheckboxProps) {
  return (
    <TouchableOpacity
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      onPress={() => onChange(!checked)}
      activeOpacity={0.8}
      style={[styles.container, containerStyle]}
    >
      <View
        style={[
          styles.box,
          {
            width: size,
            height: size,
            borderRadius: theme.radii.sm + 2,
            borderColor: theme.checkbox.borderColor,
            backgroundColor: theme.checkbox.bg,
          },
          boxStyle,
        ]}
      >
        {checked && (
          <View style={[styles.checkmark]}>
            <Icon
              name="check"
              size={Math.max(26, size - 6)}
              tint={theme.checkbox.checkColor}
            />
          </View>
        )}
      </View>

      {label && (
        <Text
          style={[
            styles.label,
            {
              color: theme.colors.text,
              fontSize: theme.typography.sizes.md,
              fontFamily: theme.typography.families.regular,
            },
            labelStyle,
          ]}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.xs,
  },
  box: {
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    marginLeft: theme.spacing.sm,
  },
  checkmark: {
    marginRight: -theme.spacing.sm,
    marginBottom: 4,
  },
});
