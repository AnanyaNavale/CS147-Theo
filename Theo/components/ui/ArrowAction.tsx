import React from "react";
import {
  StyleSheet,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from "react-native";

import { Icon } from "@/components/ui/Icon";
import { theme } from "@/design/theme";
import SvgStrokeText from "../SvgStrokeText";

type ArrowActionProps = {
  label: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  small?: boolean;
};

export function ArrowAction({
  label,
  onPress,
  style,
  textStyle,
  small,
}: ArrowActionProps) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.container, style]}>
      <SvgStrokeText
        text={label}
        containerStyle={{ paddingLeft: 10 }}
        textStyle={[
          textStyle,
          small && { fontSize: theme.typography.sizes.md },
        ]}
      />
      <Icon
        style={styles.arrow}
        name="arrow-right"
        size={small ? 50 : 80}
        tint={theme.colors.accentDark}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: theme.spacing.xxl,
    right: theme.spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: theme.spacing.sm,
    zIndex: 3,
    backgroundColor: theme.colors.background,
  },
  text: {
    color: theme.colors.text,
  },
  arrow: {
    marginVertical: -35,
  },
});
