// components/InputField.tsx

import React from "react";
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from "react-native";
import { theme } from "../../design/theme";
import { colors } from "@/assets/themes/colors";

export type InputFieldProps = {
  label?: string;
  error?: string;

  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  errorStyle?: TextStyle;

  small?: boolean;
  centered?: boolean;
  noBorder?: boolean;
} & TextInputProps;

export const InputField = React.forwardRef<TextInput, InputFieldProps>(
  (
    {
      label,
      error,
      small = false,
      centered = false,
      noBorder = false,
      containerStyle,
      labelStyle,
      errorStyle,
      style,
      ...rest
    },
    ref
  ) => {
    return (
      <View style={[styles.container, containerStyle]}>
        {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}

        <TextInput
          ref={ref}
          style={[
            styles.input,
            small && styles.smallInput,
            centered && styles.centeredInput,
            noBorder && styles.noBorder,
            error && styles.inputError,
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

  label: {
    fontSize: theme.typography.sizes.md,
    fontFamily: theme.typography.families.regular,
    marginBottom: theme.spacing.sm,
    color: theme.colors.text,
  },

  input: {
    width: "100%",
    height: theme.input.height,
    paddingHorizontal: theme.input.paddingHorizontal,
    fontSize: theme.typography.sizes.md,
    backgroundColor: colors.light.background,
    borderWidth: 1,
    borderColor: colors.light.border,
    borderRadius: 10,
    color: colors.light.body,
    fontFamily: theme.typography.families.regular,
  },

  smallInput: {
    width: 70,
    height: 40,
    paddingHorizontal: 10,
    fontSize: theme.typography.sizes.sm,
    borderRadius: theme.radii.md,
    alignSelf: "flex-start",
  },

  centeredInput: {
    textAlign: "center",
  },

  noBorder: {
    borderWidth: 0,
    backgroundColor: "transparent",
  },

  inputError: {
    borderColor: theme.colors.danger,
  },

  error: {
    marginTop: theme.spacing.xs,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.danger,
    fontFamily: theme.typography.families.regular,
  },
});
