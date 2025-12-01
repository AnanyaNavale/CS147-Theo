import { useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { InputField } from "@/components";
import { ChatBubble } from "@/components/ui/ChatBubble";
import { Icon } from "@/components/ui/Icon";
import { Text } from "@/components/ui/Text";
import { theme } from "@/design/theme";
import { generateReflectionReply } from "@/lib/ai";
import {
  ReflectionChatMessage,
  createSession,
  fetchSessionById,
  saveReflectionChat,
} from "@/lib/supabase";
import { useSupabase } from "@/providers/SupabaseProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useRouter } from "expo-router";

/* ------------------------------------------------------
   MESSAGE TYPE
------------------------------------------------------- */
export type Message = {
  id: string;
  text: string;
  from: "user" | "assistant";
  createdAt?: string;
};

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
   SINGLE MESSAGE ANIMATION
------------------------------------------------------- */
function AnimatedMessage({ message }: { message: Message }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      <ChatBubble text={message.text} from={message.from} />
    </Animated.View>
  );
}

/* ------------------------------------------------------
   CHAT SCREEN
------------------------------------------------------- */
export default function ChatScreen() {
  const { sessionId: sessionIdParam, goal } = useLocalSearchParams<{
    sessionId?: string;
    goal?: string;
  }>();
  const { session } = useSupabase();
  const navigation = useRouter();
  const [sessionId, setSessionId] = useState<string | null>(
    sessionIdParam ?? null
  );

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [assistantTyping, setAssistantTyping] = useState(false);
  const [persisting, setPersisting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const hasHydratedRef = useRef(false);
  const latestMessagesRef = useRef<Message[]>([]);
  const storageKey = `reflection-chat-${sessionId || "local"}`;

  const listRef = useRef<FlatList>(null);
  const sendingRef = useRef(false);

  const scrollToBottom = () => {
    setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true });
    }, 40);
  };

  useEffect(scrollToBottom, [messages.length]);
  useEffect(() => {
    latestMessagesRef.current = messages;
  }, [messages]);

  // Hydrate from local first, then Supabase if available
  useEffect(() => {
    let isActive = true;
    hasHydratedRef.current = false;

    const hydrate = async () => {
      let nextMessages =
        latestMessagesRef.current.length > 0 ? latestMessagesRef.current : null;
      let foundLocalMessages = false;

      // Local cache
      try {
        const raw = await AsyncStorage.getItem(storageKey);
        if (raw && isActive) {
          const localMessages: Message[] = JSON.parse(raw);
          setMessages(localMessages);
          foundLocalMessages = localMessages.length > 0;
        }
      } catch {
        // ignore local errors
      }

      if (!sessionId || !session?.user) {
        if (isActive) {
          if (!foundLocalMessages && !nextMessages?.length) {
            nextMessages = [
              {
                id: "assistant_welcome",
                text: "Hi! I'm here with you. What would you like to reflect on today?",
                from: "assistant",
                createdAt: new Date().toISOString(),
              },
            ];
          }
          if (nextMessages) setMessages(nextMessages);
          hasHydratedRef.current = true;
        }
        return;
      }

      setLoadingHistory(true);
      try {
        const sessionRow = await fetchSessionById(sessionId);
        const history =
          (sessionRow?.reflection_chat as ReflectionChatMessage[]) ?? [];

        if (isActive && history.length > 0) {
          nextMessages = history.map((m) => ({
            id: m.id,
            text: m.text,
            from: m.from,
            createdAt: m.created_at,
          }));
          foundLocalMessages = true;
        } else if (isActive && !foundLocalMessages) {
          nextMessages =
            nextMessages && nextMessages.length > 0
              ? nextMessages
              : [
                  {
                    id: "assistant_welcome",
                    text: "Hi! I'm here with you. What would you like to reflect on today?",
                    from: "assistant",
                    createdAt: new Date().toISOString(),
                  },
                ];
        }
      } catch (err) {
        console.error("Failed to load reflection chat", err);
        if (isActive && !foundLocalMessages) {
          nextMessages =
            nextMessages && nextMessages.length > 0
              ? nextMessages
              : [
                  {
                    id: "assistant_welcome",
                    text: "Hi! I'm here with you. What would you like to reflect on today?",
                    from: "assistant",
                    createdAt: new Date().toISOString(),
                  },
                ];
        }
      } finally {
        if (isActive) {
          if (nextMessages) setMessages(nextMessages);
          setLoadingHistory(false);
          hasHydratedRef.current = true;
        }
      }
    };

    hydrate();
    return () => {
      isActive = false;
    };
  }, [sessionId, session?.user, storageKey]);

  // If no sessionId but user logged in, create a session so reflections can persist
  useEffect(() => {
    if (sessionId || !session?.user) return;
    let cancelled = false;
    (async () => {
      try {
        const newSession = await createSession(
          session.user.id,
          false,
          null,
          false
        );
        if (!cancelled) setSessionId(newSession.id);
      } catch (err) {
        console.error("Failed to auto-create session for chat", err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionId, session?.user]);

  const persistChat = useCallback(
    async (nextMessages: Message[]) => {
      if (!sessionId || !session?.user) return;
      setPersisting(true);
      try {
        const payload: ReflectionChatMessage[] = nextMessages.map((m) => ({
          id: m.id,
          text: m.text,
          from: m.from,
          created_at: m.createdAt ?? new Date().toISOString(),
        }));
        await saveReflectionChat(sessionId, payload);
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Failed to save reflection.";
        setError(msg);
      } finally {
        setPersisting(false);
      }
    },
    [sessionId, session?.user]
  );

  // Always cache locally so returning to chat is instant
  useEffect(() => {
    AsyncStorage.setItem(storageKey, JSON.stringify(messages)).catch(() => {});
    if (
      sessionId &&
      session?.user &&
      hasHydratedRef.current &&
      !loadingHistory &&
      messages.length > 0
    ) {
      persistChat(messages);
    }
  }, [
    messages,
    storageKey,
    sessionId,
    session?.user,
    loadingHistory,
    persistChat,
  ]);

  /* ------------------------------------------------------
     SEND MESSAGE
  ------------------------------------------------------- */
  const handleSend = useCallback(async () => {
    if (!input.trim() || sendingRef.current) return;
    sendingRef.current = true;
    setError(null);

    const userMessage: Message = {
      id: `${Date.now()}_u`,
      text: input.trim(),
      from: "user",
      createdAt: new Date().toISOString(),
    };

    const baseHistory = [...messages, userMessage];
    setMessages(baseHistory);
    setInput("");
    Keyboard.dismiss();

    setAssistantTyping(true);

    try {
      const replyText = await generateReflectionReply(baseHistory, goal ?? "");
      const reply: Message = {
        id: `assistant_${Date.now()}`,
        text: replyText,
        from: "assistant",
        createdAt: new Date().toISOString(),
      };

      const nextMessages = [...baseHistory, reply];
      setMessages(nextMessages);
      setAssistantTyping(false);
    } catch (err) {
      setAssistantTyping(false);
      const fallbackMessage: Message = {
        id: `${Date.now()}_error`,
        text:
          err instanceof Error
            ? err.message
            : "Hmm… something went wrong. Can you try again?",
        from: "assistant",
        createdAt: new Date().toISOString(),
      };
      const nextMessages = [...baseHistory, fallbackMessage];
      setMessages(nextMessages);
    } finally {
      sendingRef.current = false;
    }
  }, [input, messages, goal]);

  const renderMessage = ({ item }: { item: Message }) => (
    <AnimatedMessage message={item} />
  );

  const hasUserMessage = messages.some((m) => m.from === "user");

  const goBackToSession = () => {
    if (navigation.canGoBack()) navigation.back();
    else router.push("../(tabs)/session");
  };

  /* ------------------------------------------------------
     UI
  ------------------------------------------------------- */
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
      >
        <View style={styles.headerRow}>
          <Pressable
            hitSlop={12}
            onPress={() => {
              if (navigation.canGoBack()) navigation.back();
              else router.push("../(tabs)/session");
            }}
          >
            <Icon name="arrow-left" size={26} tint={theme.colors.accentDark} />
          </Pressable>
          <Text style={styles.header} variant="h2">
            Converse with Theo
          </Text>
          <View style={{ width: 26 }} />
        </View>
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
            style={{ flex: 1 }}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            ListFooterComponent={
              assistantTyping ? (
                <View style={{ paddingTop: theme.spacing.sm }}>
                  <TypingBubble />
                </View>
              ) : (
                <View style={{ height: theme.spacing.md }} />
              )
            }
          />
        </Pressable>
        {/* {hasUserMessage && (
          <View style={styles.sessionLink}>
            <ArrowAction
              label="Back to session"
              small
              onPress={goBackToSession}
              style={{ bottom: theme.spacing.sm }}
            />
          </View>
        )} */}
        {/* {persisting && (
          <Text
            color="accentDark"
            style={{ textAlign: "center", paddingBottom: theme.spacing.xs }}
          >
            Saving reflection...
          </Text>
        )} */}
        {error && (
          <Text color="danger" style={{ textAlign: "center" }}>
            {error}
          </Text>
        )}

        {/* ---------------------------------------- */}
        {/*     INPUT BAR                            */}
        {/* ---------------------------------------- */}
        <View style={styles.inputBar}>
          <View style={styles.textboxWrapper}>
            <Pressable
              onPress={handleSend}
              style={styles.sendAccessory}
              hitSlop={8}
            >
              <Icon name={"send"} style={styles.sendIcon} />
            </Pressable>
            <InputField
              placeholder={
                loadingHistory ? "Loading reflection..." : "Your text here..."
              }
              value={input}
              onChangeText={setInput}
              style={styles.textInput}
              returnKeyType="send"
              onSubmitEditing={handleSend}
              editable={!assistantTyping}
              onFocus={scrollToBottom}
              onBlur={scrollToBottom}
              rightAccessory={<View style={{ width: 1 }} />}
            />
          </View>

          <Pressable onPress={() => {}} style={styles.micWrapper}>
            <Image
              source={require("../assets/icons/mic.png")}
              style={styles.micIcon}
            />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ------------------------------------------------------
   STYLES
------------------------------------------------------- */
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.solidColors.white,
  },
  container: {
    flex: 1,
    backgroundColor: theme.solidColors.white,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl * 1.25,
    paddingBottom: theme.spacing.sm,
  },
  header: {
    textAlign: "center",
  },

  listContent: {
    flexGrow: 1,
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },

  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },

  sessionLink: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xs,
  },

  textboxWrapper: {
    flex: 1,
    position: "relative",
    minHeight: theme.input.height,
  },

  textInput: {
    position: "relative",
    borderWidth: 2,
    borderRadius: theme.radii.md,
    paddingLeft: theme.spacing.md,
    paddingRight: 35,
    height: theme.input.height,
    paddingVertical: 0,
    textAlignVertical: "center",
    marginBottom: 0,
  },

  sendAccessory: {
    position: "absolute",
    right: theme.spacing.sm,
    top: theme.input.height / 2 - 22 / 2,
    zIndex: 2,
  },

  sendIcon: {
    width: 22,
    tintColor: theme.colors.accentDark,
  },

  micWrapper: {
    marginLeft: theme.spacing.md,
    height: theme.input.height,
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
