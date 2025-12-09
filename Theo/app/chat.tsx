import { InputField } from "@/components";
import { AppModal } from "@/components/custom/AppModal";
import { ChatBubble } from "@/components/custom/ChatBubble";
import { Icon } from "@/components/custom/Icon";
import SvgStrokeText from "@/components/custom/SvgStrokeText";
import { Text } from "@/components/custom/Text";
import { VoiceRecorderModal } from "@/components/custom/VoiceRecorderModal";
import { Theme } from "@/design/theme";
import { useAppTheme } from "@/hooks/ThemeContext";
import { generateReflectionReply } from "@/lib/ai";
import {
  ReflectionChatMessage,
  createSession,
  fetchSessionById,
  saveReflectionChat,
} from "@/lib/supabase";
import { useSupabase } from "@/providers/SupabaseProvider";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams, useRouter } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Alert,
  Animated,
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

/* ------------------------------------------------------
   MESSAGE TYPE
------------------------------------------------------- */
export type Message = {
  id: string;
  text: string;
  from: "user" | "assistant";
  createdAt?: string;
  isVoice?: boolean;
  displayText?: string;
};

/* ------------------------------------------------------
   TYPING INDICATOR BUBBLE
------------------------------------------------------- */
function TypingBubble({ styles }: { styles: ReturnType<typeof createStyles> }) {
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
function AnimatedMessage({
  message,
  content,
}: {
  message: Message;
  content?: React.ReactNode;
}) {
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
      <ChatBubble
        text={message.displayText ?? message.text}
        from={message.from}
        content={content}
      />
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
  const { colors: palette, theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme, palette), [theme, palette]);
  const insets = useSafeAreaInsets();
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
  const [showRecorder, setShowRecorder] = useState(false);
  const [showQuotaModal, setShowQuotaModal] = useState(false);
  const hasHydratedRef = useRef(false);
  const latestMessagesRef = useRef<Message[]>([]);
  const storageKey = `reflection-chat-${sessionId || "local"}`;

  const listRef = useRef<FlatList>(null);
  const sendingRef = useRef(false);
  const pendingSaveRef = useRef<ReflectionChatMessage[] | null>(null);
  const savingRef = useRef(false);

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
          setMessages(
            localMessages.map((m) => ({
              ...m,
              displayText:
                m.displayText ?? (m.isVoice ? "Voice message" : m.text),
            }))
          );
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
          setMessages(
            history.map((m) => ({
              id: m.id,
              text: m.text,
              from: m.from,
              createdAt: m.created_at,
              isVoice: m.isVoice ?? false,
              displayText:
                m.displayText ??
                ((m as any)?.display_text as string | undefined) ??
                (m.isVoice ? "Voice message" : m.text),
            }))
          );
        } else if (isActive) {
          setMessages([
            {
              id: "assistant_welcome",
              text: "Hi! I'm here with you. What would you like to reflect on today?",
              from: "assistant",
              createdAt: new Date().toISOString(),
            },
          ]);
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
          "false",
          false,
          "false"
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

      // Always keep the latest snapshot and serialize saves to avoid out-of-order overwrites.
      pendingSaveRef.current = nextMessages.map((m) => ({
        id: m.id,
        text: m.text,
        from: m.from,
        isVoice: m.isVoice ?? false,
        displayText: m.displayText ?? (m.isVoice ? "Voice message" : null),
        created_at: m.createdAt ?? new Date().toISOString(),
      }));

      if (savingRef.current) return;

      savingRef.current = true;
      setPersisting(true);

      try {
        while (pendingSaveRef.current) {
          const payload = pendingSaveRef.current;
          pendingSaveRef.current = null;
          if (!payload) continue;
          try {
            await saveReflectionChat(sessionId, payload);
          } catch (err) {
            const msg =
              err instanceof Error ? err.message : "Failed to save reflection.";
            setError(msg);
          }
        }
      } finally {
        savingRef.current = false;
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
     SEND MESSAGE (text + voice)
  ------------------------------------------------------- */
  const sendMessage = useCallback(
    async (
      text: string,
      options?: { isVoice?: boolean; displayText?: string }
    ) => {
      const trimmed = text.trim();
      if (!trimmed || sendingRef.current) return;
      sendingRef.current = true;
      setError(null);

      const now = new Date().toISOString();
      const userMessage: Message = {
        id: `${Date.now()}_${options?.isVoice ? "voice" : "u"}`,
        text: trimmed,
        from: "user",
        createdAt: now,
        isVoice: options?.isVoice ?? false,
        displayText:
          options?.displayText ??
          (options?.isVoice ? "Voice message" : undefined),
      };

      const baseHistory = [...messages, userMessage];
      setMessages(baseHistory);
      if (!options?.isVoice) {
        setInput("");
      }
      Keyboard.dismiss();

      setAssistantTyping(true);

      try {
        const replyText = await generateReflectionReply(
          baseHistory,
          goal ?? ""
        );
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
        const errMsg =
          err instanceof Error ? err.message : "Something went wrong.";

        setAssistantTyping(false);
        setShowQuotaModal(true);
        // Do not append fallback text; the modal informs the user.
      } finally {
        sendingRef.current = false;
      }
    },
    [messages, goal]
  );

  const handleSend = useCallback(() => {
    sendMessage(input);
  }, [input, sendMessage]);

  const handleVoiceSubmit = useCallback(
    (transcript: string) => {
      sendMessage(transcript, { isVoice: true, displayText: "Voice message" });
      setShowRecorder(false);
    },
    [sendMessage]
  );

  const renderVoiceContent = (message: Message) => {
    if (!message.isVoice || message.from !== "user") return null;
    return (
      <Pressable
        style={styles.voiceButton}
        onPress={() => {
          Alert.alert("Voice message", message.text);
        }}
      >
        <View style={styles.voiceButtonRow}>
          <Icon
            name="mic"
            size={18}
            tint={theme.colors.background}
            style={{ marginRight: theme.spacing.xs }}
          />
          <Text style={styles.voiceButtonLabel}>Voice message</Text>
        </View>
        <Text style={styles.voiceTranscriptPreview} numberOfLines={3}>
          {message.text}
        </Text>
      </Pressable>
    );
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <AnimatedMessage message={item} content={renderVoiceContent(item)} />
  );
  /* ------------------------------------------------------
     UI
  ------------------------------------------------------- */
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? insets.top : 0}
      >
        <View style={styles.header}>
          <TouchableOpacity
            hitSlop={12}
            onPress={() => {
              if (navigation.canGoBack()) navigation.back();
              else router.push("../(tabs)/session");
            }}
            style={styles.backButton}
          >
            <Feather
              name={"arrow-left"}
              size={36}
              color={palette.iconsStandalone}
            />
          </TouchableOpacity>
          <View style={styles.dateContainer}>
            <SvgStrokeText text="Converse with Theo" />
          </View>
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
                  <TypingBubble styles={styles} />
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
            color="header2"
            style={{ textAlign: "center", paddingBottom: theme.spacing.xs }}
          >
            Saving reflection...
          </Text>
        )} */}
        {error && (
          <Text color="tertiary" style={{ textAlign: "center" }}>
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

          <Pressable
            onPress={() => setShowRecorder(true)}
            style={styles.micWrapper}
          >
            <Image
              source={require("../assets/icons/mic.png")}
              style={styles.micIcon}
            />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
      <VoiceRecorderModal
        visible={showRecorder}
        onClose={() => setShowRecorder(false)}
        onTranscriptReady={handleVoiceSubmit}
        confirmLabel="Send to chat"
        title="Share your thoughts"
      />

      <AppModal
        visible={showQuotaModal}
        variant="custom"
        onClose={() => setShowQuotaModal(false)}
        title="AI limit reached"
        message="We’re limited in how many AI calls we can make. Please try features that don’t require AI for the moment."
      />
    </SafeAreaView>
  );
}

