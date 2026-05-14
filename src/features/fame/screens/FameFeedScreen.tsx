import { Image } from "expo-image";
import { HeartIcon, MessageCircleIcon, Share2Icon } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, FlatList, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ErrorBoundary } from "@/components/error-boundary/ErrorBoundary";
import { Avatar } from "@/components/ui/avatar";
import { Glass } from "@/components/ui/glass";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { type FameBurstItem, useFameBurst } from "@/features/fame/api/queries";
import { useNetwork } from "@/hooks/use-network";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");

function FameItem({ item }: { item: FameBurstItem }) {
  const insets = useSafeAreaInsets();
  const [timeLeft, setTimeLeft] = useState(60);

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

  return (
    <View style={{ height: SCREEN_HEIGHT, width: SCREEN_WIDTH }} className="bg-black">
      {/* Background Media */}
      <Image
        source={{ uri: item.mediaUrl || undefined }}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
      />

      {/* Overlays */}
      <View
        className="absolute inset-0 justify-between p-4"
        style={{ paddingTop: insets.top + 10, paddingBottom: insets.bottom + 80 }}>
        {/* Top: Fame Time Remaining */}
        <View className="flex-row justify-center">
          <Glass
            intensity={60}
            radius={20}
            className="px-4 py-2 flex-row items-center gap-2 border-[#bef445]/40">
            <View className="w-2 h-2 rounded-full bg-[#bef445] animate-pulse" />
            <Text className="font-bold text-[#bef445]">Fame Time: {timeLeft}s</Text>
          </Glass>
        </View>

        {/* Bottom: Post Info & Engagement */}
        <View className="flex-row items-end justify-between">
          <View className="flex-1 mr-4">
            <View className="flex-row items-center gap-2 mb-2">
              <Avatar url={item.author.avatarUrl} username={item.author.username} size={40} ring />
              <Text className="font-bold text-white shadow-sm">@{item.author.username}</Text>
            </View>
            <Text className="text-white/90 text-sm leading-5 shadow-sm" numberOfLines={3}>
              {item.content}
            </Text>
          </View>

          {/* Engagement Buttons */}
          <View className="gap-6 items-center">
            <View className="items-center">
              <Pressable className="bg-white/10 p-3 rounded-full backdrop-blur-md">
                <Icon as={HeartIcon} className="text-white" size={24} />
              </Pressable>
              <Text className="text-white text-xs mt-1 font-bold">1.2k</Text>
            </View>

            <View className="items-center">
              <Pressable className="bg-white/10 p-3 rounded-full backdrop-blur-md">
                <Icon as={MessageCircleIcon} className="text-white" size={24} />
              </Pressable>
              <Text className="text-white text-xs mt-1 font-bold">45</Text>
            </View>

            <Pressable className="bg-white/10 p-3 rounded-full backdrop-blur-md">
              <Icon as={Share2Icon} className="text-white" size={24} />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

export function FameFeedScreen() {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useFameBurst();
  const { isOnline } = useNetwork();

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
      <View className="flex-1 items-center justify-center bg-black">
        <ActivityIndicator color="#bef445" size="large" />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <View className="flex-1 bg-black">
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <FameItem item={item} />}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          onEndReached={() => {
            if (hasNextPage) fetchNextPage();
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetchingNextPage ? (
              <View className="py-10">
                <ActivityIndicator color="#bef445" />
              </View>
            ) : null
          }
        />
      </View>
    </ErrorBoundary>
  );
}
