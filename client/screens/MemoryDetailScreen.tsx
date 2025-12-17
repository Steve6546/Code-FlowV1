import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, Pressable, Alert, Platform } from "react-native";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import { useAudioPlayer } from "expo-audio";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { deleteMemory, incrementViewCount, type Memory } from "@/lib/database";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

type MemoryDetailRouteProp = RouteProp<RootStackParamList, "MemoryDetail">;

function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getContentTypeLabel(type: string): string {
  switch (type) {
    case "text":
      return "Note";
    case "voice":
      return "Voice Note";
    case "photo":
      return "Photo";
    case "link":
      return "Link";
    case "screenshot":
      return "Screenshot";
    default:
      return "Memory";
  }
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

export default function MemoryDetailScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<MemoryDetailRouteProp>();
  const memory = route.params.memory;

  const [isPlaying, setIsPlaying] = useState(false);
  const player = memory.audioUri ? useAudioPlayer(memory.audioUri) : null;

  useEffect(() => {
    incrementViewCount(memory.id);
  }, [memory.id]);

  useEffect(() => {
    if (player) {
      player.addListener('playingChange', ({ isPlaying: playing }) => {
        setIsPlaying(playing);
      });
    }
  }, [player]);

  const handleDelete = () => {
    Alert.alert(
      "Delete Memory",
      "Are you sure you want to delete this memory? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteMemory(memory.id);
              if (Platform.OS !== "web") {
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }
              navigation.goBack();
            } catch (error) {
              console.error("Failed to delete memory:", error);
              Alert.alert("Error", "Failed to delete memory. Please try again.");
            }
          },
        },
      ]
    );
  };

  const handlePlayPause = async () => {
    if (!player) return;
    
    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
  };

  const renderContent = () => {
    switch (memory.contentType) {
      case "text":
        return (
          <Card style={styles.contentCard}>
            <ThemedText type="body" style={styles.textContent}>
              {memory.content}
            </ThemedText>
          </Card>
        );

      case "voice":
        return (
          <Card style={styles.contentCard}>
            <View style={styles.audioPlayer}>
              <Pressable
                onPress={handlePlayPause}
                style={({ pressed }) => [
                  styles.playButton,
                  { backgroundColor: theme.primary, opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <Feather
                  name={isPlaying ? "pause" : "play"}
                  size={24}
                  color="#FFFFFF"
                />
              </Pressable>
              <View style={styles.audioInfo}>
                <ThemedText type="body">{memory.content}</ThemedText>
                <ThemedText type="caption" secondary>
                  {isPlaying ? "Playing..." : "Tap to play"}
                </ThemedText>
              </View>
            </View>
          </Card>
        );

      case "photo":
        return (
          <View style={styles.imageContainer}>
            {memory.imageUri ? (
              <Image
                source={{ uri: memory.imageUri }}
                style={styles.image}
                contentFit="cover"
              />
            ) : null}
            {memory.content && memory.content !== "Photo" ? (
              <Card style={styles.captionCard}>
                <ThemedText type="body">{memory.content}</ThemedText>
              </Card>
            ) : null}
          </View>
        );

      case "link":
        return (
          <Card style={styles.contentCard}>
            <View style={styles.linkContent}>
              <View style={[styles.linkIcon, { backgroundColor: theme.secondary + "20" }]}>
                <Feather name="globe" size={24} color={theme.secondary} />
              </View>
              <View style={styles.linkInfo}>
                <ThemedText type="body" numberOfLines={2}>
                  {memory.linkTitle || memory.content}
                </ThemedText>
                <ThemedText type="caption" secondary numberOfLines={1}>
                  {memory.linkUrl}
                </ThemedText>
              </View>
            </View>
          </Card>
        );

      default:
        return (
          <Card style={styles.contentCard}>
            <ThemedText type="body">{memory.content}</ThemedText>
          </Card>
        );
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + Spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={[styles.typeIcon, { backgroundColor: theme.primary + "20" }]}>
            <Feather
              name={getContentTypeIcon(memory.contentType) as any}
              size={24}
              color={theme.primary}
            />
          </View>
          <View style={styles.headerInfo}>
            <ThemedText type="h4">
              {getContentTypeLabel(memory.contentType)}
            </ThemedText>
            <ThemedText type="caption" secondary>
              {formatDateTime(memory.createdAt)}
            </ThemedText>
          </View>
        </View>

        {renderContent()}

        {memory.latitude && memory.longitude ? (
          <Card style={styles.metadataCard}>
            <View style={styles.metadataRow}>
              <Feather name="map-pin" size={16} color={theme.textSecondary} />
              <ThemedText type="caption" secondary style={styles.metadataText}>
                {memory.locationName || `${memory.latitude.toFixed(4)}, ${memory.longitude.toFixed(4)}`}
              </ThemedText>
            </View>
          </Card>
        ) : null}

        <Card style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Feather name="eye" size={16} color={theme.textSecondary} />
              <ThemedText type="caption" secondary style={styles.statText}>
                Viewed {memory.viewCount} times
              </ThemedText>
            </View>
          </View>
        </Card>
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            backgroundColor: theme.backgroundRoot,
            paddingBottom: insets.bottom + Spacing.md,
          },
        ]}
      >
        <Pressable
          onPress={handleDelete}
          style={({ pressed }) => [
            styles.deleteButton,
            { backgroundColor: theme.error + "20", opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Feather name="trash-2" size={20} color={theme.error} />
          <ThemedText type="body" style={{ color: theme.error, marginLeft: Spacing.sm }}>
            Delete
          </ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  typeIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  headerInfo: {
    flex: 1,
  },
  contentCard: {
    marginBottom: Spacing.lg,
  },
  textContent: {
    lineHeight: 24,
  },
  audioPlayer: {
    flexDirection: "row",
    alignItems: "center",
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  audioInfo: {
    flex: 1,
  },
  imageContainer: {
    marginBottom: Spacing.lg,
  },
  image: {
    width: "100%",
    height: 300,
    borderRadius: BorderRadius.lg,
  },
  captionCard: {
    marginTop: Spacing.md,
  },
  linkContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  linkIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.sm,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  linkInfo: {
    flex: 1,
  },
  metadataCard: {
    marginBottom: Spacing.md,
  },
  metadataRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  metadataText: {
    marginLeft: Spacing.sm,
  },
  statsCard: {
    marginBottom: Spacing.md,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  statText: {
    marginLeft: Spacing.sm,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  deleteButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
});
