import React, { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  ViewStyle,
} from "react-native";
import { Feather } from "@expo/vector-icons";

import { MemoryType } from "@/lib/memory-store";
import { useTheme } from "@/hooks/useTheme";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import Spacer from "@/components/Spacer";
import { BorderRadius, Spacing } from "@/constants/theme";

type FeatherIconName = React.ComponentProps<typeof Feather>["name"];

type QuickAddPayload = {
  type: MemoryType;
  title: string;
  content: string;
  tags?: string[];
  metadata?: {
    durationSec?: number;
    uri?: string;
  };
};

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (payload: QuickAddPayload) => void;
  style?: ViewStyle;
};

const typeOptions: { label: string; type: MemoryType; icon: FeatherIconName }[] = [
  { label: "نص", type: "text", icon: "file-text" },
  { label: "صوت", type: "voice", icon: "mic" },
  { label: "صورة", type: "photo", icon: "image" },
  { label: "رابط", type: "link", icon: "link" },
  { label: "لقطة", type: "screenshot", icon: "monitor" },
];

export function QuickAddModal({ visible, onClose, onSubmit, style }: Props) {
  const { theme, isDark } = useTheme();
  const [selectedType, setSelectedType] = useState<MemoryType>("text");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const placeholderColor = isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.35)";

  const placeholder = useMemo(() => {
    switch (selectedType) {
      case "voice":
        return "وصف سريع للتسجيل الصوتي أو المدة…";
      case "photo":
        return "وصف للصورة أو مكانها…";
      case "link":
        return "ألصق الرابط هنا…";
      case "screenshot":
        return "ماذا تحتوي اللقطة؟";
      default:
        return "أكتب الفكرة أو الملاحظة السريعة…";
    }
  }, [selectedType]);

  const handleSubmit = () => {
    if (!title.trim() && !content.trim()) return;

    onSubmit({
      type: selectedType,
      title: title.trim() || "بدون عنوان",
      content: content.trim(),
      metadata: selectedType === "voice" ? { durationSec: 30 } : undefined,
    });

    setTitle("");
    setContent("");
    setSelectedType("text");
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={[styles.backdrop]} />
      <View style={[styles.sheet, { backgroundColor: theme.backgroundRoot }, style]}>
        <View style={styles.handle} />
        <ThemedText type="h3" style={styles.title}>
          إضافة سريعة
        </ThemedText>
        <ThemedText type="small" style={styles.subtitle}>
          بدون تصنيفات أو مجلدات. أضف وسيتم الربط تلقائياً.
        </ThemedText>
        <Spacer height={Spacing.md} />

        <View style={styles.typeRow}>
          {typeOptions.map((option) => (
            <Pressable
              key={option.type}
              style={[
                styles.typeChip,
                {
                  backgroundColor:
                    selectedType === option.type
                      ? theme.link
                      : theme.backgroundSecondary,
                },
              ]}
              onPress={() => setSelectedType(option.type)}
            >
              <Feather
                name={option.icon}
                size={18}
                color={
                  selectedType === option.type ? theme.buttonText : theme.text
                }
              />
              <ThemedText
                type="small"
                style={[
                  styles.typeLabel,
                  {
                    color:
                      selectedType === option.type
                        ? theme.buttonText
                        : theme.text,
                  },
                ]}
              >
                {option.label}
              </ThemedText>
            </Pressable>
          ))}
        </View>

        <Spacer height={Spacing.md} />

        <TextInput
          placeholder="عنوان مختصر"
          placeholderTextColor={placeholderColor}
          style={[
            styles.input,
            {
              borderColor: theme.backgroundSecondary,
              color: theme.text,
            },
          ]}
          value={title}
          onChangeText={setTitle}
        />
        <Spacer height={Spacing.sm} />
        <TextInput
          placeholder={placeholder}
          placeholderTextColor={placeholderColor}
          style={[
            styles.textarea,
            {
              borderColor: theme.backgroundSecondary,
              color: theme.text,
            },
          ]}
          value={content}
          onChangeText={setContent}
          multiline
        />

        <Spacer height={Spacing.lg} />
        <Button onPress={handleSubmit}>حفظ الآن</Button>
        <Spacer height={Spacing.sm} />
        <Button style={styles.secondaryButton} onPress={onClose}>
          إلغاء
        </Button>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.lg,
    borderTopLeftRadius: BorderRadius["2xl"],
    borderTopRightRadius: BorderRadius["2xl"],
  },
  handle: {
    width: 42,
    height: 4,
    borderRadius: BorderRadius.full,
    backgroundColor: "rgba(0,0,0,0.2)",
    alignSelf: "center",
    marginBottom: Spacing.sm,
  },
  title: {
    textAlign: "left",
  },
  subtitle: {
    opacity: 0.7,
  },
  typeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  typeChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  typeLabel: {
    marginLeft: Spacing.xs,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  textarea: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minHeight: 96,
    textAlignVertical: "top",
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(0,0,0,0.1)",
  },
});
