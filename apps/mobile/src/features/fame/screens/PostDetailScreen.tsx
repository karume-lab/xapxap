import { File, Paths } from "expo-file-system";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import * as MediaLibrary from "expo-media-library";
import { useRouter } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import { ArrowLeft, Download, Heart, MessageCircle, Share2 } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Share,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { Glass } from "@/components/layout/Glass";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/contexts/auth-context";
import { useFamePost, useToggleFameInteraction } from "@/features/fame/services/queries";
import { CommentsSheet } from "@/features/waves/components/CommentsSheet";
import { useColors } from "@/hooks/use-colors";

interface PostDetailScreenProps {
  postId: string;
}

export function PostDetailScreen({ postId }: PostDetailScreenProps) {
  const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colors = useColors();
  const { session, showAuthModal } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogMessage, setDialogMessage] = useState("");

  const showDialog = (title: string, message: string) => {
    setDialogTitle(title);
    setDialogMessage(message);
    setDialogOpen(true);
  };

  const { data: item, isLoading } = useFamePost(postId);

  const handleDownload = async () => {
    if (!item?.mediaUrl) return;

    try {
      setDownloading(true);
      const uri = typeof item.mediaUrl === "string" ? item.mediaUrl : "";
      if (!uri) return;

      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        showDialog("Permission required", "Permission to access media library is required.");
        return;
      }

      const filename = uri.split("/").pop() || "download";

      const file = await File.downloadFileAsync(uri, new File(Paths.document, filename), {
        idempotent: true,
      });

      if (file.exists) {
        if (item.mediaType?.startsWith("image/") || item.mediaType?.startsWith("video/")) {
          await MediaLibrary.Asset.create(file.uri);
          showDialog("Downloaded", "Saved to your media library.");
        } else {
          showDialog("Downloaded", `Saved to ${file.uri}`);
        }
      }
    } catch (error) {
      console.error(error);
      showDialog("Download failed", "Could not download the file. Please try again.");
    } finally {
      setDownloading(false);
    }
  };
  const { mutate: toggleInteraction } = useToggleFameInteraction(session?.user?.id || null);

  const videoSource =
    item?.mediaType?.startsWith("video/") && item?.mediaUrl ? { uri: item.mediaUrl } : null;

  const player = useVideoPlayer(videoSource, (player) => {
    player.loop = true;
  });

  useEffect(() => {
    if (videoSource) {
      try {
        player?.play();
      } catch {
        /* ignore */
      }
    }
    return () => {
      try {
        player?.pause();
      } catch {
        /* ignore if already released */
      }
    };
  }, [player, videoSource]);

  const renderMedia = () => {
    if (!item) return null;
    const imageUrl = typeof item.mediaUrl === "string" ? { uri: item.mediaUrl } : item.mediaUrl;

    if (item.mediaType?.startsWith("video/")) {
      return (
        <View style={StyleSheet.absoluteFill} className="bg-zinc-950">
          <VideoView player={player} style={StyleSheet.absoluteFill} contentFit="cover" />
        </View>
      );
    }

    if (
      item.mediaType === "application/pdf" ||
      item.mediaType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const uri = typeof item.mediaUrl === "string" ? item.mediaUrl : "";
      const googleDocsUrl = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(uri)}`;

      return (
        <View style={StyleSheet.absoluteFill} className="bg-zinc-950 pt-20">
          <WebView
            source={{ uri: googleDocsUrl }}
            style={{ flex: 1, backgroundColor: "transparent" }}
            showsVerticalScrollIndicator={false}
          />
        </View>
      );
    }

    return (
      <View style={StyleSheet.absoluteFill} className="bg-zinc-950">
        <Image source={imageUrl} style={StyleSheet.absoluteFill} contentFit="cover" />
      </View>
    );
  };

  if (isLoading) {
    return (
      <View
        style={{ height: SCREEN_HEIGHT, width: SCREEN_WIDTH }}
        className="bg-background items-center justify-center">
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!item) {
    return (
      <View
        style={{ height: SCREEN_HEIGHT, width: SCREEN_WIDTH }}
        className="bg-background items-center justify-center px-6">
        <Glass radius={32} className="p-8 items-center border border-border w-full">
          <Text className="text-foreground font-bold text-xl mb-2 text-center">Post Not Found</Text>
          <Text className="text-muted-foreground text-center mb-4">
            This wave may have been deleted or is no longer available.
          </Text>
          <Button onPress={() => router.back()} size="lg" className="rounded-2xl">
            <Text>Go Back</Text>
          </Button>
        </Glass>
      </View>
    );
  }

  return (
    <View style={{ height: SCREEN_HEIGHT, width: SCREEN_WIDTH }} className="bg-background">
      {/* Back Button */}
      <View
        style={{ position: "absolute", top: insets.top + 12, left: 16, zIndex: 50 }}
        pointerEvents="box-none">
        <Button
          variant="ghost"
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-muted/60 backdrop-blur-xl items-center justify-center border border-border p-0 min-w-0 min-h-0">
          <Icon as={ArrowLeft} size={20} className="text-foreground" />
        </Button>
      </View>

      {/* Background Media */}
      {renderMedia()}

      {/* Dark Overlay for legibility */}
      <LinearGradient
        colors={["transparent", `${colors.background}cc`, colors.background]}
        locations={[0, 0.55, 1]}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 480,
          pointerEvents: "none",
        }}
      />

      {/* Overlays */}
      <View
        className="absolute inset-0 justify-end p-6"
        style={{
          paddingTop: insets.top + 85,
          paddingBottom: insets.bottom + 80,
          pointerEvents: "box-none",
        }}>
        {/* Bottom: Post Info & Engagement */}
        <View className="flex-row items-end justify-between gap-6" pointerEvents="box-none">
          <View className="flex-1" pointerEvents="box-none">
            <Button
              variant="ghost"
              onPress={() =>
                router.push({
                  pathname: "/profile/[id]",
                  params: { id: item.author.id, username: item.author.username },
                })
              }
              className="justify-start items-center flex-row gap-3 mb-3 p-0 px-0 py-0 h-auto w-auto bg-transparent active:bg-transparent">
              <View className="flex-row items-center gap-3">
                <Avatar
                  url={item.author.avatarUrl}
                  username={item.author.username}
                  size={48}
                  ring
                />
                <View>
                  <Text className="font-bold text-foreground text-lg">@{item.author.username}</Text>
                  <Text className="text-primary text-[10px] font-bold uppercase tracking-tighter">
                    Rising Star
                  </Text>
                </View>
              </View>
            </Button>
            <Text className="text-foreground/95 text-base leading-6 font-medium">
              {item.content}
            </Text>
          </View>

          {/* Engagement Buttons */}
          <View className="gap-5 items-center" pointerEvents="box-none">
            <View className="items-center">
              <Button
                variant="ghost"
                onPress={() => {
                  if (!session) return showAuthModal();
                  toggleInteraction({ postId: item.id, type: "hug" });
                }}
                className="bg-muted/30 w-14 h-14 rounded-full items-center justify-center border backdrop-blur-xl p-0 min-w-0 min-h-0 border-border active:bg-muted/50"
                style={
                  item.myInteractions?.hug
                    ? { backgroundColor: `${colors.primary}33`, borderColor: colors.primary }
                    : {}
                }>
                <Icon
                  as={Heart}
                  color={item.myInteractions?.hug ? colors.primary : colors.foreground}
                  fill={item.myInteractions?.hug ? colors.primary : "transparent"}
                  size={26}
                />
              </Button>
              <Text className="text-foreground text-xs mt-1.5 font-bold">
                {item.counts?.hugs ?? 0}
              </Text>
            </View>

            <View className="items-center">
              <Button
                variant="ghost"
                onPress={() => setShowComments(true)}
                className="bg-muted/30 w-14 h-14 rounded-full items-center justify-center border border-border backdrop-blur-xl active:bg-muted/50 p-0 min-w-0 min-h-0">
                <Icon as={MessageCircle} className="text-foreground" size={26} />
              </Button>
              <Text className="text-foreground text-xs mt-1.5 font-bold">
                {item.counts?.echoes ?? 0}
              </Text>
            </View>

            <Button
              variant="ghost"
              onPress={async () => {
                try {
                  const shareContent: { message: string; url?: string } = {
                    message: `Check out this wave by @${item.author.username} on XapXap!\n\n"${item.content}"`,
                  };
                  if (item.mediaUrl && typeof item.mediaUrl === "string") {
                    shareContent.url = item.mediaUrl;
                  }
                  await Share.share(shareContent);
                } catch (error) {
                  console.error("Sharing failed", error);
                }
              }}
              className="bg-muted/30 w-14 h-14 rounded-full items-center justify-center border border-border backdrop-blur-xl active:bg-muted/50 p-0 min-w-0 min-h-0">
              <Icon as={Share2} className="text-foreground" size={26} />
            </Button>

            {item.mediaUrl && (
              <Button
                variant="ghost"
                onPress={handleDownload}
                disabled={downloading}
                className="bg-muted/30 w-14 h-14 rounded-full items-center justify-center border border-border backdrop-blur-xl active:bg-muted/50 p-0 min-w-0 min-h-0">
                {downloading ? (
                  <ActivityIndicator color={colors.foreground} />
                ) : (
                  <Icon as={Download} className="text-foreground" size={26} />
                )}
              </Button>
            )}
          </View>
        </View>
      </View>

      {/* Comments Modal */}
      <Modal
        visible={showComments}
        animationType="none"
        transparent={true}
        onRequestClose={() => setShowComments(false)}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <View className="flex-1 bg-transparent">
            <CommentsSheet postId={item.id} onClose={() => setShowComments(false)} />
          </View>
        </GestureHandlerRootView>
      </Modal>

      {/* In-app alert dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="mx-6">
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription>{dialogMessage}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-2">
            <Button onPress={() => setDialogOpen(false)} className="rounded-full">
              <Text className="text-primary-foreground font-bold">OK</Text>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </View>
  );
}
