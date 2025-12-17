import React from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { ThemedText } from "@/components/ThemedText";
import Spacer from "@/components/Spacer";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();

  return (
    <KeyboardAwareScrollViewCompat
      style={{ flex: 1, backgroundColor: theme.backgroundRoot }}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.xl,
        paddingBottom: tabBarHeight + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
    >
      <ThemedText type="h1">Profile</ThemedText>
      <ThemedText type="body" style={styles.subtitle}>
        Customize your workspace and privacy preferences.
      </ThemedText>

      <Card elevation={1} style={styles.card}>
        <ThemedText type="h4">Avatar</ThemedText>
        <Spacer height={Spacing.sm} />
        <View style={styles.avatarRow}>
          {[theme.link, theme.backgroundSecondary, theme.backgroundTertiary].map(
            (color, idx, arr) => (
              <View
                key={idx}
                style={[
                  styles.avatar,
                  {
                    backgroundColor: color,
                    marginRight: idx === arr.length - 1 ? 0 : Spacing.md,
                  },
                ]}
              />
            ),
          )}
        </View>
        <Spacer height={Spacing.sm} />
        <Button onPress={() => {}}>Change avatar</Button>
      </Card>

      <Card elevation={1} style={styles.card}>
        <ThemedText type="h4">Statistics</ThemedText>
        <Spacer height={Spacing.sm} />
        <View style={styles.statRow}>
          <View style={styles.statBlock}>
            <ThemedText type="h3">128</ThemedText>
            <ThemedText
              type="small"
              style={[styles.muted, styles.statLabelSpacing]}
            >
              Memories
            </ThemedText>
          </View>
          <View style={styles.statBlock}>
            <ThemedText type="h3">6</ThemedText>
            <ThemedText
              type="small"
              style={[styles.muted, styles.statLabelSpacing]}
            >
              Day streak
            </ThemedText>
          </View>
        </View>
      </Card>

      <Card elevation={1} style={styles.card}>
        <ThemedText type="h4">Preferences</ThemedText>
        <Spacer height={Spacing.sm} />
        <View style={styles.settingRow}>
          <ThemedText type="body">Theme</ThemedText>
          <ThemedText type="small" style={styles.muted}>
            Light / Dark / System
          </ThemedText>
        </View>
        <View style={styles.settingRow}>
          <ThemedText type="body">Language</ThemedText>
          <ThemedText type="small" style={styles.muted}>
            English / Arabic
          </ThemedText>
        </View>
        <View style={styles.settingRow}>
          <ThemedText type="body">Privacy</ThemedText>
          <ThemedText type="small" style={styles.muted}>
            Microphone & camera permissions
          </ThemedText>
        </View>
        <Spacer height={Spacing.sm} />
        <Button onPress={() => {}}>Open settings</Button>
      </Card>

      <Card elevation={1} style={styles.card}>
        <ThemedText type="h4">Data</ThemedText>
        <Spacer height={Spacing.sm} />
        <View style={styles.settingRow}>
          <ThemedText type="body">Export</ThemedText>
          <ThemedText type="small" style={styles.muted}>
            Save a backup locally
          </ThemedText>
        </View>
        <View style={styles.settingRow}>
          <ThemedText type="body">Clear cache</ThemedText>
          <ThemedText type="small" style={styles.muted}>
            Free up device storage
          </ThemedText>
        </View>
        <Spacer height={Spacing.sm} />
        <Button onPress={() => {}}>Manage data</Button>
      </Card>
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    opacity: 0.7,
    marginBottom: Spacing.sm,
  },
  card: {
    borderRadius: 20,
  },
  avatarRow: {
    flexDirection: "row",
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  statRow: {
    flexDirection: "row",
  },
  statBlock: {
    flex: 1,
  },
  statLabelSpacing: {
    marginTop: Spacing.xs,
  },
  muted: {
    opacity: 0.7,
  },
  settingRow: {
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.08)",
  },
});
