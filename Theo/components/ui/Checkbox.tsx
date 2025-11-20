import React from "react";
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from "react-native";
import { theme } from "../../design/theme";

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
            borderRadius: theme.radii.sm,
            borderColor: theme.checkbox.borderColor,
            backgroundColor: theme.checkbox.bg,
          },
          boxStyle,
        ]}
      >
        {checked && (
          <Text
            style={[
              styles.check,
              {
                color: theme.checkbox.checkColor,
                fontFamily: theme.typography.families.handwritten,
              },
              checkStyle,
            ]}
          >
            ✓
          </Text>
        )}
      </View>

      {label && (
        <Text
          style={[
            styles.label,
            {
              color: theme.colors.text,
              fontSize: theme.typography.sizes.md,
              fontFamily: theme.typography.families.handwritten,
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
    borderWidth: theme.input.borderWidth,
    alignItems: "center",
    justifyContent: "center",
  },
  check: {
    fontSize: theme.typography.sizes.lg,
    lineHeight: theme.typography.sizes.lg + 2,
    marginTop: -2,
  },
  label: {
    marginLeft: theme.spacing.sm,
  },
});
