import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MainTabNavigator from "@/navigation/MainTabNavigator";
import QuickAddScreen from "@/screens/QuickAddScreen";
import TextInputScreen from "@/screens/TextInputScreen";
import VoiceInputScreen from "@/screens/VoiceInputScreen";
import PhotoInputScreen from "@/screens/PhotoInputScreen";
import LinkInputScreen from "@/screens/LinkInputScreen";
import FocusModeScreen from "@/screens/FocusModeScreen";
import MemoryDetailScreen from "@/screens/MemoryDetailScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import type { Memory } from "@/lib/database";

export type RootStackParamList = {
  Main: undefined;
  QuickAdd: undefined;
  TextInput: undefined;
  VoiceInput: undefined;
  PhotoInput: undefined;
  LinkInput: undefined;
  FocusMode: { goalId?: number; goalName?: string };
  MemoryDetail: { memory: Memory };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Main"
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="QuickAdd"
        component={QuickAddScreen}
        options={{
          presentation: "modal",
          headerTitle: "Add Memory",
        }}
      />
      <Stack.Screen
        name="TextInput"
        component={TextInputScreen}
        options={{
          presentation: "modal",
          headerTitle: "New Note",
        }}
      />
      <Stack.Screen
        name="VoiceInput"
        component={VoiceInputScreen}
        options={{
          presentation: "modal",
          headerTitle: "Voice Note",
        }}
      />
      <Stack.Screen
        name="PhotoInput"
        component={PhotoInputScreen}
        options={{
          presentation: "modal",
          headerTitle: "Add Photo",
        }}
      />
      <Stack.Screen
        name="LinkInput"
        component={LinkInputScreen}
        options={{
          presentation: "modal",
          headerTitle: "Add Link",
        }}
      />
      <Stack.Screen
        name="FocusMode"
        component={FocusModeScreen}
        options={{
          presentation: "modal",
          headerTitle: "Focus Mode",
        }}
      />
      <Stack.Screen
        name="MemoryDetail"
        component={MemoryDetailScreen}
        options={{
          headerTitle: "Memory",
        }}
      />
    </Stack.Navigator>
  );
}
