import { useAppTheme } from "@/hooks/ThemeContext";
import { BlurView } from "expo-blur";
import React, { useMemo } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Theme } from "../../design/theme";
import { Button, ButtonVariant } from "./Button";
import { Icon } from "./Icon";
import SvgStrokeText from "./SvgStrokeText";
import { Text } from "./Text";

export type ModalVariant = "alert" | "custom" | "bottom-sheet";

export type AppModalProps = {
  visible: boolean;
  onClose: () => void;
  variant?: ModalVariant;

  title?: string;
  message?: string;

  confirmLabel?: string;
  confirmVariant?: ButtonVariant;
  cancelLabel?: string;
  cancelVariant?: ButtonVariant;
  onConfirm?: () => void;

  height?: number;

  showClose?: boolean;

  children?: React.ReactNode;
};

export function AppModal({
  visible,
  onClose,
  variant = "alert",
  title,
  message,
  confirmLabel = "Confirm",
  confirmVariant = "tertiary" as ButtonVariant,
  cancelLabel = "Cancel",
  cancelVariant = "ghost" as ButtonVariant,
  onConfirm,
  height = 360,
  showClose = true,
  children,
}: AppModalProps) {
  const { colors: palette, theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme, palette), [palette, theme]);
  return (
    <Modal transparent visible={visible} animationType="fade">
      {/* BLUR BACKGROUND */}
      <BlurView intensity={20} style={StyleSheet.absoluteFill} />

      {/* --------------------------- ALERT MODAL --------------------------- */}
      {variant === "alert" && (
        <View style={styles.centerLayout}>
          <View style={styles.alertCard}>
            {title && (
              <SvgStrokeText
                text={title}
                containerStyle={{ alignSelf: "center" }}
              />
            )}
            {message && <Text style={styles.message}>{message}</Text>}

            <View style={styles.row}>
              <View style={[styles.flexButton, styles.buttonLeft]}>
                <Button
                  label={cancelLabel}
                  variant={cancelVariant}
                  onPress={onClose}
                  style={styles.fullWidthButton}
                />
              </View>

              <View style={[styles.flexButton, styles.buttonRight, ,]}>
                <Button
                  label={confirmLabel}
                  variant={confirmVariant}
                  onPress={() => {
                    onConfirm?.();
                    onClose();
                  }}
                  style={styles.fullWidthButton}
                />
              </View>
            </View>
          </View>
        </View>
      )}

      {/* --------------------------- CUSTOM MODAL --------------------------- */}
      {variant === "custom" && (
        <View style={styles.centerLayout}>
          <View style={styles.customCard}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                marginTop: theme.spacing.md,
              }}
            >
              {title && <SvgStrokeText text={title} />}
              {showClose && (
                <TouchableOpacity
                  onPress={onClose}
                  style={styles.closeBtnFloating}
                >
                  <Icon name="x" tint={palette.iconsStandalone}></Icon>
                </TouchableOpacity>
              )}
            </View>
            {message && <Text style={styles.message}>{message}</Text>}

            <View style={styles.customContent}>{children}</View>
          </View>
        </View>
      )}

      {/* --------------------------- BOTTOM SHEET --------------------------- */}
      {variant === "bottom-sheet" && (
        <View style={styles.bottomSheetOverlay}>
          {/* Tap background to close */}
          <TouchableOpacity style={{ flex: 1 }} onPress={onClose} />

          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.bottomSheetAvoider}
          >
            <View style={[styles.bottomSheet, { minHeight: height }]}>
              {title && <Text style={styles.sheetTitle}>{title}</Text>}

              <TouchableOpacity onPress={onClose} style={styles.closeBtnSheet}>
                <Icon name="x" tint={palette.iconsStandalone} size={34}></Icon>
              </TouchableOpacity>

              <View>{children}</View>
            </View>
          </KeyboardAvoidingView>
        </View>
      )}
    </Modal>
  );
}

/* ===================================================================== */
/*                                STYLES                                */
/* ===================================================================== */

function createStyles(
  theme: Theme,
  palette: typeof import("@/design/colors").colors.light
) {
  return StyleSheet.create({
    centerLayout: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: theme.spacing.lg,
    },

    /* ---------------------- ALERT ---------------------- */

    alertCard: {
      width: "95%",
      backgroundColor: theme.modal.cardBg,
      padding: theme.spacing.lg,
      borderRadius: theme.modal.radius,
      borderWidth: theme.modal.borderWidth,
      borderColor: theme.modal.borderColor,
    },

    title: {
      fontSize: theme.typography.sizes.xl,
      textAlign: "center",
      color: palette.body,
    },

    message: {
      marginTop: theme.spacing.sm,
      fontSize: theme.typography.sizes.md,
      textAlign: "center",
      color: palette.quote ?? palette.inactive ?? palette.body,
    },

    row: {
      flexDirection: "row",
      marginTop: theme.spacing.lg,
      alignItems: "center",
    },

    flexButton: { flex: 1 },
    buttonLeft: { marginRight: theme.spacing.sm },
    buttonRight: { marginLeft: theme.spacing.sm },
    fullWidthButton: { width: "100%" },

    /* ---------------------- CUSTOM ---------------------- */

    customCard: {
      width: "85%",
      backgroundColor: theme.modal.cardBg,
      borderRadius: theme.modal.radius,
      borderWidth: theme.modal.borderWidth,
      borderColor: theme.modal.borderColor,
      padding: theme.spacing.lg,
    },

    closeBtnFloating: {
      position: "absolute",
      right: -12,
      top: -theme.spacing.lg,
    },

    customContent: {
      width: "100%",
      marginTop: theme.spacing.md,
    },

    /* ---------------------- BOTTOM SHEET ---------------------- */

    bottomSheetOverlay: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor: palette.overlay,
    },

    bottomSheetAvoider: {
      width: "100%",
    },

    bottomSheet: {
      width: "100%",
      backgroundColor: theme.modal.cardBg,
      borderTopLeftRadius: theme.radii.xl,
      borderTopRightRadius: theme.radii.xl,
      paddingTop: theme.spacing.lg,
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.lg,
      shadowColor: palette.primary,
      shadowOpacity: 0.5,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: -6 },
      elevation: 10,
      borderWidth: theme.modal.borderWidth,
      borderColor: theme.modal.borderColor,
    },

    closeBtnSheet: {
      position: "absolute",
      top: theme.spacing.lg,
      right: theme.spacing.lg,
      zIndex: 20,
    },

    sheetTitle: {
      textAlign: "center",
      paddingHorizontal: theme.spacing.lg,
      fontSize: theme.typography.sizes.xl,
      marginBottom: theme.spacing.md,
      color: palette.body,
    },

    sheetContent: {
      width: "100%",
      paddingBottom: theme.spacing.xxl,
      gap: theme.spacing.md,
    },
  });
}
