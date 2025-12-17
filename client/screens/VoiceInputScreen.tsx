import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, Pressable, Alert, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAudioRecorder, AudioModule, RecordingPresets } from "expo-audio";
import * as Location from "expo-location";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { addMemory, getUserPreferences } from "@/lib/database";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

export default function VoiceInputScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    const setup = async () => {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      setHasPermission(status.granted);

      try {
        const prefs = await getUserPreferences();
        if (prefs.locationEnabled) {
          const { status: locStatus } = await Location.requestForegroundPermissionsAsync();
          if (locStatus === "granted") {
            const loc = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Balanced,
            });
            setLocation({
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
            });
          }
        }
      } catch (error) {
        console.log("Location not available");
      }
    };
    setup();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const startRecording = async () => {
    try {
      if (Platform.OS !== "web") {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      audioRecorder.record();
      setIsRecording(true);
      setRecordingTime(0);

      pulseScale.value = withRepeat(
        withTiming(1.2, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Failed to start recording:", error);
      Alert.alert("Error", "Failed to start recording. Please try again.");
    }
  };

  const stopRecording = async () => {
    try {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      await audioRecorder.stop();
      setIsRecording(false);
      pulseScale.value = 1;

      if (audioRecorder.uri) {
        setAudioUri(audioRecorder.uri);
        if (Platform.OS !== "web") {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }
    } catch (error) {
      console.error("Failed to stop recording:", error);
    }
  };

  const handleSave = async () => {
    if (!audioUri) {
      Alert.alert("No Recording", "Please record a voice note first.");
      return;
    }

    setSaving(true);
    try {
      await addMemory({
        content: `Voice note - ${formatTime(recordingTime)}`,
        contentType: "voice",
        createdAt: new Date().toISOString(),
        audioUri,
        latitude: location?.latitude,
        longitude: location?.longitude,
      });

      if (Platform.OS !== "web") {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      navigation.goBack();
    } catch (error) {
      console.error("Failed to save voice note:", error);
      Alert.alert("Error", "Failed to save voice note. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    Alert.alert(
      "Discard Recording",
      "Are you sure you want to discard this recording?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Discard",
          style: "destructive",
          onPress: () => {
            setAudioUri(null);
            setRecordingTime(0);
          },
        },
      ]
    );
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (hasPermission === null) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.centerContent}>
          <ThemedText>Requesting permission...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (hasPermission === false) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.centerContent}>
          <Feather name="mic-off" size={48} color={theme.error} />
          <ThemedText type="h4" style={styles.permissionTitle}>
            Microphone Access Required
          </ThemedText>
          <ThemedText type="body" secondary style={styles.permissionText}>
            Please enable microphone access in your device settings to record voice notes.
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.timerContainer}>
          <ThemedText type="display" style={styles.timer}>
            {formatTime(recordingTime)}
          </ThemedText>
          {isRecording ? (
            <View style={styles.recordingIndicator}>
              <View style={[styles.recordingDot, { backgroundColor: theme.error }]} />
              <ThemedText type="caption" style={{ color: theme.error }}>
                Recording
              </ThemedText>
            </View>
          ) : audioUri ? (
            <ThemedText type="caption" secondary>
              Recording complete
            </ThemedText>
          ) : (
            <ThemedText type="caption" secondary>
              Tap to start recording
            </ThemedText>
          )}
        </View>

        <View style={styles.controlsContainer}>
          {audioUri && !isRecording ? (
            <View style={styles.audioControls}>
              <Pressable
                onPress={handleDiscard}
                style={({ pressed }) => [
                  styles.secondaryButton,
                  { backgroundColor: theme.backgroundSecondary, opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <Feather name="trash-2" size={24} color={theme.error} />
              </Pressable>
              <Pressable
                onPress={handleSave}
                disabled={saving}
                style={({ pressed }) => [
                  styles.saveButton,
                  { backgroundColor: theme.primary, opacity: pressed || saving ? 0.7 : 1 },
                ]}
              >
                <Feather name="check" size={24} color="#FFFFFF" />
                <ThemedText type="body" style={{ color: "#FFFFFF", marginLeft: Spacing.sm }}>
                  Save
                </ThemedText>
              </Pressable>
            </View>
          ) : (
            <Animated.View style={[styles.recordButtonContainer, pulseStyle]}>
              <Pressable
                onPress={isRecording ? stopRecording : startRecording}
                style={({ pressed }) => [
                  styles.recordButton,
                  {
                    backgroundColor: isRecording ? theme.error : theme.primary,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <Feather
                  name={isRecording ? "square" : "mic"}
                  size={32}
                  color="#FFFFFF"
                />
              </Pressable>
            </Animated.View>
          )}
        </View>
      </View>

      {location ? (
        <View style={[styles.locationBadge, { bottom: insets.bottom + Spacing.xl }]}>
          <Feather name="map-pin" size={14} color={theme.textSecondary} />
          <ThemedText type="small" secondary style={styles.locationText}>
            Location will be saved
          </ThemedText>
        </View>
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  permissionTitle: {
    marginTop: Spacing.lg,
    textAlign: "center",
  },
  permissionText: {
    marginTop: Spacing.sm,
    textAlign: "center",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  timerContainer: {
    alignItems: "center",
    marginBottom: Spacing.xxl,
  },
  timer: {
    fontSize: 64,
    fontWeight: "300",
  },
  recordingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.md,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.xs,
  },
  controlsContainer: {
    alignItems: "center",
  },
  recordButtonContainer: {
    width: 80,
    height: 80,
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  audioControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.lg,
  },
  secondaryButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xl,
  },
  locationBadge: {
    position: "absolute",
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
  },
  locationText: {
    marginLeft: Spacing.xs,
  },
});
