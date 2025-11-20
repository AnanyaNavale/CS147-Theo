import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Keyboard,
} from "react-native";

import { Button } from "@/components/ui/Button";
import { Spacer } from "@/components/ui/Spacer";
import { theme } from "@/design/theme";
import { InputField } from "@/components";
import { ChatBubble } from "@/components/ui/ChatBubble";

/* ------------------------------------------------------
   MESSAGE TYPE — Strict typing for safety
------------------------------------------------------- */
export type Message = {
  id: string;
  text: string;
  from: "user" | "assistant";
};

/* ------------------------------------------------------
   FAKE ASSISTANT RESPONSE LOGIC (replace with LLM later)
------------------------------------------------------- */
async function fakeAssistantReply(userText: string): Promise<Message> {
  // Simulate network delay
  await new Promise((res) => setTimeout(res, 800));

  return {
    id: `${Date.now()}_assistant`,
    text: "Thanks for sharing. What else is on your mind?",
    from: "assistant",
  };
}

/* ------------------------------------------------------
   CHAT SCREEN
------------------------------------------------------- */
export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "assistant_welcome",
      text: "Hi! I'm here with you. What would you like to reflect on today?",
      from: "assistant",
    },
  ]);

  const [input, setInput] = useState("");
  const listRef = useRef<FlatList>(null);
  const isSendingRef = useRef(false); // Prevent double sends

  /* ----------------------------------------------
     Scroll to bottom whenever a new message arrives
  ---------------------------------------------- */
  const scrollToBottom = () => {
    setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true });
    }, 50);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  /* ----------------------------------------------
     SEND MESSAGE
  ---------------------------------------------- */
  const handleSend = useCallback(async () => {
    if (!input.trim() || isSendingRef.current) return;
    isSendingRef.current = true;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input.trim(),
      from: "user",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    Keyboard.dismiss();

    try {
      const assistantMessage = await fakeAssistantReply(userMessage.text);
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      // fallback error assistant message
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}_error`,
          text: "Hmm... something went wrong on my end. Could you try saying that again?",
          from: "assistant",
        },
      ]);
    } finally {
      isSendingRef.current = false;
    }
  }, [input]);

  /* ----------------------------------------------
     RENDER INDIVIDUAL MESSAGES
  ---------------------------------------------- */
  const renderMessage = ({ item }: { item: Message }) => {
    return <ChatBubble text={item.text} from={item.from} />;
  };

  /* ------------------------------------------------------
     MAIN RENDER
  ------------------------------------------------------- */
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      <Pressable
        style={{ flex: 1 }}
        onPress={Keyboard.dismiss}
        accessible={false}
      >
        <FlatList
          ref={listRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(m) => m.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </Pressable>

      {/* INPUT AREA */}
      <View style={styles.inputRow}>
        <View style={{ flex: 1 }}>
          <InputField
            value={input}
            onChangeText={setInput}
            placeholder="Type your reflection..."
            returnKeyType="send"
            onSubmitEditing={handleSend}
            noBorder
            style={styles.textInput}
          />
        </View>

        <Spacer size="sm" />

        <Button
          label="Send"
          size="sm"
          variant="gold"
          onPress={handleSend}
          style={{ height: theme.input.height }}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

/* ------------------------------------------------------
   STYLES
------------------------------------------------------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  listContent: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl * 3,
  },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderColor: theme.input.borderColor,
    backgroundColor: theme.colors.background,
  },

  textInput: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: theme.colors.accentDark,
    borderRadius: theme.radii.md,
    paddingHorizontal: theme.spacing.md,
    height: theme.input.height,
  },
});
