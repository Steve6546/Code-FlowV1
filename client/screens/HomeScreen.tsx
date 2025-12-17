import React, { useMemo } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import Spacer from "@/components/Spacer";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();

  const timelineItems = useMemo(
    () => [
      {
        id: "1",
        type: "Voice",
        title: "Morning check-in",
        description: "Captured a voice note about today’s priorities.",
        time: "Today • 8:32 AM",
      },
      {
        id: "2",
        type: "Link",
        title: "Research article",
        description: "Saved link about local-first apps and sync patterns.",
        time: "Yesterday • 6:10 PM",
      },
      {
        id: "3",
        type: "Photo",
        title: "Whiteboard snapshot",
        description: "Meeting notes from the product review session.",
        time: "Mon • 2:45 PM",
      },
    ],
    [],
  );

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: theme.backgroundRoot }}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.xl,
        paddingBottom: tabBarHeight + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      data={timelineItems}
      keyExtractor={(item) => item.id}
      ItemSeparatorComponent={() => <Spacer height={Spacing.md} />}
      ListHeaderComponent={
        <View>
          <ThemedText type="h1">Timeline</ThemedText>
          <Spacer height={Spacing.sm} />
          <ThemedText type="body" style={styles.subtitle}>
            Your latest memories, recordings, and saves.
          </ThemedText>
          <Spacer height={Spacing.lg} />
          <View style={styles.quickActions}>
            <Button style={styles.quickButtonLeft} onPress={() => {}}>
              + Quick Add
            </Button>
            <Button style={styles.quickButtonRight} onPress={() => {}}>
              Focus Mode
            </Button>
          </View>
          <Spacer height={Spacing.md} />
        </View>
      }
      renderItem={({ item }) => (
        <Card elevation={1} style={styles.card}>
          <View style={styles.cardHeader}>
            <ThemedText type="small" style={styles.badge}>
              {item.type}
            </ThemedText>
            <ThemedText type="small" style={styles.time}>
              {item.time}
            </ThemedText>
          </View>
          <ThemedText type="h3" style={styles.cardTitle}>
            {item.title}
          </ThemedText>
          <ThemedText type="body" style={styles.cardDescription}>
            {item.description}
          </ThemedText>
        </Card>
      )}
      ListEmptyComponent={
        <Card elevation={1} style={styles.card}>
          <ThemedText type="h3">No memories yet</ThemedText>
          <Spacer height={Spacing.sm} />
          <ThemedText type="body">
            Capture a voice note, snap a photo, or paste a link to see it here.
          </ThemedText>
          <Spacer height={Spacing.md} />
          <Button onPress={() => {}}>Start with a voice note</Button>
        </Card>
      }
    />
  );
}

const styles = StyleSheet.create({
  subtitle: {
    opacity: 0.7,
  },
  quickActions: {
    flexDirection: "row",
  },
  quickButtonLeft: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  quickButtonRight: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  card: {
    borderRadius: 20,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  badge: {
    fontWeight: "600",
    opacity: 0.8,
  },
  time: {
    opacity: 0.7,
  },
  cardTitle: {
    marginBottom: Spacing.xs,
  },
  cardDescription: {
    opacity: 0.85,
  },
});
