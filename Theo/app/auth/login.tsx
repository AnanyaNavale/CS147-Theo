import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
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
import { theme } from "@/design/theme";
import { signInWithEmail } from "@/lib/supabase";

const logo = require("@/assets/images/logo.png");
const teddy = require("@/assets/theo/working.png");

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (isSubmitting) return;
    setError(null);

    if (!email.trim() || !password) {
      setError("Enter both email and password to log in.");
      return;
    }

    setIsSubmitting(true);
    try {
      await signInWithEmail({ email: email.trim(), password });
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
                    color={theme.colors.accentDark}
                  />
                </TouchableOpacity>
              }
            />
          </View>

          {error && (
            <Text color="danger" style={styles.errorText}>
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

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
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
    color: theme.colors.text,
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
    color: theme.solidColors.textSecondary,
    fontFamily: theme.typography.families.regular,
  },
  linkAction: {
    color: theme.solidColors.accentDark,
    fontFamily: theme.typography.families.bold,
    marginTop: 4,
    textDecorationLine: "underline",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingCard: {
    backgroundColor: "#fff",
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.radii.lg,
    ...theme.shadow.medium,
  },
  loadingText: {
    fontFamily: theme.typography.families.bold,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text,
  },
});
