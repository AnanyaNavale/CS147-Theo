import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { BasicButton } from "@/components/BasicButton";
import SvgStrokeText from "@/components/SvgStrokeText";
import { Container } from "@/components/ui/Container";
import { InputField } from "@/components/ui/InputField";
import { Spacer } from "@/components/ui/Spacer";
import { Text } from "@/components/ui/Text";
import { Theme } from "@/design/theme";
import { useAppTheme } from "@/hooks/ThemeContext";
import { signInWithEmail } from "@/lib/supabase";

const logo = require("@/assets/images/logo.png");
const teddy = require("@/assets/theo/working.png");
const TEST_EMAIL = "test@test.com";
const TEST_PASSWORD = "testtest";

export default function LoginScreen() {
  const router = useRouter();
  const { colors: palette, theme } = useAppTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const performLogin = async (credentials: {
    email: string;
    password: string;
  }) => {
    if (isSubmitting) return;
    setError(null);

    if (!credentials.email.trim() || !credentials.password) {
      setError("Enter both email and password to log in.");
      return;
    }

    setIsSubmitting(true);
    try {
      await signInWithEmail({
        email: credentials.email.trim(),
        password: credentials.password,
      });
      setIsRedirecting(true);
      router.replace("/(tabs)");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "We couldn't log you in right now.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = async () => performLogin({ email, password });

  const handleTestLogin = async () => {
    setEmail(TEST_EMAIL);
    setPassword(TEST_PASSWORD);
    await performLogin({ email: TEST_EMAIL, password: TEST_PASSWORD });
  };

  const styles = useMemo(() => createStyles(theme, palette), [theme, palette]);

  return (
    <Container padded={false} style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          <View style={styles.hero}>
            <Image source={logo} style={styles.logo} />
            <Image source={teddy} style={styles.teddy} />
          </View>

          <SvgStrokeText text={"Log In"} />

          <Spacer size="sm" />

          <View style={styles.form}>
            <InputField
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              returnKeyType="next"
            />
            <InputField
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoComplete="password"
              returnKeyType="done"
              rightAccessory={
                <TouchableOpacity
                  onPress={() => setShowPassword((prev) => !prev)}
                  hitSlop={10}
                >
                  <Feather
                    name={showPassword ? "eye-off" : "eye"}
                    size={20}
                    color={palette.primary}
                  />
                </TouchableOpacity>
              }
            />
          </View>

          {error && (
            <Text color="tertiary" style={styles.errorText}>
              {error}
            </Text>
          )}

          <BasicButton
            text={isSubmitting ? "Logging in..." : "Log in"}
            onPress={handleLogin}
            disabled={isSubmitting || !email.trim() || !password}
            style={styles.sessionButton}
            //labelStyle={styles.sessionButtonLabel}
          />

          <View style={styles.linkRow}>
            <Text style={styles.linkPrompt}>Don't have an account?</Text>
            <TouchableOpacity
              onPress={() => router.replace("/auth/signup")}
              disabled={isSubmitting}
            >
              <Text style={styles.linkAction}>Create one!</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.linkRow}>
            <Text style={styles.linkPrompt}>Here to just try it out?</Text>

            <TouchableOpacity
              onPress={handleTestLogin}
              disabled={isSubmitting}
              style={styles.linkAction}
            >
              <Text style={styles.linkAction}>Log in with test account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {isSubmitting && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            <Text style={styles.loadingText}>
              {isRedirecting ? "Opening Theo..." : "Logging you in..."}
            </Text>
          </View>
        </View>
      )}
    </Container>
  );
}

function createStyles(
  theme: Theme,
  palette: typeof import("@/assets/themes/colors").colors.light
) {
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: palette.background,
    },
    scroll: {
      flexGrow: 1,
      paddingHorizontal: theme.spacing.xl,
      paddingBottom: theme.spacing.xl,
      alignItems: "center",
      justifyContent: "center",
    },
    hero: {
      alignItems: "center",
      justifyContent: "center",
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.xl,
    },
    logo: {
      width: 120,
      height: 52,
      resizeMode: "contain",
    },
    teddy: {
      width: 140,
      height: 150,
      marginLeft: 20,
      resizeMode: "contain",
    },
    title: {
      color: palette.header1,
      marginTop: theme.spacing.sm,
    },
    form: {
      width: "100%",
      marginTop: theme.spacing.md,
    },
    errorText: {
      width: "100%",
      marginTop: theme.spacing.xs,
      marginBottom: theme.spacing.sm,
    },
    sessionButton: {
      marginTop: theme.spacing.lg,
    },
    sessionButtonLabel: {
      fontFamily: theme.typography.families.medium,
      letterSpacing: 0.4,
    },
    linkRow: {
      alignItems: "center",
      marginTop: theme.spacing.lg,
    },
    linkPrompt: {
      color: palette.quote ?? palette.inactive ?? palette.body,
      fontFamily: theme.typography.families.regular,
    },
    linkAction: {
      color: palette.header2 ?? palette.primary,
      fontFamily: theme.typography.families.bold,
      marginTop: 4,
      textDecorationLine: "underline",
    },
    testAccountButton: {
      alignItems: "center",
      marginTop: theme.spacing.md,
    },
    testAccountText: {
      color: palette.header2 ?? palette.primary,
      fontFamily: theme.typography.families.bold,
      textDecorationLine: "underline",
    },
    testAccountHint: {
      marginTop: 4,
      color: palette.quote ?? palette.inactive ?? palette.body,
      fontFamily: theme.typography.families.regular,
      fontSize: theme.typography.sizes.sm,
    },
    loadingOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.2)",
      justifyContent: "center",
      alignItems: "center",
    },
    loadingCard: {
      backgroundColor: palette.background,
      paddingVertical: theme.spacing.lg,
      paddingHorizontal: theme.spacing.xl,
      borderRadius: theme.radii.lg,
      ...theme.shadow.medium,
      borderColor: palette.border,
      borderWidth: 1,
      width: "80%",
      alignItems: "center",
    },
    loadingText: {
      fontFamily: theme.typography.families.bold,
      fontSize: theme.typography.sizes.md,
      color: palette.header1 ?? palette.body,
    },
  });
}
