// components/ChatBubble.tsx

import React from "react";
import { View, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";
import { theme } from "../../design/theme";

type ChatBubbleProps = {
  text: string;
  from?: "user" | "assistant";
  /** Extra style for the bubble box itself */
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle | TextStyle[];
};

export function ChatBubble({
  text,
  from = "assistant",
  style,
  textStyle,
}: ChatBubbleProps) {
  const isUser = from === "user";

  return (
    <View
      style={[
        styles.wrapper,
        isUser ? styles.userWrapper : styles.assistantWrapper,
      ]}
    >
      {/* Main bubble */}
      <View
        style={[
          styles.base,
          isUser ? styles.userBubble : styles.assistantBubble,
          style,
        ]}
      >
        <Text
          style={[
            styles.text,
            isUser ? styles.userText : styles.assistantText,
            textStyle,
          ]}
        >
          {text}
        </Text>
      </View>

      {/* Tail circles */}
      <View
        style={[
          styles.tailBig,
          isUser ? styles.tailRightBig : styles.tailLeftBig,
          isUser ? styles.userTailCircle : styles.assistantTailCircle,
        ]}
      />
      <View
        style={[
          styles.tailSmall,
          isUser ? styles.tailRightSmall : styles.tailLeftSmall,
          isUser ? styles.userTailCircle : styles.assistantTailCircle,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  /* Outer container that handles alignment + tail positioning */
  wrapper: {
    maxWidth: "90%",
    marginBottom: theme.spacing.md,
    position: "relative",
  },
  userWrapper: {
    alignSelf: "flex-end",
  },
  assistantWrapper: {
    alignSelf: "flex-start",
  },

  /* Bubble box */
  base: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radii.lg,
  },

  // USER BUBBLE: white background, brown border
  userBubble: {
    backgroundColor: theme.solidColors.white,
    borderWidth: 2,
    borderColor: theme.colors.accentDark,
  },

  // ASSISTANT BUBBLE: solid brown block
  assistantBubble: {
    backgroundColor: theme.colors.accentDark,
  },

  // GENERAL TEXT STYLE
  text: {
    fontFamily: theme.typography.families.handwritten,
    fontSize: theme.typography.sizes.md,
    lineHeight: theme.typography.sizes.md * 1.4,
  },

  // USER TEXT inside white box
  userText: {
    color: theme.colors.text,
  },

  // ASSISTANT TEXT inside brown box
  assistantText: {
    color: theme.solidColors.white,
  },

  /* Tail circles: common geometry */
  tailBig: {
    position: "absolute",
    width: 24,
    height: 24,
    borderRadius: 999,
  },
  tailSmall: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  // Assistant tail (solid brown)
  assistantTailCircle: {
    backgroundColor: theme.colors.accentDark,
  },

  // User tail (white with brown border)
  userTailCircle: {
    backgroundColor: theme.solidColors.white,
    borderWidth: 2,
    borderColor: theme.colors.accentDark,
  },

  // Positioning for assistant (left side)
  tailLeftBig: {
    bottom: -10,
    left: -2,
  },
  tailLeftSmall: {
    bottom: -20,
    left: -6,
  },

  // Positioning for user (right side)
  tailRightBig: {
    bottom: -10,
    right: -2,
  },
  tailRightSmall: {
    bottom: -20,
    right: -6,
  },
});
