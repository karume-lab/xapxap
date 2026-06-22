import * as DocumentPicker from "expo-document-picker";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import {
  Anchor,
  Cpu,
  FileText,
  Image as ImageIcon,
  Mail,
  Radio,
  Send,
  X,
} from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Glass } from "@/components/layout/Glass";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/contexts/auth-context";
import { useCreateFleetPost } from "@/features/fleet/api/queries";
import { useColors } from "@/hooks/use-colors";
import { cn } from "@/lib/utils";

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
  const [postDestination, setPostDestination] = useState<"feed" | "fleet" | "inbox">("feed");
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
          <Icon as={Send} size={32} className="text-primary mr-1 mt-0.5" />
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
                      <Icon as={FileText} size={48} className="text-magenta mb-2" />
                      <Text className="text-foreground font-bold text-center" numberOfLines={1}>
                        {media.name || "Selected PDF"}
                      </Text>
                    </View>
                  )}

                  <Pressable
                    onPress={() => setMedia(null)}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 items-center justify-center">
                    <Icon as={X} size={16} className="text-white" />
                  </Pressable>
                </View>
              </View>
            )}

            <View className="flex-row justify-between items-center p-5 pt-0">
              <Text className="text-muted-foreground font-medium text-xs">{text.length}/500</Text>
              <Button
                variant="ghost"
                className="flex-row items-center gap-2 rounded-full border border-[#0ea5e9]/30 bg-[#0ea5e9]/10 px-4 py-2 min-h-0 min-w-0 h-auto active:bg-[#0ea5e9]/20">
                <Icon as={Cpu} size={14} className="text-[#0ea5e9]" />
                <Text className="text-[#0ea5e9] font-bold text-xs">AI Assist</Text>
              </Button>
            </View>
          </Glass>

          <View className="flex-row gap-4">
            <Pressable
              onPress={pickImage}
              className="flex-1 flex-row items-center justify-center gap-3 h-14 rounded-full border border-border bg-muted/20 active:bg-muted/40">
              <Icon as={ImageIcon} className="text-[#0ea5e9]" size={18} />
              <Text className="text-foreground font-bold text-sm">Photo / Video</Text>
            </Pressable>
            <Pressable
              onPress={pickDocument}
              className="flex-1 flex-row items-center justify-center gap-3 h-14 rounded-full border border-border bg-muted/20 active:bg-muted/40">
              <Icon as={FileText} className="text-magenta" size={18} />
              <Text className="text-foreground font-bold text-sm">PDF</Text>
            </Pressable>
          </View>

          {/* POST TO Section */}
          <View className="mt-2">
            <Text className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 ml-1">
              POST TO
            </Text>
            <View className="flex-row gap-3">
              {/* Feed */}
              <Pressable
                onPress={() => setPostDestination("feed")}
                className={cn(
                  "flex-1 p-4 rounded-3xl items-center justify-center border",
                  postDestination === "feed"
                    ? "bg-primary/10 border-primary"
                    : "bg-muted/40 border-transparent"
                )}>
                <Icon
                  as={Radio}
                  size={22}
                  className={cn(
                    "mb-2",
                    postDestination === "feed" ? "text-primary" : "text-muted-foreground"
                  )}
                />
                <Text
                  className={cn(
                    "font-bold text-[13px] mb-0.5",
                    postDestination === "feed" ? "text-primary" : "text-foreground"
                  )}>
                  Feed
                </Text>
                <Text
                  className={cn(
                    "text-[10px]",
                    postDestination === "feed" ? "text-primary/60" : "text-muted-foreground"
                  )}>
                  Public
                </Text>
              </Pressable>
              {/* Fleet */}
              <Pressable
                onPress={() => setPostDestination("fleet")}
                className={cn(
                  "flex-1 p-4 rounded-3xl items-center justify-center border",
                  postDestination === "fleet"
                    ? "bg-primary/10 border-primary"
                    : "bg-muted/40 border-transparent"
                )}>
                <Icon
                  as={Anchor}
                  size={22}
                  className={cn(
                    "mb-2",
                    postDestination === "fleet" ? "text-primary" : "text-muted-foreground"
                  )}
                />
                <Text
                  className={cn(
                    "font-bold text-[13px] mb-0.5",
                    postDestination === "fleet" ? "text-primary" : "text-foreground"
                  )}>
                  Fleet
                </Text>
                <Text
                  className={cn(
                    "text-[10px]",
                    postDestination === "fleet" ? "text-primary/60" : "text-muted-foreground"
                  )}>
                  Deck
                </Text>
              </Pressable>
              {/* Inbox */}
              <Pressable
                onPress={() => setPostDestination("inbox")}
                className={cn(
                  "flex-1 p-4 rounded-3xl items-center justify-center border",
                  postDestination === "inbox"
                    ? "bg-primary/10 border-primary"
                    : "bg-muted/40 border-transparent"
                )}>
                <Icon
                  as={Mail}
                  size={22}
                  className={cn(
                    "mb-2",
                    postDestination === "inbox" ? "text-primary" : "text-muted-foreground"
                  )}
                />
                <Text
                  className={cn(
                    "font-bold text-[13px] mb-0.5",
                    postDestination === "inbox" ? "text-primary" : "text-foreground"
                  )}>
                  Inbox
                </Text>
                <Text
                  className={cn(
                    "text-[10px]",
                    postDestination === "inbox" ? "text-primary/60" : "text-muted-foreground"
                  )}>
                  Private
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Dynamic Content based on Destination */}
          {postDestination === "fleet" && (
            <View className="mt-6 mb-2">
              <Text className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-8 ml-1">
                CHOOSE FLEET DECK
              </Text>
              <View className="items-center justify-center pb-4">
                <ActivityIndicator color={colors.primary} />
              </View>
            </View>
          )}

          <Button
            onPress={submit}
            isLoading={busy}
            disabled={!text.trim() && !media}
            className="h-16 rounded-full bg-primary mt-4">
            <View className="flex-row items-center gap-3">
              <Icon as={Send} className="text-primary-foreground" size={18} />
              <Text className="text-primary-foreground font-bold text-lg">Drop the wave</Text>
            </View>
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}
