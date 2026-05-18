import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { FileTextIcon, ImageIcon, SendIcon } from "lucide-react-native";
import { useState } from "react";
import { Alert, ScrollView, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Glass } from "@/components/layout/Glass";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/contexts/auth-context";
import { useCreateFleetPost } from "@/features/fleet/api/queries";
import { useColors } from "@/hooks/use-colors";

export function CreatePostScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colors = useColors();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const { profile, session, showAuthModal } = useAuth();
  const { mutateAsync: createPost } = useCreateFleetPost();

  if (!session) {
    return (
      <View
        className="flex-1 bg-background items-center justify-center p-6"
        style={{ paddingTop: insets.top }}>
        <View className="w-20 h-20 rounded-full bg-primary/10 items-center justify-center mb-6 border border-primary/20">
          <Icon as={SendIcon} size={32} className="text-primary mr-1 mt-0.5" />
        </View>
        <Text className="text-foreground font-bold text-2xl text-center mb-2 font-[Inter_700Bold]">
          Drop a Wave
        </Text>
        <Text className="text-muted-foreground text-center text-sm leading-6 max-w-[280px] mb-8 font-[Inter_400Regular]">
          Sign in to share your thoughts, images, videos, and PDFs with the XapXap community.
        </Text>
        <Button
          onPress={showAuthModal}
          className="w-full max-w-[240px] h-16 rounded-[28px] bg-primary">
          <Text className="text-primary-foreground font-bold text-lg font-[Inter_700Bold]">
            Sign in to XapXap
          </Text>
        </Button>
      </View>
    );
  }

  const submit = async () => {
    if (!text.trim()) {
      Alert.alert("Empty wave", "Add a thought first.");
      return;
    }
    setBusy(true);
    try {
      await createPost({ content: text, authorProfile: profile });
      if (Haptics.notificationAsync) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      }
      setText("");
      router.replace("/(tabs)");
    } catch {
      Alert.alert("Could not drop wave", "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingTop: 20,
          paddingBottom: insets.bottom + 120,
          paddingHorizontal: 24,
        }}>
        <View className="mb-8">
          <Text className="text-foreground text-3xl font-bold font-[Inter_700Bold]">
            Drop a Wave
          </Text>
          <Text className="text-muted-foreground mt-1 text-sm font-[Inter_400Regular]">
            Share a thought, an image, a video, or a PDF.
          </Text>
        </View>

        <View className="gap-6">
          <Glass radius={32} className="min-h-[220px] border border-border">
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="What's rippling through your mind?"
              placeholderTextColor={colors.mutedForeground}
              multiline
              maxLength={500}
              className="flex-1 text-foreground text-lg p-6"
              style={{ textAlignVertical: "top" }}
            />
            <View className="flex-row justify-end p-5">
              <Text className="text-muted-foreground font-medium text-xs">{text.length}/500</Text>
            </View>
          </Glass>

          <View className="flex-row gap-4">
            <Glass radius={24} className="flex-1 border border-border overflow-hidden">
              <Button
                variant="ghost"
                className="flex-row items-center justify-center gap-3 py-5 p-0 min-w-0 min-h-0 h-auto w-auto active:bg-transparent bg-transparent">
                <Icon as={ImageIcon} className="text-accent" size={18} />
                <Text className="text-foreground font-bold text-sm">Photo / Video</Text>
              </Button>
            </Glass>
            <Glass radius={24} className="flex-1 border border-border overflow-hidden">
              <Button
                variant="ghost"
                className="flex-row items-center justify-center gap-3 py-5 p-0 min-w-0 min-h-0 h-auto w-auto active:bg-transparent bg-transparent">
                <Icon as={FileTextIcon} className="text-magenta" size={18} />
                <Text className="text-foreground font-bold text-sm">PDF</Text>
              </Button>
            </Glass>
          </View>

          <Button
            onPress={submit}
            isLoading={busy}
            disabled={!text.trim()}
            className="h-20 rounded-[32px] bg-primary">
            <View className="flex-row items-center gap-3">
              <Icon as={SendIcon} className="text-primary-foreground/60" size={20} />
              <Text className="text-primary-foreground/80 font-bold text-xl">Drop the wave</Text>
            </View>
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}
