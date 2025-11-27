import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SvgStrokeText from "@/components/SvgStrokeText";

// import { Text } from "@/components/ui/Text";
// import { theme } from "@/design/theme";

export default function ProfileScreen() {
  const name = "Anna";

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          accessibilityRole="button"
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Feather name={"arrow-left"} size={36} color="#8A5E3C" />
          {/* <Text style={styles.backLabel}>Back</Text> */}
        </TouchableOpacity>
        <View
          style={styles.titleContainer}
        >
          <SvgStrokeText
            text={name + "'s Profile"}
            stroke="black"
            strokeWidth={0.3}
            style={styles.header}
          />
        </View>
      </View>

      {/* <View style={styles.content}>
        <Text variant="h2">Profile coming soon</Text>
      </View> */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    padding: 16,
    // paddingHorizontal: theme.spacing.lg,
    // paddingTop: theme.spacing.lg,
    borderColor: 'red',
    // borderWidth: 2,
  },
  headerContainer: {
    width: "100%",
    borderColor: 'red',
    // borderWidth: 1,
    flexDirection: 'row',
  },
  titleContainer: {
    alignItems: "center",
    borderColor: "blue",
    // borderWidth: 2,
    position: "absolute",
    paddingTop: 2,
    // top: 83,
    left: 0,
    right: 0,
  },
  header: {
    fontFamily: 'AnticDidone-Regular',
    fontSize: 24,
    color: 'black',
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    // gap: theme.spacing.xs,
    // paddingHorizontal: theme.spacing.md,
    // paddingVertical: theme.spacing.sm,
    // borderRadius: theme.radii.md,
    // backgroundColor: theme.colors.accentDark,
  },
  // content: {
  //   flex: 1,
  //   alignItems: "center",
  //   justifyContent: "center",
  // },
});
