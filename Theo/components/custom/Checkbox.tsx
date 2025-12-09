import { Theme } from "@/design/theme";
import { useAppTheme } from "@/hooks/ThemeContext";
import React, { useMemo } from "react";
import {
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
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
  size,
  containerStyle,
  boxStyle,
  labelStyle,
  checkStyle,
}: CheckboxProps) {
  const { theme, colors: palette } = useAppTheme();
  const resolvedSize = size ?? theme.checkbox.size;
  const styles = useMemo(() => createStyles(theme), [theme]);
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
            width: resolvedSize,
            height: resolvedSize,
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
              size={Math.max(20, resolvedSize - 8)}
              tint={palette.border}
            />
          </View>
        )}
      </View>

      {label && (
        <Text
          style={[
            styles.label,
            {
              color: palette.body,
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

function createStyles(theme: Theme) {
  return StyleSheet.create({
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
}
