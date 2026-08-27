import { File, Paths } from "expo-file-system";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import * as MediaLibrary from "expo-media-library";
import { useFocusEffect, useRouter } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import {
  ArrowLeft,
  Download,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Share2,
  Trash2,
} from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Share,
  StyleSheet,
  TextInput,
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
import { useDeletePost, useEditPost } from "@/features/fleet/services/queries";
import { CommentsSheet } from "@/features/waves/components/CommentsSheet";
import { useColors } from "@/hooks/use-colors";

function isVideoType(mt: string | null | undefined) {
  return !!mt && (mt.startsWith("video/") || mt === "video");
}

function isDocType(mt: string | null | undefined) {
  return (
    mt === "application/pdf" ||
    mt === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  );
}

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
  const [showMore, setShowMore] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const editPost = useEditPost();
  const deletePost = useDeletePost();

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogMessage, setDialogMessage] = useState("");

  const showDialog = (title: string, message: string) => {
    setDialogTitle(title);
    setDialogMessage(message);
    setDialogOpen(true);
  };

  const handleStartEdit = () => {
    setEditText(item?.content || "");
    setEditing(true);
    setShowMenu(false);
  };

  const handleSaveEdit = async () => {
    if (!item || !session?.user?.id) return;
    try {
      await editPost.mutateAsync({
        postId: item.id,
        content: editText,
        authorProfile: { id: session.user.id },
      });
      setEditing(false);
    } catch {
      showDialog("Error", "Could not update your wave.");
    }
  };

  const handleDelete = async () => {
    if (!item) return;
    setDeleting(true);
    try {
      await deletePost.mutateAsync(item.id);
      router.back();
    } catch {
      showDialog("Error", "Could not delete the wave.");
      setDeleting(false);
    }
  };

  const { data: item, isLoading } = useFamePost(postId, session?.user?.id || null);

  const isAuthor = session?.user?.id && item?.author?.id === session.user.id;

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
        if (item.mediaType?.startsWith("image/") || isVideoType(item.mediaType)) {
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
    isVideoType(item?.mediaType) && item?.mediaUrl ? { uri: item.mediaUrl } : null;

  const player = useVideoPlayer(videoSource, (player) => {
    player.loop = true;
  });

  useFocusEffect(
    useCallback(() => {
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
          /* ignore */
        }
      };
    }, [player, videoSource])
  );

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

    if (isVideoType(item.mediaType)) {
      return (
        <View style={StyleSheet.absoluteFill} className="bg-zinc-950">
          <VideoView player={player} style={StyleSheet.absoluteFill} contentFit="cover" />
        </View>
      );
    }

    if (isDocType(item.mediaType)) {
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
        <Image source={imageUrl} style={StyleSheet.absoluteFill} contentFit="contain" />
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
          <Button onPress={() => router.replace("/(tabs)")} size="lg" className="rounded-2xl">
            <Text>Go Home</Text>
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

      {/* More Menu Button (author only) */}
      {isAuthor && !editing && (
        <View
          style={{ position: "absolute", top: insets.top + 12, right: 16, zIndex: 50 }}
          pointerEvents="box-none">
          <Button
            variant="ghost"
            onPress={() => setShowMenu(!showMenu)}
            className="w-10 h-10 rounded-full bg-muted/60 backdrop-blur-xl items-center justify-center border border-border p-0 min-w-0 min-h-0">
            <Icon as={MoreHorizontal} size={20} className="text-foreground" />
          </Button>

          {/* Dropdown Menu */}
          {showMenu && (
            <View
              className="absolute right-0 top-12 bg-background border border-border rounded-2xl overflow-hidden shadow-lg"
              style={{ width: 160 }}>
              <Button
                variant="ghost"
                onPress={handleStartEdit}
                className="flex-row items-center gap-3 px-4 py-3 rounded-none justify-start min-h-0 min-w-0 bg-transparent active:bg-muted">
                <Icon as={Pencil} size={16} className="text-foreground" />
                <Text className="text-foreground text-sm font-medium">Edit Wave</Text>
              </Button>
              <Button
                variant="ghost"
                onPress={() => {
                  setConfirmDeleteOpen(true);
                  setShowMenu(false);
                }}
                className="flex-row items-center gap-3 px-4 py-3 rounded-none justify-start min-h-0 min-w-0 bg-transparent active:bg-muted">
                <Icon as={Trash2} size={16} className="text-destructive" />
                <Text className="text-destructive text-sm font-medium">Delete Wave</Text>
              </Button>
            </View>
          )}
        </View>
      )}

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
              {showMore
                ? item.content
                : `${item.content?.substring(0, 200)}${(item.content?.length ?? 0) > 200 ? "..." : ""}`}
            </Text>
            {(item.content?.length ?? 0) > 200 ? (
              showMore ? (
                <Button
                  variant="ghost"
                  onPress={() => setShowMore(false)}
                  className="text-primary text-xs font-bold uppercase tracking-wider mt-2">
                  <Text className="text-primary text-xs font-bold uppercase tracking-wider">
                    Read Less
                  </Text>
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  onPress={() => setShowMore(true)}
                  className="text-primary text-xs font-bold uppercase tracking-wider mt-2">
                  <Text className="text-primary text-xs font-bold uppercase tracking-wider">
                    Read More
                  </Text>
                </Button>
              )
            ) : null}
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
                {item.counts?.comments ?? 0}
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

            {item.mediaUrl && !isAuthor && (
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

      {/* Edit Overlay */}
      {editing && (
        <View
          className="absolute inset-0 bg-background/95 z-40"
          style={{
            paddingTop: insets.top + 60,
            paddingBottom: insets.bottom + 20,
            paddingHorizontal: 24,
          }}>
          <Text className="text-foreground font-bold text-lg mb-4">Edit Wave</Text>
          <TextInput
            value={editText}
            onChangeText={setEditText}
            multiline
            className="text-foreground text-base leading-6 bg-muted rounded-2xl p-4 border border-border min-h-[120px]"
            placeholderTextColor={colors.mutedForeground}
            placeholder="What's on your mind?"
            textAlignVertical="top"
          />
          <View className="flex-row gap-3 mt-4">
            <Button
              variant="ghost"
              onPress={() => setEditing(false)}
              className="flex-1 h-14 rounded-2xl bg-muted border border-border">
              <Text className="text-foreground font-bold">Cancel</Text>
            </Button>
            <Button
              onPress={handleSaveEdit}
              disabled={!editText.trim() || editPost.isPending}
              className="flex-1 h-14 rounded-2xl bg-primary">
              {editPost.isPending ? (
                <ActivityIndicator color={colors.primaryForeground} />
              ) : (
                <Text className="text-primary-foreground font-bold">Save</Text>
              )}
            </Button>
          </View>
        </View>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <DialogContent className="mx-6">
          <DialogHeader>
            <DialogTitle>Delete Wave</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this wave? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-2 flex-row gap-3">
            <Button
              variant="ghost"
              onPress={() => setConfirmDeleteOpen(false)}
              className="flex-1 rounded-full bg-muted border border-border">
              <Text className="text-foreground font-bold">Cancel</Text>
            </Button>
            <Button
              onPress={handleDelete}
              disabled={deleting}
              className="flex-1 rounded-full bg-destructive">
              {deleting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-destructive-foreground font-bold">Delete</Text>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
