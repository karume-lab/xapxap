import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { FileTextIcon, ImageIcon, SendIcon } from "lucide-react-native";
import React, { useState } from "react";
import { Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/ui/button";
import { Glass } from "@/components/ui/glass";
import { Icon } from "@/components/ui/icon";
import { useColors } from "@/hooks/use-colors";

export function CreatePostScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!text.trim()) {
      Alert.alert("Empty wave", "Add a thought first.");
      return;
    }
    setBusy(true);
    try {
      // Mock submit
      await new Promise((resolve) => setTimeout(resolve, 1500));
      if (Haptics.notificationAsync) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      }
      setText("");
      (router.replace as any)("/(tabs)");
    } catch {
      Alert.alert("Could not drop wave", "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingTop: insets.top + 20,
          paddingBottom: insets.bottom + 120,
          paddingHorizontal: 24,
        }}>
        <View className="mb-6">
          <Text className="text-foreground font-bold text-3xl tracking-tight font-[Inter_700Bold]">
            Drop a Wave
          </Text>
          <Text className="text-muted-foreground mt-1 text-sm font-[Inter_400Regular]">
            Share a thought with the global tide.
          </Text>
        </View>

        <View className="gap-4">
          <Glass className="min-h-[180px]">
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="What's rippling through your mind?"
              placeholderTextColor={colors.mutedForeground}
              multiline
              maxLength={500}
              className="flex-1 text-foreground font-normal text-lg p-5"
              style={{ textAlignVertical: "top" }}
            />
            <View className="flex-row justify-end p-4">
              <Text className="text-muted-foreground font-medium text-xs font-[Inter_500Medium]">
                {text.length}/500
              </Text>
            </View>
          </Glass>

          <View className="flex-row gap-3">
            <Pressable className="flex-1 flex-row items-center justify-center gap-2 py-4 rounded-full bg-foreground/5 border border-border">
              <Icon as={ImageIcon} className="text-accent" size={16} />
              <Text className="text-foreground font-medium text-sm font-[Inter_500Medium]">
                Media
              </Text>
            </Pressable>
            <Pressable className="flex-1 flex-row items-center justify-center gap-2 py-4 rounded-full bg-foreground/5 border border-border">
              <Icon as={FileTextIcon} className="text-magenta" size={16} />
              <Text className="text-foreground font-medium text-sm font-[Inter_500Medium]">
                PDF
              </Text>
            </Pressable>
          </View>

          <Button
            onPress={submit}
            size="lg"
            disabled={busy || !text.trim()}
            className="h-14 rounded-[26px]">
            <View className="flex-row items-center gap-2">
              <Text className="font-bold text-lg">{busy ? "Dropping..." : "Drop the wave"}</Text>
              {!busy && <Icon as={SendIcon} className="text-primary-foreground" size={18} />}
            </View>
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}
