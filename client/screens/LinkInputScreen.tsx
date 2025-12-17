import React, { useState, useEffect } from "react";
import { View, StyleSheet, TextInput, Pressable, Alert, Platform, Linking } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Typography } from "@/constants/theme";
import { addMemory } from "@/lib/database";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

function isValidUrl(string: string): boolean {
  try {
    new URL(string.startsWith("http") ? string : `https://${string}`);
    return true;
  } catch {
    return false;
  }
}

function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url.startsWith("http") ? url : `https://${url}`);
    return urlObj.hostname.replace("www.", "");
  } catch {
    return "";
  }
}

export default function LinkInputScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    setIsValid(url.trim().length > 0 && isValidUrl(url.trim()));
  }, [url]);

  const handleSave = async () => {
    if (!url.trim()) {
      Alert.alert("No URL", "Please enter a link.");
      return;
    }

    if (!isValidUrl(url.trim())) {
      Alert.alert("Invalid URL", "Please enter a valid website address.");
      return;
    }

    setSaving(true);
    try {
      const fullUrl = url.startsWith("http") ? url : `https://${url}`;
      
      await addMemory({
        content: title.trim() || extractDomain(fullUrl),
        contentType: "link",
        createdAt: new Date().toISOString(),
        linkUrl: fullUrl,
        linkTitle: title.trim() || undefined,
      });

      if (Platform.OS !== "web") {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      navigation.goBack();
    } catch (error) {
      console.error("Failed to save link:", error);
      Alert.alert("Error", "Failed to save link. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleOpenLink = async () => {
    if (isValid) {
      const fullUrl = url.startsWith("http") ? url : `https://${url}`;
      try {
        await Linking.openURL(fullUrl);
      } catch (error) {
        Alert.alert("Error", "Cannot open this link.");
      }
    }
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAwareScrollViewCompat
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + Spacing.xl },
        ]}
      >
        <View style={styles.inputGroup}>
          <ThemedText type="caption" secondary style={styles.label}>
            URL
          </ThemedText>
          <View style={[styles.urlInputContainer, { backgroundColor: theme.backgroundDefault }]}>
            <Feather name="link" size={20} color={theme.textSecondary} style={styles.urlIcon} />
            <TextInput
              style={[styles.urlInput, { color: theme.text }]}
              placeholder="Paste or type a link..."
              placeholderTextColor={theme.textSecondary}
              value={url}
              onChangeText={setUrl}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              autoFocus
            />
            {isValid ? (
              <Pressable onPress={handleOpenLink} style={styles.openButton}>
                <Feather name="external-link" size={20} color={theme.primary} />
              </Pressable>
            ) : null}
          </View>
        </View>

        {isValid ? (
          <View style={styles.previewCard}>
            <View style={[styles.previewIcon, { backgroundColor: theme.secondary + "20" }]}>
              <Feather name="globe" size={24} color={theme.secondary} />
            </View>
            <View style={styles.previewContent}>
              <ThemedText type="caption" secondary>
                {extractDomain(url)}
              </ThemedText>
              <ThemedText type="body" numberOfLines={1}>
                {title || url}
              </ThemedText>
            </View>
          </View>
        ) : null}

        <View style={styles.inputGroup}>
          <ThemedText type="caption" secondary style={styles.label}>
            Title (optional)
          </ThemedText>
          <TextInput
            style={[
              styles.titleInput,
              { color: theme.text, backgroundColor: theme.backgroundDefault },
            ]}
            placeholder="Add a custom title..."
            placeholderTextColor={theme.textSecondary}
            value={title}
            onChangeText={setTitle}
          />
        </View>
      </KeyboardAwareScrollViewCompat>

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
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [
            styles.cancelButton,
            { opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <ThemedText type="body" secondary>
            Cancel
          </ThemedText>
        </Pressable>
        <Pressable
          onPress={handleSave}
          disabled={saving || !isValid}
          style={({ pressed }) => [
            styles.saveButton,
            {
              backgroundColor: isValid ? theme.primary : theme.backgroundSecondary,
              opacity: pressed || saving ? 0.7 : 1,
            },
          ]}
        >
          <Feather name="check" size={20} color="#FFFFFF" />
          <ThemedText type="body" style={styles.saveButtonText}>
            Save
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
    flex: 1,
    padding: Spacing.lg,
  },
  inputGroup: {
    marginBottom: Spacing.xl,
  },
  label: {
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
  },
  urlInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
  },
  urlIcon: {
    marginRight: Spacing.sm,
  },
  urlInput: {
    flex: 1,
    height: 48,
    ...Typography.body,
  },
  openButton: {
    padding: Spacing.sm,
  },
  titleInput: {
    height: 48,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    ...Typography.body,
  },
  previewCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    marginBottom: Spacing.xl,
  },
  previewIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.sm,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  previewContent: {
    flex: 1,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  cancelButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
  },
  saveButtonText: {
    color: "#FFFFFF",
    marginLeft: Spacing.sm,
  },
});
