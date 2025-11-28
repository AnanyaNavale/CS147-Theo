import {
  Animated, Dimensions,
  StyleSheet,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "expo-router";

// SUPABASE
import { useSupabase } from "@/providers/SupabaseProvider";
// import type { WorkSession, SessionSetting } from "@/types/database.types";
import { fetchSessionDatesForMonth } from "@/lib/supabase";

// import EditScreenInfo from '@/components/EditScreenInfo';
import { Text, View } from '@/components/Themed';

import { Calendar, LocaleConfig } from "react-native-calendars";
import { Feather } from "@expo/vector-icons";
import SvgStrokeText from "@/components/SvgStrokeText";
import { colors } from "@/assets/themes/colors";
import { fonts } from "@/assets/themes/typography";

const SCREEN_WIDTH = Dimensions.get("window").width;

LocaleConfig.locales["custom"] = {
  monthNames: [
    "JANUARY",
    "FEBRUARY",
    "MARCH",
    "APRIL",
    "MAY",
    "JUNE",
    "JULY",
    "AUGUST",
    "SEPTEMBER",
    "OCTOBER",
    "NOVEMBER",
    "DECEMBER",
  ],
  monthNamesShort: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ],
  dayNames: [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ],
  dayNamesShort: ["S", "M", "T", "W", "Th", "F", "Sa"],
};

LocaleConfig.defaultLocale = "custom";

export default function ArchiveScreen() {
  // STATES
  const [monthSessions, setMonthSessions] = useState<{ [date: string]: any }>({});
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth() + 1); // 1-12
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  const [loading, setLoading] = useState(false);

  const { supabase, session: authSession } = useSupabase();
  // const opacity = useRef(new Animated.Value(1)).current;
  // const prevMonth = useRef(currentMonth);
  const router = useRouter();

  // RETRIEVE MONTHLY SESSIONS FROM SUPABASE
  useEffect(() => {
    // console.log("authSession inside useEffect:", authSession);
    // if (!authSession) return;
    const fetchMonthSessionsData = async () => {
      setLoading(true);
      try {

        const data = await fetchSessionDatesForMonth(currentMonth, currentYear);

        const marked: { [date: string]: any } = {};

        // Mark month session dates
        data.forEach((dateString) => {
          const day = dateString.split("T")[0]; // strip time
          marked[day] = {
            customStyles: {
              container: {
                borderColor: colors.light.markedDates,
                borderWidth: 2,
                borderRadius: 50,
                // paddingBottom: 5,
                justifyContent: "center",
                alignItems: "center",
              },
              text: {
                color: colors.light.body,
                marginBottom: 3,
              },
            },
          };
        });

        setMonthSessions(marked);

      } catch (error) {
        console.error("Error fetching month sessions:", error);
      } finally {
        setLoading(false);
      }

    };

    fetchMonthSessionsData();

  }, [authSession, currentMonth, currentYear]);

  const today = new Date().toLocaleDateString("en-CA"); // outputs YYYY-MM-DD

  const combinedMarkedDates = {
    ...monthSessions, // your DB sessions
    [today]: {
      ...(monthSessions[today] || {}), // keep DB styling if today is also a session
      customStyles: {
        container: {
          backgroundColor: colors.light.primary,
          // borderColor: colors.light.border,
          borderRadius: 50,
        },
        text: {
          color: colors.light.month,
        },
      },
    },
  };

  return (
    <View style={styles.container}>
      <SvgStrokeText
        text="Session & Plan Archive"
      />
      <View style={styles.calendarContainer}>
        <Calendar
          renderHeader={(date) => {
            const month = date.toString("MMMM yyyy"); // or use moment/Date API

            return (
              <View
                style={{
                  backgroundColor: colors.light.primary,
                  paddingVertical: 4,
                  paddingTop: 7,
                  paddingHorizontal: 16,
                  // paddingRight: 20,
                  borderRadius: 12,
                  justifyContent: "center",
                  alignItems: "center",
                  // borderWidth: 2,
                  // borderColor: "#B28F6D",
                  alignSelf: "center",
                  // marginBottom: 10,
                }}
              >
                <SvgStrokeText
                  text={month}
                  stroke={colors.light.month}
                  strokeWidth={0.5}
                  textStyle={{ fontSize: 20, color: colors.light.month }}
                />
              </View>
            );
          }}
          style={styles.calendar}
          current={today} // show current month
          renderArrow={(direction) => (
            <Feather
              name={direction === "left" ? "arrow-left" : "arrow-right"}
              size={30}
              color={colors.light.iconsStandalone}
            />
          )}
          onDayPress={(day) => {
            router.push({
              pathname: "../archiveStack/[date]",
              params: { date: day.dateString },
            });
          }}
          onMonthChange={(month) => {
            setCurrentMonth(month.month); // 1-12
            setCurrentYear(month.year);
          }}
          markingType="custom"
          markedDates={combinedMarkedDates}
          theme={{
            ...({
              "stylesheet.calendar.header": {
                monthText: {
                  fontFamily: "AnticDidone-Regular",
                  fontSize: 22,
                  color: "black",
                },
              },
            } as any),
            textSectionTitleColor: colors.light.header1,
            textDayHeaderFontFamily: fonts.typeface.header,
            textDayHeaderFontSize: 18,
            textDayFontFamily: fonts.typeface.body,
            textDisabledColor: colors.light.inactive,
            backgroundColor: colors.light.background,
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: SCREEN_WIDTH * 0.2,
    backgroundColor: colors.light.background,
  },
  calendarContainer: {
    position: "relative",
    justifyContent: "center", // vertical centering
    alignItems: "center", // horizontal centering
    backgroundColor: colors.light.background,
  },
  calendar: {
    marginTop: SCREEN_WIDTH * 0.1,
    width: SCREEN_WIDTH * 0.9,
  },
});
