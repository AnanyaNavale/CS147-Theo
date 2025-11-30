import { Stack } from "expo-router";
import { Image, StyleSheet, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Text, View } from "@/components/Themed";
import SvgStrokeText from "@/components/SvgStrokeText";

import { Feather } from "@expo/vector-icons";
import { colors } from "@/assets/themes/colors";
import { fonts } from "@/assets/themes/typography";
import MainHeader from "@/components/ui/MainHeader";

type FeatherName = React.ComponentProps<typeof Feather>["name"];

function TabBarIcon({
  name,
  color,
  size = 33,
}: {
  name: FeatherName;
  color: string;
  size?: number;
}) {
  return (
    <Feather
      name={name}
      color={color}
      size={size}
      style={{ marginBottom: -2 }}
    />
  );
}

export default function ArchiveLayout() {
  const image = require("@/assets/images/logo.png");
  const router = useRouter();
  const { date } = useLocalSearchParams<{ date: string }>();

  return (
    <Stack
      screenOptions={{
        headerShown: false, // hide header by default for all screens
      }}
    >
      <Stack.Screen
        name="index" // calendar page
        options={{
          headerShown: true,
          header: () => (
            <MainHeader />
          ),
        }}
      />
      <Stack.Screen
        name="[date]/index" // daily page
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  headerCalendar: {
    height: 130,
    backgroundColor: "#fff",
    shadowOpacity: 0,
    elevation: 0,
    flexDirection: "row", // horizontal layout
    justifyContent: "space-between", // spread elements evenly across width
    alignItems: "flex-end", // vertically center elements
    paddingHorizontal: 30,
    paddingVertical: 15,
  },
  userIcon: {
    borderRadius: 22, // half of width/height
    borderWidth: 4,
    borderColor: "#8A5E3C",
    backgroundColor: "#8A5E3C",
    width: 45,
    height: 45,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    height: 130,
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
    justifyContent: "flex-end",
    backgroundColor: colors.light.background,
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
    width: "100%",
    backgroundColor: colors.light.background,
  },
});
