import React from "react";
import { Image, ImageStyle, StyleProp } from "react-native";

// 1. Central icon registry
const ICONS = {
  play: require("../../assets/icons/play.png"),
  pause: require("../../assets/icons/pause.png"),
  stop: require("../../assets/icons/stop.png"),
  chat: require("../../assets/icons/chat.png"),
  break: require("../../assets/icons/break.png"),
  "fast-forward": require("../../assets/icons/fast-forward.png"),
  more: require("../../assets/icons/more.png"),
  "more-vertical": require("../../assets/icons/more-vertical.png"),
  "arrow-left": require("../../assets/icons/arrow-left.png"),
  "arrow-right": require("../../assets/icons/arrow-right.png"),
  plus: require("../../assets/icons/plus.png"),
  refresh: require("../../assets/icons/refresh.png"),
  trash: require("../../assets/icons/trash.png"),
  mic: require("../../assets/icons/mic.png"),
  pencil: require("../../assets/icons/pencil.png"),
  x: require("../../assets/icons/x.png"),
  ai: require("../../assets/icons/ai.png"),
  exit: require("../../assets/icons/exit.png"),
  report: require("../../assets/icons/report.png"),
  help: require("../../assets/icons/help.png"),
  drag: require("../../assets/icons/drag.png"),
} as const;

// 2. Infer valid icon names
export type IconName = keyof typeof ICONS;

interface IconProps {
  name: IconName;
  size?: number;
  style?: StyleProp<ImageStyle>;
  tint?: string;
}

export function Icon({ name, size = 28, tint, style }: IconProps) {
  return (
    <Image
      source={ICONS[name]}
      style={[
        {
          width: size,
          height: size,
          resizeMode: "contain",
          tintColor: tint ?? undefined,
        },
        style,
      ]}
    />
  );
}
