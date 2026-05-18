import BottomSheet, {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetScrollView,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import { HeartIcon, MessageCircleIcon, SendIcon, XIcon } from "lucide-react-native";
import { useCallback, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Dimensions, View } from "react-native";
import type { TextInput } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Glass } from "@/components/layout/Glass";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/contexts/auth-context";
import { useAddComment, useComments, useToggleCommentLike } from "@/features/waves/api/comments";
import { useColors } from "@/hooks/use-colors";
import type { FleetPostWithAuthor } from "@/lib/types";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface CommentsSheetProps {
  postId: string | null;
  onClose: () => void;
}

function formatTimeAgo(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

function CommentItem({
  comment,
  onReply,
  onLike,
  isReply = false,
}: {
  comment: FleetPostWithAuthor;
  onReply: () => void;
  onLike: () => void;
  isReply?: boolean;
}) {
  const router = useRouter();
  const liked = comment.myInteractions?.hug ?? false;
  const likesCount = comment.counts?.hugs ?? 0;
  const colors = useColors();

  const handleProfilePress = () => {
    router.push({
      pathname: "/profile/[id]",
      params: { id: comment.author.id, username: comment.author.username },
    });
  };

  return (
    <View
      className={`flex-row gap-3 py-3 ${isReply ? "pl-11 mt-1" : "border-b border-border px-6"}`}>
      <Button
        variant="ghost"
        onPress={handleProfilePress}
        className="p-0 h-auto w-auto active:opacity-75 bg-transparent active:bg-transparent min-w-0 min-h-0">
        <Avatar username={comment.author.username} url={comment.author.avatarUrl} size={32} />
      </Button>
      <View className="flex-1 gap-1">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <Button
              variant="ghost"
              onPress={handleProfilePress}
              className="flex-row items-center gap-2 p-0 h-auto w-auto active:opacity-75 bg-transparent active:bg-transparent min-w-0 min-h-0">
              <Text className="text-foreground font-bold text-sm">@{comment.author.username}</Text>
              {comment.author.isPremium && (
                <View className="px-1.5 py-0.5 rounded bg-primary/20">
                  <Text className="text-primary text-[8px] font-bold uppercase font-[Inter_700Bold]">
                    PRO
                  </Text>
                </View>
              )}
            </Button>
            <Text className="text-muted-foreground text-xs font-[Inter_400Regular]">
              {formatTimeAgo(comment.createdAt ?? new Date())}
            </Text>
          </View>

          {/* Like Button */}
          <Button
            variant="ghost"
            onPress={onLike}
            className="flex-row items-center gap-1.5 active:scale-90 pr-2 p-0 h-auto w-auto bg-transparent active:bg-transparent min-w-0 min-h-0">
            <Icon
              as={HeartIcon}
              size={14}
              color={liked ? colors.destructive : colors.mutedForeground}
              fill={liked ? colors.destructive : "transparent"}
            />
            {likesCount > 0 && (
              <Text
                className={`text-xs font-semibold ${liked ? "text-destructive" : "text-muted-foreground"}`}>
                {likesCount}
              </Text>
            )}
          </Button>
        </View>

        <Text className="text-foreground text-sm leading-5 font-[Inter_400Regular]">
          {comment.content}
        </Text>

        {!isReply && (
          <Button
            variant="ghost"
            onPress={onReply}
            className="mt-1 active:opacity-75 self-start p-0 h-auto w-auto bg-transparent active:bg-transparent min-w-0 min-h-0">
            <Text className="text-primary font-bold text-xs font-[Inter_600SemiBold]">Reply</Text>
          </Button>
        )}
      </View>
    </View>
  );
}

export function CommentsSheet({ postId, onClose }: CommentsSheetProps) {
  const insets = useSafeAreaInsets();
  const { profile, session, showAuthModal } = useAuth();
  const [commentText, setCommentText] = useState("");
  const [replyTo, setReplyTo] = useState<FleetPostWithAuthor | null>(null);
  const inputRef = useRef<TextInput>(null);
  const sheetRef = useRef<BottomSheet>(null);

  const { data: comments = [], isLoading } = useComments(postId);
  const { mutate: addComment } = useAddComment();
  const { mutate: toggleLike } = useToggleCommentLike();

  const handleSend = () => {
    if (!session) return showAuthModal();
    if (!commentText.trim() || !postId || !profile) return;

    addComment({
      postId,
      parentId: replyTo?.id ?? postId,
      content: commentText.trim(),
      author: {
        id: profile.id,
        username: profile.username,
        avatarUrl: profile.avatarUrl,
        isPremium: profile.isPremium ?? false,
      },
    });

    setCommentText("");
    setReplyTo(null);
  };

  const handleReplyPress = (comment: FleetPostWithAuthor) => {
    if (!session) return showAuthModal();
    setReplyTo(comment);
    inputRef.current?.focus();
  };

  const topLevelComments = comments.filter((c) => c.parentId === postId);
  const replies = comments.filter((c) => c.parentId !== postId);

  const colors = useColors();
  const snapPoints = useMemo(() => [SCREEN_HEIGHT * 0.5, SCREEN_HEIGHT * 0.75, SCREEN_HEIGHT], []);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.4}
        enableTouchThrough={false}
      />
    ),
    []
  );

  return (
    <BottomSheet
      ref={sheetRef}
      snapPoints={snapPoints}
      index={0}
      enablePanDownToClose
      onClose={onClose}
      backdropComponent={renderBackdrop}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      backgroundStyle={{
        backgroundColor: colors.background,
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        borderWidth: 1,
        borderColor: colors.border,
      }}
      handleIndicatorStyle={{ backgroundColor: colors.secondary, width: 40 }}
      handleStyle={{ paddingTop: 12, paddingBottom: 4 }}>
      <View className="flex-1">
        {/* Header */}
        <View className="px-6 py-4 flex-row justify-between items-center border-b border-border">
          <Text className="text-foreground font-bold text-lg font-[Inter_700Bold]">
            Comments ({comments.length})
          </Text>
          <Button
            variant="ghost"
            onPress={() => sheetRef.current?.close()}
            className="w-8 h-8 rounded-full bg-muted items-center justify-center p-0 min-w-0 min-h-0 active:bg-transparent">
            <Icon as={XIcon} size={18} className="text-foreground" />
          </Button>
        </View>

        <BottomSheetScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
          {isLoading ? (
            <View className="flex-1 items-center justify-center py-20">
              <ActivityIndicator color={colors.primary} size="small" />
            </View>
          ) : topLevelComments.length === 0 ? (
            <View className="flex-1 items-center justify-center p-12">
              <View className="w-20 h-20 rounded-full bg-muted items-center justify-center mb-6">
                <Icon as={MessageCircleIcon} size={40} className="text-muted-foreground" />
              </View>
              <Text className="text-muted-foreground text-center text-sm leading-6 font-[Inter_400Regular]">
                No comments yet. Be the first to start the conversation.
              </Text>
            </View>
          ) : (
            <View className="flex-1">
              {topLevelComments.map((topComment) => {
                const commentReplies = replies.filter((r) => r.parentId === topComment.id);
                return (
                  <View key={topComment.id}>
                    {/* Top Level Comment */}
                    <CommentItem
                      comment={topComment}
                      onReply={() => handleReplyPress(topComment)}
                      onLike={() => {
                        if (!session) return showAuthModal();
                        toggleLike({ commentId: topComment.id, postId: postId ?? "" });
                      }}
                    />

                    {/* Indented Replies */}
                    {commentReplies.map((reply) => (
                      <CommentItem
                        key={reply.id}
                        comment={reply}
                        isReply
                        onReply={() => {}}
                        onLike={() => {
                          if (!session) return showAuthModal();
                          toggleLike({ commentId: reply.id, postId: postId ?? "" });
                        }}
                      />
                    ))}
                  </View>
                );
              })}
            </View>
          )}
        </BottomSheetScrollView>

        {/* Bottom Bar */}
        <View>
          {/* Reply Indicator */}
          {replyTo && (
            <View className="bg-muted border-t border-border px-6 py-2 flex-row justify-between items-center">
              <Text className="text-muted-foreground text-xs font-[Inter_400Regular]">
                Replying to{" "}
                <Text className="text-primary font-semibold">@{replyTo.author.username}</Text>
              </Text>
              <Button
                variant="ghost"
                onPress={() => setReplyTo(null)}
                className="p-1 active:opacity-75 bg-transparent active:bg-transparent min-w-0 min-h-0 h-auto w-auto">
                <Icon as={XIcon} size={14} className="text-muted-foreground" />
              </Button>
            </View>
          )}

          <Glass
            radius={0}
            intensity={60}
            className="border-t border-border px-6 py-4"
            style={{ paddingBottom: insets.bottom + 10 }}>
            <View className="flex-row items-center gap-3">
              <Avatar username={profile?.username || "me"} url={profile?.avatarUrl} size={36} />
              <Button
                variant="ghost"
                onPress={() => {
                  if (!session) {
                    showAuthModal();
                  }
                }}
                className="flex-1 p-0 h-auto w-auto bg-transparent active:bg-transparent min-w-0 min-h-0">
                <Glass
                  radius={20}
                  className="h-12 justify-center px-4 border border-border bg-muted">
                  <BottomSheetTextInput
                    ref={inputRef}
                    value={commentText}
                    onChangeText={setCommentText}
                    editable={!!session}
                    pointerEvents={session ? "auto" : "none"}
                    placeholder={
                      replyTo ? `Reply to @${replyTo.author.username}...` : "Add a comment..."
                    }
                    placeholderTextColor={colors.mutedForeground}
                    className="text-foreground text-sm font-medium font-[Inter_400Regular] flex-1"
                    onSubmitEditing={handleSend}
                    returnKeyType="send"
                  />
                </Glass>
              </Button>
              <Button
                variant="ghost"
                onPress={handleSend}
                className={`w-12 h-12 rounded-full items-center justify-center active:scale-95 p-0 min-w-0 min-h-0 ${commentText.trim() ? "bg-primary" : "bg-muted"}`}>
                <Icon
                  as={SendIcon}
                  size={20}
                  className={
                    commentText.trim() ? "text-primary-foreground" : "text-muted-foreground"
                  }
                />
              </Button>
            </View>
          </Glass>
        </View>
      </View>
    </BottomSheet>
  );
}
