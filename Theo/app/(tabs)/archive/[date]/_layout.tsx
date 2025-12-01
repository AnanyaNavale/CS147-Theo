import { Stack } from "expo-router";

import { useLocalSearchParams, useRouter } from "expo-router";
import { Text, View } from "@/components/Themed";
import SvgStrokeText from "@/components/SvgStrokeText";

import { Feather } from "@expo/vector-icons";
import { colors } from "@/assets/themes/colors";
import { fonts } from "@/assets/themes/typography";

export default function DateStackLayout() {

    return (
      <Stack>
        <Stack.Screen
          name="index" // single session page
          options={{
            headerShown: false,
            // tabBarStyle: { display: "none" },
          }}
        />
        <Stack.Screen
          name="[session]" // single session page
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    );
}


