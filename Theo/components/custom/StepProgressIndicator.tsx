import { useNavigation } from "@react-navigation/native";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

import { AppModal, InputField } from "@/components";
import { Icon } from "@/components/custom/Icon";
import { Text } from "@/components/custom/Text";
import { colors } from "@/design/colors";
import { Theme } from "@/design/theme";
import { fonts } from "@/design/typography";
import { useAppTheme } from "@/hooks/ThemeContext";
import { createReport } from "@/lib/supabase";
import { useSupabase } from "@/providers/SupabaseProvider";
import { Button } from "./Button";
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
  tint,
  iconSize = 26,
  helpMessagept1,
  helpMessagept2,
}: StepProgressIndicatorProps) {
  const { colors: palette, theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme, palette), [palette, theme]);
  const iconTint = tint ?? palette.iconsStandalone;

  const { session } = useSupabase();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportText, setReportText] = useState("");
  const [showSubmitBanner, setShowSubmitBanner] = useState(false);
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

  const handleSubmitReport = async () => {
    if (!session?.user) {
      console.error("Not an authenticated user.");
      return;
    }

    try {
      const data = await createReport(session.user.id, reportText);

      setReportText("");
      setShowSubmitBanner(true);
    } catch (err) {
      console.error("Error submitting report:", err);
    }
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
              <Icon name="x" size={36} tint={iconTint} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={handleBack}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Icon name="arrow-left" size={36} tint={iconTint} />
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

              const leftComplete = index > 0 && index <= activeCount - 1;
              const rightComplete = index < activeCount - 1;
              return (
                <View key={`${label}-track`} style={styles.stepWrapper}>
                  {!isFirst && (
                    <View
                      style={[
                        styles.halfLine,
                        styles.lineLeft,
                        {
                          backgroundColor: leftComplete
                            ? palette.progressBarComplete
                            : palette.progressBarIncomplete,
                        },
                      ]}
                    />
                  )}
                  {!isLast && (
                    <View
                      style={[
                        styles.halfLine,
                        styles.lineRight,
                        {
                          backgroundColor: rightComplete
                            ? palette.progressBarComplete
                            : palette.progressBarIncomplete,
                        },
                      ]}
                    />
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
                      !isActive
                        ? styles.stepLabelInactive
                        : styles.stepLabelActive,
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
              <Icon name="more-vertical" size={36} tint={iconTint} />
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
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: palette.overlay },
              ]}
              onPress={() => setMenuOpen(false)}
            />
            <View style={styles.menuCard}>
              <MenuItem
                label="Exit setup"
                icon="exit"
                styles={styles}
                iconTint={palette.background}
                onPress={handleMenuAction(() => setShowExitConfirm(true))}
              />
              <View style={styles.menuDivider} />
              <MenuItem
                label="Help"
                icon="help"
                styles={styles}
                iconTint={palette.background}
                onPress={handleMenuAction(() => setShowHelpModal(true))}
              />
              <View style={styles.menuDivider} />
              <MenuItem
                label="Report a problem   "
                icon="report"
                styles={styles}
                iconTint={palette.background}
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
        message={"This will exit the setup flow and take you back to home."}
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
        title={"Report a Problem"}
        message="Please describe the issue you are encountering."
      >
        <InputField
          placeholder="Describe the issue"
          inputStyle={{ paddingRight: theme.input.paddingHorizontal }}
          value={reportText}
          onChangeText={setReportText}
        />
        {showSubmitBanner && (
          <Text style={styles.submitBanner}>
            {"Report submitted.\nThank you for your feedback."}
          </Text>
        )}
        <Button
          label="Submit report"
          variant="brown"
          disabled={reportText.trim().length === 0}
          onPress={handleSubmitReport}
        />
      </AppModal>
    </>
  );
}

type MenuItemProps = {
  label: string;
  icon: React.ComponentProps<typeof Icon>["name"];
  onPress: () => void;
  styles: ReturnType<typeof createStyles>;
  iconTint: string;
};

function MenuItem({ label, icon, onPress, styles, iconTint }: MenuItemProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.menuItem}
      activeOpacity={0.85}
    >
      <Text style={styles.menuLabel}>{label}</Text>
      <Icon name={icon} size={24} tint={iconTint} />
    </TouchableOpacity>
  );
}

const createStyles = (theme: Theme, palette: typeof colors.light) =>
  StyleSheet.create({
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
      backgroundColor: palette.border,
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
      backgroundColor: palette.progressBarIncomplete,
    },

    stepDotActive: {
      backgroundColor: palette.progressBarComplete,
    },

    stepLabel: {
      marginTop: theme.spacing.xs,
      fontSize: theme.typography.sizes.sm,
      fontFamily: theme.typography.families.regular,
      color: palette.progressBarIncomplete,
    },

    stepLabelActive: {
      color: palette.progressBarComplete,
    },

    stepLabelInactive: {
      color: palette.progressBarIncomplete,
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
      backgroundColor: theme.colors.primary,
      borderRadius: theme.radii.lg,
      paddingVertical: theme.spacing.xs,
      minWidth: 200,
      ...theme.shadow.medium,
      zIndex: 3,
      // borderWidth: theme.modal.borderWidth,
      // borderColor: theme.modal.borderColor,
    },
    menuItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: theme.spacing.sm + 3,
      paddingHorizontal: theme.spacing.md,
    },
    menuLabel: {
      color: palette.background,
      fontFamily: theme.typography.families.regular,
      fontSize: theme.typography.sizes.md,
    },
    menuDivider: {
      height: 1,
      backgroundColor: palette.background,
      opacity: 0.3,
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
      color: palette.body,
    },

    submitBanner: {
      textAlign: "center",
      marginBottom: 10,
      padding: 7,
      fontSize: fonts.sizes.body,
      backgroundColor: palette.overlay,
      borderRadius: 10,
      color: palette.body,
    },
  });
