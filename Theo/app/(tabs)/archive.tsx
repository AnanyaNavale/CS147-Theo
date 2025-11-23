import { Dimensions, StyleSheet } from "react-native";

import EditScreenInfo from '@/components/EditScreenInfo';
import { Text, View } from '@/components/Themed';

import { Calendar, LocaleConfig } from "react-native-calendars";
import { Feather } from "@expo/vector-icons";

const SCREEN_WIDTH = Dimensions.get("window").width;

LocaleConfig.locales["custom"] = {
  monthNames: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
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

  const today = new Date().toISOString().split("T")[0];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Session & Plan Archive</Text>
      <View>
        <Calendar
          renderHeader={(date) => {
            const month = date.toString("MMMM yyyy"); // or use moment/Date API

            return (
              <View
                style={{
                  backgroundColor: "#8A5E3C",
                  paddingVertical: 8,
                  paddingHorizontal: 16,
                  borderRadius: 12,
                  // borderWidth: 2,
                  // borderColor: "#B28F6D",
                  alignSelf: "center",
                  // marginBottom: 10,
                }}
              >
                <Text
                  style={{
                    fontSize: 18,
                    // fontWeight: "bold",
                    color: "white",
                  }}
                >
                  {month}
                </Text>
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
          markingType="custom"
          markedDates={{
            [today]: {
              customStyles: {
                container: {
                  backgroundColor: "#8A5E3C",
                  // borderWidth: 2,
                  borderColor: "#8A5E3C",
                  borderRadius: 50,
                  // padding: 4,
                },
                text: {
                  color: "white",
                  fontWeight: "600",
                },
              },
            },
          }}
          theme={{
            // calendarBackground: "#FDF6EE",
            // monthTextColor: "#B28F6D", // color for the month name
            textMonthFontSize: 18,
            textSectionTitleColor: "black",
            textDayHeaderFontWeight: "bold",
            textDayHeaderFontSize: 18,
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
    // alignSelf: 'center',
    // width: "70%",
    fontSize: 20,
    // fontWeight: "bold",
    fontStyle: 'italic',
    backgroundColor: "white",
    color: "black",
    // marginTop: SCREEN_WIDTH * 0.2,
    // borderColor: 'red',
  },
  // calendarContainer: {
  //   flex: 1, // fills the whole screen
  //   justifyContent: "center", // vertical centering
  //   alignItems: "center", // horizontal centering
  // },
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
