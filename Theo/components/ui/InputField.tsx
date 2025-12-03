// components/InputField.tsx

import React from "react";
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
          <Text style={[styles.error, errorStyle, small && styles.smallError]}>
            {error}
          </Text>
        )}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: theme.spacing.md + 2,
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
    color: theme.colors.accentDark,
  },

  input: {
    //width: "100%",
    height: theme.input.height,
    paddingHorizontal: theme.input.paddingHorizontal,
    fontSize: theme.typography.sizes.md,
    backgroundColor: theme.colors.background,
    borderWidth: theme.input.borderWidth,
    borderColor: theme.input.borderColor,
    borderRadius: theme.radii.md,
    color: theme.colors.text,
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
  },

  inputError: {
    borderColor: theme.colors.danger,
  },

  error: {
    position: "absolute",
    marginTop: theme.spacing.xxl + theme.spacing.lg,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.danger,
    fontFamily: theme.typography.families.regular,
  },
  smallError: {
    marginTop: theme.spacing.xxl + theme.spacing.sm,
  },
  rightAccessory: {
    position: "absolute",
    right: theme.spacing.md,
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
  },
});
