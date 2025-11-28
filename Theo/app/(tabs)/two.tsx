import { StyleSheet, Text, View } from 'react-native';

import { BasicButton } from "@/components/BasicButton";

import { colors } from "@/assets/themes/colors";
import { fonts } from "@/assets/themes/typography";

export default function TabTwoScreen() {
  return (
    <View style={styles.container}>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
