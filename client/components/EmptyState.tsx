import React from "react";
import { View, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface EmptyStateProps {
  icon: string;
  title: string;
  message: string;
  compact?: boolean;
}

export function EmptyState({ icon, title, message, compact = false }: EmptyStateProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, compact && styles.compactContainer]}>
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: theme.backgroundSecondary },
          compact && styles.compactIcon,
        ]}
      >
        <Feather
          name={icon as any}
          size={compact ? 32 : 48}
          color={theme.textSecondary}
        />
      </View>
      <ThemedText
        type={compact ? "h4" : "h3"}
        style={styles.title}
      >
        {title}
      </ThemedText>
      <ThemedText
        type={compact ? "caption" : "body"}
        secondary
        style={styles.message}
      >
        {message}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxl,
  },
  compactContainer: {
    flex: 0,
    paddingVertical: Spacing.xl,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  compactIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  title: {
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  message: {
    textAlign: "center",
    maxWidth: 280,
  },
});
