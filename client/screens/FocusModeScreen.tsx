import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, FlatList, TextInput, Pressable, Alert, Platform } from "react-native";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { MemoryCard } from "@/components/MemoryCard";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import {
  initDatabase,
  getAllMemories,
  getFocusGoals,
  addFocusGoal,
  setActiveFocusGoal,
  deleteFocusGoal,
  type Memory,
  type FocusGoal,
} from "@/lib/database";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

type FocusModeRouteProp = RouteProp<RootStackParamList, "FocusMode">;

export default function FocusModeScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<FocusModeRouteProp>();

  const [goals, setGoals] = useState<FocusGoal[]>([]);
  const [activeGoal, setActiveGoal] = useState<FocusGoal | null>(null);
  const [filteredMemories, setFilteredMemories] = useState<Memory[]>([]);
  const [newGoalName, setNewGoalName] = useState("");
  const [showNewGoalInput, setShowNewGoalInput] = useState(false);

  const loadData = useCallback(async () => {
    try {
      await initDatabase();
      const allGoals = await getFocusGoals();
      setGoals(allGoals);

      if (route.params?.goalId) {
        const goal = allGoals.find((g) => g.id === route.params.goalId);
        if (goal) {
          setActiveGoal(goal);
          await filterMemories(goal.name);
        }
      } else {
        const active = allGoals.find((g) => g.isActive);
        if (active) {
          setActiveGoal(active);
          await filterMemories(active.name);
        }
      }
    } catch (error) {
      console.error("Failed to load focus data:", error);
    }
  }, [route.params?.goalId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filterMemories = async (goalName: string) => {
    try {
      const allMemories = await getAllMemories();
      const keywords = goalName.toLowerCase().split(/\s+/);
      const filtered = allMemories.filter((memory) => {
        const content = memory.content.toLowerCase();
        const tags = memory.focusTags?.toLowerCase() || "";
        return keywords.some((keyword) => content.includes(keyword) || tags.includes(keyword));
      });
      setFilteredMemories(filtered);
    } catch (error) {
      console.error("Failed to filter memories:", error);
    }
  };

  const handleSelectGoal = async (goal: FocusGoal) => {
    setActiveGoal(goal);
    await setActiveFocusGoal(goal.id);
    await filterMemories(goal.name);
    if (Platform.OS !== "web") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleCreateGoal = async () => {
    if (!newGoalName.trim()) {
      Alert.alert("Empty Name", "Please enter a goal name.");
      return;
    }

    try {
      await addFocusGoal(newGoalName.trim());
      setNewGoalName("");
      setShowNewGoalInput(false);
      await loadData();
      if (Platform.OS !== "web") {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error("Failed to create goal:", error);
      Alert.alert("Error", "Failed to create goal. Please try again.");
    }
  };

  const handleDeleteGoal = async (goal: FocusGoal) => {
    Alert.alert(
      "Delete Goal",
      `Are you sure you want to delete "${goal.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteFocusGoal(goal.id);
              if (activeGoal?.id === goal.id) {
                setActiveGoal(null);
                setFilteredMemories([]);
              }
              await loadData();
            } catch (error) {
              console.error("Failed to delete goal:", error);
            }
          },
        },
      ]
    );
  };

  const handleExitFocus = async () => {
    await setActiveFocusGoal(null);
    navigation.goBack();
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.goalsSection}>
          <View style={styles.goalsSectionHeader}>
            <ThemedText type="h4">Focus Goals</ThemedText>
            <Pressable
              onPress={() => setShowNewGoalInput(true)}
              style={({ pressed }) => [
                styles.addGoalButton,
                { backgroundColor: theme.primary, opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Feather name="plus" size={16} color="#FFFFFF" />
            </Pressable>
          </View>

          {showNewGoalInput ? (
            <View style={[styles.newGoalInput, { backgroundColor: theme.backgroundDefault }]}>
              <TextInput
                style={[styles.goalTextInput, { color: theme.text }]}
                placeholder="e.g., Work, Study, Creative..."
                placeholderTextColor={theme.textSecondary}
                value={newGoalName}
                onChangeText={setNewGoalName}
                autoFocus
                onSubmitEditing={handleCreateGoal}
              />
              <Pressable onPress={handleCreateGoal} style={styles.goalSubmitButton}>
                <Feather name="check" size={20} color={theme.primary} />
              </Pressable>
              <Pressable onPress={() => setShowNewGoalInput(false)} style={styles.goalCancelButton}>
                <Feather name="x" size={20} color={theme.textSecondary} />
              </Pressable>
            </View>
          ) : null}

          <View style={styles.goalsRow}>
            {goals.map((goal) => (
              <Pressable
                key={goal.id}
                onPress={() => handleSelectGoal(goal)}
                onLongPress={() => handleDeleteGoal(goal)}
                style={({ pressed }) => [
                  styles.goalChip,
                  {
                    backgroundColor: activeGoal?.id === goal.id ? theme.primary : theme.backgroundSecondary,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <Feather
                  name="target"
                  size={16}
                  color={activeGoal?.id === goal.id ? "#FFFFFF" : theme.text}
                />
                <ThemedText
                  type="caption"
                  style={{
                    marginLeft: Spacing.xs,
                    color: activeGoal?.id === goal.id ? "#FFFFFF" : theme.text,
                  }}
                >
                  {goal.name}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </View>

        {activeGoal ? (
          <View style={styles.focusContent}>
            <View style={styles.focusHeader}>
              <View style={[styles.focusIndicator, { backgroundColor: theme.primary }]} />
              <ThemedText type="h3">Focused on: {activeGoal.name}</ThemedText>
            </View>

            {filteredMemories.length === 0 ? (
              <EmptyState
                icon="target"
                title="No related memories"
                message={`Add memories with "${activeGoal.name}" in the content to see them here`}
                compact
              />
            ) : (
              <FlatList
                data={filteredMemories}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <MemoryCard
                    memory={item}
                    onPress={() => navigation.navigate("MemoryDetail", { memory: item })}
                  />
                )}
                contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.xxl }}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        ) : (
          <View style={styles.noFocusContent}>
            <View style={[styles.noFocusIcon, { backgroundColor: theme.backgroundSecondary }]}>
              <Feather name="target" size={48} color={theme.textSecondary} />
            </View>
            <ThemedText type="h4" style={styles.noFocusTitle}>
              Select a focus goal
            </ThemedText>
            <ThemedText type="body" secondary style={styles.noFocusText}>
              Choose or create a goal to filter your memories and stay focused on what matters.
            </ThemedText>
          </View>
        )}
      </View>

      {activeGoal ? (
        <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.md }]}>
          <Pressable
            onPress={handleExitFocus}
            style={({ pressed }) => [
              styles.exitButton,
              { backgroundColor: theme.backgroundSecondary, opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Feather name="x" size={20} color={theme.text} />
            <ThemedText type="body" style={{ marginLeft: Spacing.sm }}>
              Exit Focus Mode
            </ThemedText>
          </Pressable>
        </View>
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  goalsSection: {
    marginBottom: Spacing.xl,
  },
  goalsSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  addGoalButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  newGoalInput: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  goalTextInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
  },
  goalSubmitButton: {
    padding: Spacing.sm,
  },
  goalCancelButton: {
    padding: Spacing.sm,
  },
  goalsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  goalChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
  },
  focusContent: {
    flex: 1,
  },
  focusHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  focusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.sm,
  },
  noFocusContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
  },
  noFocusIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  noFocusTitle: {
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  noFocusText: {
    textAlign: "center",
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  exitButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
});
