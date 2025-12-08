import { colors } from "@/assets/themes/colors";
import { fonts } from "@/assets/themes/typography";
import { Checkbox, Spacer } from "@/components";
import SvgStrokeText from "@/components/SvgStrokeText";
import { theme } from "@/design/theme";
import { fetchSessionById, fetchTasksForSession } from "@/lib/supabase";
import { Task, WorkSession } from "@/types/database.types";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "@/components/ui/Text";

export default function SingleSessionScreen() {
  const router = useRouter();

  const { session: sessionId, date } = useLocalSearchParams<{
    session: string;
    date: string;
  }>();

  // TODO: Pass all these values in:
  // const hasGoal = true;
  // const isSession = true;
  // const dateCreated = "Monday, 12/01/2025";
  // const title = "Prep for CS 147 Midterm";
  // const status = "Incomplete";

  const [sessionData, setSessionData] = useState<WorkSession | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [year, month, day] = date.split("-").map(Number);
  const dateObj = new Date(year, month - 1, day); // month is 0-based

  const formattedDate = dateObj.toLocaleDateString("en-US", {
    weekday: "long", // full day name
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });

  useEffect(() => {
    if (!sessionId) return;

    const loadSessionAndTasks = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch session
        const session = await fetchSessionById(sessionId);
        setSessionData(session);

        if (session) {
          // Fetch tasks for this session
          const sessionTasks = await fetchTasksForSession(sessionId);
          setTasks(sessionTasks);
        } else {
          setTasks([]);
        }
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Failed to load session";
        setError(msg);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadSessionAndTasks();
  }, [sessionId]);

  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error}</Text>;
  if (!sessionData) return <Text>Session not found</Text>;

  const headerTitle =
    sessionData?.status === "planned" ? "Plan Summary" : "Session Summary";

  function formatTime(totalMinutes: number): string {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0 && minutes > 0) {
      return `${hours} hr, ${minutes} min`;
    } else if (hours > 0) {
      return `${hours} hr`;
    } else {
      return `${minutes} min`;
    }
  }

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
          <SvgStrokeText text={headerTitle} />
        </View>
      </View>
      <View style={styles.shadow} />

      <Spacer></Spacer>
      <View style={styles.row}>
        <Text weight="bold" style={styles.label}>
          Date created:
        </Text>
        <Text weight="bold" style={styles.value}>
          {formattedDate}
        </Text>
      </View>

      {sessionData.goal && (
        <View style={styles.row}>
          <Text weight="bold" style={styles.label}>
            Goal:
          </Text>
          <Text style={styles.value}>{sessionData.goal}</Text>
        </View>
      )}

      <View style={styles.row}>
        <Text weight="bold" style={styles.label}>
          Status:
        </Text>
        <Text
          style={[
            styles.value,
            { fontFamily: fonts.typeface.bodyBold },
            sessionData.status === "complete"
              ? { color: colors.light.secondary } // or your theme color for complete
              : { color: colors.light.primary },
          ]}
        >
          {sessionData.status.charAt(0).toUpperCase() +
            sessionData.status.slice(1)}
        </Text>
      </View>

      <View style={styles.row}>
        <Text weight="bold" style={styles.label}>
          {sessionData.status === "planned" ? "Time planned:" : "Time spent:"}
        </Text>
        <Text style={styles.value}>{formatTime(sessionData.total_time)}</Text>
      </View>

      <Spacer size="lg" />

      <View style={{ margin: theme.spacing.xs, paddingHorizontal: 20 }}>
        <Text style={styles.sectionHeading}>Breakdown:</Text>

        <Spacer size="sm" />

        <View style={styles.breakdownList}>
          {tasks.length > 0 ? (
            tasks.map((task, index) => (
              <View key={task.id ?? index} style={styles.taskRow}>
                {sessionData.status !== "planned" && (
                  <Checkbox
                    checked={task.is_completed} // or `true` if all should appear checked
                    onChange={() => {}}
                    boxStyle={styles.checkBox}
                    containerStyle={styles.checkboxContainer}
                  />
                )}
                <View style={styles.taskTextWrap}>
                  <Text style={styles.taskText}>{task.task_name}</Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.value}>No tasks recorded.</Text>
          )}
        </View>
      </View>

      {/* <View style={styles.topContent}>
        <View style={styles.subsection}>
          <Text style={styles.subheading}>Date Created:</Text>
          <Text style={styles.sectionResponse}>{dateCreated}</Text>
        </View>

        <View style={styles.subsection}>
          {hasGoal ? (
            <Text style={styles.subheading}>Goal:</Text>
          ) : (
            <Text style={styles.subheading}>Title:</Text>
          )}
          <Text style={styles.sectionResponse}>{title}</Text>
        </View>

        <View style={styles.subsection}>
          {isSession ? (
            <View style={{ flexDirection: 'row' }}>
              <Text style={styles.subheading}>Status:</Text>
              <Text
                style={[
                  styles.sectionResponse,
                  {
                    color: colors.light.header2,
                    fontFamily: fonts.typeface.bodyBold,
                  },
                ]}
              >
                {status}
              </Text>
            </View>
          ) : null}
        </View>
      </View> */}
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
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    margin: theme.spacing.xs,
    marginHorizontal: theme.spacing.lg,
  },
  label: {
    //fontFamily: theme.typography.families.handwritten,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text,
    marginRight: 5,
  },
  value: {
    fontFamily: theme.typography.families.regular,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text,
  },
  statusValue: {
    color: colors.light.secondary,
    fontFamily: fonts.typeface.bodyBold,
  },
  statusValueSkipped: {
    color: colors.light.primary,
    fontFamily: fonts.typeface.bodyBold,
  },
  sectionHeading: {
    //fontFamily: theme.typography.families.handwritten,
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.text,
  },
  breakdownList: {
    gap: theme.spacing.sm,
    //paddingHorizontal: 20,
  },
  taskRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.spacing.sm,
    marginLeft: theme.spacing.md,
  },
  taskTextWrap: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-end",
  },
  taskText: {
    fontFamily: theme.typography.families.regular,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text,
    marginRight: theme.spacing.sm,
  },
  taskMinutes: {
    fontFamily: theme.typography.families.regular,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.accentDark,
  },
  checkboxContainer: {
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  checkBox: {
    marginTop: theme.spacing.xs / 2,
  },
  // topContent: {
  //   borderColor: "red",
  //   // borderWidth: 1,
  //   height: "70%",
  //   width: "100%",
  //   // marginTop: 10,
  //   padding: 16,
  //   paddingLeft: 30,
  // },
  // subheading: {
  //   fontFamily: fonts.typeface.header,
  //   color: colors.light.header1,
  //   fontSize: fonts.sizes.largerBody,
  //   marginRight: 5,
  // },
  // subsection: {
  //   // margin: 10,
  //   // marginLeft: 16,
  //   marginVertical: 5,
  //   borderColor: "blue",
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   // alignItems: 'flex-start',
  //   // borderWidth: 1,
  // },
  // sectionResponse: {
  //   fontFamily: fonts.typeface.body,
  //   color: colors.light.body,
  //   fontSize: fonts.sizes.body + 2,
  // },
});
