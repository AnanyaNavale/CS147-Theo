import React from "react";
import { StyleSheet, TouchableOpacity, ViewStyle } from "react-native";

import { Icon } from "@/components/ui/Icon";
import { Text } from "@/components/ui/Text";
import { theme } from "@/design/theme";
import SvgStrokeText from "../SvgStrokeText";

type ArrowActionProps = {
  label: string;
  onPress: () => void;
  style?: ViewStyle;
};

export function ArrowAction({ label, onPress, style }: ArrowActionProps) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.container, style]}>
      <SvgStrokeText text={label} containerStyle={{ paddingLeft: 10 }}/>
      {/* <Text variant="h2" style={styles.text}>
        {label}
      </Text> */}
      <Icon
        style={styles.arrow}
        name="arrow-right"
        size={100}
        tint={theme.colors.accentDark}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: theme.spacing.xxl,
    right: theme.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: theme.spacing.sm,
    zIndex: 3,
  },
  text: {
    color: theme.colors.text,
  },
  arrow: {
    marginVertical: -35,
    marginLeft: -5,
  },
});
