import {
  Dimensions,
  FlatList,
  SectionList, StyleSheet,
  TouchableOpacity,
} from "react-native";
import { View, Text } from "@/components/Themed";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import SvgStrokeText from "@/components/SvgStrokeText";

// SUPABASE
import { useSupabase } from "@/providers/SupabaseProvider";
// import type { WorkSession, SessionSetting } from "@/types/database.types";
import { fetchSessionsForDayWithSettingsSorted } from "@/lib/supabase";

import SessionBox from "@/components/ArchiveSessionBox";
import { Feather } from "@expo/vector-icons";
import { colors } from "@/assets/themes/colors";
import { fonts } from "@/assets/themes/typography";


// import { Feather } from "@expo/vector-icons";
const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;

export default function SingleDayScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const [year, month, day] = date.split("-").map(Number);

  const { supabase } = useSupabase();
  const router = useRouter();

  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const displayDate = new Date(year, month - 1, day).toLocaleDateString(
    "en-US",
    {
      weekday: "long",
      month: "2-digit",
      day: "2-digit",
      year: "numeric", // or "2-digit" for MM/DD/YY
    }
  );

  useEffect(() => {
    if (!date) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const data = await fetchSessionsForDayWithSettingsSorted(date, null);
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
      title: "Sessions",
      data: sessions.filter((s) => s.has_settings === true),
    },
    {
      title: "Plans",
      data: sessions.filter((s) => s.has_settings === false),
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.replace("/archive")}
          style={styles.backButton}
        >
          <Feather
            name={"arrow-left"}
            size={36}
            color={colors.light.iconsStandalone}
          />
        </TouchableOpacity>
        <View style={styles.dateContainer}>
          <SvgStrokeText text={displayDate} />
        </View>
      </View>

      <View style={styles.shadow} />

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SessionBox
            title={item.title}
            time={item.total_time}
            has_settings={item.has_settings}
            status={item.status}
            onPress={() =>
              router.push({
                pathname: "../../../(tabs)/archive/[date]/[session]",
                params: { date: date, session: item.id },
              })
            }
          />
        )}
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.headerContainer}>
            <SvgStrokeText
              text={title}
              textStyle={{ fontSize: fonts.sizes.header2 }}
              containerStyle={{ alignSelf: "center" }}
            />
          </View>
        )}
        ItemSeparatorComponent={() => (
          <View style={{ height: 10, backgroundColor: "white" }} />
        )}
        contentContainerStyle={{
          paddingHorizontal: 16,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    height: 130,
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
    justifyContent: "flex-end",
    backgroundColor: colors.light.background,
    borderColor: 'red',
    // borderWidth: 1,
    // borderBottomWidth: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 }, // subtle bottom shadow
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    position: "absolute",
    left: 16,
    top: 80,
    zIndex: 2,
    backgroundColor: colors.light.background,
  },
  dateContainer: {
    position: "absolute",
    top: 83,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 1,
    width: "100%",
    backgroundColor: colors.light.background,
  },
  shadow: {
    height: 4,
    backgroundColor: "transparent",
    shadowColor: colors.light.shadowPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    marginBottom: 5,
        },
  headerContainer: {
    padding: 10,
    backgroundColor: "white",
    width: "100%",
    borderColor: "red",
  },
});
