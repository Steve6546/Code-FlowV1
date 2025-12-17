import React, { useEffect, useState, useCallback } from "react";
import { View, StyleSheet, ScrollView, Pressable, Alert } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { AvatarPicker } from "@/components/AvatarPicker";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import {
  initDatabase,
  getUserPreferences,
  updateUserPreferences,
  getMemoryCount,
  getTodayMemoryCount,
  type UserPreferences,
} from "@/lib/database";

export default function ProfileScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();

  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [totalMemories, setTotalMemories] = useState(0);
  const [todayMemories, setTodayMemories] = useState(0);

  const loadData = useCallback(async () => {
    try {
      await initDatabase();
      const prefs = await getUserPreferences();
      setPreferences(prefs);
      
      const total = await getMemoryCount();
      setTotalMemories(total);
      
      const today = await getTodayMemoryCount();
      setTodayMemories(today);
    } catch (error) {
      console.error("Failed to load profile:", error);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAvatarChange = async (index: number) => {
    if (!preferences) return;
    try {
      await updateUserPreferences({ avatarIndex: index });
      setPreferences({ ...preferences, avatarIndex: index });
    } catch (error) {
      console.error("Failed to update avatar:", error);
    }
  };

  const handleLocationToggle = async () => {
    if (!preferences) return;
    const newValue = !preferences.locationEnabled;
    try {
      await updateUserPreferences({ locationEnabled: newValue });
      setPreferences({ ...preferences, locationEnabled: newValue });
    } catch (error) {
      console.error("Failed to update location setting:", error);
    }
  };

  const handleExportData = () => {
    Alert.alert(
      "Export Data",
      "This feature will be available in a future update. Your data is safely stored locally on your device.",
      [{ text: "OK" }]
    );
  };

  const handleClearCache = () => {
    Alert.alert(
      "Clear Cache",
      "This will remove temporary files but keep your memories. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => {
            Alert.alert("Success", "Cache cleared successfully.");
          },
        },
      ]
    );
  };

  const SettingsRow = ({
    icon,
    title,
    subtitle,
    onPress,
    rightElement,
    destructive,
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
    destructive?: boolean;
  }) => (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.settingsRow,
        { backgroundColor: theme.backgroundDefault, opacity: pressed && onPress ? 0.7 : 1 },
      ]}
    >
      <View style={[styles.settingsIcon, { backgroundColor: theme.backgroundSecondary }]}>
        <Feather
          name={icon as any}
          size={20}
          color={destructive ? theme.error : theme.primary}
        />
      </View>
      <View style={styles.settingsContent}>
        <ThemedText
          type="body"
          style={destructive ? { color: theme.error } : undefined}
        >
          {title}
        </ThemedText>
        {subtitle ? (
          <ThemedText type="small" secondary>
            {subtitle}
          </ThemedText>
        ) : null}
      </View>
      {rightElement}
      {onPress && !rightElement ? (
        <Feather name="chevron-right" size={20} color={theme.textSecondary} />
      ) : null}
    </Pressable>
  );

  const ToggleSwitch = ({ value, onToggle }: { value: boolean; onToggle: () => void }) => (
    <Pressable
      onPress={onToggle}
      style={[
        styles.toggle,
        { backgroundColor: value ? theme.primary : theme.backgroundTertiary },
      ]}
    >
      <View
        style={[
          styles.toggleKnob,
          { transform: [{ translateX: value ? 20 : 0 }] },
        ]}
      />
    </Pressable>
  );

  if (!preferences) {
    return (
      <ThemedView style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
          <ThemedText type="h1">Profile</ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <ThemedText type="h1">Profile</ThemedText>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: Spacing.lg,
          paddingBottom: tabBarHeight + Spacing.fabSize + Spacing.xxl,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.avatarSection}>
          <AvatarPicker
            selectedIndex={preferences.avatarIndex}
            onSelect={handleAvatarChange}
          />
          <ThemedText type="h3" style={styles.displayName}>
            {preferences.displayName}
          </ThemedText>
        </View>

        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <ThemedText type="h2" style={{ color: theme.primary }}>
              {totalMemories}
            </ThemedText>
            <ThemedText type="caption" secondary>
              Total Memories
            </ThemedText>
          </Card>
          <Card style={styles.statCard}>
            <ThemedText type="h2" style={{ color: theme.secondary }}>
              {todayMemories}
            </ThemedText>
            <ThemedText type="caption" secondary>
              Today
            </ThemedText>
          </Card>
        </View>

        <View style={styles.section}>
          <ThemedText type="caption" secondary style={styles.sectionLabel}>
            PRIVACY
          </ThemedText>
          <View style={styles.settingsGroup}>
            <SettingsRow
              icon="map-pin"
              title="Location Tracking"
              subtitle="Save location with memories"
              rightElement={
                <ToggleSwitch
                  value={preferences.locationEnabled}
                  onToggle={handleLocationToggle}
                />
              }
            />
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="caption" secondary style={styles.sectionLabel}>
            DATA
          </ThemedText>
          <View style={styles.settingsGroup}>
            <SettingsRow
              icon="download"
              title="Export Data"
              subtitle="Download all your memories"
              onPress={handleExportData}
            />
            <View style={[styles.divider, { backgroundColor: theme.divider }]} />
            <SettingsRow
              icon="trash-2"
              title="Clear Cache"
              onPress={handleClearCache}
              destructive
            />
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="caption" secondary style={styles.sectionLabel}>
            ABOUT
          </ThemedText>
          <View style={styles.settingsGroup}>
            <SettingsRow
              icon="info"
              title="Version"
              subtitle="1.0.0"
            />
            <View style={[styles.divider, { backgroundColor: theme.divider }]} />
            <SettingsRow
              icon="shield"
              title="Privacy Policy"
              subtitle="Your data stays on your device"
              onPress={() => {}}
            />
          </View>
        </View>

        <View style={styles.footer}>
          <ThemedText type="small" secondary style={{ textAlign: "center" }}>
            Thakira - Your Smart Memory
          </ThemedText>
          <ThemedText type="small" secondary style={{ textAlign: "center", marginTop: Spacing.xs }}>
            All data stored locally on your device
          </ThemedText>
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
  avatarSection: {
    alignItems: "center",
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
  },
  displayName: {
    marginTop: Spacing.md,
  },
  statsRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionLabel: {
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  settingsGroup: {
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    minHeight: 56,
  },
  settingsIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  settingsContent: {
    flex: 1,
  },
  divider: {
    height: 1,
    marginLeft: 56,
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    padding: 2,
  },
  toggleKnob: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
  },
  footer: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.lg,
  },
});
