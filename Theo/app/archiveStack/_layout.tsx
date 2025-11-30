import { Stack } from "expo-router";
import { StyleSheet, TouchableOpacity, Image, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import SvgStrokeText from "@/components/SvgStrokeText";

import { Feather } from "@expo/vector-icons";
import { colors } from "@/assets/themes/colors";

export default function ArchiveStackLayout() {
  const router = useRouter();
  const { date } = useLocalSearchParams<{ date: string }>();
  const [year, month, day] = date.split("-").map(Number);

  const displayDate = new Date(year, month - 1, day).toLocaleDateString(
    "en-US",
    {
      weekday: "long",
      month: "2-digit",
      day: "2-digit",
      year: "numeric", // or "2-digit" for MM/DD/YY
    }
  );

  return (
    <Stack
      screenOptions={{
        header: () => (
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.push("../(tabs)/archive")}
              style={styles.backButton}
            >
              <Feather
                name={"arrow-left"}
                size={36}
                color={colors.light.iconsStandalone}
                // marginTop={90}
              />

              <TouchableOpacity onPress={() => router.push("../profile")}>
                <View style={styles.userIcon}>
                  <Feather name="user" size={24} color={colors.light.ghost} />
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.dateContainer}>
              <SvgStrokeText text={displayDate} />
            </View>
          </View>
        ),
      }}
    />
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 24,
    paddingHorizontal: 20,
    backgroundColor: colors.light.background,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dateContainer: {
    marginTop: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 8,
  },
  logo: {
    width: 90,
    height: 38,
    resizeMode: "contain",
  },
  userIcon: {
    borderRadius: 18,
    borderWidth: 3,
    borderColor: colors.light.iconsStandalone,
    backgroundColor: colors.light.iconsStandalone,
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
});
