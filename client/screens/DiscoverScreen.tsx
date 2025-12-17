import React, { useEffect, useState, useCallback } from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { MemoryCard } from "@/components/MemoryCard";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import {
  initDatabase,
  getMorningMemories,
  getRecentMemories,
  getFrequentlyViewedMemories,
  getFocusGoals,
  type Memory,
  type FocusGoal,
} from "@/lib/database";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getSuggestionContext(): { title: string; subtitle: string } {
  const hour = new Date().getHours();
  if (hour < 12) {
    return {
      title: "Yesterday's thoughts",
      subtitle: "Review what was on your mind",
    };
  }
  if (hour < 17) {
    return {
      title: "Recent captures",
      subtitle: "Continue where you left off",
    };
  }
  return {
    title: "Frequently revisited",
    subtitle: "Memories you come back to",
  };
}

export default function DiscoverScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [suggestions, setSuggestions] = useState<Memory[]>([]);
  const [focusGoals, setFocusGoals] = useState<FocusGoal[]>([]);
  const [loading, setLoading] = useState(true);

  const contextInfo = getSuggestionContext();

  const loadData = useCallback(async () => {
    try {
      await initDatabase();
      const hour = new Date().getHours();
      let memorySuggestions: Memory[];
      
      if (hour < 12) {
        memorySuggestions = await getMorningMemories();
      } else if (hour < 17) {
        memorySuggestions = await getRecentMemories(5);
      } else {
        memorySuggestions = await getFrequentlyViewedMemories();
      }

      if (memorySuggestions.length === 0) {
        memorySuggestions = await getRecentMemories(5);
      }

      setSuggestions(memorySuggestions);
      
      const goals = await getFocusGoals();
      setFocusGoals(goals);
    } catch (error) {
      console.error("Failed to load suggestions:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      loadData();
    });
    return unsubscribe;
  }, [navigation, loadData]);

  const handleFocusModePress = (goal?: FocusGoal) => {
    navigation.navigate("FocusMode", {
      goalId: goal?.id,
      goalName: goal?.name,
    });
  };

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <ThemedText type="h1">Discover</ThemedText>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: Spacing.lg,
          paddingBottom: tabBarHeight + Spacing.fabSize + Spacing.xxl,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Card
          style={[styles.greetingCard, { backgroundColor: theme.primary }]}
          onPress={() => handleFocusModePress()}
        >
          <View style={styles.greetingContent}>
            <View style={styles.greetingText}>
              <ThemedText type="h3" style={{ color: "#FFFFFF" }}>
                {getTimeGreeting()}
              </ThemedText>
              <ThemedText type="body" style={{ color: "rgba(255,255,255,0.8)", marginTop: Spacing.xs }}>
                Ready to focus? Start a focus session to see only what matters.
              </ThemedText>
            </View>
            <View style={[styles.focusIconContainer, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
              <Feather name="target" size={24} color="#FFFFFF" />
            </View>
          </View>
        </Card>

        {focusGoals.length > 0 ? (
          <View style={styles.section}>
            <ThemedText type="h4" style={styles.sectionTitle}>
              Your Focus Goals
            </ThemedText>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.goalsRow}
            >
              {focusGoals.map((goal) => (
                <Pressable
                  key={goal.id}
                  onPress={() => handleFocusModePress(goal)}
                  style={({ pressed }) => [
                    styles.goalChip,
                    {
                      backgroundColor: goal.isActive ? theme.primary : theme.backgroundSecondary,
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                >
                  <Feather
                    name="zap"
                    size={16}
                    color={goal.isActive ? "#FFFFFF" : theme.text}
                  />
                  <ThemedText
                    type="caption"
                    style={{
                      marginLeft: Spacing.xs,
                      color: goal.isActive ? "#FFFFFF" : theme.text,
                    }}
                  >
                    {goal.name}
                  </ThemedText>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        ) : null}

        <View style={styles.section}>
          <ThemedText type="h4" style={styles.sectionTitle}>
            {contextInfo.title}
          </ThemedText>
          <ThemedText type="caption" secondary style={styles.sectionSubtitle}>
            {contextInfo.subtitle}
          </ThemedText>

          {!loading && suggestions.length === 0 ? (
            <EmptyState
              icon="compass"
              title="Nothing to suggest yet"
              message="Add some memories and they'll appear here based on context"
              compact
            />
          ) : (
            suggestions.map((memory) => (
              <MemoryCard
                key={memory.id}
                memory={memory}
                onPress={() => navigation.navigate("MemoryDetail", { memory })}
              />
            ))
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  greetingCard: {
    marginTop: Spacing.sm,
  },
  greetingContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  greetingText: {
    flex: 1,
  },
  focusIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: Spacing.md,
  },
  section: {
    marginTop: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.xs,
  },
  sectionSubtitle: {
    marginBottom: Spacing.md,
  },
  goalsRow: {
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  goalChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
  },
});
