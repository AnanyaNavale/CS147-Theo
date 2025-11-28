import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  Dimensions,
  Image,
  ImageSourcePropType,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SvgStrokeText from "@/components/SvgStrokeText";

// import { BottomSheetModal } from "@/components/ui/BottomSheetModal";
import { theme } from "@/design/theme";
import { colors } from "@/assets/themes/colors";
import { fonts } from "@/assets/themes/typography";

// import { Text } from "@/components/ui/Text";
// import { theme } from "@/design/theme";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;

export default function ProfileScreen() {
  const name = "Anna";

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          accessibilityRole="button"
          onPress={() => router.back()}
        >
          <Feather name={"arrow-left"} size={36} color="#8A5E3C" />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <SvgStrokeText
            text={name + "'s Profile"}
          />
        </View>
      </View>

      <View style={styles.imageContainer}>
        <Image
          source={require("../assets/images/profile_sample.webp")}
          style={styles.profileImage}
          resizeMode="contain"
        />
      </View>

      <TouchableOpacity
        onPress={() => console.log("Change Image")}
        style={styles.cameraContainer}
      >
        <Feather name="camera" size={25} color="white" />
      </TouchableOpacity>

      <View style={styles.detailsContainer}>
        <Text style={styles.firstName}>First Name</Text>
        {/* <InputField label="First Name" /> */}
        <Text style={styles.lastName}>Last Name</Text>
        {/* <InputField label="Last Name" /> */}
        <Text style={styles.userName}>Username</Text>
        {/* <InputField label="Username" /> */}
        <Text style={styles.email}>Email</Text>
        {/* <InputField label="Email" /> */}
        <Text style={styles.password}>Password</Text>
        {/* <InputField label="Password" /> */}
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    padding: 16,
    borderColor: "red",
    alignItems: "center",
    // borderWidth: 2,
  },
  headerContainer: {
    width: "100%",
    borderColor: "red",
    // borderWidth: 1,
    flexDirection: "row",
  },
  titleContainer: {
    alignItems: "center",
    borderColor: "blue",
    // borderWidth: 2,
    position: "absolute",
    paddingTop: 2,
    left: 0,
    right: 0,
  },
  header: {
    fontFamily: "AnticDidone-Regular",
    fontSize: 24,
    color: "black",
  },
  imageContainer: {
    marginVertical: 30,
    // borderWidth: 2,
    // borderColor: theme.colors.light.border,
    borderRadius: 100,
    width: SCREEN_WIDTH * 0.5,
    aspectRatio: 1,
    overflow: "hidden",
    zIndex: 1,
    // shadowOffset: { width: 0, height: 4 },
    // shadowOpacity: 0.5,
    // shadowRadius: 4,
    // shadowColor: "#B28F6D80",
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  cameraContainer: {
    borderRadius: 100,
    backgroundColor: "#8A5E3CBF",
    width: "12%",
    aspectRatio: 1,
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    right: 110,
    top: 300,
    zIndex: 2,
  },
  detailsContainer: {
    borderColor: "#8A5E3C",
    // borderWidth: 1,
    borderRadius: 10,
    padding: 16,
    // backgroundColor: "#8A5E3C80",
    width: "95%",
    height: SCREEN_HEIGHT * 0.4, // 0.5
  },
  firstName: {
    fontFamily: "Raleway-Regular",
    fontSize: 16,
    color: "#8A5E3CBF",
  },
  lastName: {
    fontFamily: "Raleway-Regular",
    fontSize: 16,
    color: "#8A5E3CBF",
  },
  userName: {
    fontFamily: "Raleway-Regular",
    fontSize: 16,
    color: "#8A5E3CBF",
  },
  email: {
    fontFamily: "Raleway-Regular",
    fontSize: 16,
    color: "#8A5E3CBF",
  },
  password: {
    fontFamily: "Raleway-Regular",
    fontSize: 16,
    color: "#8A5E3CBF",
  },
});