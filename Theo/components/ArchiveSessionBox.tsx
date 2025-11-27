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
  onPress?: () => void;
}

export default function SessionBox({ title, time, has_settings, onPress }: SessionBoxProps) {
  const timeDisplay = formatMinutes(Number(time));

  return (
    <TouchableOpacity style={has_settings ? styles.containerSession : styles.containerPlan} onPress={onPress}>
      <View style={has_settings ? styles.timeContainerSession : styles.timeContainerPlan}>
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

const styles = StyleSheet.create({
  containerSession: {
    height: 100,
    // width: "100%",
    marginHorizontal: 20,
    // padding: 16,
    borderRadius: 10,
    borderColor: "#8A5E3C",
    backgroundColor: "white",
    borderWidth: 2,
    // backgroundColor: "#F5F5F5",
    marginBottom: 12,
    flexDirection: "row",
    shadowColor: "#8A5E3C80",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  containerPlan: {
    height: 100,
    // width: "100%",
    marginHorizontal: 20,
    // padding: 16,
    borderRadius: 10,
    borderColor: "#CF9841",
    backgroundColor: "white",
    borderWidth: 2,
    // backgroundColor: "#F5F5F5",
    marginBottom: 12,
    flexDirection: "row",
    shadowColor: "#CF984180",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  timeContainerSession: {
    width: "25%",
    height: "100%",
    backgroundColor: "#8A5E3C",
    borderRadius: 5,
    padding: 10,
  },
  timeContainerPlan: {
    width: "25%",
    height: "100%",
    backgroundColor: "#CF9841",
    borderRadius: 5,
    padding: 10,
  },
  titleContainer: {
    padding: 10,
  },
  title: {
    fontSize: 16,
    fontFamily: "Raleway-Regular",
    // fontWeight: "bold",
  },
  time: {
    fontSize: 16,
    fontFamily: "Raleway-Regular",
    color: "white",
  },
});