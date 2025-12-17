import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

type ContentOption = {
  type: keyof RootStackParamList;
  icon: string;
  label: string;
  description: string;
  color: string;
};

export default function QuickAddScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const options: ContentOption[] = [
    {
      type: "TextInput",
      icon: "file-text",
      label: "Note",
      description: "Write a quick thought or idea",
      color: theme.primary,
    },
    {
      type: "VoiceInput",
      icon: "mic",
      label: "Voice",
      description: "Record a voice note",
      color: "#E91E63",
    },
    {
      type: "PhotoInput",
      icon: "camera",
      label: "Photo",
      description: "Capture or select an image",
      color: "#FF9800",
    },
    {
      type: "LinkInput",
      icon: "link",
      label: "Link",
      description: "Save a website or article",
      color: theme.secondary,
    },
  ];

  const handleSelect = (type: keyof RootStackParamList) => {
    navigation.replace(type as any);
  };

  return (
    <ThemedView style={styles.container}>
      <View
        style={[
          styles.content,
          { paddingBottom: insets.bottom + Spacing.xl },
        ]}
      >
        <View style={styles.header}>
          <ThemedText type="h3">What would you like to capture?</ThemedText>
          <ThemedText type="caption" secondary style={styles.subtitle}>
            Choose how you want to add a new memory
          </ThemedText>
        </View>

        <View style={styles.optionsGrid}>
          {options.map((option) => (
            <Pressable
              key={option.type}
              onPress={() => handleSelect(option.type)}
              style={({ pressed }) => [
                styles.optionCard,
                { backgroundColor: theme.backgroundDefault, opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: option.color + "20" },
                ]}
              >
                <Feather name={option.icon as any} size={28} color={option.color} />
              </View>
              <ThemedText type="h4" style={styles.optionLabel}>
                {option.label}
              </ThemedText>
              <ThemedText type="small" secondary style={styles.optionDescription}>
                {option.description}
              </ThemedText>
            </Pressable>
          ))}
        </View>
      </View>
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
  header: {
    marginBottom: Spacing.xl,
  },
  subtitle: {
    marginTop: Spacing.xs,
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  optionCard: {
    width: "47%",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.xl,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  optionLabel: {
    marginBottom: Spacing.xs,
  },
  optionDescription: {
    textAlign: "center",
  },
});
