import { Text, View } from "@/components/Themed";
import { StyleSheet, TouchableOpacity } from "react-native";
// SUPABASE
import { colors } from "@/assets/themes/colors";
import { fonts } from "@/assets/themes/typography";
import { Theme } from "@/design/theme";
import { useAppTheme } from "@/hooks/ThemeContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useMemo } from "react";

interface ArchiveSessionBoxProps {
  title: string | null;
  goal: string | null;
  time: number;
  status: string;
  onPress?: () => void;
}

export default function ArchiveSessionBox({
  title,
  goal,
  time,
  status,
  onPress,
}: ArchiveSessionBoxProps) {
  const timeDisplay = formatMinutes(time);
  const { colors: palette, theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme, palette), [palette, theme]);

  const hasTitle = title?.trim() !== "";
  if (!hasTitle) {
    title = goal;
  }

  return (
    <TouchableOpacity
      style={[
        styles.container,
        status === "complete"
          ? styles.containerCompleted
          : status === "planned"
          ? styles.containerPlan
          : styles.containerSession,
      ]}
      onPress={onPress}
    >
      <View
        style={[
          styles.timeContainer,
          status === "complete"
            ? styles.timeContainerCompleted
            : status === "planned"
            ? styles.timeContainerPlan
            : styles.timeContainerSession,
        ]}
      >
        {timeDisplay !== "0 min." ? (
          <Text style={styles.time}>{timeDisplay}</Text>
        ) : (
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "transparent",
            }}
          >
            <MaterialCommunityIcons
              name="clock-plus-outline"
              size={36}
              color={"white"}
            />
          </View>
        )}
      </View>
      <View style={styles.titleContainer}>
        <Text
          style={[
            styles.title,
            (title === "Session" || title === "Plan") && styles.italicTitle,
          ]}
        >
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function formatMinutes(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0 && minutes > 0) {
    return `${hours} hr.,\n${minutes} min.`;
  }
  if (hours > 0) {
    return `${hours} hr.`;
  }
  return `${minutes} min.`;
}

const createStyles = (theme: Theme, palette: typeof colors.light) =>
  StyleSheet.create({
    container: {
      height: 100,
      marginHorizontal: 20,
      borderRadius: 10,
      backgroundColor: palette.background,
      borderWidth: 2,
      marginBottom: 12,
      flexDirection: "row",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.5,
      shadowRadius: 4,
      overflow: "hidden",
    },
    containerSession: {
      borderColor: "#B28F6D",
      borderStyle: "dashed",
      shadowColor: palette.shadowPrimary ?? palette.overlay,
    },
    containerCompleted: {
      borderColor: palette.primary,
      shadowColor: palette.shadowPrimary ?? palette.overlay,
    },
    containerPlan: {
      borderColor: palette.secondary,
      shadowColor: palette.shadowSecondary ?? palette.overlay,
    },
    timeContainer: {
      width: "25%",
      height: "100%",
      padding: 10,
      backgroundColor: palette.background,
    },
    timeContainerSession: {
      backgroundColor: "#B28F6D",
    },
    timeContainerCompleted: {
      backgroundColor: palette.primary,
    },
    timeContainerPlan: {
      backgroundColor: palette.secondary,
    },
    titleContainer: {
      flex: 1,
      flexShrink: 1,
      padding: 10,
      backgroundColor: palette.background,
    },
    title: {
      fontSize: theme.typography.sizes.sm + 2,
      fontFamily: fonts.typeface.body,
      color: palette.body,
      width: "100%",
      flexWrap: "wrap",
    },
    italicTitle: {
      fontFamily: fonts.typeface.bodyItalic,
    },
    time: {
      fontSize: theme.typography.sizes.md,
      fontFamily: "Raleway-Regular",
      color: "white",
    },
  });
