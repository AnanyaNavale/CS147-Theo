import React from "react";
import { Feather } from "@expo/vector-icons";
import { Image, StyleSheet, TouchableOpacity, View, ViewStyle } from "react-native";

import { colors } from "@/assets/themes/colors";
import { Spacer } from "@/components/ui/Spacer";
import { theme } from "@/design/theme";

type MainHeaderProps = {
  onMenuPress?: () => void;
  onProfilePress?: () => void;
  showBellDot?: boolean;
  style?: ViewStyle;
  paddingTop?: number;
  paddingHorizontal?: number;
  height?: number;
  iconSize?: number;
};

const logo = require("@/assets/images/logo.png");

export function MainHeader({
  onMenuPress,
  onProfilePress,
  showBellDot = false,
  style,
  paddingTop,
  paddingHorizontal,
  height,
  iconSize,
}: MainHeaderProps) {
  const resolvedIconSize = iconSize ?? 28; // match bottom tab default

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: paddingTop ?? theme.spacing.xl,
          paddingHorizontal: paddingHorizontal ?? theme.spacing.lg,
          height: height,
        },
        style,
      ]}
    >
      <TouchableOpacity onPress={onMenuPress}>
        <Feather name="menu" size={resolvedIconSize} color={colors.light.iconsStandalone} />
      </TouchableOpacity>

      <Image source={logo} style={styles.logo} />

      <View style={styles.right}>
        <View style={styles.bellWrapper}>
          <Feather name="bell" size={resolvedIconSize} color={colors.light.iconsStandalone} />
          {showBellDot && <View style={styles.redDot} />}
        </View>
        <Spacer horizontal px={8} />
        <TouchableOpacity onPress={onProfilePress}>
          <View style={styles.userIcon}>
            <Feather name="user" size={resolvedIconSize} color={colors.light.ghost} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logo: {
    width: 110,
    height: 46,
    resizeMode: "contain",
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  bellWrapper: {
    position: "relative",
  },
  redDot: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#B35454",
    borderColor: colors.light.background,
    borderWidth: 1,
  },
  userIcon: {
    borderRadius: 18,
    borderWidth: 3,
    borderColor: colors.light.iconsStandalone,
    backgroundColor: colors.light.iconsStandalone,
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
});
