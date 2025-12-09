import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Dimensions, StyleSheet } from "react-native";

// SUPABASE
import { useSupabase } from "@/providers/SupabaseProvider";
// import type { WorkSession, SessionSetting } from "@/types/database.types";
import { fetchSessionDatesForMonth, getCurrentSession } from "@/lib/supabase";

// import EditScreenInfo from '@/components/EditScreenInfo';
import { View } from "@/components/Themed";

import { fonts } from "@/assets/themes/typography";
import SvgStrokeText from "@/components/SvgStrokeText";
import { Theme } from "@/design/theme";
import { useAppTheme } from "@/hooks/ThemeContext";
import { Feather } from "@expo/vector-icons";
import { Calendar, LocaleConfig } from "react-native-calendars";

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
  const [monthSessions, setMonthSessions] = useState<{ [date: string]: any }>(
    {}
  );
  const [currentMonth, setCurrentMonth] = useState<number>(
    new Date().getMonth() + 1
  ); // 1-12
  const [currentYear, setCurrentYear] = useState<number>(
    new Date().getFullYear()
  );
  const [loading, setLoading] = useState(false);

  const { session: authSession } = useSupabase();
  const router = useRouter();
  const { colors: palette, theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme, palette), [palette, theme]);

  // RETRIEVE MONTHLY SESSIONS FROM SUPABASE

  useEffect(() => {
    const fetchMonthSessionsData = async () => {
      setLoading(true);
      try {
        const userId = authSession?.user?.id;
        if (!userId) {
          setMonthSessions({});
          return;
        }

        // 1. Fetch local-day strings from Supabase
        const sessionDays = await fetchSessionDatesForMonth(
          currentMonth,
          currentYear,
          userId
        );

        // 2. Build marked object
        const marked: Record<string, any> = {};
        sessionDays.forEach((localDay) => {
          marked[localDay] = {
            customStyles: {
              container: {
                borderColor: palette.markedDates,
                borderWidth: 2,
                borderRadius: 50,
                justifyContent: "center",
                alignItems: "center",
              },
              text: {
                color: palette.body,
                marginBottom: 3,
              },
            },
          };
        });

        // 3. Set state
        setMonthSessions(marked);
      } catch (error) {
        console.error("Error fetching month sessions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMonthSessionsData();
  }, [authSession, currentMonth, currentYear, palette]);

  const today = new Date().toLocaleDateString("en-CA"); // outputs YYYY-MM-DD

  const combinedMarkedDates = {
    ...monthSessions, // your DB sessions
    [today]: {
      ...(monthSessions[today] || {}), // keep DB styling if today is also a session
      customStyles: {
        container: {
          backgroundColor: palette.primary,
          // borderColor: colors.light.border,
          borderRadius: 50,
        },
        text: {
          color: palette.month,
        },
      },
    },
  };

  return (
    <View style={styles.container}>
      <SvgStrokeText text="Session & Plan Archive" />
      <View style={styles.calendarContainer}>
        <Calendar
          key={palette.background}
          renderHeader={(date) => {
            const month = date.toString("MMMM yyyy"); // or use moment/Date API

            return (
              <View
                style={{
                  backgroundColor: palette.primary,
                  paddingVertical: 4,
                  paddingTop: 7,
                  paddingHorizontal: 16,
                  borderRadius: theme.radii.md,
                  justifyContent: "center",
                  alignItems: "center",
                  alignSelf: "center",

                }}
              >
                <SvgStrokeText
                  text={month}
                  stroke={palette.month}
                  strokeWidth={0.5}
                  textStyle={{ fontSize: 20, color: palette.month }}
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
              color={palette.iconsStandalone}
            />
          )}
          onDayPress={(day) => {
            router.push({
              pathname: "../../(tabs)/archive/[date]",
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
                  color: palette.month,
                },
              },
            } as any),
            textSectionTitleColor: palette.header1,
            textDayHeaderFontFamily: fonts.typeface.header,
            textDayHeaderFontSize: 18,
            textDayFontFamily: fonts.typeface.body,
            textDayFontSize: 16,
            textDisabledColor: palette.inactive,
            backgroundColor: palette.background,
            calendarBackground: palette.background,
            dayTextColor: palette.body,
            monthTextColor: palette.month,
            arrowColor: palette.iconsStandalone,
          }}
        />
      </View>
    </View>
  );
}

function createStyles(theme: Theme, palette: typeof import("@/assets/themes/colors").colors.light) {
  return StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "center",
      paddingTop: SCREEN_WIDTH * 0.2,
      backgroundColor: palette.background,
    },
    calendarContainer: {
      position: "relative",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: palette.background,
    },
    calendar: {
      marginTop: SCREEN_WIDTH * 0.1,
      width: SCREEN_WIDTH * 0.9,
    },
  });
}
