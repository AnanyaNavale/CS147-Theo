// components/InputField.tsx

import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import {
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";

import { Theme } from "@/design/theme";
import { useAppTheme } from "@/hooks/ThemeContext";

export type InputFieldProps = {
  label?: string;
  error?: string;

  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  errorStyle?: TextStyle;
  row?: boolean;
  small?: boolean;
  centered?: boolean;
  noBorder?: boolean;
  width?: ViewStyle["width"];
  rightAccessory?: React.ReactNode;
  inputStyle?: StyleProp<TextStyle>;
} & TextInputProps;

export const InputField = React.forwardRef<TextInput, InputFieldProps>(
  (
    {
      label,
      error,
      small = false,
      centered = false,
      noBorder = false,
      row = false,
      containerStyle,
      labelStyle,
      errorStyle,
      style,
      width,
      rightAccessory,
      inputStyle,
      ...rest
    },
    ref
  ) => {
    const { colors: palette, theme } = useAppTheme();
    const styles = useMemo(
      () => createStyles(theme, palette),
      [theme, palette]
    );

    return (
      <View
        style={[
          styles.container,
          width != null ? { width } : null,
          containerStyle,
          row && styles.row,
        ]}
      >
        {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}

        <View style={[row ? styles.inputWrapperRow : styles.inputWrapper]}>
          <TextInput
            ref={ref}
            style={[
              styles.input,
              small && styles.smallInput,
              centered && styles.centeredInput,
              noBorder && styles.noBorder,
              error && styles.inputError,
              row && styles.rowInput,
              style,
              inputStyle,
            ]}
            placeholderTextColor={theme.input.placeholder}
            {...rest}
          />
          {rightAccessory && (
            <View style={styles.rightAccessory}>{rightAccessory}</View>
          )}
        </View>

        {error && (
          <View style={styles.errorRow}>
            <Text
              style={[styles.error, errorStyle, small && styles.smallError]}
            >
              {error}
            </Text>
            <MaterialCommunityIcons
              name="alert-circle"
              color={palette.error}
              size={16}
              style={[{ marginLeft: 6 }, small && styles.smallErrorIcon]}
            />
          </View>
        )}
      </View>
    );
  }
);

const createStyles = (
  theme: Theme,
  palette: typeof import("@/design/colors").colors.light
) =>
  StyleSheet.create({
    container: {
      width: "100%",
      paddingBottom: 20,
      position: "relative",
    },

    row: {
      flexDirection: "row",
      alignItems: "center",
      width: "100%",
    },
    inputWrapper: {
      width: "100%",
      justifyContent: "center",
    },
    inputWrapperRow: {
      width: "auto",
    },

    label: {
      fontSize: theme.typography.sizes.lg,
      fontFamily: theme.typography.families.regular,
      marginBottom: theme.spacing.sm,
      color: palette.primary,
    },

    input: {
      height: theme.input.height,
      paddingHorizontal: theme.input.paddingHorizontal,
      fontSize: theme.typography.sizes.md,
      backgroundColor: palette.background,
      borderWidth: theme.input.borderWidth,
      borderColor: palette.border,
      borderRadius: theme.input.borderRadius,
      color: palette.body,
      fontFamily: theme.typography.families.regular,
      paddingRight: theme.spacing.xl * 1.6,
      ...theme.shadow.soft,
    },

    smallInput: {
      width: 70,
      height: 40,
      paddingHorizontal: 10,
      fontSize: theme.typography.sizes.sm,
      borderRadius: theme.radii.md,
      alignSelf: "flex-start",
    },

    rowInput: {
      marginLeft: theme.spacing.sm,
      width: "100%",
      paddingRight: theme.spacing.sm,
    },
    centeredInput: {
      textAlign: "center",
    },

    noBorder: {
      borderWidth: 0,
      backgroundColor: "transparent",
      paddingLeft: 0,
      marginTop: -theme.spacing.sm,
      shadowColor: "transparent",
      shadowOpacity: 0,
      shadowRadius: 0,
      shadowOffset: { width: 0, height: 0 },
      elevation: 0,
    },

    inputError: {
      borderColor: palette.error,
    },

    error: {
      fontSize: theme.typography.sizes.sm,
      color: palette.error,
      fontFamily: theme.typography.families.regular,
    },

    errorRow: {
      flexDirection: "row",
      alignSelf: "flex-end",
      justifyContent: "flex-start",
      position: "absolute",
    },

    smallError: {
      marginTop: theme.spacing.xxl + theme.spacing.sm,
    },
    smallErrorIcon: {
      marginTop: theme.spacing.xxl + theme.spacing.sm + 3,
    },
    rightAccessory: {
      position: "absolute",
      right: theme.spacing.md,
      justifyContent: "center",
      alignItems: "center",
      height: "100%",
    },
  });
