// components/ChatBubble.tsx

import React from "react";
import { View, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";
import { theme } from "../../design/theme";

type ChatBubbleProps = {
  text: string;
  from?: "user" | "assistant";
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
  );
}

const styles = StyleSheet.create({
  base: {
    maxWidth: "90%",
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radii.lg,
    marginBottom: theme.spacing.md,
  },

  // USER BUBBLE: white background, brown border
  userBubble: {
    backgroundColor: theme.colors.background,
    borderWidth: 3,
    borderColor: theme.colors.accentDark,
    alignSelf: "flex-end",
  },

  // ASSISTANT BUBBLE: solid brown block
  assistantBubble: {
    backgroundColor: theme.colors.accentDark,
    alignSelf: "flex-start",
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
    color: "#FFFFFF",
  },
});
