import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { FileTextIcon, ImageIcon, SendIcon } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Glass } from "@/components/layout/Glass";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/contexts/auth-context";
import { useCreateFleetPost } from "@/features/fleet/api/queries";

export function CreatePostScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const { profile, session, showAuthModal } = useAuth();
  const { mutateAsync: createPost } = useCreateFleetPost();

  useEffect(() => {
    if (!session) {
      showAuthModal();
    }
  }, [session, showAuthModal]);

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
          <Text className="text-white text-3xl font-bold font-[Inter_700Bold]">Drop a Wave</Text>
          <Text className="text-muted-foreground mt-1 text-sm font-[Inter_400Regular]">
            Share a thought, an image, a video, or a PDF.
          </Text>
        </View>

        <View className="gap-6">
          <Glass radius={32} className="min-h-[220px] border border-white/5">
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="What's rippling through your mind?"
              placeholderTextColor="rgba(255,255,255,0.2)"
              multiline
              maxLength={500}
              className="flex-1 text-white text-lg p-6"
              style={{ textAlignVertical: "top" }}
            />
            <View className="flex-row justify-end p-5">
              <Text className="text-muted-foreground font-medium text-xs">{text.length}/500</Text>
            </View>
          </Glass>

          <View className="flex-row gap-4">
            <Glass radius={24} className="flex-1 border border-white/5 overflow-hidden">
              <Pressable className="flex-row items-center justify-center gap-3 py-5 active:bg-white/5">
                <Icon as={ImageIcon} className="text-accent" size={18} />
                <Text className="text-white font-bold text-sm">Photo / Video</Text>
              </Pressable>
            </Glass>
            <Glass radius={24} className="flex-1 border border-white/5 overflow-hidden">
              <Pressable className="flex-row items-center justify-center gap-3 py-5 active:bg-white/5">
                <Icon as={FileTextIcon} className="text-[#FF5FA8]" size={18} />
                <Text className="text-white font-bold text-sm">PDF</Text>
              </Pressable>
            </Glass>
          </View>

          <Button
            onPress={submit}
            isLoading={busy}
            disabled={!text.trim()}
            className="h-20 rounded-[32px] bg-[#8ba42f]">
            <View className="flex-row items-center gap-3">
              <Icon as={SendIcon} className="text-black/60" size={20} />
              <Text className="text-black/80 font-bold text-xl">Drop the wave</Text>
            </View>
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}
