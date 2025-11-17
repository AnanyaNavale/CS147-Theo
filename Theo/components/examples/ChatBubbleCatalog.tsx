// components/catalogs/ChatBubbleCatalog.tsx

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { ChatBubble } from "../ui/ChatBubble";
import { theme } from "../../design/theme";

export function ChatBubbleCatalog() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Chat Bubbles</Text>

      <View style={styles.section}>
        <Text style={styles.label}>Assistant Messages</Text>

        <ChatBubble text="Hello! How can I help you today?" from="assistant" />
        <ChatBubble
          text="This is a longer assistant message to test wrapping and bubble width."
          from="assistant"
        />
        <ChatBubble text="Typing…" from="assistant" />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>User Messages</Text>

        <ChatBubble text="Here's what I'm trying to do…" from="user" />
        <ChatBubble text="Looks good!" from="user" />
        <ChatBubble
          text="Another longer user message so you can see how width and layout behave with wrapping."
          from="user"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Custom Styles</Text>

        <ChatBubble
          text="This one has custom padding."
          from="assistant"
          style={{ paddingVertical: 30 }}
        />

        <ChatBubble
          text="This one has custom text styling applied."
          from="user"
          textStyle={{ fontSize: 22 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.lg,
    width: "100%",
  },
  header: {
    fontSize: theme.typography.sizes.lg,
    fontFamily: theme.typography.families.bold,
    marginBottom: theme.spacing.lg,
    color: theme.colors.text,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  label: {
    fontSize: theme.typography.sizes.md,
    marginBottom: theme.spacing.md,
    color: theme.colors.mutedText,
  },
});
