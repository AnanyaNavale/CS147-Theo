import { Text as RNText, TextProps, StyleSheet } from "react-native";
import { theme } from "../../design/theme";

export function Text({ style, ...props }: TextProps) {
  return <RNText {...props} style={[styles.text, style]} />;
}

const styles = StyleSheet.create({
  text: {
    color: theme.colors.text,
    fontFamily: theme.typography.families.regular,
    fontSize: theme.typography.sizes.md,
  },
});
