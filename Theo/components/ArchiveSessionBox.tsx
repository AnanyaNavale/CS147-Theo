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

interface SessionBoxProps {
  title: string;
  goal: string;
  time: string;
  status: string;
  onPress?: () => void;
}

export default function SessionBox({ title, goal, time, status, onPress }: SessionBoxProps) {
  const timeDisplay = formatMinutes(Number(time));

  const hasTitle = title?.trim() !== "";
  if (!hasTitle) {
    title = goal;
  }

  return (
    <TouchableOpacity
      style={[styles.container, getBoxStyle(status)]}
      onPress={onPress}
    >
      <View style={[styles.timeContainer, getTimeStyle(status)]}>
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
        <Text style={styles.title}>{title}</Text>
        {/* {title === "null" || !title ? (
          <Text style={styles.title}>{title}</Text>
        ) : status === "planned" ? (
          <Text
            style={[styles.title, { fontFamily: fonts.typeface.bodyItalic }]}
          >
            Plan
          </Text>
        ) : (
          <Text
            style={[styles.title, { fontFamily: fonts.typeface.bodyItalic }]}
          >
            Session
          </Text>
        )} */}
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

function getBoxStyle(status: string) {
  console.log(status);
  if (status === "complete")
    return styles.containerCompleted;
  if (status !== "complete" && status !== "planned") return styles.containerSession;
  return styles.containerPlan;
}

function getTimeStyle(status: string) {
  if (status === "complete") return styles.timeContainerCompleted;
  if (status !== "complete" && status !== "planned")
    return styles.timeContainerSession;
  return styles.timeContainerPlan;
}

const styles = StyleSheet.create({
  container: {
    height: 100,
    marginHorizontal: 20,
    borderRadius: 10,
    backgroundColor: "white",
    borderWidth: 2,
    marginBottom: 12,
    flexDirection: "row",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  containerSession: {
    borderColor: "#B28F6D",
    borderStyle: "dashed",
    shadowColor: "#B28F6D80",
  },
  containerCompleted: {
    borderColor: "#8A5E3C",
    shadowColor: "#8A5E3C80",
  },
  containerPlan: {
    borderColor: "#CF9841",
    shadowColor: "#CF984180",
  },
  timeContainer: {
    width: "25%",
    height: "100%",
    borderRadius: 5,
    padding: 10,
    backgroundColor: "white",
  },
  timeContainerSession: {
    backgroundColor: "#B28F6D",
  },
  timeContainerCompleted: {
    backgroundColor: "#8A5E3C",
  },
  timeContainerPlan: {
    backgroundColor: "#CF9841",
  },
  titleContainer: {
    flex: 1,
    flexShrink: 1,
    padding: 10,
    backgroundColor: "white",

  },
  title: {
    fontSize: 16,
    fontFamily: "Raleway-Regular",
    color: "black",
    width: "100%",
    flexWrap: "wrap",
  },
  time: {
    fontSize: 16,
    fontFamily: "Raleway-Regular",
    color: "white",
  },
});