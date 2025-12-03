import { BlurView } from "expo-blur";
import React from "react";
import {
  DimensionValue,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { theme } from "../../design/theme";
import { ButtonVariant, Button } from "./Button";
import { Icon } from "./Icon";
import { Text } from "./Text";
import SvgStrokeText from "../SvgStrokeText";
import { colors } from "@/assets/themes/colors";

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
  confirmVariant = "danger" as ButtonVariant,
  cancelLabel = "Cancel",
  cancelVariant = "ghost" as ButtonVariant,
  onConfirm,
  height = 360,
  showClose = true,
  children,
}: AppModalProps) {
  return (
    <Modal transparent visible={visible} animationType="fade">
      {/* BLUR BACKGROUND */}
      <BlurView intensity={20} tint="light" style={StyleSheet.absoluteFill} />

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
              }}
            >
              {title && <SvgStrokeText text={title} />}
              {showClose && (
                <TouchableOpacity
                  onPress={onClose}
                  style={styles.closeBtnFloating}
                >
                  <Icon name="x"></Icon>
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
                <Icon name="x" size={34}></Icon>
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

const styles = StyleSheet.create({
  centerLayout: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.lg,
  },

  /* ---------------------- ALERT ---------------------- */

  alertCard: {
    width: "80%",
    backgroundColor: theme.modal.cardBg,
    padding: theme.spacing.lg,
    borderRadius: theme.modal.radius,
    borderWidth: theme.modal.borderWidth,
    borderColor: theme.modal.borderColor,
  },

  title: {
    //fontFamily: theme.typography.families.handwritten,
    fontSize: theme.typography.sizes.xl,
    textAlign: "center",
    color: theme.colors.text,
  },

  message: {
    marginTop: theme.spacing.sm,
    fontSize: theme.typography.sizes.md,
    textAlign: "center",
    color: theme.colors.mutedText,
  },

  row: {
    flexDirection: "row",
    marginTop: theme.spacing.lg,
    alignItems: 'center',
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
    right: 10,
  },

  customContent: {
    width: "100%",
    marginTop: theme.spacing.md,
  },

  /* ---------------------- BOTTOM SHEET ---------------------- */

  bottomSheetOverlay: {
    flex: 1,
    justifyContent: "flex-end",
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
    shadowColor: theme.colors.accentDark,
    shadowOpacity: 0.5,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -6 },
    elevation: 10,
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
    color: theme.colors.text,
  },

  sheetContent: {
    width: "100%",
    paddingBottom: theme.spacing.xxl,
    gap: theme.spacing.md,
  },
});
