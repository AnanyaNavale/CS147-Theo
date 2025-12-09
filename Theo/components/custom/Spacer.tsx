import React from "react";
import { View, StyleProp, ViewStyle } from "react-native";
import { theme } from "../../design/theme";

type SpacerSize = keyof typeof theme.spacing;

type SpacerProps = {
  size?: SpacerSize; // uses theme spacing
  px?: number; // raw numeric spacing override
  horizontal?: boolean; // if true, uses width instead of height
  style?: StyleProp<ViewStyle>;
};

export function Spacer({
  size = "md",
  px,
  horizontal = false,
  style,
}: SpacerProps) {
  const dimension = px ?? theme.spacing[size];

  return (
    <View
      style={[horizontal ? { width: dimension } : { height: dimension }, style]}
    />
  );
}
