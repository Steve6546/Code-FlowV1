import React from "react";
import { Pressable, StyleSheet, ViewStyle } from "react-native";
import { Feather } from "@expo/vector-icons";

import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

type Props = {
  onPress?: () => void;
  style?: ViewStyle;
};

export function Fab({ onPress, style }: Props) {
  const { theme } = useTheme();

  return (
    <Pressable
      accessibilityLabel="Quick add"
      style={[
        styles.fab,
        {
          backgroundColor: theme.link,
          shadowColor: theme.text,
        },
        style,
      ]}
      onPress={onPress}
    >
      <Feather name="plus" size={24} color={theme.buttonText} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    bottom: Spacing["3xl"],
    alignSelf: "center",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
});
