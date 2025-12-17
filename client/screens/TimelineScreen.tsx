import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Pressable,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { MemoryCard } from "@/components/MemoryCard";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { getAllMemories, initDatabase, type Memory } from "@/lib/database";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

type GroupedMemories = {
  date: string;
  formattedDate: string;
  data: Memory[];
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return "Today";
  } else if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  } else {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  }
}

function groupMemoriesByDate(memories: Memory[]): GroupedMemories[] {
  const groups: { [key: string]: Memory[] } = {};

  memories.forEach((memory) => {
    const date = memory.createdAt.split("T")[0];
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(memory);
  });

  return Object.entries(groups)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([date, data]) => ({
      date,
      formattedDate: formatDate(date),
      data,
    }));
}

export default function TimelineScreen() {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [memories, setMemories] = useState<Memory[]>([]);
  const [groupedMemories, setGroupedMemories] = useState<GroupedMemories[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const loadMemories = useCallback(async () => {
    try {
      await initDatabase();
      const data = await getAllMemories();
      setMemories(data);
      setGroupedMemories(groupMemoriesByDate(data));
    } catch (error) {
      console.error("Failed to load memories:", error);
    }
  }, []);

  useEffect(() => {
    loadMemories();
  }, [loadMemories]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      loadMemories();
    });
    return unsubscribe;
  }, [navigation, loadMemories]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadMemories();
    setRefreshing(false);
  }, [loadMemories]);

  const filteredGroups = filterType
    ? groupedMemories
        .map((group) => ({
          ...group,
          data: group.data.filter((m) => m.contentType === filterType),
        }))
        .filter((group) => group.data.length > 0)
    : groupedMemories;

  const filterOptions = [
    { type: null, label: "All", icon: "grid" },
    { type: "text", label: "Notes", icon: "file-text" },
    { type: "voice", label: "Voice", icon: "mic" },
    { type: "photo", label: "Photos", icon: "image" },
    { type: "link", label: "Links", icon: "link" },
  ];

  const renderSectionHeader = ({ section }: { section: GroupedMemories }) => (
    <View style={[styles.sectionHeader, { backgroundColor: isDark ? "rgba(18,18,18,0.9)" : "rgba(250,250,250,0.9)" }]}>
      {Platform.OS === "ios" ? (
        <BlurView intensity={50} tint={isDark ? "dark" : "light"} style={StyleSheet.absoluteFill} />
      ) : null}
      <ThemedText type="caption" secondary style={styles.sectionHeaderText}>
        {section.formattedDate}
      </ThemedText>
    </View>
  );

  const renderItem = ({ item }: { item: Memory }) => (
    <MemoryCard
      memory={item}
      onPress={() => navigation.navigate("MemoryDetail", { memory: item })}
    />
  );

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <ThemedText type="h1">Timeline</ThemedText>
        <Pressable
          onPress={() => setShowFilters(!showFilters)}
          style={({ pressed }) => [
            styles.filterButton,
            { backgroundColor: theme.backgroundSecondary, opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Feather name="filter" size={20} color={theme.text} />
        </Pressable>
      </View>

      {showFilters ? (
        <View style={[styles.filterRow, { backgroundColor: theme.backgroundDefault }]}>
          {filterOptions.map((option) => (
            <Pressable
              key={option.type ?? "all"}
              onPress={() => setFilterType(option.type)}
              style={({ pressed }) => [
                styles.filterChip,
                {
                  backgroundColor:
                    filterType === option.type ? theme.primary : theme.backgroundSecondary,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Feather
                name={option.icon as any}
                size={16}
                color={filterType === option.type ? "#FFFFFF" : theme.text}
              />
              <ThemedText
                type="small"
                style={{
                  marginLeft: Spacing.xs,
                  color: filterType === option.type ? "#FFFFFF" : theme.text,
                }}
              >
                {option.label}
              </ThemedText>
            </Pressable>
          ))}
        </View>
      ) : null}

      {filteredGroups.length === 0 ? (
        <EmptyState
          icon="clock"
          title="No memories yet"
          message="Tap the + button to capture your first thought, photo, or voice note"
        />
      ) : (
        <FlatList
          data={filteredGroups}
          keyExtractor={(item) => item.date}
          renderItem={({ item: group }) => (
            <View>
              {renderSectionHeader({ section: group })}
              {group.data.map((memory) => (
                <View key={memory.id}>{renderItem({ item: memory })}</View>
              ))}
            </View>
          )}
          contentContainerStyle={{
            paddingTop: Spacing.sm,
            paddingBottom: tabBarHeight + Spacing.fabSize + Spacing.xxl,
            paddingHorizontal: Spacing.lg,
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    flexWrap: "wrap",
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
  },
  sectionHeader: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    borderRadius: BorderRadius.sm,
    overflow: "hidden",
  },
  sectionHeaderText: {
    textTransform: "uppercase",
    letterSpacing: 1,
  },
});
