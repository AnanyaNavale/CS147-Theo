import {
  Dimensions,
  FlatList,
  SectionList, StyleSheet,
  TouchableOpacity,
} from "react-native";
import { View, Text } from "@/components/Themed";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import SvgStrokeText from "@/components/SvgStrokeText";

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

  useEffect(() => {
    if (!date) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const data = await fetchSessionsForDayWithSettingsSorted(date, null);
        // console.log(data);
        setSessions(data ?? []);
      } catch (err) {
        console.error("Error fetching sessions:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [date]);

  const sections = [
    {
      title: "Sessions:",
      data: sessions.filter((s) => s.has_settings === true),
    },
    {
      title: "Plans:",
      data: sessions.filter((s) => s.has_settings === false),
    },
  ];

  return (
    <View style={styles.container}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SessionBox
            title={item.title}
            time={item.total_time}
            has_settings={item.has_settings}
            status={item.status}
          />
        )}
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.headerContainer}>
            <SvgStrokeText
              text={title}
              stroke="black"
              strokeWidth={0.3}
              style={styles.sectionHeader}
              width="100%" // fill the container
              height={30} // optional fixed height
              textAnchor="start"
            />
          </View>
        )}
        ItemSeparatorComponent={() => (
          <View style={{ height: 10, backgroundColor: "white" }} />
        )}
        contentContainerStyle={{ paddingBottom: 50 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // height: "100%",
    // paddingTop: 16,
    paddingHorizontal: 16,
    backgroundColor: "white",
    // borderColor: 'red',
  },
  headerContainer: {
    padding: 16,
    paddingLeft: 20,
    backgroundColor: "white",
    width: "100%",
    alignItems: 'flex-start',
    borderColor: 'red',
    // borderWidth: 2,
  },
  sectionHeader: {
    fontSize: 20,
    fontFamily: "AnticDidone-Regular",
    color: "black",
    // margin: 16,
    // marginHorizontal: 16,
  },
});
