import { FlashList } from "@shopify/flash-list";
import type { FameBurstItem } from "@xapxap/types";
import * as FileSystem from "expo-file-system/legacy";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import * as MediaLibrary from "expo-media-library";
import { useRouter } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import { Download, Heart, MessageCircle, Share2, SparklesIcon } from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Share,
  StyleSheet,
  useWindowDimensions,
  View,
  type ViewToken,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ErrorBoundary } from "@/components/error-boundary/ErrorBoundary";
import { Glass } from "@/components/layout/Glass";
import { XapXapHeader } from "@/components/layout/XapXapHeader";
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
import { useFameBurst, useToggleFameInteraction } from "@/features/fame/services/queries";
import { CommentsSheet } from "@/features/waves/components/CommentsSheet";
import { useColors } from "@/hooks/use-colors";
import { useNetwork } from "@/hooks/use-network";
import { useRealtimeFleetPosts } from "@/hooks/use-realtime";
import { cn } from "@/lib/utils";

type FameItemProps = {
  item: FameBurstItem;
  onShowComments: () => void;
  onPressPost: () => void;
  isActive: boolean;
};

function FameItem({ item, onShowComments, onPressPost, isActive }: FameItemProps) {
  const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colors = useColors();
  const [timeLeft, setTimeLeft] = useState(60);
  const [downloading, setDownloading] = useState(false);
  const { session, showAuthModal } = useAuth();
  const { mutate: toggleInteraction } = useToggleFameInteraction(session?.user?.id || null);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogMessage, setDialogMessage] = useState("");

  const showDialog = (title: string, message: string) => {
    setDialogTitle(title);
    setDialogMessage(message);
    setDialogOpen(true);
  };

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
      const fileUri = `${FileSystem.documentDirectory}${filename}`;

      const downloadResumable = FileSystem.createDownloadResumable(uri, fileUri);
      const result = await downloadResumable.downloadAsync();

      if (result?.uri) {
        if (item.mediaType?.startsWith("image/") || item.mediaType?.startsWith("video/")) {
          await MediaLibrary.saveToLibraryAsync(result.uri);
          showDialog("Downloaded", "Saved to your media library.");
        } else {
          showDialog("Downloaded", `Saved to ${result.uri}`);
        }
      }
    } catch (error) {
      console.error(error);
      showDialog("Download failed", "Could not download the file. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const videoSource =
    item.mediaType?.startsWith("video/") && item.mediaUrl ? { uri: item.mediaUrl } : null;

  const player = useVideoPlayer(videoSource, (player) => {
    player.loop = true;
  });

  useEffect(() => {
    if (isActive) {
      try {
        player?.play();
      } catch {
        /* ignore if not ready */
      }
    } else {
      try {
        player?.pause();
      } catch {
        /* ignore if not ready or already released */
      }
    }
  }, [isActive, player]);

  useEffect(() => {
    if (item.fame_heuristics?.burstEndedAt) {
      const end = new Date(item.fame_heuristics.burstEndedAt).getTime();
      const interval = setInterval(() => {
        const now = Date.now();
        const diff = Math.max(0, Math.floor((end - now) / 1000));
        setTimeLeft(diff);
        if (diff === 0) clearInterval(interval);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [item.fame_heuristics?.burstEndedAt]);

  const renderMedia = () => {
    const imageUrl = typeof item.mediaUrl === "string" ? { uri: item.mediaUrl } : item.mediaUrl;

    if (isActive) {
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
        return (
          <View style={StyleSheet.absoluteFill} className="bg-zinc-900 items-center justify-center">
            <Text className="text-white text-lg font-bold mb-2">Document</Text>
            <Text className="text-white/60 text-sm">Tap to view full document</Text>
          </View>
        );
      }

      // Active state for images (no play button)
      return (
        <View style={StyleSheet.absoluteFill} className="bg-zinc-950">
          <Image source={imageUrl} style={StyleSheet.absoluteFill} contentFit="cover" />
        </View>
      );
    }

    // Lightweight poster image (For docs and unrendered items)
    if (
      item.mediaType === "application/pdf" ||
      item.mediaType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      return (
        <View style={StyleSheet.absoluteFill} className="bg-zinc-900 items-center justify-center">
          <Text className="text-white text-lg font-bold">Document Preview</Text>
        </View>
      );
    }

    return (
      <View style={StyleSheet.absoluteFill} className="bg-zinc-900">
        <Image
          source={imageUrl}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          className="opacity-50"
        />
      </View>
    );
  };

  const isDocument =
    item.mediaType === "application/pdf" ||
    item.mediaType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

  return (
    <View style={{ height: SCREEN_HEIGHT, width: SCREEN_WIDTH }} className="bg-background">
      {/* Background Media - tappable for documents */}
      {isDocument ? (
        <Button
          variant="ghost"
          onPress={onPressPost}
          className="absolute inset-0 p-0 min-w-0 min-h-0 h-auto w-auto bg-transparent active:bg-transparent">
          {renderMedia()}
        </Button>
      ) : (
        renderMedia()
      )}

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
        {/* Top: Fame Time Remaining (Hidden by default) */}
        {false && (
          <View className="flex-row justify-center" pointerEvents="box-none">
            <View className="px-6 py-3 rounded-full flex-row items-center gap-2.5 border border-primary/30 bg-background/70">
              <View className="w-2.5 h-2.5 rounded-full bg-primary shadow-lg shadow-primary/50" />
              <Text
                className="font-bold text-primary text-sm uppercase tracking-widest"
                style={{
                  textShadowColor: colors.background,
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 3,
                }}>
                Fame Pulse: {timeLeft}s
              </Text>
            </View>
          </View>
        )}

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
            <Text className="text-foreground/95 text-base leading-6 font-medium" numberOfLines={3}>
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
                className={cn(
                  "w-14 h-14 rounded-full items-center justify-center border backdrop-blur-xl p-0 min-w-0 min-h-0 bg-muted/30 border-border active:bg-muted/50",
                  item.myInteractions?.hug && "bg-primary/20 border-primary"
                )}>
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
                onPress={onShowComments}
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

export function FameFeedScreen() {
  const { session } = useAuth();
  useRealtimeFleetPosts();
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useFameBurst(
    session?.user?.id || null
  );
  const { isOnline } = useNetwork();
  const insets = useSafeAreaInsets();
  const { height: SCREEN_HEIGHT } = useWindowDimensions();
  const colors = useColors();
  const router = useRouter();
  const [showComments, setShowComments] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 80,
  }).current;

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setActiveIndex(viewableItems[0].index);
      }
    },
    []
  );

  const posts = data?.pages.flatMap((page) => page.data) ?? [];

  if (!isOnline) {
    return (
      <View className="flex-1 items-center justify-center bg-background p-6">
        <Glass className="p-6 items-center">
          <Text variant="h3" className="mb-2">
            You're Offline
          </Text>
          <Text className="text-muted-foreground text-center">
            The Fame engine requires a signal. Displaying cached waves…
          </Text>
        </Glass>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <View className="flex-1 bg-background">
        <View style={{ position: "absolute", top: insets.top, left: 0, right: 0, zIndex: 50 }}>
          <XapXapHeader />
        </View>
        <FlashList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <FameItem
              item={item}
              isActive={index === activeIndex}
              onShowComments={() => {
                setSelectedPostId(item.id);
                setShowComments(true);
              }}
              onPressPost={() => {
                router.push(`/post/${item.id}`);
              }}
            />
          )}
          pagingEnabled={true}
          snapToInterval={SCREEN_HEIGHT}
          snapToAlignment="start"
          decelerationRate="fast"
          disableIntervalMomentum={true}
          showsVerticalScrollIndicator={false}
          viewabilityConfig={viewabilityConfig}
          onViewableItemsChanged={onViewableItemsChanged}
          extraData={activeIndex}
          getItemType={(item) => item.mediaType ?? undefined}
          onEndReached={() => {
            if (hasNextPage) fetchNextPage();
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetchingNextPage ? (
              <View className="py-10">
                <ActivityIndicator color={colors.primary} />
              </View>
            ) : null
          }
          ListEmptyComponent={
            !isLoading && !isFetchingNextPage ? (
              <View
                style={{ height: SCREEN_HEIGHT, paddingTop: insets.top + 100 }}
                className="items-center px-6">
                <Glass radius={32} className="p-8 items-center border border-border w-full">
                  <Icon as={SparklesIcon} size={48} className="text-muted-foreground mb-4" />
                  <Text className="text-foreground font-bold text-xl mb-2 text-center">
                    No Fame Pulses
                  </Text>
                  <Text className="text-muted-foreground text-center">
                    There are currently no waves riding the fame burst. Check back later!
                  </Text>
                </Glass>
              </View>
            ) : null
          }
        />

        <Modal
          visible={showComments}
          animationType="none"
          transparent={true}
          onRequestClose={() => {
            setShowComments(false);
            setSelectedPostId(null);
          }}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <View className="flex-1 bg-transparent">
              <CommentsSheet
                postId={selectedPostId}
                onClose={() => {
                  setShowComments(false);
                  setSelectedPostId(null);
                }}
              />
            </View>
          </GestureHandlerRootView>
        </Modal>
      </View>
    </ErrorBoundary>
  );
}
