import { useNavigation } from "@react-navigation/native";
import { router } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, TouchableOpacity, View, ViewStyle } from "react-native";

import { AppModal } from "@/components/ui/AppModal";
import { Icon } from "@/components/ui/Icon";
import { Text } from "@/components/ui/Text";
import { theme } from "@/design/theme";

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
  tint = theme.colors.accentDark,
  iconSize = 26,
}: StepProgressIndicatorProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const navigation = useNavigation();

  const toggleMenu = () => {
    onPressMenu?.();
    setMenuOpen((prev) => !prev);
  };

  const handleBack = () => {
    setMenuOpen(false);
    if (onPressBack) {
      onPressBack();
      return;
    }

    if (activeCount <= 1) {
      router.replace("./");
      return;
    }

    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    router.replace("../(tabs)/index");
  };

  const handleMenuAction = (action: () => void) => () => {
    setMenuOpen(false);
    action();
  };

  return (
    <View style={[styles.container, style]}>
      {menuOpen && (
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          onPress={() => setMenuOpen(false)}
          activeOpacity={1}
        />
      )}

      <View style={styles.iconSlot}>
        {showBackIcon ? (
          <TouchableOpacity
            onPress={handleBack}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Icon name="arrow-left" size={iconSize} tint={tint} />
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
                {!isFirst && (
                  <View style={[styles.halfLine, styles.lineLeft]} />
                )}
                {!isLast && (
                  <View style={[styles.halfLine, styles.lineRight]} />
                )}

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
            onPress={toggleMenu}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Menu"
          >
            <Icon name="more-vertical" size={iconSize - 4} tint={tint} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: iconSize, height: iconSize }} />
        )}
      </View>

      {menuOpen && (
        <View style={styles.menuCard}>
          <MenuItem
            label="Exit setup"
            icon="exit"
            onPress={handleMenuAction(() => setShowExitConfirm(true))}
          />
          <View style={styles.menuDivider} />
          <MenuItem
            label="Help"
            icon="help"
            onPress={handleMenuAction(() => setShowHelpModal(true))}
          />
          <View style={styles.menuDivider} />
          <MenuItem
            label="Report a problem"
            icon="report"
            onPress={handleMenuAction(() => setShowReportModal(true))}
          />
        </View>
      )}

      {/* Exit confirmation */}
      <AppModal
        visible={showExitConfirm}
        onClose={() => setShowExitConfirm(false)}
        variant="alert"
        title="Exit setup?"
        message="This will leave the setup flow and return you home."
        confirmLabel="Exit"
        cancelLabel="Cancel"
        onConfirm={() => {
          setShowExitConfirm(false);
          router.push("../");
        }}
      />

      {/* Help modal */}
      <AppModal
        visible={showHelpModal}
        onClose={() => setShowHelpModal(false)}
        variant="custom"
        title="Help"
      >
        <Text style={styles.modalBody}>Help content coming soon.</Text>
      </AppModal>

      {/* Report modal */}
      <AppModal
        visible={showReportModal}
        onClose={() => setShowReportModal(false)}
        variant="custom"
        title="Report a problem"
      >
        <Text style={styles.modalBody}>
          Reporting will be available shortly.
        </Text>
      </AppModal>
    </View>
  );
}

type MenuItemProps = {
  label: string;
  icon: React.ComponentProps<typeof Icon>["name"];
  onPress: () => void;
};

function MenuItem({ label, icon, onPress }: MenuItemProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.menuItem}
      activeOpacity={0.85}
    >
      <Text style={styles.menuLabel}>{label}</Text>
      <Icon name={icon} size={24} tint={theme.solidColors.white} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: theme.spacing.md,
    width: "100%",
    position: "relative",
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
    borderWidth: 2,
    borderColor: theme.colors.accentDark,
    backgroundColor: theme.colors.background,
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
    color: theme.colors.mutedText,
  },

  iconSlot: {
    width: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  menuCard: {
    position: "absolute",
    top: theme.spacing.xxl,
    right: theme.spacing.md,
    backgroundColor: theme.colors.accentDark,
    borderRadius: theme.radii.lg,
    paddingVertical: theme.spacing.xs,
    minWidth: 190,
    ...theme.shadow.medium,
    zIndex: 3,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  menuLabel: {
    color: theme.solidColors.white,
    fontFamily: theme.typography.families.regular,
    fontSize: theme.typography.sizes.md,
  },
  menuDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
    opacity: 0.6,
    marginHorizontal: theme.spacing.sm,
  },

  overlay: {
    position: "absolute",
    top: -1000,
    bottom: -1000,
    left: -1000,
    right: -1000,
    zIndex: 2,
  },

  modalBody: {
    fontFamily: theme.typography.families.regular,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text,
  },
});
