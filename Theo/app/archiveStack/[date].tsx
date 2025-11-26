import { Dimensions, StyleSheet, TouchableOpacity } from "react-native";
import { View, Text } from "@/components/Themed";
import { useLocalSearchParams } from "expo-router";


// import { Feather } from "@expo/vector-icons";
const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;

export default function SingleDayScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();

  return (
    <View style={styles.container}>
      <Text>Data for {date}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // height: SCREEN_HEIGHT * 0.8,
    justifyContent: "center",
    alignItems: "center",
    borderColor: 'red',
    borderWidth: 1,
  },
});
