import FontAwesome from "@expo/vector-icons/FontAwesome";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Spacer } from "@/components";
import { Text } from "@/components/ui/Text";
import { theme } from "@/design/theme";

const RECENT_SESSIONS = [
  "45 min · CS 147 reading",
  "60 min · Research work",
  "75 min · Internship app",
  "50 min · Interview prep",
  "45 min · Slide deck prep",
];

type GradientButtonProps = {
  label: string;
  onPress?: () => void;
  gradient?: readonly [string, string];
  icon?: React.ComponentProps<typeof FontAwesome>["name"];
  testID?: string;
};

function GradientButton({
  label,
  onPress,
  gradient = theme.colors.gradients.brown,
  icon,
  testID,
}: GradientButtonProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      style={styles.buttonWrapper}
      testID={testID}
    >
      <LinearGradient colors={gradient} style={styles.buttonBg}>
        <Text style={styles.buttonLabel}>{label}</Text>

        {icon ? (
          <View style={styles.buttonIconBadge}>
            <FontAwesome name={icon} size={18} color="#fff" />
          </View>
        ) : null}
      </LinearGradient>
    </TouchableOpacity>
  );
}

export default function StartSessionScreen() {
  const handleCreateNew = () => router.push("/new-session");

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <FontAwesome
              name="arrow-left"
              size={22}
              color={theme.colors.accentDark}
            />
          </TouchableOpacity>

          <View style={styles.titleGroup}>
            <Text style={styles.titleLine}>Start a</Text>
            <View style={styles.titleRow}>
              <Text style={styles.titleLine}>Work Session</Text>
              <FontAwesome
                name="pencil"
                size={18}
                color={theme.colors.text}
                style={styles.titleIcon}
              />
            </View>
          </View>

          <View style={{ width: 22 }} />
        </View>

        <Spacer size="lg" />

        <Text style={styles.subtitle}>How would you like to get started?</Text>

        <Spacer size="lg" />

        <GradientButton
          label="Create a new session"
          onPress={handleCreateNew}
          gradient={theme.colors.gradients.brown}
          icon="pencil"
          testID="create-new-session"
        />

        <Spacer size="lg" />

        <View style={styles.dividerRow}>
          <View style={styles.line} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.line} />
        </View>

        <Spacer size="md" />

        <Text style={styles.sectionLabel}>Copy a recent session:</Text>

        <Spacer size="md" />

        <View style={styles.list}>
          {RECENT_SESSIONS.map((session) => (
            <GradientButton
              key={session}
              label={session}
              gradient={theme.colors.gradients.gold}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FDF6EE",
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  titleGroup: {
    alignItems: "center",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  titleLine: {
    fontFamily: theme.typography.families.handwritten,
    fontSize: theme.typography.sizes.xl,
    color: theme.colors.text,
  },
  titleIcon: {
    marginLeft: theme.spacing.xs,
  },
  subtitle: {
    textAlign: "center",
    fontFamily: theme.typography.families.regular,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text,
  },
  buttonWrapper: {
    borderRadius: theme.radii.lg,
    overflow: "hidden",
    ...theme.shadow.soft,
  },
  buttonBg: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  buttonLabel: {
    fontFamily: theme.typography.families.bold,
    fontSize: theme.typography.sizes.md,
    color: "#fff",
  },
  buttonIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.6)",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.sm,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#CBB7A0",
  },
  dividerText: {
    fontFamily: theme.typography.families.regular,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text,
  },
  sectionLabel: {
    fontFamily: theme.typography.families.handwritten,
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.text,
    textAlign: "center",
  },
  list: {
    gap: theme.spacing.sm,
  },
});
