import { Dimensions, StyleSheet, TouchableOpacity } from "react-native";
import { View, Text } from "@/components/Themed";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";

// SUPABASE
import { useSupabase } from "@/providers/SupabaseProvider";
// import type { WorkSession, SessionSetting } from "@/types/database.types";
import { fetchSessionsForDayWithSettingsSorted } from "@/lib/supabase";

interface SessionBoxProps {
  title: string;
  time: string;
  has_settings: boolean;
  status: string;
  onPress?: () => void;
}

export default function SessionBox({ title, time, has_settings, status, onPress }: SessionBoxProps) {
  const timeDisplay = formatMinutes(Number(time));

  return (
    <TouchableOpacity
      style={[styles.container, getBoxStyle(has_settings, status)]}
      onPress={onPress}
    >
      <View style={[styles.timeContainer, getTimeStyle(has_settings, status)]}>
        <Text style={styles.time}>{timeDisplay}</Text>
      </View>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{title}</Text>
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

function getBoxStyle(has_settings: boolean, status: string) {
  if (has_settings && status === "completed")
    return styles.containerCompleted;
  if (has_settings) return styles.containerSession;
  return styles.containerPlan;
}

function getTimeStyle(has_settings: boolean, status: string) {
  if (has_settings && status === "completed") return styles.timeContainerCompleted;
  if (has_settings) return styles.timeContainerSession;
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
    padding: 10,
    backgroundColor: "white",
  },
  title: {
    fontSize: 16,
    fontFamily: "Raleway-Regular",
    color: 'black',
    // fontWeight: "bold",
  },
  time: {
    fontSize: 16,
    fontFamily: "Raleway-Regular",
    color: "white",
  },
});