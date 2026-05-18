import * as Haptics from "expo-haptics";
import {
  BookmarkIcon,
  HeartIcon,
  type LucideIcon,
  RepeatIcon,
  SendIcon,
  ZapIcon,
} from "lucide-react-native";
import { useCallback } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import { Glass } from "@/components/layout/Glass";
import { Avatar } from "@/components/ui/avatar";
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
  const { user, session, showAuthModal } = useAuth();
  const { mutate: toggleInteraction } = useToggleFleetInteraction();

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

  return (
    <Glass className="mx-4 mb-4 overflow-hidden">
      <View className="p-4">
        <View className="flex-row items-center gap-3">
          <Avatar
            url={post.author.avatarUrl}
            username={post.author.username}
            size={40}
            ring={post.author.isPremium}
          />
          <View className="flex-1">
            <View className="flex-row items-center gap-1">
              <Text className="text-foreground font-semibold text-[15px] font-[Inter_600SemiBold]">
                @{post.author.username}
              </Text>
              {post.author.isPremium && (
                <ZapIcon size={12} color={colors.primary} fill={colors.primary} />
              )}
            </View>
            <Text className="text-muted-foreground text-xs mt-0.5 font-[Inter_400Regular]">
              {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : "Just now"}
            </Text>
          </View>
          {!isOwn && (
            <Pressable
              onPress={() => {
                if (!session) return showAuthModal();
                // Gift logic would go here
              }}
              className="bg-primary/10 border border-primary/30 flex-row items-center gap-1 py-1.5 px-3 rounded-full">
              <ZapIcon size={12} color={colors.primary} />
              <Text className="text-primary font-semibold text-xs font-[Inter_600SemiBold]">
                Gift
              </Text>
            </Pressable>
          )}
        </View>

        {post.content && (
          <Text className="text-foreground text-[15px] leading-6 mt-3 font-[Inter_400Regular]">
            {post.content}
          </Text>
        )}

        {children}

        <View className="flex-row items-center justify-between mt-4">
          <InteractionButton
            icon={HeartIcon}
            count={post.counts.hugs}
            active={post.myInteractions.hug}
            color="magenta"
            onPress={() => toggle("hug")}
          />
          <InteractionButton
            icon={RepeatIcon}
            count={post.counts.echoes}
            active={post.myInteractions.echo}
            color="cyan"
            onPress={() => toggle("echo")}
          />
          <InteractionButton
            icon={SendIcon}
            count={post.counts.casts}
            active={post.myInteractions.cast}
            color="lime"
            onPress={() => toggle("cast")}
          />
          <InteractionButton
            icon={BookmarkIcon}
            count={post.counts.anchors}
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
  count: number;
  active: boolean;
  color: "magenta" | "cyan" | "lime" | "amber";
  onPress: () => void;
}

function InteractionButton({ icon: Icon, count, active, color, onPress }: InteractionButtonProps) {
  const colors = useColors();

  const tint =
    color === "lime"
      ? colors.primary
      : color === "cyan"
        ? colors.accent
        : color === "magenta"
          ? "#FF5FA8"
          : "#FFC23D";

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-1.5 py-1.5 px-2 rounded-full"
      style={{ backgroundColor: active ? `${tint}22` : "transparent" }}>
      <Icon
        size={18}
        color={active ? tint : colors.mutedForeground}
        fill={active && color === "magenta" ? tint : "transparent"}
      />
      <Text
        className="font-medium text-xs"
        style={{ color: active ? tint : colors.mutedForeground, fontFamily: "Inter_500Medium" }}>
        {count || ""}
      </Text>
    </Pressable>
  );
}
