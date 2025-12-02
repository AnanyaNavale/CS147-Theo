import { colors } from "@/assets/themes/colors";
import { fonts } from "@/assets/themes/typography";
import SvgStrokeText from "@/components/SvgStrokeText";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function SingleSessionScreen() {
  const router = useRouter();

  // TODO: Pass all these values in:
  const hasGoal = true;
  const isSession = true;
  const dateCreated = "Monday, 12/01/2025";
  const title = "Prep for CS 147 Midterm";
  const status = "Incomplete";

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Feather
            name={"arrow-left"}
            size={36}
            color={colors.light.iconsStandalone}
          />
        </TouchableOpacity>
        <View style={styles.header}>
          {isSession ? (
            <SvgStrokeText text="Session Summary" />
          ) : (
            <SvgStrokeText text="Plan Summary" />
          )}
        </View>
      </View>
      <View style={styles.shadow} />

      <View style={styles.topContent}>
        <View style={styles.subsection}>
          <Text style={styles.subheading}>Date Created:</Text>
          {/* <SvgStrokeText
            text="Date Created: "
            strokeWidth={0.3}
            textStyle={styles.subheading}
            containerStyle={{ alignSelf: "flex-start", borderColor: 'red', borderWidth: 1 }}
          /> */}
          <Text style={styles.sectionResponse}>{dateCreated}</Text>
        </View>

        <View style={styles.subsection}>
          {hasGoal ? (
            <Text style={styles.subheading}>Goal:</Text>
          ) : (
            // <SvgStrokeText
            //   text="Goal: "
            //   strokeWidth={0.3}
            //   textStyle={styles.subheading}
            //   containerStyle={{ alignSelf: "flex-start", paddingLeft: 8 }}
            // />
            <Text style={styles.subheading}>Title:</Text>
            // <SvgStrokeText
            //   text="Title: "
            //   strokeWidth={0.3}
            //   textStyle={styles.subheading}
            //   containerStyle={{ alignSelf: "flex-start", paddingLeft: 4 }}
            // />
          )}
          <Text style={styles.sectionResponse}>{title}</Text>
        </View>

        <View style={styles.subsection}>
          {isSession ? (
            // <SvgStrokeText
            //   text="Status: "
            //   strokeWidth={0.3}
            //   textStyle={styles.subheading}
            //   containerStyle={{ alignSelf: "flex-start", paddingLeft: 8 }}
            // />
            <View style={{ flexDirection: 'row' }}>
              <Text style={styles.subheading}>Status:</Text>
              <Text style={[styles.sectionResponse, {color: colors.light.header2, fontFamily: fonts.typeface.bodyBold }]}>{status}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderColor: "red",
    // borderWidth: 1,
    backgroundColor: colors.light.background,
  },
  headerContainer: {
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
  header: {
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
  topContent: {
    borderColor: "red",
    // borderWidth: 1,
    height: "70%",
    width: "100%",
    // marginTop: 10,
    padding: 16,
    paddingLeft: 30,
  },
  subheading: {
    fontFamily: fonts.typeface.header,
    color: colors.light.header1,
    fontSize: fonts.sizes.largerBody,
    marginRight: 5,
  },
  subsection: {
    // margin: 10,
    // marginLeft: 16,
    marginVertical: 5,
    borderColor: "blue",
    flexDirection: 'row',
    alignItems: 'center',
    // alignItems: 'flex-start',
    // borderWidth: 1,
  },
  sectionResponse: {
    fontFamily: fonts.typeface.body,
    color: colors.light.body,
    fontSize: fonts.sizes.body + 2,
  },
});