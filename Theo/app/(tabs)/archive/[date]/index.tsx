import {
  Dimensions,
  FlatList,
  SectionList, StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import SvgStrokeText from "@/components/SvgStrokeText";

// SUPABASE
import { useSupabase } from "@/providers/SupabaseProvider";
import { fetchSessionsForDayWithSettingsSorted } from "@/lib/supabase";

import SessionBox from "@/components/ArchiveSessionBox";
import { Feather } from "@expo/vector-icons";
import { colors } from "@/assets/themes/colors";
import { fonts } from "@/assets/themes/typography";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;

export default function SingleDayScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const [year, month, day] = date.split("-").map(Number);

  const { supabase } = useSupabase();
  const router = useRouter();

  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Parse the string into a Date
  const currentDate = new Date(year, month - 1, day); // works if date is "YYYY-MM-DD"

  const previousDate = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000);

  const nextDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);

  const displayDate = new Date(year, month - 1, day).toLocaleDateString(
    "en-US",
    {
      weekday: "long",
      month: "2-digit",
      day: "2-digit",
      year: "numeric", // or "2-digit" for MM/DD/YY
    }
  );

  const displayPrevious = previousDate.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "2-digit",
  });

  const displayNext = nextDate.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "2-digit",
  });

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

      <View style={styles.shadowBottom} />

      <View
        style={{
          height: "73%",
          marginBottom: "2%",
        }}
      >
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
          renderSectionFooter={({ section }) =>
            section.data.length === 0 ? (
              <View
                style={{
                  alignItems: "center",
                  backgroundColor: colors.light.background,
                }}
              >
                <Text
                  style={{
                    fontFamily: fonts.typeface.body,
                    fontSize: fonts.sizes.body,
                    color: colors.light.listPlaceholder,
                    padding: 16,
                    opacity: 0.6,
                  }}
                >
                  No items for this section.
                </Text>
              </View>
            ) : null
          }
          ItemSeparatorComponent={() => (
            <View style={{ height: 10, backgroundColor: "white" }} />
          )}
          contentContainerStyle={{
            paddingHorizontal: 16,
          }}
          style={{ backgroundColor: colors.light.background }}
        />
      </View>

      <View style={styles.shadowTop} />

      <View style={styles.bottomNavigator}>
        <TouchableOpacity
          style={{ flexDirection: "row" }}
          onPress={() =>
            router.push({
              pathname: "/(tabs)/archive/[date]",
              params: { date: previousDate.toISOString().split("T")[0] }, // "YYYY-MM-DD"
              // animation: "slide_from_left",
            })
          }
        >
          <Feather
            name="arrow-left"
            size={20}
            color={colors.light.iconsStandalone}
          />
          <Text style={styles.dates}>{displayPrevious}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ flexDirection: "row" }}
          onPress={() =>
            router.push({
              pathname: "/(tabs)/archive/[date]",
              params: { date: nextDate.toISOString().split("T")[0] }, // "YYYY-MM-DD"
            })
          }
        >
          <Text style={styles.dates}>{displayNext}</Text>
          <Feather
            name="arrow-right"
            size={20}
            color={colors.light.iconsStandalone}
          />
        </TouchableOpacity>
      </View>
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
  shadowBottom: {
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
  },
  bottomNavigator: {
    height: "11%",
    width: "100%",
    backgroundColor: colors.light.background,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 }, // subtle bottom shadow
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    paddingHorizontal: 20,
    paddingTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  shadowTop: {
    height: 4,
    backgroundColor: "transparent",
    shadowColor: colors.light.shadowPrimary,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    marginTop: 5,
  },
  dates: {
    fontFamily: fonts.typeface.body,
    color: colors.light.primary,
    fontSize: 18,
    marginHorizontal: 7,
  },
});
