import FontAwesome from "@expo/vector-icons/FontAwesome";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Checkbox } from "@/components/ui/Checkbox";
import { Spacer } from "@/components/ui/Spacer";
import { Text } from "@/components/ui/Text";
import { theme } from "@/design/theme";

type SettingOption = {
  id: string;
  label: string;
};

const WORK_SESSION_OPTIONS: SettingOption[] = [
  { id: "breakdown", label: "I would like task\nbreakdown help." },
  { id: "reflection", label: "I would like periodic\nreflection reminders." },
];

const COLLAB_OPTIONS: SettingOption[] = [
  { id: "collab", label: "Let me know if anyone\nrequests to collaborate." },
];

export default function NewSessionSettingsScreen() {
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const toggleOption = (id: string) => {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const headerGap = useMemo(
    () => ({
      marginTop: theme.spacing.lg,
      marginBottom: theme.spacing.md,
    }),
    []
  );

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

          <Text style={styles.heading}>Pick Your Settings</Text>

          <View style={{ width: 22 }} />
        </View>

        <View style={styles.divider} />

        <View style={headerGap} />
        <Text style={styles.sectionTitle}>Work Session</Text>
        <Spacer size="md" />

        <View style={styles.optionGroup}>
          {WORK_SESSION_OPTIONS.map((option) => (
            <Checkbox
              key={option.id}
              label={option.label}
              checked={!!selected[option.id]}
              onChange={() => toggleOption(option.id)}
              containerStyle={styles.checkboxContainer}
              labelStyle={styles.checkboxLabel}
              checkStyle={styles.checkmarkPoke}
            />
          ))}
        </View>

        <View style={headerGap} />
        <Text style={styles.sectionTitle}>Collaboration</Text>
        <Spacer size="md" />

        <View style={styles.optionGroup}>
          {COLLAB_OPTIONS.map((option) => (
            <Checkbox
              key={option.id}
              label={option.label}
              checked={!!selected[option.id]}
              onChange={() => toggleOption(option.id)}
              containerStyle={styles.checkboxContainer}
              labelStyle={styles.checkboxLabel}
              checkStyle={styles.checkmarkPoke}
            />
          ))}
        </View>

        <Spacer size="xxl" />

        <TouchableOpacity
          onPress={() => router.push("/goal")}
          style={styles.ctaRow}
          accessibilityRole="button"
          accessibilityLabel="Continue"
        >
          <Text style={styles.ctaText}>Keep going...</Text>
          <FontAwesome
            name="long-arrow-right"
            size={22}
            color={theme.colors.accentDark}
          />
        </TouchableOpacity>
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
  heading: {
    fontFamily: theme.typography.families.handwritten,
    fontSize: theme.typography.sizes.xl,
    color: theme.colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: "#CBB7A0",
    marginTop: theme.spacing.md,
  },
  sectionTitle: {
    fontFamily: theme.typography.families.handwritten,
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.text,
  },
  optionGroup: {
    gap: theme.spacing.md,
  },
  checkboxContainer: {
    alignItems: "flex-start",
  },
  checkboxLabel: {
    fontFamily: theme.typography.families.regular,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text,
    lineHeight: 24,
  },
  ctaRow: {
    marginTop: theme.spacing.xl,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: theme.spacing.md,
    alignSelf: "flex-end",
    width: "100%",
  },
  ctaText: {
    fontFamily: theme.typography.families.handwritten,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.accentDark,
  },
  checkmarkPoke: {
    marginTop: -6,
  },
});
