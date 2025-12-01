import { colors } from "@/assets/themes/colors";
import { StyleSheet, Text, View } from "react-native";

export default function SingleSessionScreen() {
    return (
      <View style={styles.container}>
        <Text style={{ fontSize: 70 }}>...</Text>
      </View>
    );
    
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderColor: 'red',
    borderWidth: 1,
    backgroundColor: colors.light.background,
  },
});