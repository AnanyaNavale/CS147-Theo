import { colors } from "@/assets/themes/colors";
import SvgStrokeText from "@/components/SvgStrokeText";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function SingleSessionScreen() {
  const router = useRouter();

    return (
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Feather
              name={"arrow-left"}
              size={36}
              color={colors.light.iconsStandalone}
            />
          </TouchableOpacity>
          <View style={styles.header}>
            <SvgStrokeText text="Session Summary" />
          </View>
        </View>
        <View style={styles.shadow} />

        <View style={styles.topContent}>

        </View>
      </View>
    );
    
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderColor: "red",
    borderWidth: 1,
    backgroundColor: colors.light.background,
  },
  headerContainer: {
    height: 130,
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
    justifyContent: "flex-end",
    backgroundColor: colors.light.background,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 }, // subtle bottom shadow
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    position: "absolute",
    left: 16,
    top: 80,
    zIndex: 2,
    backgroundColor: colors.light.background,
  },
  header: {
    position: "absolute",
    top: 83,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 1,
    width: "100%",
    backgroundColor: colors.light.background,
  },
  shadow: {
    height: 4,
    backgroundColor: "transparent",
    shadowColor: colors.light.shadowPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    marginBottom: 5,
  },
  topContent: {
    borderColor: 'red',
    borderWidth: 1,
    height: "50%",
  },
});