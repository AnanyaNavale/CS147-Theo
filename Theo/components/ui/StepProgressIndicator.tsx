import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";

import { Text } from "@/components/ui/Text";
import { theme } from "@/design/theme";

type StepProgressIndicatorProps = {
  steps: string[];
  /** Number of steps that should appear active (filled dots). */
  activeCount?: number;
  style?: ViewStyle;
};

export function StepProgressIndicator({
  steps,
  activeCount = 0,
  style,
}: StepProgressIndicatorProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.trackRow}>
        {steps.map((label, index) => {
          const isActive = index < activeCount;
          const isLast = index === steps.length - 1;

          return (
            <React.Fragment key={`${label}-track`}>
              <View
                style={[styles.stepDot, isActive ? styles.stepDotActive : null]}
              />

              {!isLast && <View style={styles.stepLine} />}
            </React.Fragment>
          );
        })}
      </View>

      <View style={styles.labelRow}>
        {steps.map((label, index) => {
          const isActive = index < activeCount;
          return (
            <View key={`${label}-label`}>
              <Text
                style={[
                  styles.stepLabel,
                  !isActive ? styles.stepLabelInactive : null,
                ]}
              >
                {label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.lg,
  },

  trackRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "stretch",
    marginTop: theme.spacing.xs,
    width: "112%",
    marginLeft: -10,
  },

  stepDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: theme.colors.accentDark,
    backgroundColor: theme.colors.background,
  },

  stepDotActive: {
    backgroundColor: theme.colors.accentDark,
  },

  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: theme.colors.border,
    marginHorizontal: theme.spacing.sm,
  },

  stepLabel: {
    marginTop: 4,
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.families.regular,
    color: theme.colors.accentDark,
  },

  stepLabelInactive: {
    color: theme.colors.mutedText,
  },
});
