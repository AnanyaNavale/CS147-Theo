import React from "react";
import { StyleSheet, TouchableOpacity, View, ViewStyle } from "react-native";

import { Icon } from "@/components/ui/Icon";
import { Text } from "@/components/ui/Text";
import { theme } from "@/design/theme";
import { colors } from "@/assets/themes/colors";

type StepProgressIndicatorProps = {
  steps: string[];
  /** Number of steps that should appear active (filled dots). */
  activeCount?: number;
  style?: ViewStyle;
  showBackIcon?: boolean;
  showMenuIcon?: boolean;
  onPressBack?: () => void;
  onPressMenu?: () => void;
  tint?: string;
  iconSize?: number;
};

export function StepProgressIndicator({
  steps,
  activeCount = 0,
  style,
  showBackIcon = true,
  showMenuIcon = true,
  onPressBack,
  onPressMenu,
  tint = colors.light.progressBarIncomplete,
  iconSize = 26,
}: StepProgressIndicatorProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconSlot}>
        {showBackIcon ? (
          <TouchableOpacity
            onPress={onPressBack}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Icon name="arrow-left" size={36} tint={colors.light.iconsStandalone} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: iconSize, height: iconSize }} />
        )}
      </View>

      <View style={styles.progressArea}>
        <View style={styles.trackRow}>
          {steps.map((label, index) => {
            const isActive = index < activeCount;
            const isLast = index === steps.length - 1;
            const isFirst = index === 0;

            return (
              <View key={`${label}-track`} style={styles.stepWrapper}>
                {!isFirst && <View style={[styles.halfLine, styles.lineLeft]} />}
                {!isLast && <View style={[styles.halfLine, styles.lineRight]} />}

                <View
                  style={[
                    styles.stepDot,
                    isActive ? styles.stepDotActive : null,
                  ]}
                />
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

      <View style={styles.iconSlot}>
        {showMenuIcon ? (
          <TouchableOpacity
            onPress={onPressMenu}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Menu"
          >
            <Icon name="more-vertical" size={36} tint={colors.light.iconsStandalone} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: iconSize, height: iconSize }} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: theme.spacing.md,
    width: "100%",
  },

  progressArea: {
    flex: 1,
  },

  trackRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  stepWrapper: {
    flex: 1,
    alignItems: "center",
    position: "relative",
    paddingHorizontal: theme.spacing.xs,
  },

  halfLine: {
    position: "absolute",
    top: 7,
    height: 2,
    backgroundColor: theme.colors.border,
    width: "50%",
  },

  lineLeft: {
    left: 0,
  },

  lineRight: {
    right: 0,
  },

  stepDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    // borderWidth: 2,
    // borderColor: ,
    backgroundColor: colors.light.progressBarIncomplete,
    marginTop: 1,
  },

  stepDotActive: {
    backgroundColor: theme.colors.accentDark,
  },

  stepLabel: {
    marginTop: theme.spacing.xs,
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.families.regular,
    color: theme.colors.accentDark,
  },

  stepLabelInactive: {
    color: colors.light.progressBarIncomplete,
  },

  iconSlot: {
    width: 40,
    alignItems: "center",
    justifyContent: "center",
  },
});
