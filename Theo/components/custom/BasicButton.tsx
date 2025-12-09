import { Icon, IconName } from "@/components/custom/Icon";
import { colors } from "@/design/colors";
import { Theme } from "@/design/theme";
import { fonts } from "@/design/typography";
import { useAppTheme } from "@/hooks/ThemeContext";
import React, { useMemo } from "react";
import {
  DimensionValue,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

export type BasicButtonProps = {
  text: string;
  variant?: "primary" | "secondary" | "tertiary";
  width?: DimensionValue;
  height?: DimensionValue;
  backgroundColor?: string;
  shadowColor?: string;
  textStyle?: TextStyle;
  style?: ViewStyle;
  iconName?: IconName;
  iconSize?: number;
  iconTint?: string;
} & React.ComponentProps<typeof TouchableOpacity>;

export const BasicButton = React.forwardRef<View, BasicButtonProps>(
  (
    {
      text,
      variant = "primary",
      width = "70%",
      height = 50,
      backgroundColor,
      shadowColor,
      textStyle,
      style,
      iconName,
      iconSize = 20,
      iconTint,
      ...rest
    },
    ref
  ) => {
    const { colors: palette, theme } = useAppTheme();
    const styles = useMemo(
      () => createStyles(palette, theme),
      [palette, theme]
    );

    const isDisabled = rest.disabled ?? false;

    const getColors = (variant: "primary" | "secondary" | "tertiary") => {
      switch (variant) {
        case "primary":
          return {
            backgroundColor: palette.primary,
            shadowColor: palette.shadowPrimary ?? palette.overlay,
          };
        case "secondary":
          return {
            backgroundColor: palette.secondary,
            shadowColor: palette.shadowSecondary ?? palette.overlay,
          };
        case "tertiary":
          return {
            backgroundColor: palette.tertiary,
            shadowColor: palette.shadowTertiary ?? palette.overlay,
          };
      }
    };

    const { backgroundColor: bg, shadowColor: sc } = getColors(variant);
    const resolvedBg = backgroundColor ?? bg;
    const resolvedShadow = shadowColor ?? sc;
    const resolvedIconTint = iconTint ?? palette.buttonText ?? palette.body;
    const resolvedTextColor = palette.buttonText ?? palette.body;

    return (
      <TouchableOpacity
        ref={ref}
        style={[
          styles.base,
          {
            width,
            height,
            backgroundColor: resolvedBg,
            shadowColor: resolvedShadow,
            opacity: isDisabled ? 0.5 : 1,
          },
          style,
        ]}
        {...rest}
      >
        {iconName && (
          <Icon
            name={iconName}
            size={iconSize}
            tint={resolvedIconTint}
            style={styles.icon}
          />
        )}
        <Text style={[styles.text, { color: resolvedTextColor }, textStyle]}>
          {text}
        </Text>
      </TouchableOpacity>
    );
  }
);

const createStyles = (palette: typeof colors.light, theme: Theme) =>
  StyleSheet.create({
    base: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      borderRadius: theme.radii.md,
      margin: 10,

      shadowOpacity: 0.5,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 4 },
      elevation: 4,
      backgroundColor: palette.primary,
    },

    text: {
      fontSize: fonts.sizes.button,
      fontFamily: "Raleway-Regular",
    },

    icon: {
      marginRight: 8,
    },
  });
