import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { HeartIcon, MessageCircleIcon, Share2Icon } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
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

      {/* Dark Overlay for legibility */}
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.85)"]}
        style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 350 }}
      />

      {/* Overlays */}
      <View
        className="absolute inset-0 justify-between p-6"
        style={{ paddingTop: insets.top + 85, paddingBottom: insets.bottom + 110 }}>
        {/* Top: Fame Time Remaining */}
        <View className="flex-row justify-center">
          <View className="px-6 py-3 rounded-full flex-row items-center gap-2.5 border border-[#bef445]/30 bg-black/70">
            <View className="w-2.5 h-2.5 rounded-full bg-[#bef445] shadow-lg shadow-[#bef445]/50" />
            <Text
              className="font-bold text-[#bef445] text-sm uppercase tracking-widest"
              style={{
                textShadowColor: "rgba(0,0,0,0.8)",
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 3,
              }}>
              Fame Pulse: {timeLeft}s
            </Text>
          </View>
        </View>

        {/* Bottom: Post Info & Engagement */}
        <View className="flex-row items-end justify-between gap-6">
          <View className="flex-1">
            <View className="flex-row items-center gap-3 mb-3">
              <Avatar url={item.author.avatarUrl} username={item.author.username} size={48} ring />
              <View>
                <Text className="font-bold text-white text-lg">@{item.author.username}</Text>
                <Text className="text-primary text-[10px] font-bold uppercase tracking-tighter">
                  Rising Star
                </Text>
              </View>
            </View>
            <Text className="text-white/95 text-base leading-6 font-medium" numberOfLines={3}>
              {item.content}
            </Text>
          </View>

          {/* Engagement Buttons */}
          <View className="gap-5 items-center">
            <View className="items-center">
              <Pressable className="bg-white/10 w-14 h-14 rounded-full items-center justify-center border border-white/10 backdrop-blur-xl active:bg-white/20">
                <Icon as={HeartIcon} className="text-white" size={26} />
              </Pressable>
              <Text className="text-white text-xs mt-1.5 font-bold">1.2k</Text>
            </View>

            <View className="items-center">
              <Pressable
                onPress={() => Alert.alert("Comments", "Coming soon in the next tide!")}
                className="bg-white/10 w-14 h-14 rounded-full items-center justify-center border border-white/10 backdrop-blur-xl active:bg-white/20">
                <Icon as={MessageCircleIcon} className="text-white" size={26} />
              </Pressable>
              <Text className="text-white text-xs mt-1.5 font-bold">45</Text>
            </View>

            <Pressable className="bg-white/10 w-14 h-14 rounded-full items-center justify-center border border-white/10 backdrop-blur-xl active:bg-white/20">
              <Icon as={Share2Icon} className="text-white" size={26} />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

import { XapXapHeader } from "@/components/ui/header";

export function FameFeedScreen() {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useFameBurst();
  const { isOnline } = useNetwork();
  const insets = useSafeAreaInsets();

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
        <View style={{ position: "absolute", top: insets.top, left: 0, right: 0, zIndex: 50 }}>
          <XapXapHeader />
        </View>

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
