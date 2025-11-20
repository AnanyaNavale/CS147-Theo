import FontAwesome from "@expo/vector-icons/FontAwesome";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Spacer } from "@/components";
import { Text } from "@/components/ui/Text";
import { theme } from "@/design/theme";

const RECENT_SESSIONS = [
  "45 min - CS 147 reading",
  "60 min - Research work",
  "75 min - Internship app",
  "50 min - Interview prep",
  "45 min - Slide deck prep",
];

type GradientButtonProps = {
  label: string;
  onPress?: () => void;
  gradient?: readonly [string, string];
  icon?: React.ComponentProps<typeof FontAwesome>["name"];
  testID?: string;
  width?: number;
};

function GradientButton({
  label,
  onPress,
  gradient = theme.colors.gradients.brown,
  icon,
  testID,
  width,
}: GradientButtonProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      style={[styles.buttonWrapper, width && { width }]}
      testID={testID}
    >
      <LinearGradient colors={gradient} style={styles.buttonBg}>
        <Text style={styles.buttonLabel}>{label}</Text>

        {icon ? (
          <View style={styles.buttonIconBadge}>
            <FontAwesome name={icon} size={16} color="#fff" />
          </View>
        ) : null}
      </LinearGradient>
    </TouchableOpacity>
  );
}

export default function StartSessionScreen() {
  const handleCreateNew = () => router.push("/new-session");
  const { width } = useWindowDimensions();
  const buttonWidth = width * 0.66;

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
                size={16}
                color={theme.colors.text}
                style={styles.titleIcon}
              />
            </View>
          </View>

          <View style={{ width: 22 }} />
        </View>

        <Spacer size="md" />

        <Text style={styles.subtitle}>How would you like to get started?</Text>

        <Spacer size="md" />

        <GradientButton
          label="Create a new session"
          onPress={handleCreateNew}
          gradient={theme.colors.gradients.brown}
          icon="pencil"
          testID="create-new-session"
          width={buttonWidth}
        />

        <Spacer size="md" />

        <View style={styles.dividerRow}>
          <View style={styles.line} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.line} />
        </View>

        <Spacer size="sm" />

        <Text style={styles.sectionLabel}>Copy a recent session:</Text>

        <Spacer size="sm" />

        <View style={styles.list}>
          {RECENT_SESSIONS.map((session) => (
            <GradientButton
              key={session}
              label={session}
              gradient={theme.colors.gradients.gold}
              width={buttonWidth}
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
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
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
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.text,
  },
  titleIcon: {
    marginLeft: theme.spacing.xs,
  },
  subtitle: {
    textAlign: "center",
    fontFamily: theme.typography.families.regular,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text,
  },
  buttonWrapper: {
    borderRadius: theme.radii.lg,
    overflow: "hidden",
    alignSelf: "center",
    ...theme.shadow.soft,
  },
  buttonBg: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  buttonLabel: {
    fontFamily: theme.typography.families.bold,
    fontSize: theme.typography.sizes.sm,
    color: "#fff",
  },
  buttonIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
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
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.text,
  },
  sectionLabel: {
    fontFamily: theme.typography.families.handwritten,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text,
    textAlign: "center",
  },
  list: {
    gap: theme.spacing.sm,
    alignItems: "center",
  },
});
