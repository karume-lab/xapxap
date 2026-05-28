import * as DocumentPicker from "expo-document-picker";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import { FileTextIcon, ImageIcon, SendIcon, XIcon } from "lucide-react-native";
import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Glass } from "@/components/layout/Glass";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/contexts/auth-context";
import { useCreateFleetPost } from "@/features/fleet/api/queries";
import { useColors } from "@/hooks/use-colors";

type MediaPreview = {
  uri: string;
  type: "image" | "video" | "pdf";
  name?: string;
};

export function CreatePostScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colors = useColors();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [media, setMedia] = useState<MediaPreview | null>(null);
  const { profile, session, showAuthModal } = useAuth();
  const { mutateAsync: createPost } = useCreateFleetPost();

  const videoPlayer = useVideoPlayer(media?.type === "video" ? media.uri : "", (player) => {
    player.loop = true;
    player.pause();
  });

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
        <Text className="text-muted-foreground text-center text-sm leading-6 max-w-70 mb-8 font-[Inter_400Regular]">
          Sign in to share your thoughts, images, videos, and PDFs with the XapXap community.
        </Text>
        <Button onPress={showAuthModal} className="w-full max-w-60 h-16 rounded-[28px] bg-primary">
          <Text className="text-primary-foreground font-bold text-lg font-[Inter_700Bold]">
            Sign in to XapXap
          </Text>
        </Button>
      </View>
    );
  }

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const type = asset.type === "video" ? "video" : "image";
        setMedia({ uri: asset.uri, type });
      }
    } catch {
      Alert.alert("Error", "Could not pick media.");
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setMedia({ uri: asset.uri, type: "pdf", name: asset.name });
      }
    } catch {
      Alert.alert("Error", "Could not pick document.");
    }
  };

  const submit = async () => {
    if (!text.trim() && !media) {
      Alert.alert("Empty wave", "Add a thought or media first.");
      return;
    }
    setBusy(true);
    try {
      await createPost({
        content: text,
        authorProfile: profile,
        mediaUrl: media?.uri,
        mediaType: media?.type,
      });
      if (Haptics.notificationAsync) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      }
      setText("");
      setMedia(null);
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
          <Glass radius={32} className="min-h-55 border border-border">
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

            {/* Media Preview */}
            {media && (
              <View className="px-6 pb-2">
                <View className="relative w-full h-48 rounded-2xl overflow-hidden border border-border bg-muted items-center justify-center">
                  {media.type === "image" && (
                    <Image
                      source={{ uri: media.uri }}
                      style={StyleSheet.absoluteFill}
                      contentFit="cover"
                    />
                  )}
                  {media.type === "video" && (
                    <Pressable
                      style={StyleSheet.absoluteFill}
                      onPress={() => {
                        if (videoPlayer.playing) videoPlayer.pause();
                        else videoPlayer.play();
                      }}>
                      <VideoView
                        style={StyleSheet.absoluteFill}
                        player={videoPlayer}
                        allowsPictureInPicture={false}
                        nativeControls={false}
                        contentFit="cover"
                      />
                    </Pressable>
                  )}
                  {media.type === "pdf" && (
                    <View className="items-center justify-center p-4">
                      <Icon as={FileTextIcon} size={48} className="text-magenta mb-2" />
                      <Text className="text-foreground font-bold text-center" numberOfLines={1}>
                        {media.name || "Selected PDF"}
                      </Text>
                    </View>
                  )}

                  <Pressable
                    onPress={() => setMedia(null)}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 items-center justify-center">
                    <Icon as={XIcon} size={16} className="text-white" />
                  </Pressable>
                </View>
              </View>
            )}

            <View className="flex-row justify-end p-5 pt-0">
              <Text className="text-muted-foreground font-medium text-xs">{text.length}/500</Text>
            </View>
          </Glass>

          <View className="flex-row gap-4">
            <Glass radius={24} className="flex-1 border border-border overflow-hidden">
              <Button
                variant="ghost"
                onPress={pickImage}
                className="flex-row items-center justify-center gap-3 py-5 p-0 min-w-0 min-h-0 h-auto w-auto active:bg-transparent bg-transparent">
                <Icon as={ImageIcon} className="text-accent" size={18} />
                <Text className="text-foreground font-bold text-sm">Photo / Video</Text>
              </Button>
            </Glass>
            <Glass radius={24} className="flex-1 border border-border overflow-hidden">
              <Button
                variant="ghost"
                onPress={pickDocument}
                className="flex-row items-center justify-center gap-3 py-5 p-0 min-w-0 min-h-0 h-auto w-auto active:bg-transparent bg-transparent">
                <Icon as={FileTextIcon} className="text-magenta" size={18} />
                <Text className="text-foreground font-bold text-sm">PDF</Text>
              </Button>
            </Glass>
          </View>

          <Button
            onPress={submit}
            isLoading={busy}
            disabled={!text.trim() && !media}
            className="h-20 rounded-4xl bg-primary">
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
