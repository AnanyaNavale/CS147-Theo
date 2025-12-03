import { colors } from "@/assets/themes/colors";
import { fonts } from "@/assets/themes/typography";
import { Icon, IconName } from "@/components/ui/Icon";
import { theme } from "@/design/theme";
import React from "react";
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
      backgroundColor = colors.light.primary,
      shadowColor = colors.light.shadowPrimary,
      textStyle,
      style,
      iconName,
      iconSize = 20,
      iconTint = colors.light.buttonText,
      ...rest
    },
    ref
  ) => {
    // Inside your component
    const getColors = (variant: "primary" | "secondary" | "tertiary") => {
      switch (variant) {
        case "primary":
          return {
            backgroundColor: colors.light.primary,
            shadowColor: colors.light.shadowPrimary,
          };
        case "secondary":
          return {
            backgroundColor: colors.light.secondary,
            shadowColor: colors.light.shadowSecondary,
          };
        case "tertiary":
          return {
            backgroundColor: colors.light.tertiary,
            shadowColor: colors.light.shadowTertiary,
          };
      }
    };

    const { backgroundColor: bg, shadowColor: sc } = getColors(variant);

    return (
      <TouchableOpacity
        ref={ref}
        style={[
          styles.base,
          {
            width,
            height,
            backgroundColor: bg,
            shadowColor: sc,
          },
          style,
        ]}
        {...rest}
      >
        {iconName && (
          <Icon
            name={iconName}
            size={iconSize}
            tint={iconTint}
            style={styles.icon}
          />
        )}
        <Text style={[styles.text, textStyle]}>{text}</Text>
      </TouchableOpacity>
    );
  }
);

const styles = StyleSheet.create({
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
  },

  text: {
    color: colors.light.buttonText,
    fontSize: fonts.sizes.button,
    fontFamily: "Raleway-Regular",
  },

  icon: {
    marginRight: 8,
  },
});
