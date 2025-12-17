import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface AvatarPickerProps {
  selectedIndex: number;
  onSelect: (index: number) => void;
}

const avatarConfigs = [
  { icon: "zap", bgColor: "#2E7D32", iconColor: "#FFFFFF" },
  { icon: "sun", bgColor: "#FF9800", iconColor: "#FFFFFF" },
  { icon: "star", bgColor: "#9C27B0", iconColor: "#FFFFFF" },
];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function AvatarOption({
  config,
  isSelected,
  onPress,
}: {
  config: typeof avatarConfigs[0];
  isSelected: boolean;
  onPress: () => void;
}) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 150 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.avatarOption,
        isSelected && { borderColor: theme.primary, borderWidth: 3 },
        animatedStyle,
      ]}
    >
      <View style={[styles.avatarInner, { backgroundColor: config.bgColor }]}>
        <Feather name={config.icon as any} size={32} color={config.iconColor} />
      </View>
    </AnimatedPressable>
  );
}

export function AvatarPicker({ selectedIndex, onSelect }: AvatarPickerProps) {
  return (
    <View style={styles.container}>
      {avatarConfigs.map((config, index) => (
        <AvatarOption
          key={index}
          config={config}
          isSelected={selectedIndex === index}
          onPress={() => onSelect(index)}
        />
      ))}
    </View>
  );
}

export function SelectedAvatar({ index }: { index: number }) {
  const config = avatarConfigs[index] || avatarConfigs[0];

  return (
    <View style={[styles.selectedAvatar, { backgroundColor: config.bgColor }]}>
      <Feather name={config.icon as any} size={40} color={config.iconColor} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  avatarOption: {
    width: 72,
    height: 72,
    borderRadius: 36,
    padding: 3,
    borderWidth: 3,
    borderColor: "transparent",
  },
  avatarInner: {
    flex: 1,
    borderRadius: 33,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
});
