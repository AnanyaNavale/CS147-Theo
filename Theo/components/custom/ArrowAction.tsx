import React, { useMemo } from "react";
import {
  StyleSheet,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from "react-native";

import { Icon } from "@/components/custom/Icon";
import { Theme } from "@/design/theme";
import { useAppTheme } from "@/hooks/ThemeContext";
import SvgStrokeText from "./SvgStrokeText";

type ArrowActionProps = {
  label: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  small?: boolean;
};

export function ArrowAction({
  label,
  onPress,
  style,
  textStyle,
  small,
}: ArrowActionProps) {
  const { colors: palette, theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme, palette), [theme, palette]);

  return (
    <TouchableOpacity onPress={onPress} style={[styles.container, style]}>
      <SvgStrokeText
        text={label}
        containerStyle={{ paddingLeft: 10 }}
        textStyle={[
          textStyle,
          small && { fontSize: theme.typography.sizes.md },
        ]}
      />
      <Icon
        style={styles.arrow}
        name="arrow-right"
        size={small ? 50 : 80}
        tint={palette.primary}
      />
    </TouchableOpacity>
  );
}

const createStyles = (
  theme: Theme,
  palette: typeof import("@/design/colors").colors.light
) =>
  StyleSheet.create({
    container: {
      position: "absolute",
      bottom: 0,
      right: theme.spacing.lg,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
      gap: theme.spacing.sm,
      zIndex: 3,
      backgroundColor: palette.background,
      paddingBottom: theme.spacing.xxl,
    },
    text: {
      color: palette.body,
    },
    arrow: {
      marginVertical: -35,
    },
  });
