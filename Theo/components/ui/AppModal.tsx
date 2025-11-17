import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  TouchableOpacity,
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
  height = 330,
  children,
}: AppModalProps) {
  return (
    <Modal transparent visible={visible} animationType="fade">
      {/* Blurred background */}
      <BlurView intensity={50} tint="light" style={StyleSheet.absoluteFill} />

      {/* ALERT */}
      {variant === "alert" && (
        <View style={styles.center}>
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

      {/* CUSTOM (floating center card) */}
      {variant === "custom" && (
        <View style={styles.center}>
          <View style={styles.customCard}>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeIcon}>×</Text>
            </TouchableOpacity>

            {title && <Text style={styles.title}>{title}</Text>}

            <View style={{ width: "100%", marginTop: theme.spacing.md }}>
              {children}
            </View>
          </View>
        </View>
      )}

      {/* BOTTOM SHEET */}
      {variant === "bottom-sheet" && (
        <View style={styles.bottomSheetContainer}>
          <TouchableOpacity style={{ flex: 1 }} onPress={onClose} />

          <View style={[styles.bottomSheet, { height }]}>
            <TouchableOpacity style={styles.closeBtnSheet} onPress={onClose}>
              <Text style={styles.closeIcon}>×</Text>
            </TouchableOpacity>

            {title && <Text style={styles.sheetTitle}>{title}</Text>}

            <View style={{ width: "100%", marginTop: theme.spacing.md }}>
              {children}
            </View>
          </View>
        </View>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.lg,
  },

  /* ALERT MODAL */
  alertCard: {
    width: "80%",
    backgroundColor: theme.modal.cardBg,
    borderRadius: theme.modal.radius,
    borderWidth: theme.modal.borderWidth,
    borderColor: theme.modal.borderColor,
    padding: theme.spacing.xl,
    alignItems: "center",
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
    width: "100%",
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
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text,
    fontFamily: theme.typography.families.handwritten,
  },

  btnConfirm: {
    backgroundColor: theme.colors.accent,
    marginLeft: theme.spacing.sm,
  },
  btnConfirmText: {
    fontSize: theme.typography.sizes.md,
    color: "#fff",
    fontFamily: theme.typography.families.handwritten,
  },

  /* CUSTOM MODAL */
  customCard: {
    width: "85%",
    backgroundColor: theme.modal.cardBg,
    padding: theme.spacing.xl,
    borderRadius: theme.modal.radius,
    borderWidth: theme.modal.borderWidth,
    borderColor: theme.modal.borderColor,
    alignItems: "center",
  },

  closeBtn: {
    position: "absolute",
    top: 14,
    right: 14,
  },
  closeIcon: {
    fontSize: 32,
    color: theme.colors.accentDark,
    fontFamily: theme.typography.families.handwritten,
  },

  /* BOTTOM SHEET */
  bottomSheetContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  bottomSheet: {
    width: "100%",
    backgroundColor: theme.modal.cardBg,
    borderTopLeftRadius: theme.radii.xl,
    borderTopRightRadius: theme.radii.xl,
    padding: theme.spacing.xl,
    borderWidth: theme.modal.borderWidth,
    borderColor: theme.modal.borderColor,
    alignItems: "center",
  },
  sheetTitle: {
    fontFamily: theme.typography.families.handwritten,
    fontSize: theme.typography.sizes.xl,
    textAlign: "center",
    color: theme.colors.text,
    marginTop: 4,
  },
  closeBtnSheet: {
    position: "absolute",
    top: 12,
    right: 16,
  },
});
