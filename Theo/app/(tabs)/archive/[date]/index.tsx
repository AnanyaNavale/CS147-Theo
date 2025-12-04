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
import { fetchSessionsForDaySorted } from "@/lib/supabase";

import SessionBox from "@/components/ArchiveSessionBox";
import { Feather } from "@expo/vector-icons";
import { colors } from "@/assets/themes/colors";
import { fonts } from "@/assets/themes/typography";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;

export default function SingleDayScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const [year, month, day] = date.split("-").map(Number);

  const { session } = useSupabase();
  const userId = session?.user?.id;
  const router = useRouter();

  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Parse the string into a Date
  const currentDate = new Date(year, month - 1, day); // works if date is "YYYY-MM-DD"

  const previousDate = new Date(currentDate);
  previousDate.setDate(currentDate.getDate() - 1);

  const nextDate = new Date(currentDate);
  nextDate.setDate(currentDate.getDate() + 1);

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
    if (!date || !userId) return; // ⬅️ important

    const loadData = async () => {
      setLoading(true);
      try {
        const data = await fetchSessionsForDaySorted(date, userId);
        setSessions(data ?? []);
      } catch (err) {
        console.error("Error fetching sessions:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [date, userId]);

  const sections = [
  {
    title: "Sessions",
    data: sessions.filter(
      (s) => s.status !== "planned" // active, incomplete, complete
    ),
  },
  {
    title: "Plans",
    data: sessions.filter((s) => s.status === "planned"),
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
          <SvgStrokeText
            text={displayDate}
            textStyle={{ fontSize: fonts.sizes.header2 }}
          />
        </View>
      </View>

      <View style={styles.shadowBottom} />

      <View style={styles.topContentWrapper}>
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SessionBox
              title={item.title}
              goal={item.goal}
              time={item.total_time}
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
              params: { date: previousDate.toISOString().split("T")[0] }, // correct local day
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
              params: { date: nextDate.toISOString().split("T")[0] }, // correct local day
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
    backgroundColor: colors.light.background,
    justifyContent: "space-between",
  },
  topContentWrapper: {
    flex: 1, // fills all space above bottom navigator
    marginBottom: 90,
    backgroundColor: colors.light.background,
    justifyContent: "space-between",
  },
  header: {
    height: 130,
    flexDirection: "row",
    position: "relative",
    backgroundColor: colors.light.background,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 }, // subtle bottom shadow
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderColor: 'red',
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
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
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
