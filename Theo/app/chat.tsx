import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Keyboard,
  Image,
  Animated,
} from "react-native";

import { theme } from "@/design/theme";
import { InputField } from "@/components";
import { ChatBubble } from "@/components/ui/ChatBubble";
import { Text } from "@/components/ui/Text";

/* ------------------------------------------------------
   MESSAGE TYPE
------------------------------------------------------- */
export type Message = {
  id: string;
  text: string;
  from: "user" | "assistant";
};

/* ------------------------------------------------------
   FELIX TODO: TEMP AI (replace with real API)
------------------------------------------------------- */
async function fakeAssistantReply(_: string) {
  await new Promise((res) => setTimeout(res, 1200));
  return {
    id: `assistant_${Date.now()}`,
    text: "Thanks for sharing. What else is on your mind?",
    from: "assistant" as const,
  };
}

/* ------------------------------------------------------
   TYPING INDICATOR BUBBLE
------------------------------------------------------- */
function TypingBubble() {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  const animateDot = (dot: Animated.Value, delay: number) => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(dot, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
          delay,
        }),
        Animated.timing(dot, {
          toValue: 0.3,
          duration: 300,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  useEffect(() => {
    animateDot(dot1, 0);
    animateDot(dot2, 150);
    animateDot(dot3, 300);
  }, []);

  return (
    <View style={styles.typingBubble}>
      <Animated.View style={[styles.dot, { opacity: dot1 }]} />
      <Animated.View style={[styles.dot, { opacity: dot2 }]} />
      <Animated.View style={[styles.dot, { opacity: dot3 }]} />
    </View>
  );
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
  const [assistantTyping, setAssistantTyping] = useState(false);

  const listRef = useRef<FlatList>(null);
  const sendingRef = useRef(false);

  const scrollToBottom = () => {
    setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true });
    }, 40);
  };

  useEffect(scrollToBottom, [messages.length]);

  /* ------------------------------------------------------
     SEND MESSAGE
  ------------------------------------------------------- */
  const handleSend = useCallback(async () => {
    if (!input.trim() || sendingRef.current) return;
    sendingRef.current = true;

    const userMessage: Message = {
      id: `${Date.now()}_u`,
      text: input.trim(),
      from: "user",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    Keyboard.dismiss();

    setAssistantTyping(true);

    try {
      const reply = await fakeAssistantReply(userMessage.text);
      setAssistantTyping(false);
      setMessages((prev) => [...prev, reply]);
    } catch {
      setAssistantTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}_error`,
          text: "Hmm… something went wrong. Can you try again?",
          from: "assistant",
        },
      ]);
    } finally {
      sendingRef.current = false;
    }
  }, [input]);

  const renderMessage = ({ item }: { item: Message }) => (
    <ChatBubble text={item.text} from={item.from} />
  );

  /* ------------------------------------------------------
     UI
  ------------------------------------------------------- */
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={60}
    >
      <Text style={styles.header} variant="h2">
        Converse with Theo
      </Text>
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
          ListFooterComponent={
            assistantTyping ? (
              <View style={{ paddingTop: theme.spacing.sm }}>
                <TypingBubble />
              </View>
            ) : null
          }
        />
      </Pressable>

      {/* ---------------------------------------- */}
      {/*     INPUT BAR                            */}
      {/* ---------------------------------------- */}
      <View style={styles.inputBar}>
        {/* Textbox with send icon INSIDE */}
        <View style={styles.textboxWrapper}>
          <InputField
            placeholder="Your text here..."
            value={input}
            onChangeText={setInput}
            noBorder
            style={styles.textInput}
            returnKeyType="send"
            onSubmitEditing={handleSend}
          />

          <Pressable onPress={handleSend} style={styles.sendButton}>
            <Image
              source={require("../assets/icons/send.png")}
              style={styles.sendIcon}
            />
          </Pressable>
        </View>

        {/* Microphone button */}
        <Pressable onPress={() => {}} style={styles.micWrapper}>
          <Image
            source={require("../assets/icons/mic.png")}
            style={styles.micIcon}
          />
        </Pressable>
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
    backgroundColor: theme.solidColors.white,
  },
  header: {
    textAlign: "center",
    paddingTop: theme.spacing.lg,
  },

  listContent: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl * 3,
  },

  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.solidColors.white,
  },

  textboxWrapper: {
    flex: 1,
    position: "relative",
  },

  textInput: {
    backgroundColor: theme.solidColors.white,
    borderWidth: 2,
    borderColor: theme.colors.accentDark,
    borderRadius: theme.radii.md,
    paddingLeft: theme.spacing.md,
    paddingRight: 35,
    height: theme.input.height,
    paddingVertical: 0,
    textAlignVertical: "center",
  },

  sendButton: {
    position: "absolute",
    right: 10,
    top: 10,
    padding: 4,
  },

  sendIcon: {
    width: 22,
    height: 22,
    tintColor: theme.colors.accentDark,
  },

  micWrapper: {
    marginLeft: theme.spacing.md,
    height: theme.input.height,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 12,
  },

  micIcon: {
    tintColor: theme.colors.accentDark,
    height: 36,
    width: 36,
  },

  typingBubble: {
    flexDirection: "row",
    backgroundColor: theme.colors.accentDark,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: theme.radii.lg,
    alignSelf: "flex-start",
    marginBottom: theme.spacing.md,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "white",
    marginHorizontal: 3,
  },
});
