// components/InputField.tsx

import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { theme } from "../../design/theme";

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
      ...rest
    },
    ref
  ) => {
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
          ]}
          placeholderTextColor={theme.input.placeholder}
          {...rest}
        />

        {error && <Text style={[styles.error, errorStyle]}>{error}</Text>}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: theme.spacing.md + 2,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  label: {
    fontSize: theme.typography.sizes.lg,
    fontFamily: theme.typography.families.regular,
    marginBottom: theme.spacing.sm,
    color: theme.colors.accentDark,
  },

  input: {
    width: "100%",
    height: theme.input.height,
    paddingHorizontal: theme.input.paddingHorizontal,
    fontSize: theme.typography.sizes.md,
    backgroundColor: theme.colors.background,
    borderWidth: theme.input.borderWidth,
    borderColor: theme.input.borderColor,
    borderRadius: theme.input.borderRadius,
    color: theme.colors.text,
    fontFamily: theme.typography.families.regular,
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
    width: "auto",
  },
  centeredInput: {
    textAlign: "center",
  },

  noBorder: {
    borderWidth: 0,
    backgroundColor: "transparent",
    paddingLeft: 0,
    marginTop: -theme.spacing.sm,
  },

  inputError: {
    borderColor: theme.colors.danger,
  },

  error: {
    position: "absolute",
    marginTop: theme.spacing.xxl,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.danger,
    fontFamily: theme.typography.families.regular,
  },
});
