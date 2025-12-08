import { StyleSheet, TouchableOpacity } from "react-native";
import { View, Text } from "@/components/Themed";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { fonts } from "@/assets/themes/typography";
import { colors } from "@/assets/themes/colors";
import { theme } from "@/design/theme";
import { WorkSession } from "@/types/database.types";

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

const styles = StyleSheet.create({
  container: {
    minHeight: 100,
    width: "100%",
    borderRadius: 10,
    backgroundColor: colors.light.background,
    borderWidth: 2,
    borderColor: colors.light.secondary,
    marginBottom: theme.spacing.sm,
    flexDirection: "row",
    overflow: "hidden",
  },
  containerSession: {
    borderColor: "#B28F6D",
    borderStyle: "dashed",
    shadowColor: colors.light.shadowPrimary,
  },
  timeContainer: {
    width: "30%",
    height: "100%",
    padding: 10,
    backgroundColor: colors.light.secondary,
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
    backgroundColor: colors.light.background,
    justifyContent: "space-between",
  },
  title: {
    fontSize: theme.typography.sizes.sm + 2,
    fontFamily: fonts.typeface.body,
    color: colors.light.body,
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
    backgroundColor: theme.solidColors.accentLight,
  },
  statusPillIncomplete: {
    backgroundColor: theme.colors.ghost,
  },
  statusText: {
    color: colors.light.body,
    fontFamily: fonts.typeface.body,
    fontSize: 12,
  },
  metaText: {
    color: colors.light.body,
    fontFamily: fonts.typeface.body,
    fontSize: 12,
  },
  time: {
    fontSize: theme.typography.sizes.md,
    fontFamily: "Raleway-Regular",
    color: "white",
  },
});
