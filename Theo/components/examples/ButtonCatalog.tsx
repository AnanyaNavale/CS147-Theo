import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { Button } from "../ui/Button";
import { Text } from "../ui/Text";
import { theme } from "../../design/theme";
import { Spacer } from "../ui/Spacer";

export function ButtonCatalog() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* TITLE */}
      <Text style={styles.header}>Button Catalog</Text>

      {/* VARIANTS */}
      <Section title="Variants">
        <Button label="Gold" variant="gold" onPress={() => {}} />
        <Spacer size="md" />
        <Button label="Brown" variant="brown" onPress={() => {}} />
        <Spacer size="md" />
        <Button label="Danger" variant="danger" onPress={() => {}} />
        <Spacer size="md" />
        <Button
          label="Outline Brown"
          variant="outlineBrown"
          onPress={() => {}}
        />
        <Spacer size="md" />
        <Button label="Outline Gold" variant="outlineGold" onPress={() => {}} />
        <Spacer size="md" />
        <Button label="Ghost" variant="ghost" onPress={() => {}} />
        <Spacer size="md" />
        <Button label="Subtle" variant="subtle" onPress={() => {}} />
      </Section>

      {/* SIZES */}
      <Section title="Sizes">
        <Button label="Small" size="sm" onPress={() => {}} />
        <Spacer size="md" />
        <Button label="Medium" size="md" onPress={() => {}} />
        <Spacer size="md" />
        <Button label="Large" size="lg" onPress={() => {}} />
      </Section>

      {/* VARIANT × SIZE GRID */}
      <Section title="Variant x Size Grid">
        {[
          "gold",
          "brown",
          "danger",
          "outlineBrown",
          "outlineGold",
          "ghost",
          "subtle",
        ].map((variant) => (
          <View key={variant} style={{ marginBottom: theme.spacing.lg }}>
            <Text style={styles.subheader}>{variant}</Text>
            <Spacer size="sm" />

            <Button
              label="Small"
              variant={variant as any}
              size="sm"
              onPress={() => {}}
            />
            <Spacer size="sm" />

            <Button
              label="Medium"
              variant={variant as any}
              size="md"
              onPress={() => {}}
            />
            <Spacer size="sm" />

            <Button
              label="Large"
              variant={variant as any}
              size="lg"
              onPress={() => {}}
            />
          </View>
        ))}
      </Section>
    </ScrollView>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Spacer size="sm" />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.lg,
    paddingBottom: 150,
  },
  header: {
    fontSize: theme.typography.sizes.xl,
    fontFamily: theme.typography.families.bold,
    marginBottom: theme.spacing.lg,
  },
  section: {
    marginBottom: theme.spacing.xl,
    padding: theme.spacing.md,
    backgroundColor: "#F6F0E8",
    borderRadius: theme.radii.lg,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.lg,
    fontFamily: theme.typography.families.bold,
    color: theme.colors.text,
  },
  subheader: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.mutedText,
  },
});
