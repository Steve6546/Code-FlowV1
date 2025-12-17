import React, { useMemo } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

import { Card } from "@/components/Card";
import Spacer from "@/components/Spacer";
import { ThemedText } from "@/components/ThemedText";
import {
  getSmartSuggestions,
  getTimeOfDayGreeting,
  useMemoryStore,
} from "@/lib/memory-store";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing } from "@/constants/theme";

export default function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const { items, focusGoal, setFocusGoal } = useMemoryStore();

  const suggestions = useMemo(() => getSmartSuggestions(items), [items]);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.backgroundRoot }}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.xl,
        paddingBottom: tabBarHeight + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
    >
      <ThemedText type="h1">{getTimeOfDayGreeting()}</ThemedText>
      <Spacer height={Spacing.xs} />
      <ThemedText type="body" style={styles.subtitle}>
        اقتراحات مبنية على الوقت والتكرار دون الحاجة للبحث اليدوي.
      </ThemedText>
      <Spacer height={Spacing.lg} />

      <Card elevation={1} style={styles.card}>
        <ThemedText type="h3">وضع التركيز</ThemedText>
        <Spacer height={Spacing.sm} />
        <ThemedText type="body" style={styles.muted}>
          اختر هدفاً مؤقتاً لإخفاء الضوضاء. سيتم عرض ما يخدم الهدف فقط.
        </ThemedText>
        <Spacer height={Spacing.sm} />
        <View style={styles.tagRow}>
          {["عمل", "دراسة", "تفكير عميق"].map((goal) => (
            <View
              key={goal}
              style={[
                styles.tag,
                {
                  backgroundColor:
                    focusGoal === goal ? theme.link : theme.backgroundSecondary,
                },
              ]}
            >
              <ThemedText
                type="small"
                style={{
                  color: focusGoal === goal ? theme.buttonText : theme.text,
                }}
                onPress={() => setFocusGoal(focusGoal === goal ? null : goal)}
              >
                {goal}
              </ThemedText>
            </View>
          ))}
        </View>
      </Card>

      <Spacer height={Spacing.lg} />

      <ThemedText type="h3">اقتراحات الآن</ThemedText>
      <Spacer height={Spacing.sm} />
      {suggestions.length === 0 ? (
        <Card elevation={1} style={styles.card}>
          <ThemedText type="h4">لا يوجد اقتراحات بعد</ThemedText>
          <Spacer height={Spacing.xs} />
          <ThemedText type="body" style={styles.muted}>
            أضف محتوى جديد (صوت، نص، صورة) ليظهر هنا حسب الوقت والمكان.
          </ThemedText>
        </Card>
      ) : (
        suggestions.map((item) => (
          <Card key={item.id} elevation={1} style={styles.card}>
            <View style={styles.cardHeader}>
              <ThemedText type="small" style={styles.badge}>
                {mapTypeToLabel(item.type)}
              </ThemedText>
              <ThemedText type="small" style={styles.time}>
                {new Date(item.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </ThemedText>
            </View>
            <ThemedText type="h4" style={styles.cardTitle}>
              {item.title}
            </ThemedText>
            <ThemedText type="body" style={styles.cardDescription}>
              {item.content}
            </ThemedText>
          </Card>
        ))
      )}
    </ScrollView>
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

const styles = StyleSheet.create({
  subtitle: {
    opacity: 0.7,
  },
  card: {
    borderRadius: 20,
    marginBottom: Spacing.md,
  },
  muted: {
    opacity: 0.7,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  tag: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.sm,
    marginBottom: Spacing.sm,
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
