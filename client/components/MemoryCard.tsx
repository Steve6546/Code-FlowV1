import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import type { Memory } from "@/lib/database";

interface MemoryCardProps {
  memory: Memory;
  onPress: () => void;
}

function getContentTypeIcon(type: string): string {
  switch (type) {
    case "text":
      return "file-text";
    case "voice":
      return "mic";
    case "photo":
      return "image";
    case "link":
      return "link";
    case "screenshot":
      return "monitor";
    default:
      return "circle";
  }
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "...";
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function MemoryCard({ memory, onPress }: MemoryCardProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 150 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
  };

  const renderContent = () => {
    switch (memory.contentType) {
      case "photo":
        return (
          <View style={styles.photoContent}>
            {memory.imageUri ? (
              <Image
                source={{ uri: memory.imageUri }}
                style={styles.thumbnail}
                contentFit="cover"
              />
            ) : null}
            {memory.content && memory.content !== "Photo" ? (
              <ThemedText type="body" numberOfLines={2} style={styles.photoCaption}>
                {memory.content}
              </ThemedText>
            ) : null}
          </View>
        );

      case "voice":
        return (
          <View style={styles.voiceContent}>
            <View style={[styles.waveformPlaceholder, { backgroundColor: theme.primary + "20" }]}>
              <Feather name="activity" size={20} color={theme.primary} />
            </View>
            <ThemedText type="caption" secondary>
              {memory.content}
            </ThemedText>
          </View>
        );

      case "link":
        return (
          <View style={styles.linkContent}>
            <View style={[styles.linkIcon, { backgroundColor: theme.secondary + "20" }]}>
              <Feather name="globe" size={16} color={theme.secondary} />
            </View>
            <View style={styles.linkText}>
              <ThemedText type="body" numberOfLines={1}>
                {memory.linkTitle || memory.content}
              </ThemedText>
              <ThemedText type="small" secondary numberOfLines={1}>
                {memory.linkUrl}
              </ThemedText>
            </View>
          </View>
        );

      default:
        return (
          <ThemedText type="body" numberOfLines={3}>
            {truncateText(memory.content, 150)}
          </ThemedText>
        );
    }
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.card,
        { backgroundColor: theme.backgroundDefault },
        animatedStyle,
      ]}
    >
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: theme.primary + "20" }]}>
          <Feather
            name={getContentTypeIcon(memory.contentType) as any}
            size={16}
            color={theme.primary}
          />
        </View>
        <ThemedText type="small" secondary>
          {formatTime(memory.createdAt)}
        </ThemedText>
      </View>

      <View style={styles.content}>{renderContent()}</View>

      {memory.latitude && memory.longitude ? (
        <View style={styles.locationBadge}>
          <Feather name="map-pin" size={12} color={theme.textSecondary} />
          <ThemedText type="small" secondary style={styles.locationText}>
            {memory.locationName || "Location saved"}
          </ThemedText>
        </View>
      ) : null}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.xs,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    marginBottom: Spacing.xs,
  },
  photoContent: {
    gap: Spacing.sm,
  },
  thumbnail: {
    width: "100%",
    height: 150,
    borderRadius: BorderRadius.sm,
  },
  photoCaption: {
    marginTop: Spacing.xs,
  },
  voiceContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  waveformPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    justifyContent: "center",
    alignItems: "center",
  },
  linkContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  linkIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.xs,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  linkText: {
    flex: 1,
  },
  locationBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.sm,
  },
  locationText: {
    marginLeft: Spacing.xs,
  },
});
