import { Feather } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import {
  Image,
  LayoutChangeEvent,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { colors } from "@/design/colors";
import { Theme } from "@/design/theme";
import { useAppTheme } from "@/hooks/ThemeContext";
import { signOut } from "@/lib/supabase";
import { useRouter } from "expo-router";
import { AppModal } from "./AppModal";

const logoLight = require("@/assets/images/logo.png");
const logoDark = require("@/assets/images/logo-white.png");
type FeatherName = React.ComponentProps<typeof Feather>["name"];

function TabBarIcon({
  name,
  color,
  size = 33,
}: {
  name: FeatherName;
  color: string;
  size?: number;
}) {
  return (
    <Feather
      name={name}
      color={color}
      size={size}
      style={{ marginBottom: -2 }}
    />
  );
}

type MainHeaderProps = {
  avatarUrl?: string | null;
};

export default function MainHeader({ avatarUrl }: MainHeaderProps) {
  const router = useRouter();
  const { colors: palette, theme: appTheme, mode, toggleMode } = useAppTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuHeight, setMenuHeight] = useState(0);
  const [menuTop, setMenuTop] = useState(0);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    // Reset failure flag when a new avatar URL arrives
    setAvatarFailed(false);
  }, [avatarUrl]);

  const handleLogout = async () => {
    setMenuOpen(false);
    setShowLogoutConfirm(false);
    try {
      await signOut();
      router.replace("../auth/login");
    } catch (err) {
      console.warn("Failed to log out", err);
    }
  };

  const styles = useMemo(
    () => createStyles(appTheme, palette, mode),
    [appTheme, mode, palette]
  );
  const logoSource = mode === "dark" ? logoDark : logoLight;

  const handleMenuAction = (action: () => void) => () => {
    setMenuOpen(false);
    action();
  };

  const handleLayout = (event: LayoutChangeEvent) => {
    setMenuHeight(event.nativeEvent.layout.height);
  };

  return (
    <View onLayout={handleLayout}>
      <View style={styles.header}>
        <Image source={logoSource} style={{ width: 90, height: 40 }} />

        <TouchableOpacity onPress={() => setMenuOpen((prev) => !prev)}>
          <View
            style={styles.userIcon}
            onLayout={(event) => {
              // Position the menu so its top edge sits against the avatar.
              setMenuTop(event.nativeEvent.layout.y);
            }}
          >
            {avatarUrl && !avatarFailed ? (
              <Image
                key={avatarUrl}
                source={{ uri: avatarUrl }}
                style={styles.avatarImage}
                onError={() => setAvatarFailed(true)}
              />
            ) : (
              <TabBarIcon
                name="user"
                color={
                  mode === "dark" ? palette.body : appTheme.colors.background
                }
                size={32}
              />
            )}
          </View>
        </TouchableOpacity>
      </View>

      {/* Overlay + menu card */}
      {menuOpen && (
        <Modal
          transparent
          visible
          animationType="fade"
          onRequestClose={() => setMenuOpen(false)}
        >
          <View style={StyleSheet.absoluteFillObject}>
            <Pressable
              style={styles.menuOverlay}
              onPress={() => setMenuOpen(false)}
            />

            <View style={[styles.menuAnchor, { top: menuTop || menuHeight }]}>
              <View style={styles.menuCard}>
                <MenuItem
                  label="Profile"
                  styles={styles}
                  onPress={handleMenuAction(() => router.push("../profile"))}
                />
                <View style={styles.menuDivider} />
                <MenuItem
                  label={
                    mode === "dark"
                      ? "Switch to light mode"
                      : "Switch to dark mode"
                  }
                  styles={styles}
                  onPress={handleMenuAction(toggleMode)}
                />
                <View style={styles.menuDivider} />
                <MenuItem
                  label="Log out"
                  styles={styles}
                  onPress={handleMenuAction(() => setShowLogoutConfirm(true))}
                />
              </View>
            </View>
          </View>
        </Modal>
      )}

      <AppModal
        visible={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        variant="alert"
        title="Log out?"
        message="Are you sure you want to log out?"
        cancelLabel="Cancel"
        confirmLabel="Log out"
        onConfirm={handleLogout}
      />
    </View>
  );
}

type MenuItemProps = {
  label: string;
  onPress: () => void;
  styles: ReturnType<typeof createStyles>;
};

function MenuItem({ label, onPress, styles }: MenuItemProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.menuItem}
      activeOpacity={0.85}
    >
      <Text style={styles.menuLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const createStyles = (
  theme: Theme,
  palette: typeof colors.light,
  mode: "light" | "dark"
) =>
  StyleSheet.create({
    header: {
      height: 130,
      backgroundColor: palette.background,
      shadowOpacity: 0,
      elevation: 0,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-end",
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: 15,
    },
    userIcon: {
      borderRadius: 22,
      borderWidth: 4,
      borderColor: palette.primary,
      backgroundColor: palette.primary,
      width: 45,
      height: 45,
      justifyContent: "center",
      alignItems: "center",
      overflow: "hidden",
    },
    avatarImage: {
      width: "100%",
      height: "100%",
      resizeMode: "cover",
    },
    menuButton: {
      transform: [{ translateY: -4 }, { translateX: -4 }],
    },
    menuOverlay: {
      position: "absolute",
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 2,
      backgroundColor: palette.overlay,
    },
    menuAnchor: {
      position: "absolute",
      right: theme.spacing.md,
      zIndex: 3,
    },
    menuCard: {
      backgroundColor: theme.modal.cardBg,
      borderRadius: theme.radii.lg,
      paddingVertical: theme.spacing.xs,
      minWidth: 170,
      ...theme.shadow.medium,
      borderWidth: theme.modal.borderWidth,
      borderColor: theme.modal.borderColor,
    },
    menuItem: {
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
    },
    menuLabel: {
      color: palette.body,
      fontFamily: theme.typography.families.regular,
      fontSize: theme.typography.sizes.md,
    },
    menuDivider: {
      height: 1,
      backgroundColor: palette.border,
      opacity: 0.6,
      marginHorizontal: theme.spacing.sm,
    },
  });

// const styles = StyleSheet.create({
//   container: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//   },
//   header: {
//     height: 130,
//     backgroundColor: "#fff",
//     shadowOpacity: 0,
//     elevation: 0,
//     flexDirection: "row", // horizontal layout
//     justifyContent: "space-between", // spread elements evenly across width
//     alignItems: "flex-end", // vertically center elements
//     paddingHorizontal: 30,
//     paddingVertical: 15,
//   },
//   userIcon: {
//     borderRadius: 22, // half of width/height
//     borderWidth: 4,
//     borderColor: "#8A5E3C",
//     backgroundColor: "#8A5E3C",
//     width: 45,
//     height: 45,
//     justifyContent: "center",
//     alignItems: "center",
//   },
// });
