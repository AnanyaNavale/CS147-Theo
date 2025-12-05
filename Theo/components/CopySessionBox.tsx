import { Dimensions, StyleSheet, TouchableOpacity } from "react-native";
import { View, Text } from "@/components/Themed";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";

// SUPABASE
import { useSupabase } from "@/providers/SupabaseProvider";
// import type { WorkSession, SessionSetting } from "@/types/database.types";
import { fetchSessionsForDaySorted } from "@/lib/supabase";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { fonts } from "@/assets/themes/typography";
import { colors } from "@/assets/themes/colors";

interface CopySessionBoxProps {
  title: string;
  goal: string | null;
  time: number;
  onPress?: () => void;
}

export default function CopySessionBox({
  title,
  goal,
  time,
  onPress,
}: CopySessionBoxProps) {
  const timeDisplay = formatMinutes(time);

  if (goal) {
    title = goal;
  }

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
    >
      <View style={styles.timeContainer}>
        {timeDisplay !== "0 min." ? (
          <Text style={styles.time}>{timeDisplay}</Text>
        ) : (
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "transparent",
            }}
          >
            <MaterialCommunityIcons
              name="clock-plus-outline"
              size={36}
              color={"white"}
            />
          </View>
        )}
      </View>
      <View style={styles.titleContainer}>
        <Text
          style={[
            styles.title,
            (title === "Session" || title === "Plan") && styles.italicTitle,
          ]}
        >
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function formatMinutes(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0 && minutes > 0) {
    return `${hours} hr.,\n${minutes} min.`;
  }
  if (hours > 0) {
    return `${hours} hr.`;
  }
  return `${minutes} min.`;
}

// function getBoxStyle(status: string) {
//   // console.log(status);
//   if (status === "complete") return styles.containerCompleted;
//   if (status !== "complete" && status !== "planned")
//     return styles.containerSession;
//   return styles.containerPlan;
// }

// function getTimeStyle(status: string) {
//   if (status === "complete") return styles.timeContainerCompleted;
//   if (status !== "complete" && status !== "planned")
//     return styles.timeContainerSession;
//   return styles.timeContainerPlan;
// }

const styles = StyleSheet.create({
  container: {
    height: 70,
    width: "80%",
    marginHorizontal: 20,
    borderRadius: 10,
    backgroundColor: colors.light.background,
    borderWidth: 2,
    borderColor: colors.light.secondary,
    marginBottom: 12,
    flexDirection: "row",
    overflow: "hidden",
  },
  containerSession: {
    borderColor: "#B28F6D",
    borderStyle: "dashed",
    shadowColor: colors.light.shadowPrimary,
  },
  timeContainer: {
    width: "30%",
    height: "100%",
    borderRadius: 5,
    padding: 10,
    backgroundColor: colors.light.secondary,
    alignItems: "center",
  },
  timeContainerSession: {
    backgroundColor: "#B28F6D",
  },
  titleContainer: {
    flex: 1,
    flexShrink: 1,
    padding: 10,
    backgroundColor: colors.light.background,
  },
  title: {
    fontSize: 16,
    fontFamily: fonts.typeface.body,
    color: colors.light.body,
    width: "100%",
    flexWrap: "wrap",
  },
  italicTitle: {
    fontFamily: fonts.typeface.bodyItalic,
  },
  time: {
    fontSize: 16,
    fontFamily: "Raleway-Regular",
    color: "white",
  },
});