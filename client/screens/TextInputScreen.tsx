import React, { useState, useEffect } from "react";
import { View, StyleSheet, TextInput, Pressable, Alert, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Location from "expo-location";
import * as Haptics from "expo-haptics";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Typography } from "@/constants/theme";
import { addMemory, getUserPreferences } from "@/lib/database";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

export default function TextInputScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    const getLocation = async () => {
      try {
        const prefs = await getUserPreferences();
        if (!prefs.locationEnabled) return;

        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") return;

        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
      } catch (error) {
        console.log("Location not available");
      }
    };
    getLocation();
  }, []);

  const handleSave = async () => {
    if (!text.trim()) {
      Alert.alert("Empty Note", "Please write something before saving.");
      return;
    }

    setSaving(true);
    try {
      await addMemory({
        content: text.trim(),
        contentType: "text",
        createdAt: new Date().toISOString(),
        latitude: location?.latitude,
        longitude: location?.longitude,
      });

      if (Platform.OS !== "web") {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      navigation.goBack();
    } catch (error) {
      console.error("Failed to save note:", error);
      Alert.alert("Error", "Failed to save note. Please try again.");
    } finally {
      setSaving(false);
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
        <TextInput
          style={[
            styles.textInput,
            {
              color: theme.text,
              backgroundColor: theme.backgroundDefault,
            },
          ]}
          placeholder="What's on your mind?"
          placeholderTextColor={theme.textSecondary}
          value={text}
          onChangeText={setText}
          multiline
          autoFocus
          textAlignVertical="top"
        />

        {location ? (
          <View style={styles.locationBadge}>
            <Feather name="map-pin" size={14} color={theme.textSecondary} />
            <ThemedText type="small" secondary style={styles.locationText}>
              Location will be saved
            </ThemedText>
          </View>
        ) : null}
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
        <ThemedText type="small" secondary>
          {text.length} characters
        </ThemedText>
        <Pressable
          onPress={handleSave}
          disabled={saving || !text.trim()}
          style={({ pressed }) => [
            styles.saveButton,
            {
              backgroundColor: text.trim() ? theme.primary : theme.backgroundSecondary,
              opacity: pressed ? 0.7 : saving ? 0.5 : 1,
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
  textInput: {
    flex: 1,
    minHeight: 200,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    ...Typography.body,
  },
  locationBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.md,
  },
  locationText: {
    marginLeft: Spacing.xs,
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
