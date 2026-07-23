import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import {
  BookmarkIcon,
  Heart,
  type LucideIcon,
  MessageCircle,
  RepeatIcon,
  Send,
  Zap,
} from "lucide-react-native";
import { useCallback } from "react";
import { Platform, Text, View } from "react-native";
import { Glass } from "@/components/layout/Glass";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { useToggleFleetInteraction } from "@/features/fleet/api/queries";
import { useColors } from "@/hooks/use-colors";

interface WaveCardProps {
  post: {
    id: string;
    content: string | null;
    createdAt: Date | string | null;
    author: {
      id: string;
      username: string;
      avatarUrl: string | null;
      isPremium: boolean;
    };
    counts: {
      hugs: number;
      echoes: number;
      casts: number;
      anchors: number;
    };
    myInteractions: {
      hug: boolean;
      echo: boolean;
      cast: boolean;
      anchor: boolean;
    };
  };
  children?: React.ReactNode;
}

export function WaveCard({ post, children }: WaveCardProps) {
  const colors = useColors();
  const router = useRouter();
  const { user, session, showAuthModal } = useAuth();
  const { mutate: toggleInteraction } = useToggleFleetInteraction(session?.user?.id || null);

  const toggle = useCallback(
    (type: "hug" | "echo" | "cast" | "anchor") => {
      if (!session) return showAuthModal();
      toggleInteraction({ postId: post.id, type });

      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      }
    },
    [post.id, toggleInteraction, session, showAuthModal]
  );

  const isOwn = post.author.id === user?.id;
  const dateStr = post.createdAt ? new Date(post.createdAt).toLocaleDateString() : "Just now";

  return (
    <Glass className="mx-4 mb-4 overflow-hidden rounded-2xl">
      <View className="p-4">
        {/* Header */}
        <View className="flex-row items-start gap-3">
          <Button
            variant="ghost"
            onPress={() =>
              router.push({
                pathname: "/profile/[id]",
                params: { id: post.author.id, username: post.author.username },
              })
            }
            className="flex-row items-start gap-3 flex-1 p-0 h-auto w-auto bg-transparent active:bg-transparent min-w-0 min-h-0">
            <Avatar
              url={post.author.avatarUrl}
              username={post.author.username}
              size={48}
              ring={post.author.isPremium}
            />
            <View className="flex-1 mt-0.5">
              <View className="flex-row items-center gap-1">
                <Text className="text-foreground font-bold text-[17px] font-[Inter_700Bold]">
                  @{post.author.username}
                </Text>
                {post.author.isPremium && (
                  <Zap size={14} color={colors.primary} fill={colors.primary} />
                )}
              </View>
              <Text className="text-muted-foreground text-[13px] mt-0.5 font-[Inter_500Medium]">
                {dateStr} • update
              </Text>
              <View className="flex-row items-center mt-0.5">
                <View className="w-1.5 h-1.5 rounded-full bg-muted-foreground mr-1.5" />
                <Text className="text-muted-foreground text-[13px] font-[Inter_500Medium]">
                  Away 50d ago
                </Text>
              </View>
            </View>
          </Button>

          {!isOwn && (
            <Button
              variant="ghost"
              onPress={() => {
                if (!session) return showAuthModal();
                // Gift logic
              }}
              className="bg-[#4ade80]/10 border border-[#4ade80]/30 flex-row items-center gap-1.5 py-1.5 px-3 rounded-full h-auto min-h-0 min-w-0">
              <Zap size={14} color="#4ade80" />
              <Text className="text-[#4ade80] font-semibold text-[13px] font-[Inter_600SemiBold]">
                Gift
              </Text>
            </Button>
          )}
        </View>

        {/* Content */}
        {post.content && (
          <Text className="text-foreground text-[17px] leading-6 mt-4 mb-3 font-[Inter_400Regular]">
            {post.content}
          </Text>
        )}

        {/* Media */}
        {children && <View className="mt-1 rounded-2xl overflow-hidden">{children}</View>}

        {/* Footer Interactions */}
        <View className="flex-row items-center mt-4">
          <View className="flex-row items-center gap-6">
            <InteractionButton
              icon={Heart}
              label={post.counts.hugs > 0 ? post.counts.hugs.toString() : "Like"}
              active={post.myInteractions.hug}
              color="magenta"
              onPress={() => toggle("hug")}
            />
            <InteractionButton
              icon={RepeatIcon}
              label="Echo"
              active={post.myInteractions.echo}
              color="cyan"
              onPress={() => toggle("echo")}
            />
            <InteractionButton
              icon={MessageCircle}
              label="Reply"
              active={false}
              color="cyan"
              onPress={() => {}}
            />
            <InteractionButton
              icon={Send}
              label="Cast"
              active={post.myInteractions.cast}
              color="lime"
              onPress={() => toggle("cast")}
            />
          </View>

          <View className="flex-1" />

          <InteractionButton
            icon={BookmarkIcon}
            label=""
            active={post.myInteractions.anchor}
            color="amber"
            onPress={() => toggle("anchor")}
          />
        </View>
      </View>
    </Glass>
  );
}

interface InteractionButtonProps {
  icon: LucideIcon;
  label: string;
  active: boolean;
  color: "magenta" | "cyan" | "lime" | "amber";
  onPress: () => void;
}

function InteractionButton({ icon: Icon, label, active, color, onPress }: InteractionButtonProps) {
  const colors = useColors();

  const tint =
    color === "lime"
      ? colors.primary
      : color === "cyan"
        ? colors.cyan
        : color === "magenta"
          ? colors.magenta
          : colors.amber;

  return (
    <Button
      variant="ghost"
      onPress={onPress}
      className="flex-row items-center gap-2 p-0 h-auto min-h-0 min-w-0 bg-transparent active:bg-transparent"
      style={{ opacity: active ? 1 : 0.7 }}>
      <Icon
        size={20}
        color={active ? tint : colors.mutedForeground}
        fill={active && color === "magenta" ? tint : "transparent"}
      />
      {label ? (
        <Text
          className="font-medium text-[15px]"
          style={{ color: active ? tint : colors.mutedForeground, fontFamily: "Inter_500Medium" }}>
          {label}
        </Text>
      ) : null}
    </Button>
  );
}
