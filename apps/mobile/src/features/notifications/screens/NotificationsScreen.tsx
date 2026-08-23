import {
  BarChart3,
  Bell,
  Heart,
  MessageCircle,
  Repeat2,
  Send,
  Sparkles,
  Users,
  Video,
} from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/contexts/auth-context";
import {
  type NotificationItem,
  type NotificationType,
  useMarkNotificationsRead,
  useNotifications,
} from "@/features/notifications/services/queries";
import { useColors } from "@/hooks/use-colors";
import { useRealtimeNotifications } from "@/hooks/use-realtime";
import { cn } from "@/lib/utils";

type FilterType = "all" | "activity" | "tips" | "comments";

const TYPE_BADGE_CONFIG: Record<
  NotificationType,
  {
    icon: typeof Heart;
    label: string;
    colorKey: string;
    bgClass: string;
    borderClass: string;
    textClass: string;
  }
> = {
  hug: {
    icon: Heart,
    label: "Hug",
    colorKey: "destructive",
    bgClass: "bg-destructive/10",
    borderClass: "border-destructive/20",
    textClass: "text-destructive",
  },
  echo: {
    icon: Repeat2,
    label: "Echo",
    colorKey: "accent",
    bgClass: "bg-accent/10",
    borderClass: "border-accent/20",
    textClass: "text-accent",
  },
  cast: {
    icon: Send,
    label: "Cast",
    colorKey: "primary",
    bgClass: "bg-primary/10",
    borderClass: "border-primary/20",
    textClass: "text-primary",
  },
  comment: {
    icon: MessageCircle,
    label: "Reply",
    colorKey: "accent",
    bgClass: "bg-accent/10",
    borderClass: "border-accent/20",
    textClass: "text-accent",
  },
  tip: {
    icon: Sparkles,
    label: "Gems",
    colorKey: "primary",
    bgClass: "bg-primary/10",
    borderClass: "border-primary/20",
    textClass: "text-primary",
  },
  stream_join: {
    icon: Video,
    label: "Stream",
    colorKey: "accent",
    bgClass: "bg-accent/10",
    borderClass: "border-accent/20",
    textClass: "text-accent",
  },
  fleet_join: {
    icon: Users,
    label: "Deck",
    colorKey: "primary",
    bgClass: "bg-primary/10",
    borderClass: "border-primary/20",
    textClass: "text-primary",
  },
  poll_vote: {
    icon: BarChart3,
    label: "Poll",
    colorKey: "accent",
    bgClass: "bg-accent/10",
    borderClass: "border-accent/20",
    textClass: "text-accent",
  },
  system: {
    icon: Bell,
    label: "System",
    colorKey: "muted-foreground",
    bgClass: "bg-muted",
    borderClass: "border-border",
    textClass: "text-muted-foreground",
  },
};

function relativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(dateStr).toLocaleDateString();
}

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { session, showAuthModal } = useAuth();
  const [filter, setFilter] = useState<FilterType>("all");

  const userId = session?.user?.id || null;
  const { data: notifications = [], isLoading, refetch, isRefetching } = useNotifications(userId);
  const markRead = useMarkNotificationsRead(userId);

  useRealtimeNotifications(userId);

  const filteredNotifications = notifications.filter((item) => {
    if (filter === "all") return true;
    if (filter === "tips") return item.type === "tip";
    if (filter === "comments") return item.type === "comment";
    if (filter === "activity")
      return (
        item.type === "hug" ||
        item.type === "echo" ||
        item.type === "cast" ||
        item.type === "stream_join" ||
        item.type === "fleet_join" ||
        item.type === "poll_vote"
      );
    return true;
  });

  const handleMarkAllRead = () => {
    markRead.mutate();
  };

  const renderItem = ({ item }: { item: NotificationItem }) => {
    const badge = TYPE_BADGE_CONFIG[item.type] || TYPE_BADGE_CONFIG.system;
    const BadgeIcon = badge.icon;
    return (
      <View
        className={cn(
          "flex-row gap-3 px-5 py-4 border-b border-border items-start",
          item.unread && "bg-primary/5"
        )}>
        {item.user ? (
          <Avatar
            username={item.user.username}
            url={item.user.avatarUrl}
            size={40}
            ring={item.user.isPremium}
          />
        ) : (
          <View
            className={cn(
              "w-10 h-10 rounded-full items-center justify-center border",
              badge.bgClass,
              badge.borderClass
            )}>
            <Icon as={BadgeIcon} size={18} className={badge.textClass} />
          </View>
        )}

        <View className="flex-1 gap-1">
          <Text className="text-foreground text-sm font-semibold leading-5">
            <Text className="font-bold text-foreground">
              {item.user ? `@${item.user.username}` : ""}
            </Text>{" "}
            <Text className="text-foreground/80 font-normal">{item.content}</Text>
          </Text>

          <View className="flex-row items-center gap-2 mt-1">
            {item.type === "tip" && item.amount != null && (
              <View className="flex-row items-center gap-1 bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                <Sparkles size={10} color={colors.primary} />
                <Text className="text-primary text-[10px] font-bold">+{item.amount} Gems</Text>
              </View>
            )}
            <View className="flex-row items-center gap-1 px-2 py-0.5 rounded-full border border-border bg-muted/50">
              <BadgeIcon size={9} color={colors.mutedForeground ?? "#888"} />
              <Text className="text-muted-foreground text-[10px] font-bold uppercase">
                {badge.label}
              </Text>
            </View>
            <Text className="text-muted-foreground text-xs font-mono">
              {relativeTime(item.time)}
            </Text>
            {item.unread && <View className="w-2 h-2 rounded-full bg-primary ml-auto" />}
          </View>
        </View>
      </View>
    );
  };

  if (!session) {
    return (
      <View className="flex-1 bg-background" style={{ paddingTop: Math.max(insets.top, 16) }}>
        <View className="px-6 py-4 border-b border-border">
          <Text className="text-foreground font-bold text-xl font-[Inter_700Bold]">
            Notifications
          </Text>
        </View>
        <View className="flex-1 items-center justify-center p-6 pb-24">
          <View className="w-20 h-20 rounded-full bg-primary/10 items-center justify-center mb-6 border border-primary/20">
            <Icon as={Bell} size={36} className="text-primary" />
          </View>
          <Text className="text-foreground font-bold text-2xl text-center mb-2 font-[Inter_700Bold]">
            Your Notifications
          </Text>
          <Text className="text-muted-foreground text-center text-sm leading-6 max-w-70 mb-8 font-[Inter_400Regular]">
            Sign in to track hugs, echoes, gems tipped, comments on your waves, and more!
          </Text>
          <Button
            onPress={showAuthModal}
            className="w-full max-w-60 h-16 rounded-[28px] bg-primary">
            <Text className="text-primary-foreground font-bold text-lg font-[Inter_700Bold]">
              Sign in to XapXap
            </Text>
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: Math.max(insets.top, 16) }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-border">
        <Text className="text-foreground font-bold text-xl font-[Inter_700Bold]">
          Notifications
        </Text>
        {notifications.some((n) => n.unread) && (
          <Button
            variant="ghost"
            onPress={handleMarkAllRead}
            disabled={markRead.isPending}
            className="min-h-0 min-w-0 p-0 active:bg-transparent bg-transparent">
            <Text className="text-primary text-xs font-bold">Mark all read</Text>
          </Button>
        )}
      </View>

      {/* Filters */}
      <View className="flex-row gap-2 px-6 py-4">
        {(["all", "activity", "tips", "comments"] as FilterType[]).map((tab) => (
          <Button
            key={tab}
            variant="ghost"
            onPress={() => setFilter(tab)}
            className={cn(
              "px-4 py-2 rounded-full border active:scale-95 h-auto min-h-0 min-w-0 p-0 active:bg-transparent bg-transparent",
              filter === tab ? "bg-primary border-primary" : "bg-muted border-border"
            )}>
            <View className="px-4 py-2">
              <Text
                className={cn(
                  "text-xs font-bold uppercase tracking-wider",
                  filter === tab ? "text-primary-foreground" : "text-muted-foreground"
                )}>
                {tab}
              </Text>
            </View>
          </Button>
        ))}
      </View>

      {/* List */}
      <FlatList
        data={filteredNotifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching && !isLoading}
            onRefresh={refetch}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          isLoading ? (
            <View className="flex-1 items-center justify-center p-12 py-32">
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : (
            <View className="flex-1 items-center justify-center p-12 py-32">
              <View className="w-16 h-16 rounded-full bg-muted items-center justify-center mb-4">
                <Icon as={Bell} size={28} className="text-muted-foreground" />
              </View>
              <Text className="text-muted-foreground text-center text-sm leading-6">
                No notifications yet in this category.
              </Text>
            </View>
          )
        }
      />
    </View>
  );
}
