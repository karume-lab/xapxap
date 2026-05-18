import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeftIcon,
  BookmarkIcon,
  CheckCircleIcon,
  CloudIcon,
  HeartIcon,
  MessageCircleIcon,
  RepeatIcon,
  SendIcon,
} from "lucide-react-native";
import { Pressable, Image as RNImage, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Glass } from "@/components/layout/Glass";
import { Avatar } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";

const STATS = [
  { label: "WAVES", icon: CloudIcon, count: 2, color: "#6CE7FF" },
  { label: "HUGS", icon: HeartIcon, count: 3, color: "#FF5FA8" },
  { label: "ECHOES", icon: RepeatIcon, count: 1, color: "#6CE7FF" },
  { label: "REPLIES", icon: MessageCircleIcon, count: 1, color: "#6CE7FF" },
  { label: "CASTS", icon: SendIcon, count: 0, color: "#bef445" },
  { label: "SAVES", icon: BookmarkIcon, count: 0, color: "#FFC107" },
];

export function UserProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { username: paramUsername } = useLocalSearchParams<{ id: string; username: string }>();

  const username = paramUsername || "sammy";

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View style={{ paddingTop: insets.top + 10 }} className="px-4 pb-4 flex-row items-center">
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-white/5 items-center justify-center mr-4">
          <Icon as={ArrowLeftIcon} size={20} className="text-white" />
        </Pressable>
        <Text className="text-white font-bold text-lg">@{username}</Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View className="px-4">
          <Glass radius={32} className="p-8 border border-white/5 items-center">
            <Avatar username={username} size={120} ring />

            <View className="flex-row items-center mt-4 gap-2">
              <Text className="text-white text-3xl font-bold">@{username}</Text>
              <Icon as={CheckCircleIcon} size={20} className="text-[#6CE7FF]" />
            </View>

            <Text className="text-muted-foreground text-xs font-bold uppercase tracking-widest mt-2">
              SAMMY.TECH
            </Text>

            {/* Stats Grid */}
            <View className="flex-row flex-wrap gap-3 mt-8 justify-center">
              {STATS.map((s) => (
                <Glass
                  key={s.label}
                  radius={20}
                  className="w-[100px] h-[100px] p-3 items-center justify-center border border-white/5">
                  <Icon as={s.icon} size={24} color={s.color} className="mb-2" />
                  <Text className="text-white font-bold text-lg">{s.count}</Text>
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
            <Glass radius={32} className="p-6 border border-white/5">
              <View className="flex-row items-center mb-4">
                <Avatar username={username} size={40} ring />
                <View className="ml-3 flex-1">
                  <View className="flex-row items-center gap-1">
                    <Text className="text-white font-bold">@{username}</Text>
                    <Icon as={CheckCircleIcon} size={14} className="text-[#6CE7FF]" />
                  </View>
                  <Text className="text-muted-foreground text-xs">1d • video</Text>
                </View>
              </View>

              <Text className="text-white text-base mb-4">Saw this</Text>

              <View className="rounded-3xl overflow-hidden bg-black/40 border border-white/5">
                <RNImage
                  source={{ uri: "https://images.unsplash.com/photo-1516280440614-37939bbacd81" }}
                  style={{ width: "100%", height: 200 }}
                  resizeMode="cover"
                />
                <View className="absolute bottom-3 left-3 bg-black/60 px-3 py-1.5 rounded-full flex-row items-center gap-2 border border-white/10">
                  <Icon as={CloudIcon} size={12} className="text-white" />
                  <Text className="text-white text-[10px] font-bold uppercase">Video</Text>
                </View>
              </View>

              {/* Action Bar */}
              <View className="flex-row items-center justify-between mt-6 px-2">
                <Pressable className="flex-row items-center gap-2">
                  <Icon as={HeartIcon} size={18} className="text-muted-foreground" />
                  <Text className="text-muted-foreground text-xs font-bold">1</Text>
                </Pressable>
                <Pressable className="flex-row items-center gap-2">
                  <Icon as={RepeatIcon} size={18} className="text-muted-foreground" />
                  <Text className="text-muted-foreground text-xs font-bold">Echo</Text>
                </Pressable>
                <Pressable className="flex-row items-center gap-2 bg-[#6CE7FF]/10 px-3 py-1.5 rounded-full border border-[#6CE7FF]/20">
                  <Icon as={MessageCircleIcon} size={18} className="text-[#6CE7FF]" />
                  <Text className="text-[#6CE7FF] text-xs font-bold">1</Text>
                </Pressable>
                <Pressable className="flex-row items-center gap-2">
                  <Icon as={SendIcon} size={18} className="text-muted-foreground" />
                  <Text className="text-muted-foreground text-xs font-bold">Cast</Text>
                </Pressable>
                <Pressable className="flex-row items-center gap-2">
                  <Icon as={BookmarkIcon} size={18} className="text-muted-foreground" />
                  <Text className="text-muted-foreground text-xs font-bold">Save</Text>
                </Pressable>
              </View>
            </Glass>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
