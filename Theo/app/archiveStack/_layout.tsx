import { Stack } from "expo-router";
import { StyleSheet, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Text, View } from "@/components/Themed";
import SvgStrokeText from "@/components/SvgStrokeText";

import { Feather } from "@expo/vector-icons";
import { colors } from "@/assets/themes/colors";
import { fonts } from "@/assets/themes/typography";

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
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Feather
                name={"arrow-left"}
                size={36}
                color={colors.light.iconsStandalone}
                // marginTop={90}
              />
            </TouchableOpacity>
            <View style={styles.dateContainer}>
              <SvgStrokeText
                text={displayDate}
              />
            </View>
          </View>
        ),
      }}
    />
  );
}

const styles = StyleSheet.create({
  header: {
    // flex: 1,
    height: 130,
    // justifyContent: "center",
    // paddingLeft: 30,
    // borderColor: "red",
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
    justifyContent: "flex-end",
    backgroundColor: colors.light.background,
    // paddingTop: 80,
    // flexDirection: 'row',
    // borderWidth: 2,
  },
  backButton: {
    position: "absolute",
    left: 16,
    top: 80,
    zIndex: 2,
    backgroundColor: colors.light.background,
  },
  dateContainer: {
    position: "absolute",
    top: 83,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 1,
    // textAlign: "center",
    width: "100%",
    backgroundColor: colors.light.background,
  },
});
