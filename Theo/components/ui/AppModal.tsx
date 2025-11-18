import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { BlurView } from "expo-blur";
import { theme } from "../../design/theme";

export type ModalVariant = "alert" | "custom" | "bottom-sheet";

export type AppModalProps = {
  visible: boolean;
  onClose: () => void;
  variant?: ModalVariant;

  title?: string;
  message?: string;

  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;

  height?: number;

  children?: React.ReactNode;
};

export function AppModal({
  visible,
  onClose,
  variant = "alert",
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  height = 360,
  children,
}: AppModalProps) {
  return (
    <Modal transparent visible={visible} animationType="fade">
      {/* BLUR BACKGROUND */}
      <BlurView intensity={50} tint="light" style={StyleSheet.absoluteFill} />

      {/* --------------------------- ALERT MODAL --------------------------- */}
      {variant === "alert" && (
        <View style={styles.centerLayout}>
          <View style={styles.alertCard}>
            {title && <Text style={styles.title}>{title}</Text>}
            {message && <Text style={styles.message}>{message}</Text>}

            <View style={styles.row}>
              <Pressable
                style={[styles.btn, styles.btnCancel]}
                onPress={onClose}
              >
                <Text style={styles.btnCancelText}>{cancelLabel}</Text>
              </Pressable>

              <Pressable
                style={[styles.btn, styles.btnConfirm]}
                onPress={() => {
                  onConfirm?.();
                  onClose();
                }}
              >
                <Text style={styles.btnConfirmText}>{confirmLabel}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}

      {/* --------------------------- CUSTOM MODAL --------------------------- */}
      {variant === "custom" && (
        <View style={styles.centerLayout}>
          <View style={styles.customCard}>
            <TouchableOpacity onPress={onClose} style={styles.closeBtnFloating}>
              <Text style={styles.closeIcon}>×</Text>
            </TouchableOpacity>

            {title && <Text style={styles.title}>{title}</Text>}

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
              <TouchableOpacity onPress={onClose} style={styles.closeBtnSheet}>
                <Text style={styles.closeIcon}>×</Text>
              </TouchableOpacity>

              {title && <Text style={styles.sheetTitle}>{title}</Text>}

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
    padding: theme.spacing.xl,
    borderRadius: theme.modal.radius,
    borderWidth: theme.modal.borderWidth,
    borderColor: theme.modal.borderColor,
  },

  title: {
    fontFamily: theme.typography.families.handwritten,
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
  },

  btn: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radii.md,
    alignItems: "center",
  },

  btnCancel: {
    backgroundColor: "#EFE8DF",
    marginRight: theme.spacing.sm,
  },

  btnCancelText: {
    fontFamily: theme.typography.families.handwritten,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text,
  },

  btnConfirm: {
    backgroundColor: theme.colors.accent,
    marginLeft: theme.spacing.sm,
  },

  btnConfirmText: {
    fontFamily: theme.typography.families.handwritten,
    fontSize: theme.typography.sizes.md,
    color: "#fff",
  },

  /* ---------------------- CUSTOM ---------------------- */

  customCard: {
    width: "85%",
    backgroundColor: theme.modal.cardBg,
    borderRadius: theme.modal.radius,
    borderWidth: theme.modal.borderWidth,
    borderColor: theme.modal.borderColor,
    padding: theme.spacing.xl,
  },

  closeBtnFloating: {
    position: "absolute",
    top: 14,
    right: 14,
  },

  closeIcon: {
    fontFamily: theme.typography.families.handwritten,
    fontSize: 32,
    color: theme.colors.accentDark,
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
    borderWidth: theme.modal.borderWidth,
    borderColor: theme.modal.borderColor,
    paddingTop: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },

  closeBtnSheet: {
    position: "absolute",
    top: 12,
    right: 16,
  },

  sheetTitle: {
    textAlign: "center",
    fontFamily: theme.typography.families.handwritten,
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
