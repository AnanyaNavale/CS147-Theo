import MainHeader from "@/components/custom/MainHeader";
import { Feather } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";

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
          header: () => <MainHeader />,
          animation: "slide_from_left",
        }}
      />
    </Stack>
  );
}
