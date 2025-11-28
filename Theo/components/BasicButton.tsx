import React from "react";
import {
  DimensionValue,
  Pressable,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
} from "react-native";
import { colors } from "@/assets/themes/colors";
import { fonts } from "@/assets/themes/typography";

export type BasicButtonProps = {
  text: string;
  variant?: "primary" | "secondary" | "tertiary";
  width?: DimensionValue;
  height?: DimensionValue;
  backgroundColor?: string;
  shadowColor?: string;
  textStyle?: TextStyle;
  style?: ViewStyle;
} & React.ComponentProps<typeof Pressable>;

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
      <Pressable
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
        <Text style={[styles.text, textStyle]}>{text}</Text>
      </Pressable>
    );
  }
);

const styles = StyleSheet.create({
  base: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
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
});