import { useRouter } from "expo-router";
import { ArrowLeft, Bell, Heart, MessageCircle, SparklesIcon } from "lucide-react-native";
import { useState } from "react";
import { FlatList, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/contexts/auth-context";
import { useColors } from "@/hooks/use-colors";
import { cn } from "@/lib/utils";

interface NotificationItem {
  id: string;
  type: "like" | "comment" | "gift" | "system";
  user?: {
    username: string;
    avatarUrl: string | null;
    isPremium: boolean;
  };
  content: string;
  time: string;
  unread: boolean;
  amount?: number; // for gems
}

const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "1",
    type: "gift",
    user: {
      username: "dave_wave",
      avatarUrl: null,
      isPremium: true,
    },
    content: "tipped you 50 Gems on your Wave",
    time: "2m ago",
    unread: true,
    amount: 50,
  },
  {
    id: "2",
    type: "comment",
    user: {
      username: "sarah_k",
      avatarUrl: null,
      isPremium: false,
    },
    content: "commented: 'This looks so beautiful! Cannot wait for the next Drop.'",
    time: "15m ago",
    unread: true,
  },
  {
    id: "3",
    type: "like",
    user: {
      username: "james_drop",
      avatarUrl: null,
      isPremium: false,
    },
    content: "liked your Wave",
    time: "2h ago",
    unread: false,
  },
  {
    id: "4",
    type: "gift",
    user: {
      username: "elena_r",
      avatarUrl: null,
      isPremium: true,
    },
    content: "tipped you 100 Gems on your Wave",
    time: "5h ago",
    unread: false,
    amount: 100,
  },
  {
    id: "5",
    type: "system",
    content: "Welcome to XapXap! Start dropping your waves and start earning Gems today.",
    time: "1d ago",
    unread: false,
  },
];

type FilterType = "all" | "gems" | "comments" | "likes";

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colors = useColors();
  const { session, showAuthModal } = useAuth();
  const [filter, setFilter] = useState<FilterType>("all");

  const filteredNotifications = MOCK_NOTIFICATIONS.filter((item) => {
    if (filter === "all") return true;
    if (filter === "gems") return item.type === "gift";
    if (filter === "comments") return item.type === "comment";
    if (filter === "likes") return item.type === "like";
    return true;
  });

  const renderItem = ({ item }: { item: NotificationItem }) => {
    return (
      <View
        className={cn(
          "flex-row gap-4 p-5 border-b border-border items-start",
          item.unread && "bg-primary/5"
        )}>
        {item.type === "system" ? (
          <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center border border-primary/20">
            <Icon as={Bell} size={18} className="text-primary" />
          </View>
        ) : (
          <Avatar
            username={item.user?.username || "user"}
            url={item.user?.avatarUrl || null}
            size={40}
            ring={item.user?.isPremium}
          />
        )}

        <View className="flex-1 gap-1">
          <View className="flex-row items-center justify-between">
            <Text className="text-foreground text-sm font-semibold leading-5 flex-1 pr-2">
              {item.type !== "system" && (
                <Text className="font-bold text-foreground">@{item.user?.username} </Text>
              )}
              <Text className="text-foreground/80 font-normal">{item.content}</Text>
            </Text>
            {item.unread && <View className="w-2 h-2 rounded-full bg-primary" />}
          </View>

          <View className="flex-row items-center gap-2 mt-1">
            {item.type === "gift" && (
              <View className="flex-row items-center gap-1 bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                <SparklesIcon size={10} color={colors.primary} />
                <Text className="text-primary text-[10px] font-bold">+{item.amount} Gems</Text>
              </View>
            )}
            {item.type === "comment" && (
              <View className="flex-row items-center gap-1 bg-accent/10 px-2 py-0.5 rounded-full border border-accent/20">
                <MessageCircle size={10} color={colors.accent} />
                <Text className="text-accent text-[10px] font-bold">Reply</Text>
              </View>
            )}
            {item.type === "like" && (
              <View className="flex-row items-center gap-1 bg-destructive/10 px-2 py-0.5 rounded-full border border-destructive/20">
                <Heart size={10} color={colors.destructive} />
                <Text className="text-destructive text-[10px] font-bold">Love</Text>
              </View>
            )}
            <Text className="text-muted-foreground text-xs font-mono">{item.time}</Text>
          </View>
        </View>
      </View>
    );
  };

  if (!session) {
    return (
      <View className="flex-1 bg-background" style={{ paddingTop: Math.max(insets.top, 16) }}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 py-4 border-b border-border">
          <View className="flex-row items-center gap-3">
            <Button
              variant="ghost"
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full bg-muted items-center justify-center border border-border active:scale-95 p-0 min-w-0 min-h-0 active:bg-transparent">
              <Icon as={ArrowLeft} size={18} className="text-foreground" />
            </Button>
            <Text className="text-foreground font-bold text-xl font-[Inter_700Bold]">
              Notifications
            </Text>
          </View>
        </View>

        {/* CTA Container */}
        <View className="flex-1 items-center justify-center p-6 pb-24">
          <View className="w-20 h-20 rounded-full bg-primary/10 items-center justify-center mb-6 border border-primary/20">
            <Icon as={Bell} size={36} className="text-primary" />
          </View>
          <Text className="text-foreground font-bold text-2xl text-center mb-2 font-[Inter_700Bold]">
            Your Notifications
          </Text>
          <Text className="text-muted-foreground text-center text-sm leading-6 max-w-[280px] mb-8 font-[Inter_400Regular]">
            Sign in to track likes, gems tipped by fans, comments on your waves, and account
            updates!
          </Text>
          <Button
            onPress={showAuthModal}
            className="w-full max-w-[240px] h-16 rounded-[28px] bg-primary">
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
        <View className="flex-row items-center gap-3">
          <Button
            variant="ghost"
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-muted items-center justify-center border border-border active:scale-95 p-0 min-w-0 min-h-0 active:bg-transparent">
            <Icon as={ArrowLeft} size={18} className="text-foreground" />
          </Button>
          <Text className="text-foreground font-bold text-xl font-[Inter_700Bold]">
            Notifications
          </Text>
        </View>
      </View>

      {/* Filters */}
      <View className="flex-row gap-2 px-6 py-4">
        {(["all", "gems", "comments", "likes"] as FilterType[]).map((tab) => (
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
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center p-12 py-32">
            <View className="w-16 h-16 rounded-full bg-muted items-center justify-center mb-4">
              <Icon as={Bell} size={28} className="text-muted-foreground" />
            </View>
            <Text className="text-muted-foreground text-center text-sm leading-6">
              No notifications yet in this category.
            </Text>
          </View>
        }
      />
    </View>
  );
}
