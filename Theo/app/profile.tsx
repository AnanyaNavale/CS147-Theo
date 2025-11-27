import FontAwesome from "@expo/vector-icons/FontAwesome";
import { router } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Text } from "@/components/ui/Text";
import { theme } from "@/design/theme";

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <Pressable
        accessibilityRole="button"
        onPress={() => router.back()}
        style={styles.backButton}
      >
        <FontAwesome
          name="chevron-left"
          size={18}
          color={theme.colors.background}
        />
        <Text style={styles.backLabel}>Back</Text>
      </Pressable>

      <View style={styles.content}>
        <Text variant="h2">Profile coming soon</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FDF6EE",
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.accentDark,
  },
  backLabel: {
    color: theme.colors.background,
    fontFamily: theme.typography.families.handwritten,
    fontSize: theme.typography.sizes.md,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
