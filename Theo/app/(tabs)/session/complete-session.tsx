import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Spacer } from "@/components";
import { BasicButton } from "@/components/BasicButton";
import CopySessionBox from "@/components/CopySessionBox";
import SvgStrokeText from "@/components/SvgStrokeText";
import { StepProgressIndicator } from "@/components/ui/StepProgressIndicator";
import { Text } from "@/components/ui/Text";
import { Theme } from "@/design/theme";
import { useAppTheme } from "@/hooks/ThemeContext";
import {
  fetchPlannedOrIncompleteSessions,
  fetchTasksForSession,
} from "@/lib/supabase";
import { useSupabase } from "@/providers/SupabaseProvider";
import { WorkSession } from "@/types/database.types";

const PAGE_SIZE = 5;

const mapTasksForBreakdown = (
  tasks: Awaited<ReturnType<typeof fetchTasksForSession>>
) =>
  tasks.map((t) => ({
    id: String(t.id),
    text: t.task_name,
    minutes: Number(t.time_allotted ?? t.time_completed) || 0,
    completed: Boolean(t.is_completed),
  }));

export default function CompleteSessionScreen() {
  const { session } = useSupabase();
  const userId = session?.user?.id;
  const [sessions, setSessions] = useState<WorkSession[]>([]);
  const [loadingSessionId, setLoadingSessionId] = useState<string | null>(null);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const showEmpty = !isLoadingList && sessions.length === 0;
  const { colors: palette, theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme, palette), [palette, theme]);

  useEffect(() => {
    if (!userId) {
      console.error("User not logged in.");
      setSessions([]);
      setHasMore(false);
      setIsLoadingList(false);
      return;
    }

    async function load() {
      setIsLoadingList(true);
      setHasMore(true);
      try {
        const data = await fetchPlannedOrIncompleteSessions(
          userId!,
          PAGE_SIZE,
          0
        );
        setSessions(data);
        setHasMore(data.length === PAGE_SIZE);
      } catch (e) {
        console.error("Failed to load sessions:", e);
      } finally {
        setIsLoadingList(false);
      }
    }

    load();
  }, [userId]);

  const loadMoreSessions = async () => {
    if (!userId || isLoadingList || !hasMore) return;
    setIsLoadingList(true);

    try {
      const data = await fetchPlannedOrIncompleteSessions(
        userId,
        PAGE_SIZE,
        sessions.length
      );

      setSessions((prev) => [...prev, ...data]);
      setHasMore(data.length === PAGE_SIZE);
    } catch (e) {
      console.error("Failed to load more sessions:", e);
    } finally {
      setIsLoadingList(false);
    }
  };

  const handleSelectSession = async (session: WorkSession) => {
    if (loadingSessionId) return;
    setLoadingSessionId(session.id);

    try {
      const tasks = await fetchTasksForSession(session.id);
      const mappedTasks = mapTasksForBreakdown(tasks);

      router.push({
        pathname: "./breakdown",
        params: {
          goal: session.goal ?? "",
          tasks: JSON.stringify(mappedTasks),
          sessionId: session.id,
        },
      });
    } catch (e) {
      console.error("Failed to load session tasks:", e);
    } finally {
      setLoadingSessionId(null);
    }
  };

  const handleCreateNew = () => {
    router.replace("./goal");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerRow}>
        <StepProgressIndicator
          steps={["Setup", "Customize", "Finalize"]}
          activeCount={1}
          style={styles.headerProgress}
          onPressBack={() => router.back()}
          onPressMenu={() => {}}
          helpMessagept1={
            "Here, you'll see a list of your recent sessions. You can select one of these plans to begin this new session."
          }
        />
      </View>

      <Spacer size="lg" />
      {/* <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      > */}
      <SvgStrokeText
        text={"Complete a session"}
        containerStyle={{ alignSelf: "center" }}
      />
      <Spacer size="md" />
      <Text style={styles.actionDescription}>
        Choose from your planned or incomplete sessions listed below.
      </Text>

      <Spacer size="lg" />
      <View style={styles.listContainer}>
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {showEmpty ? (
            <View style={styles.emptyState}>
              <Text variant="h3" style={styles.emptyTitle}>
                No sessions to complete
              </Text>
              <Spacer size="sm" />
              <Text style={styles.emptyBody}>
                Create a new session to get started.
              </Text>
              <Spacer size="md" />
              <BasicButton
                text="Create a new session"
                onPress={handleCreateNew}
              />
            </View>
          ) : (
            sessions.map((item) => (
              <CopySessionBox
                key={item.id}
                title={item.title}
                goal={item.goal}
                time={item.total_time}
                status={item.status}
                createdAt={item.created_at}
                showStatusMeta
                onPress={() => handleSelectSession(item)}
              />
            ))
          )}
        </ScrollView>

        {!showEmpty && (
          <View style={styles.loadMoreWrapper}>
            {hasMore ? (
              <BasicButton
                text={isLoadingList ? "Loading more..." : "Load more"}
                onPress={loadMoreSessions}
                disabled={isLoadingList}
              />
            ) : (
              <Text style={styles.noMoreText}>Loaded all sessions</Text>
            )}
          </View>
        )}
      </View>
      {/* <View style={styles.actionBlock}>
          <BasicButton text="Create a new session" onPress={handleCreateNew} />
          <Spacer size="md" />
          <Text style={styles.actionDescription}>
            Set up a fresh goal or set of tasks.
          </Text>
        </View>

        <Spacer size="xl" />
        <View style={styles.divider} />
        <Spacer size="xl" />

        <View style={styles.actionBlock}>
          <BasicButton
            text="Copy a recent session"
            onPress={() => setShowComingSoon(true)}
            variant="secondary"
          />
          <Spacer size="md" />
          <Text style={styles.actionDescription}>
            Duplicate & edit a past session&apos;s goals, tasks, and timings.
          </Text>
        </View>

        <Spacer size="xl" />
        <View style={styles.divider} />
        <Spacer size="xl" />

        <View style={styles.actionBlock}>
          <BasicButton
            text="Complete a session"
            onPress={() => setShowComingSoon(true)}
            variant="tertiary"
            //style={[styles.actionButton, { width: buttonWidth }]}
          />
          <Spacer size="md" />
          <Text style={styles.actionDescription}>
            Use saved plans from the archive to begin a new session.
          </Text>
        </View> */}
      {/* </ScrollView> */}
      {/* <AppModal
        visible={showComingSoon}
        onClose={() => setShowComingSoon(false)}
        variant="custom"
        title="Coming soon!"
        showClose
      >
        <Text style={styles.modalMessage}>
          Copying and completing sessions isn't ready yet.
        </Text>
        <Spacer size="md" />
        <Text style={styles.modalMessage}>
          Please create a new session to get started.
        </Text>
        <Spacer size="md" />
        <BasicButton
          style={styles.center}
          text="Create a new session"
          onPress={() => {
            setShowComingSoon(false);
            handleCreateNew();
          }}
          textStyle={{ flexWrap: "nowrap" }}
        />
      </AppModal> */}
    </SafeAreaView>
  );
}

