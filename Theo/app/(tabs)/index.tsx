import React from "react";
import { Image, StyleSheet, View } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "@/assets/themes/colors";
import { BasicButton } from "@/components/BasicButton";
import SvgStrokeText from "@/components/SvgStrokeText";
import { router } from "expo-router";
import { Spacer } from "@/components";

const teddyBear = require("@/assets/theo/working.png");

export default function HomeScreen() {
  const userName = "User";
  const today = formatHomeDate(new Date());

  return (
    <View style={styles.container}>
      <Spacer size="sm"/>
      <View style={styles.header}>
        <SvgStrokeText
          text={today}
          stroke={colors.light.date}
          textStyle={{ color: colors.light.date, fontSize: 20 }}
          containerStyle={{
            borderColor: "blue",
            alignSelf: "flex-start",
            // borderWidth: 1,
            marginLeft: -2,
          }}
        />
        <SvgStrokeText
          text={"Hi, " + userName}
          containerStyle={{
            // marginTop: 10,
            // marginLeft: 7,
            alignSelf: "flex-start",
            borderColor: "blue",
            marginVertical: 10,
            // borderWidth: 1,
          }}
        />
      </View>

      <Image source={teddyBear} style={styles.heroImage} />

      <Spacer size="xxl" />

      <BasicButton
        text="Start a work session"
        style={{ alignSelf: "center", marginTop: 50 }}
        onPress={() => router.push("../(tabs)/session")}
      />
      {/* <BasicButton
        text="Get help with a goal"
        variant="secondary"
        style={{ alignSelf: "center" }}
      /> */}
    </View>
  );
}

function formatHomeDate(date: Date) {
  const weekday = date.toLocaleDateString("en-US", { weekday: "long" });
  const month = date.toLocaleDateString("en-US", { month: "long" });
  const day = date.getDate();
  const year = date.getFullYear();
  return `${weekday}, ${month} ${day} ${year}`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
    borderColor: "red",
    // borderWidth: 1,
    padding: 16,
  },
  header: {
    width: "100%",
    // alignItems: "flex-start",
    // justifyContent: 'flex-start',
    borderColor: "red",
    // borderWidth: 1,
  },
  heroImage: {
    alignSelf: "center",
    marginTop: 30,
  },
});
