import React, { useMemo, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import Spacer from "@/components/Spacer";
import { ThemedText } from "@/components/ThemedText";
import { Fab } from "@/components/Fab";
import { QuickAddModal } from "@/components/QuickAddModal";
import { useMemoryStore } from "@/lib/memory-store";
import { useTheme } from "@/hooks/useTheme";
import { MemoryType } from "@/lib/memory-store";
import { Spacing } from "@/constants/theme";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const { items, addMemory, focusGoal, setFocusGoal } = useMemoryStore();
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  const filteredItems = useMemo(() => {
    if (!focusGoal) return items;
    const lowerGoal = focusGoal.toLowerCase();
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(lowerGoal) ||
        item.tags?.some((tag) => tag.toLowerCase().includes(lowerGoal)),
    );
  }, [focusGoal, items]);

  const handleAdd = (payload: {
    type: MemoryType;
    title: string;
    content: string;
    tags?: string[];
    metadata?: { durationSec?: number; uri?: string };
  }) => {
    addMemory({
      ...payload,
      tags: payload.tags ?? (focusGoal ? [focusGoal] : undefined),
    });
  };

  const toggleFocus = () => {
    setFocusGoal(focusGoal ? null : "focus");
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.backgroundRoot }}>
      <FlatList
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: tabBarHeight + Spacing["4xl"],
          paddingHorizontal: Spacing.lg,
        }}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        data={filteredItems}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <Spacer height={Spacing.md} />}
        ListHeaderComponent={
          <View>
            <ThemedText type="h1">الخط الزمني</ThemedText>
            <Spacer height={Spacing.sm} />
            <ThemedText type="body" style={styles.subtitle}>
              أضف أي فكرة بسرعة، وسنربطها ونقترحها حسب الوقت والمكان.
            </ThemedText>
            <Spacer height={Spacing.lg} />
            <View style={styles.quickActions}>
              <Button style={styles.quickButtonLeft} onPress={() => setShowQuickAdd(true)}>
                + إضافة سريعة
              </Button>
              <Button style={styles.quickButtonRight} onPress={toggleFocus}>
                {focusGoal ? "إيقاف التركيز" : "وضع التركيز"}
              </Button>
            </View>
            <Spacer height={Spacing.md} />
          </View>
        }
        renderItem={({ item }) => (
          <Card elevation={1} style={styles.card}>
            <View style={styles.cardHeader}>
              <ThemedText type="small" style={styles.badge}>
                {mapTypeToLabel(item.type)}
              </ThemedText>
              <ThemedText type="small" style={styles.time}>
                {formatTimestamp(item.createdAt)}
              </ThemedText>
            </View>
            <ThemedText type="h3" style={styles.cardTitle}>
              {item.title}
            </ThemedText>
            <ThemedText type="body" style={styles.cardDescription}>
              {item.content || "—"}
            </ThemedText>
          </Card>
        )}
        ListEmptyComponent={
          <Card elevation={1} style={styles.card}>
            <ThemedText type="h3">لا يوجد محتوى بعد</ThemedText>
            <Spacer height={Spacing.sm} />
            <ThemedText type="body">
              سجّل صوت، التقط صورة، أو أكتب فكرة لتظهر هنا.
            </ThemedText>
            <Spacer height={Spacing.md} />
            <Button onPress={() => setShowQuickAdd(true)}>
              ابدأ بتسجيل صوت
            </Button>
          </Card>
        }
      />
      <Fab onPress={() => setShowQuickAdd(true)} />
      <QuickAddModal
        visible={showQuickAdd}
        onClose={() => setShowQuickAdd(false)}
        onSubmit={handleAdd}
      />
    </View>
  );
}

function mapTypeToLabel(type: string) {
  switch (type) {
    case "voice":
      return "صوت";
    case "photo":
      return "صورة";
    case "link":
      return "رابط";
    case "screenshot":
      return "لقطة";
    default:
      return "نص";
  }
}

function formatTimestamp(value: string) {
  const date = new Date(value);
  return `${date.toLocaleDateString()} • ${date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
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
