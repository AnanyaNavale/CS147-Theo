import { Text, View } from "@/components/Themed";
import { colors } from "@/design/colors";
import { Theme } from "@/design/theme";
import { fonts } from "@/design/typography";
import { useAppTheme } from "@/hooks/ThemeContext";
import { WorkSession } from "@/types/database.types";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useMemo } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";

interface CopySessionBoxProps {
  title: string;
  goal: string | null;
  time: number;
  status?: WorkSession["status"];
  createdAt?: string;
  showStatusMeta?: boolean;
  onPress?: () => void;
}

export default function CopySessionBox({
  title,
  goal,
  time,
  status,
  createdAt,
  showStatusMeta,
  onPress,
}: CopySessionBoxProps) {
  const timeDisplay = formatMinutes(time);
  const { colors: palette, theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme, palette), [palette, theme]);

  const statusLabel =
    status === "planned"
      ? "Planned"
      : status === "incomplete"
      ? "Incomplete"
      : null;
  const startedLabel =
    status === "incomplete" && createdAt ? formatShortDate(createdAt) : null;

  const plannedLabel =
    status === "planned" && createdAt ? formatShortDate(createdAt) : null;
  if (goal) {
    title = goal;
  }

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.timeContainer}>
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
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {title === "Session" ? "Session (no goal set)" : title}
        </Text>
        {showStatusMeta && (statusLabel || startedLabel) && (
          <View style={styles.metaRow}>
            {statusLabel && (
              <View
                style={[
                  styles.statusPill,
                  status === "incomplete" && styles.statusPillIncomplete,
                ]}
              >
                <Text style={styles.statusText}>{statusLabel}</Text>
              </View>
            )}
            {startedLabel && (
              <Text style={styles.metaText}>Started {startedLabel}</Text>
            )}
            {plannedLabel && (
              <Text style={styles.metaText}>Planned for {plannedLabel}</Text>
            )}
          </View>
        )}
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

function formatShortDate(dateString: string) {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const createStyles = (theme: Theme, palette: typeof colors.light) =>
  StyleSheet.create({
    container: {
      minHeight: 100,
      width: "100%",
      borderRadius: 10,
      backgroundColor: palette.background,
      borderWidth: 2,
      borderColor: palette.secondary,
      marginBottom: theme.spacing.sm,
      flexDirection: "row",
      overflow: "hidden",
    },
    containerSession: {
      borderColor: "#B28F6D",
      borderStyle: "dashed",
      shadowColor: palette.shadowPrimary ?? palette.overlay,
    },
    timeContainer: {
      width: "30%",
      height: "100%",
      padding: 10,
      backgroundColor: palette.secondary,
      alignItems: "center",
      fontSize: theme.typography.sizes.md,
    },
    timeContainerSession: {
      backgroundColor: "#B28F6D",
    },
    titleContainer: {
      flex: 1,
      flexShrink: 1,
      paddingVertical: 10,
      paddingHorizontal: 10,
      backgroundColor: palette.background,
      justifyContent: "space-between",
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
    metaRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginTop: 6,
      backgroundColor: "transparent",
    },
    statusPill: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 999,
      backgroundColor: palette.secondary,
    },
    statusPillIncomplete: {
      backgroundColor: palette.inactive,
    },
    statusText: {
      color: palette.body,
      fontFamily: fonts.typeface.body,
      fontSize: 12,
    },
    metaText: {
      color: palette.body,
      fontFamily: fonts.typeface.body,
      fontSize: 12,
    },
    time: {
      fontSize: theme.typography.sizes.md,
      fontFamily: "Raleway-Regular",
      color: "white",
    },
  });
