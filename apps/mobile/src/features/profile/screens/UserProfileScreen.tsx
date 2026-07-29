import type { FleetPostWithAuthor } from "@xapxap/types";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  BookmarkIcon,
  CircleCheck,
  CloudIcon,
  Heart,
  MessageCircle,
  RepeatIcon,
  Send,
} from "lucide-react-native";
import { Image as RNImage, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Glass } from "@/components/layout/Glass";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { useUserProfileStats, useUserWaves } from "@/features/profile/services/queries";
import { useColors } from "@/hooks/use-colors";

const STATS_KEYS = [
  { label: "WAVES", icon: CloudIcon, count: 2, colorKey: "cyan" },
  { label: "HUGS", icon: Heart, count: 3, colorKey: "magenta" },
  { label: "ECHOES", icon: RepeatIcon, count: 1, colorKey: "cyan" },
  { label: "REPLIES", icon: MessageCircle, count: 1, colorKey: "cyan" },
  { label: "CASTS", icon: Send, count: 0, colorKey: "primary" },
  { label: "SAVES", icon: BookmarkIcon, count: 0, colorKey: "amber" },
] as const;

export function UserProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colors = useColors();
  const { username: paramUsername, id: userId } = useLocalSearchParams<{
    id: string;
    username: string;
  }>();

  const { data: statsData, isLoading: isStatsLoading } = useUserProfileStats(userId);
  const { data: wavesData, isLoading: isWavesLoading } = useUserWaves(userId);

  const username = statsData?.profile?.username || paramUsername;

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View style={{ paddingTop: insets.top + 10 }} className="px-4 pb-4 flex-row items-center">
        <Button
          variant="ghost"
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-muted items-center justify-center mr-4 p-0 min-w-0 min-h-0 active:bg-transparent">
          <Icon as={ArrowLeft} size={20} className="text-foreground" />
        </Button>
        <Text className="text-foreground font-bold text-lg">@{username}</Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View className="px-4">
          <Glass radius={32} className="p-8 border border-border items-center">
            <Avatar username={username} size={120} ring />

            <View className="flex-row items-center mt-4 gap-2">
              <Text className="text-foreground text-3xl font-bold">@{username}</Text>
              <Icon as={CircleCheck} size={20} className="text-cyan" />
            </View>

            {isStatsLoading ? (
              <Skeleton className="h-4 w-24 mt-2" />
            ) : (
              <Text className="text-muted-foreground text-xs font-bold uppercase tracking-widest mt-2">
                {statsData?.profile?.role || "Drifter"}
              </Text>
            )}

            {/* Stats Grid */}
            <View className="flex-row flex-wrap gap-3 mt-8 justify-center">
              {STATS_KEYS.map((s) => (
                <Glass
                  key={s.label}
                  radius={20}
                  className="w-25 h-25 p-3 items-center justify-center border border-border">
                  <Icon as={s.icon} size={24} color={colors[s.colorKey]} className="mb-2" />
                  {isStatsLoading ? (
                    <Skeleton className="h-6 w-8 mb-1" />
                  ) : (
                    <Text className="text-foreground font-bold text-lg">
                      {statsData?.stats[s.label.toLowerCase() as keyof typeof statsData.stats] || 0}
                    </Text>
                  )}
                  <Text className="text-muted-foreground text-[8px] font-bold tracking-widest">
                    {s.label}
                  </Text>
                </Glass>
              ))}
            </View>
          </Glass>
        </View>

        {/* Waves List */}
        <View className="mt-8">
          <View className="px-6 mb-6">
            <Text className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              THEIR WAVES
            </Text>
          </View>

          <View className="px-4 gap-4">
            {isWavesLoading ? (
              <Glass radius={32} className="p-6 border border-border h-48">
                <Skeleton className="w-full h-full rounded-2xl" />
              </Glass>
            ) : wavesData?.length === 0 ? (
              <Glass radius={32} className="p-6 border border-border items-center">
                <Text className="text-muted-foreground">No waves yet.</Text>
              </Glass>
            ) : (
              wavesData?.map((wave: FleetPostWithAuthor) => (
                <Glass key={wave.id} radius={32} className="p-6 border border-border">
                  <View className="flex-row items-center mb-4">
                    <Avatar username={wave.author?.username || username} size={40} ring />
                    <View className="ml-3 flex-1">
                      <View className="flex-row items-center gap-1">
                        <Text className="text-foreground font-bold">
                          @{wave.author?.username || username}
                        </Text>
                        <Icon as={CircleCheck} size={14} className="text-cyan" />
                      </View>
                      <Text className="text-muted-foreground text-xs">
                        {wave.createdAt ? new Date(wave.createdAt).toLocaleDateString() : ""} •{" "}
                        {wave.mediaType || "text"}
                      </Text>
                    </View>
                  </View>

                  <Text className="text-foreground text-base mb-4">{wave.content}</Text>

                  {wave.mediaUrl && (
                    <View className="rounded-3xl overflow-hidden bg-background/40 border border-border">
                      <RNImage
                        source={{ uri: wave.mediaUrl }}
                        style={{ width: "100%", height: 200 }}
                        resizeMode="cover"
                      />
                      <View className="absolute bottom-3 left-3 bg-background/60 px-3 py-1.5 rounded-full flex-row items-center gap-2 border border-border">
                        <Icon as={CloudIcon} size={12} className="text-foreground" />
                        <Text className="text-foreground text-[10px] font-bold uppercase">
                          {wave.mediaType || "Media"}
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* Action Bar */}
                  <View className="flex-row items-center justify-between mt-6 px-2">
                    <Button
                      variant="ghost"
                      className="flex-row items-center gap-2 p-0 min-w-0 min-h-0 h-auto w-auto bg-transparent active:bg-transparent">
                      <Icon as={Heart} size={18} className="text-muted-foreground" />
                      <Text className="text-muted-foreground text-xs font-bold">0</Text>
                    </Button>
                    <Button
                      variant="ghost"
                      className="flex-row items-center gap-2 p-0 min-w-0 min-h-0 h-auto w-auto bg-transparent active:bg-transparent">
                      <Icon as={RepeatIcon} size={18} className="text-muted-foreground" />
                      <Text className="text-muted-foreground text-xs font-bold">Echo</Text>
                    </Button>
                    <Button
                      variant="ghost"
                      className="flex-row items-center gap-2 bg-cyan/10 px-3 py-1.5 rounded-full border border-cyan/20 p-0 min-w-0 min-h-0 h-auto w-auto active:bg-transparent">
                      <View className="flex-row items-center gap-2 px-3 py-1.5">
                        <Icon as={MessageCircle} size={18} className="text-cyan" />
                        <Text className="text-cyan text-xs font-bold">0</Text>
                      </View>
                    </Button>
                    <Button
                      variant="ghost"
                      className="flex-row items-center gap-2 p-0 min-w-0 min-h-0 h-auto w-auto bg-transparent active:bg-transparent">
                      <Icon as={Send} size={18} className="text-muted-foreground" />
                      <Text className="text-muted-foreground text-xs font-bold">Cast</Text>
                    </Button>
                    <Button
                      variant="ghost"
                      className="flex-row items-center gap-2 p-0 min-w-0 min-h-0 h-auto w-auto bg-transparent active:bg-transparent">
                      <Icon as={BookmarkIcon} size={18} className="text-muted-foreground" />
                      <Text className="text-muted-foreground text-xs font-bold">Save</Text>
                    </Button>
                  </View>
                </Glass>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