/* ------------------------------------------------------
   STYLES
------------------------------------------------------- */
function createStyles(
  theme: Theme,
  palette: typeof import("@/design/colors").colors.light
) {
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: palette.background,
    },
    container: {
      flex: 1,
      backgroundColor: palette.background,
    },

    header: {
      height: 70,
      flexDirection: "row",
      alignItems: "center",
      position: "relative",
      justifyContent: "center",
      backgroundColor: palette.background,
    },
    backButton: {
      position: "absolute",
      left: 16,
      top: 22,
      zIndex: 2,
      backgroundColor: palette.background,
    },
    dateContainer: {
      position: "absolute",
      top: 25,
      left: 0,
      right: 0,
      alignItems: "center",
      zIndex: 1,
      width: "100%",
      backgroundColor: palette.background,
    },

    listContent: {
      flexGrow: 1,
      padding: theme.spacing.lg,
      paddingBottom: theme.spacing.md,
    },

    inputBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing.xl,
      height: theme.input.height + theme.spacing.md + theme.spacing.xl,
      backgroundColor: palette.background,
    },

    sessionLink: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.xs,
    },

    textboxWrapper: {
      flex: 1,
    },

    textInput: {
      borderWidth: 2,
      marginTop: 11,
      paddingRight: 35,
    },

    sendAccessory: {
      position: "absolute",
      right: theme.spacing.sm,
      top: 19,
      justifyContent: "center",
      alignItems: "center",
      zIndex: 2,
    },

    sendIcon: {
      width: 28,
      height: 28,
      tintColor: palette.primary,
    },

    micWrapper: {
      marginLeft: theme.spacing.md,
      height: theme.input.height,
      width: theme.input.height,
      justifyContent: "center",
      alignItems: "center",
    },

    micIcon: {
      tintColor: palette.primary,
      height: theme.input.height - 4,
      width: theme.input.height - 4,
      resizeMode: "contain",
      top: 1,
    },
    voiceButton: {
      backgroundColor: palette.primary,
      borderRadius: theme.radii.md,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
    },
    voiceButtonRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: theme.spacing.xs,
    },
    voiceButtonLabel: {
      color: palette.buttonText ?? palette.user ?? "#fff",
      fontFamily: theme.typography.families.medium,
      fontSize: theme.typography.sizes.md,
    },
    voiceTranscriptPreview: {
      color: palette.buttonText ?? palette.user ?? "#fff",
      opacity: 0.9,
      fontFamily: theme.typography.families.regular,
      lineHeight: theme.typography.sizes.md * 1.3,
    },

    typingBubble: {
      flexDirection: "row",
      backgroundColor: palette.primary,
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
      backgroundColor: theme.colors.background,
      marginHorizontal: 3,
    },
  });
}
