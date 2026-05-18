import { useRouter } from "expo-router";
import { HeartIcon, MessageCircleIcon, SendIcon, XIcon } from "lucide-react-native";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Glass } from "@/components/layout/Glass";
import { Avatar } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/contexts/auth-context";
import { useAddComment, useComments, useToggleCommentLike } from "@/features/waves/api/comments";
import { useColors } from "@/hooks/use-colors";
import type { FleetPostWithAuthor } from "@/lib/types";

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
      className={`flex-row gap-3 py-3 ${isReply ? "pl-11 mt-1" : "border-b border-white/5 px-6"}`}>
      <Pressable onPress={handleProfilePress}>
        <Avatar username={comment.author.username} url={comment.author.avatarUrl} size={32} />
      </Pressable>
      <View className="flex-1 gap-1">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <Pressable onPress={handleProfilePress} className="flex-row items-center gap-2">
              <Text className="text-white font-bold text-sm">@{comment.author.username}</Text>
              {comment.author.isPremium && (
                <View className="px-1.5 py-0.5 rounded bg-primary/20">
                  <Text className="text-primary text-[8px] font-bold uppercase font-[Inter_700Bold]">
                    PRO
                  </Text>
                </View>
              )}
            </Pressable>
            <Text className="text-white/40 text-xs font-[Inter_400Regular]">
              {formatTimeAgo(comment.createdAt ?? new Date())}
            </Text>
          </View>

          {/* Like Button */}
          <Pressable
            onPress={onLike}
            className="flex-row items-center gap-1.5 active:scale-90 pr-2">
            <Icon
              as={HeartIcon}
              size={14}
              color={liked ? colors.destructive : "rgba(255,255,255,0.4)"}
              fill={liked ? colors.destructive : "transparent"}
            />
            {likesCount > 0 && (
              <Text
                className={`text-xs font-semibold ${liked ? "text-destructive" : "text-white/40"}`}>
                {likesCount}
              </Text>
            )}
          </Pressable>
        </View>

        <Text className="text-white/90 text-sm leading-5 font-[Inter_400Regular]">
          {comment.content}
        </Text>

        {!isReply && (
          <Pressable onPress={onReply} className="mt-1 active:opacity-75 self-start">
            <Text className="text-primary font-bold text-xs font-[Inter_600SemiBold]">Reply</Text>
          </Pressable>
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

  return (
    <View className="flex-1 bg-background rounded-t-[40px] overflow-hidden border-t border-white/10">
      {/* Drag Handle */}
      <View className="items-center pt-3 pb-1">
        <View className="w-10 h-1 rounded-full bg-white/20" />
      </View>

      {/* Header */}
      <View className="px-6 py-4 flex-row justify-between items-center border-b border-white/5">
        <Text className="text-white font-bold text-lg font-[Inter_700Bold]">
          Comments ({comments.length})
        </Text>
        <Pressable
          onPress={onClose}
          className="w-8 h-8 rounded-full bg-white/5 items-center justify-center">
          <Icon as={XIcon} size={18} className="text-white" />
        </Pressable>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
        {isLoading ? (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator color={colors.primary} size="small" />
          </View>
        ) : topLevelComments.length === 0 ? (
          <View className="flex-1 items-center justify-center p-12">
            <View className="w-20 h-20 rounded-full bg-white/5 items-center justify-center mb-6">
              <Icon as={MessageCircleIcon} size={40} className="text-white/20" />
            </View>
            <Text className="text-muted-foreground text-center text-sm leading-6 font-[Inter_400Regular]">
              No comments yet. Be the first to start the conversation.
            </Text>
          </View>
        ) : (
          <View className="py-2">
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
      </ScrollView>

      {/* Bottom Bar */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}>
        {/* Reply Indicator */}
        {replyTo && (
          <View className="bg-white/5 border-t border-white/5 px-6 py-2 flex-row justify-between items-center">
            <Text className="text-white/60 text-xs font-[Inter_400Regular]">
              Replying to{" "}
              <Text className="text-primary font-semibold">@{replyTo.author.username}</Text>
            </Text>
            <Pressable onPress={() => setReplyTo(null)} className="p-1 active:opacity-75">
              <Icon as={XIcon} size={14} className="text-white/60" />
            </Pressable>
          </View>
        )}

        <Glass
          radius={0}
          intensity={60}
          className="border-t border-white/10 px-6 py-4"
          style={{ paddingBottom: insets.bottom + 10 }}>
          <View className="flex-row items-center gap-3">
            <Avatar username={profile?.username || "me"} url={profile?.avatarUrl} size={36} />
            <Pressable
              onPress={() => {
                if (!session) {
                  showAuthModal();
                }
              }}
              className="flex-1">
              <Glass
                radius={20}
                className="h-12 justify-center px-4 border border-white/10 bg-white/5">
                <TextInput
                  ref={inputRef}
                  value={commentText}
                  onChangeText={setCommentText}
                  editable={!!session}
                  pointerEvents={session ? "auto" : "none"}
                  placeholder={
                    replyTo ? `Reply to @${replyTo.author.username}...` : "Add a comment..."
                  }
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  className="text-white text-sm font-medium font-[Inter_400Regular]"
                  onSubmitEditing={handleSend}
                  returnKeyType="send"
                />
              </Glass>
            </Pressable>
            <Pressable
              onPress={handleSend}
              className={`w-12 h-12 rounded-full items-center justify-center active:scale-95 ${commentText.trim() ? "bg-primary" : "bg-white/5"}`}>
              <Icon
                as={SendIcon}
                size={20}
                className={commentText.trim() ? "text-black" : "text-muted-foreground"}
              />
            </Pressable>
          </View>
        </Glass>
      </KeyboardAvoidingView>
    </View>
  );
}
