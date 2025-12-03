import { useNavigation } from "@react-navigation/native";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

import { colors } from "@/assets/themes/colors";
import { fonts } from "@/assets/themes/typography";
import { AppModal } from "@/components";
import { Icon } from "@/components/ui/Icon";
import { Text } from "@/components/ui/Text";
import { theme } from "@/design/theme";
// import { Button } from "react-native/Libraries/Components/Button";

type StepProgressIndicatorProps = {
  steps: string[];
  /** Number of steps that should appear active (filled dots). */
  activeCount?: number;
  style?: ViewStyle;
  firstPage?: boolean;
  showBackIcon?: boolean;
  showMenuIcon?: boolean;
  onPressBack?: () => void;
  onPressMenu?: () => void;
  tint?: string;
  iconSize?: number;
  helpMessagept1?: string;
  helpMessagept2?: string;
};

export function StepProgressIndicator({
  steps,
  activeCount = 0,
  style,
  firstPage = false,
  showBackIcon = true,
  showMenuIcon = true,
  onPressBack,
  onPressMenu,
  tint = theme.colors.accentDark,
  iconSize = 26,
  helpMessagept1,
  helpMessagept2,
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
    <>
      <View style={[styles.container, style]}>
        <View style={styles.iconSlot}>
          {firstPage ? (
            <TouchableOpacity
              onPress={handleBack}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Icon name="x" size={36} tint={colors.light.iconsStandalone} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={handleBack}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Icon
                name="arrow-left"
                size={36}
                tint={colors.light.iconsStandalone}
              />
            </TouchableOpacity>
            // <View style={{ width: iconSize, height: iconSize }} />
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
              <Icon
                name="more-vertical"
                size={36}
                tint={colors.light.iconsStandalone}
              />
            </TouchableOpacity>
          ) : (
            <View style={{ width: iconSize, height: iconSize }} />
          )}
        </View>
      </View>

      {menuOpen && (
        <Modal
          transparent
          visible
          animationType="fade"
          onRequestClose={() => setMenuOpen(false)}
        >
          <View style={StyleSheet.absoluteFillObject}>
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={() => setMenuOpen(false)}
            />
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
                label="Report a problem   "
                icon="report"
                onPress={handleMenuAction(() => setShowReportModal(true))}
              />
            </View>
          </View>
        </Modal>
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
          router.push("/" as unknown as any);
        }}
      />

      {/* Help modal */}
      <AppModal
        visible={showHelpModal}
        onClose={() => setShowHelpModal(false)}
        variant="custom"
        title="Help"
      >
        <Text style={{ fontSize: fonts.sizes.body }}>{helpMessagept1}</Text>
        <Text style={{ fontSize: fonts.sizes.body }}>{helpMessagept2}</Text>
      </AppModal>

      {/* Report modal */}
      <AppModal
        visible={showReportModal}
        onClose={() => setShowReportModal(false)}
        variant="custom"
        title="Report a Problem"
      >
        <Text style={styles.modalBody}>
          Reporting will be available shortly.
        </Text>
      </AppModal>
    </>
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
    marginTop: 1,
    borderRadius: 7,
    backgroundColor: colors.light.progressBarIncomplete,
  },

  stepDotActive: {
    backgroundColor: colors.light.progressBarComplete,
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

  menuCard: {
    position: "absolute",
    top: theme.spacing.xxl * 2 + theme.spacing.lg, // offset so the menu sits lower than the icon
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