function createStyles(
  theme: Theme,
  palette: typeof import("@/assets/themes/colors").colors.light
) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: palette.background,
    },
    content: {
      flexGrow: 1,
      paddingBottom: theme.spacing.xxl * 1.5,
      alignItems: "center",
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    subtitle: {
      textAlign: "center",
      fontFamily: theme.typography.families.serif,
      fontSize: theme.typography.sizes.xl,
      color: palette.body,
    },
    headerProgress: {
      flex: 1,
      marginHorizontal: theme.spacing.lg,
      paddingHorizontal: 0,
    },
    actionBlock: {
      alignItems: "center",
    },
    actionButton: {
      alignSelf: "center",
      paddingVertical: theme.spacing.md,
    },
    actionDescription: {
      textAlign: "center",
      fontSize: theme.typography.sizes.sm + 2,
      paddingHorizontal: theme.spacing.lg,
      alignSelf: "center",
      color: palette.body,
    },
    divider: {
      height: 1,
      backgroundColor: palette.separator,
      marginHorizontal: theme.spacing.lg,
    },
    modalMessage: {
      textAlign: "center",
      marginTop: theme.spacing.sm,
      fontSize: theme.typography.sizes.md,
      color: theme.colors.quote,
    },
    center: {
      alignSelf: "center",
      width: "100%",
      maxWidth: "100%",
    },
    listContainer: {
      flex: 1,
      width: "100%",
    },
    list: {
      flex: 1,
      width: "100%",
    },
    listContent: {
      paddingTop: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.lg,
      gap: theme.spacing.sm,
    },
    loadMoreWrapper: {
      paddingVertical: theme.spacing.lg,
      paddingHorizontal: theme.spacing.lg,
      alignItems: "center",
      backgroundColor: palette.background,
    },
    noMoreText: {
      color: theme.colors.quote,
      fontFamily: theme.typography.families.medium,
    },
    emptyState: {
      width: "100%",
      alignItems: "center",
      paddingVertical: theme.spacing.xl,
    },
    emptyTitle: {
      color: theme.colors.header1,
      textAlign: "center",
    },
    emptyBody: {
      color: theme.colors.quote,
      textAlign: "center",
    },
  });
}
