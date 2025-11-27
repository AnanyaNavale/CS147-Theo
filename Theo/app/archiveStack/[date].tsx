import { Dimensions, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { View, Text } from "@/components/Themed";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";

// SUPABASE
import { useSupabase } from "@/providers/SupabaseProvider";
// import type { WorkSession, SessionSetting } from "@/types/database.types";
import { fetchSessionsForDayWithSettingsSorted } from "@/lib/supabase";

import SessionBox from "@/components/ArchiveSessionBox";


// import { Feather } from "@expo/vector-icons";
const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;

export default function SingleDayScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const { supabase } = useSupabase();

  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // const sessions = [
  //   { id: "1", title: "Math Homework", time: "90 min" },
  //   { id: "2", title: "Project Work", time: "45 min" },
  // ];

  useEffect(() => {
    if (!date) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const data = await fetchSessionsForDayWithSettingsSorted(date, null);
        console.log(data);
        setSessions(data ?? []);
      } catch (err) {
        console.error("Error fetching sessions:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [date]);

  return (
    <View style={styles.container}>
      <FlatList
        data={sessions}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        // contentContainerStyle={{ paddingVertical: 30 }}
        renderItem={({ item }) => (
          <SessionBox title={item.title} time={item.total_time} has_settings={item.has_settings}/>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: "100%",
    paddingTop: 30,
    paddingHorizontal: 16,
    borderColor: 'red',
  },
});
