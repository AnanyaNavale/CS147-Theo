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
import { signUpWithEmail } from "@/lib/supabase";

const logo = require("@/assets/images/logo.png");
const teddy = require("@/assets/theo/waving.png");

export default function SignUpScreen() {
  const router = useRouter();
  const { colors: palette, theme } = useAppTheme();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const styles = useMemo(() => createStyles(theme, palette), [theme, palette]);

  const handleSignUp = async () => {
    if (isSubmitting) return;

    setError(null);
    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      setError("Please fill in every field to create your account.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords need to match.");
      return;
    }

    setIsSubmitting(true);
    try {
      await signUpWithEmail({
        email: email.trim(),
        password,
        displayName: fullName.trim(),
      });
      router.replace("/(tabs)");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "We couldn't create your account right now.";
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

          <SvgStrokeText text={"Create Account"} />

          <Spacer size="sm" />

          <View style={styles.form}>
            <InputField
              placeholder="Name"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
              autoComplete="name"
              returnKeyType="next"
            />
            <InputField
              placeholder="Email address"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              returnKeyType="next"
            />
            <InputField
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoComplete="password-new"
              returnKeyType="next"
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
            <InputField
              placeholder="Confirm password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              autoComplete="password-new"
              returnKeyType="done"
              rightAccessory={
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword((prev) => !prev)}
                  hitSlop={10}
                >
                  <Feather
                    name={showConfirmPassword ? "eye-off" : "eye"}
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
            text={isSubmitting ? "Creating..." : "Create account"}
            onPress={handleSignUp}
            disabled={
              isSubmitting ||
              !fullName.trim() ||
              !email.trim() ||
              !password ||
              !confirmPassword
            }
            style={styles.sessionButton}
          />

          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => router.replace("/auth/login")}
            disabled={isSubmitting}
          >
            <Text style={styles.linkPrompt}>Already have an account?</Text>
            <Text style={styles.linkAction}>Log in!</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.sm,
    },
    logo: {
      width: 120,
      height: 52,
      resizeMode: "contain",
    },
    teddy: {
      width: 140,
      height: 150,
      resizeMode: "contain",
    },
    sessionButton: {
      marginTop: theme.spacing.lg,
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
    linkRow: {
      alignItems: "center",
      marginTop: theme.spacing.lg,
    },
    linkPrompt: {
      color: palette.quote ?? palette.inactive ?? palette.body,
      fontFamily: theme.typography.families.regular,
    },
    linkAction: {
      color: palette.primary,
      fontFamily: theme.typography.families.bold,
      marginTop: 4,
      textDecorationLine: "underline",
    },
  });
}
