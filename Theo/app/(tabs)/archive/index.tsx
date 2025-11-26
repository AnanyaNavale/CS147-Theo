import {
  Animated, Dimensions,
  StyleSheet,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import { useSupabase } from "@/providers/SupabaseProvider";
// import type { WorkSession, SessionSetting } from "@/types/database.types";
import { fetchSessionDatesForMonth } from "@/lib/supabase";

// import EditScreenInfo from '@/components/EditScreenInfo';
import { Text, View } from '@/components/Themed';

import { Calendar, LocaleConfig } from "react-native-calendars";
import { Feather } from "@expo/vector-icons";
// import StrokeText from "react-native-stroke-text";
import SvgStrokeText from "@/components/SvgStrokeText";

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
  const opacity = useRef(new Animated.Value(1)).current;
  const prevMonth = useRef(currentMonth);

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
                borderColor: "#CF9841",
                borderWidth: 2,
                borderRadius: 50,
                // paddingBottom: 5,
                justifyContent: "center",
                alignItems: "center",
              },
              text: {
                color: "black",
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

  useEffect(() => {
    if (prevMonth.current !== currentMonth) {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
      prevMonth.current = currentMonth;
    }
  }, [currentMonth]);

  const today = new Date().toLocaleDateString("en-CA"); // outputs YYYY-MM-DD

  const combinedMarkedDates = {
    ...monthSessions, // your DB sessions
    [today]: {
      ...(monthSessions[today] || {}), // keep DB styling if today is also a session
      customStyles: {
        container: {
          backgroundColor: "#8A5E3C",
          // borderWidth: 2,
          borderColor: "#8A5E3C",
          borderRadius: 50,
          // paddingBottom: 8,
        },
        text: {
          color: "white",
          // fontWeight: ,
        },
      },
    },
  };

  return (
    <View style={styles.container}>
      <SvgStrokeText
        text="Session & Plan Archive"
        // fontSize={18}
        // fontFamily="AnticDidone-Regular"
        stroke="black"
        strokeWidth={0.3}
        // fill="black"
        style={styles.title}
      />
      {/* <Text style={styles.title}>Session & Plan Archive</Text> */}
      <View style={styles.calendarContainer}>
        <Calendar
          renderHeader={(date) => {
            const month = date.toString("MMMM yyyy"); // or use moment/Date API

            return (
              <View
                style={{
                  backgroundColor: "#8A5E3C",
                  paddingVertical: 4,
                  paddingTop: 7,
                  paddingHorizontal: 16,
                  paddingRight: 20,
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
                  fontSize={18}
                  fontFamily="AnticDidone-Regular"
                  stroke="white"
                  strokeWidth={0.5}
                  fill="white"
                />
                {/* <Text
                  style={{
                    fontSize: 18,
                    fontFamily: "AnticDidone-Regular",
                    fontWeight: "bold",
                    color: "white",
                    // textShadowColor: "white",
                    // textShadowRadius: 1,
                    // textShadowOffset: { width: 0.5, height: 0.5 },
                  }}
                >
                  {month}
                </Text> */}
              </View>
            );
          }}
          style={styles.calendar}
          // dayNamesShort={["S", "M", "T", "W", "Th", "F", "Sa"]}
          current={today} // show current month
          renderArrow={(direction) => (
            <Feather
              name={direction === "left" ? "arrow-left" : "arrow-right"}
              size={30}
              color="#8A5E3C"
            />
          )}
          onDayPress={(day) => console.log("Selected day", day)}
          onMonthChange={(month) => {
            setCurrentMonth(month.month); // 1-12
            setCurrentYear(month.year);
          }}
          markingType="custom"
          markedDates={combinedMarkedDates}
          theme={{
            // calendarBackground: "#FDF6EE",
            // monthTextColor: "#B28F6D", // color for the month name
            ...({
              "stylesheet.calendar.header": {
                monthText: {
                  fontFamily: "AnticDidone-Regular",
                  fontSize: 22,
                  color: "black",
                },
              },
            } as any),
            // textMonthFontFamily: "AnticDidone-Regular",
            // textMonthFontSize: 18,
            textSectionTitleColor: "black",
            textDayHeaderFontFamily: "AnticDidone-Regular",
            textDayHeaderFontSize: 18,
            textDayFontFamily: "Raleway-Regular",
            textDisabledColor: "#dadadaff",
            // selectedDayBackgroundColor: "#8A5E3C",
            // todayTextColor: "white",
            // dayTextColor: "#000",
            // arrowColor: "#8A5E3C",
            // monthTextColor: "#8A5E3C",
          }}
        />
      </View>
      {/* <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" /> */}
      {/* <EditScreenInfo path="app/(tabs)/two.tsx" /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: SCREEN_WIDTH * 0.2,
    // justifyContent: 'center',
    backgroundColor: "white",
  },
  title: {
    fontSize: 22,
    fontFamily: "AnticDidone-Regular",
    color: "black",
  },
  // loadingOverlay: {
  //   position: "absolute",
  //   top: 60,
  //   left: 0,
  //   bottom: 0,
  //   right: 0,
  //   // top: "50%",
  //   // left: "50%",
  //   // transform: [{ translateX: -20 }, { translateY: -20 }],
  //   justifyContent: "center",
  //   alignItems: "center",
  //   backgroundColor: "rgba(255, 255, 255, 0.6)", // optional dimming
  //   zIndex: 10,
  // },
  calendarContainer: {
    position: "relative",
    //   flex: 1, // fills the whole screen
    justifyContent: "center", // vertical centering
    alignItems: "center", // horizontal centering
  },
  calendar: {
    marginTop: SCREEN_WIDTH * 0.1,
    width: SCREEN_WIDTH * 0.8,
  },

  // separator: {
  //   marginVertical: 30,
  //   height: 1,
  //   width: '80%',
  // },
});
