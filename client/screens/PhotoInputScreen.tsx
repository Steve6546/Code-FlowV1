import React, { useState, useEffect } from "react";
import { View, StyleSheet, Pressable, Alert, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { addMemory, getUserPreferences } from "@/lib/database";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

export default function PhotoInputScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
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

  const pickImage = async (useCamera: boolean) => {
    try {
      let result;

      if (useCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission Required", "Camera access is needed to take photos.");
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          quality: 0.8,
        });
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission Required", "Photo library access is needed to select photos.");
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Failed to pick image:", error);
      Alert.alert("Error", "Failed to access photos. Please try again.");
    }
  };

  const handleSave = async () => {
    if (!imageUri) {
      Alert.alert("No Photo", "Please select or capture a photo first.");
      return;
    }

    setSaving(true);
    try {
      await addMemory({
        content: caption.trim() || "Photo",
        contentType: "photo",
        createdAt: new Date().toISOString(),
        imageUri,
        latitude: location?.latitude,
        longitude: location?.longitude,
      });

      if (Platform.OS !== "web") {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      navigation.goBack();
    } catch (error) {
      console.error("Failed to save photo:", error);
      Alert.alert("Error", "Failed to save photo. Please try again.");
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
        {imageUri ? (
          <View style={styles.imagePreviewContainer}>
            <Image
              source={{ uri: imageUri }}
              style={styles.imagePreview}
              contentFit="cover"
            />
            <Pressable
              onPress={() => setImageUri(null)}
              style={({ pressed }) => [
                styles.removeButton,
                { backgroundColor: theme.error, opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Feather name="x" size={20} color="#FFFFFF" />
            </Pressable>
          </View>
        ) : (
          <View style={styles.pickersContainer}>
            <Pressable
              onPress={() => pickImage(true)}
              style={({ pressed }) => [
                styles.pickerButton,
                { backgroundColor: theme.backgroundDefault, opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <View style={[styles.pickerIcon, { backgroundColor: theme.primary + "20" }]}>
                <Feather name="camera" size={32} color={theme.primary} />
              </View>
              <ThemedText type="h4">Camera</ThemedText>
              <ThemedText type="small" secondary>
                Take a new photo
              </ThemedText>
            </Pressable>

            <Pressable
              onPress={() => pickImage(false)}
              style={({ pressed }) => [
                styles.pickerButton,
                { backgroundColor: theme.backgroundDefault, opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <View style={[styles.pickerIcon, { backgroundColor: theme.secondary + "20" }]}>
                <Feather name="image" size={32} color={theme.secondary} />
              </View>
              <ThemedText type="h4">Gallery</ThemedText>
              <ThemedText type="small" secondary>
                Choose from photos
              </ThemedText>
            </Pressable>
          </View>
        )}

        {location ? (
          <View style={styles.locationBadge}>
            <Feather name="map-pin" size={14} color={theme.textSecondary} />
            <ThemedText type="small" secondary style={styles.locationText}>
              Location will be saved
            </ThemedText>
          </View>
        ) : null}
      </KeyboardAwareScrollViewCompat>

      {imageUri ? (
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
            onPress={() => setImageUri(null)}
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
            disabled={saving}
            style={({ pressed }) => [
              styles.saveButton,
              {
                backgroundColor: theme.primary,
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
      ) : null}
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
  pickersContainer: {
    flexDirection: "row",
    gap: Spacing.md,
    flex: 1,
    paddingVertical: Spacing.xl,
  },
  pickerButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  pickerIcon: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.xl,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  imagePreviewContainer: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    position: "relative",
  },
  imagePreview: {
    flex: 1,
    borderRadius: BorderRadius.lg,
  },
  removeButton: {
    position: "absolute",
    top: Spacing.md,
    right: Spacing.md,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  locationBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.md,
    justifyContent: "center",
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
