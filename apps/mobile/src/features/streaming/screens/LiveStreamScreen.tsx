import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import { Users, X } from "lucide-react-native";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ErrorBoundary } from "@/components/error-boundary/ErrorBoundary";
import { Avatar } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { useLiveStreams } from "@/features/streaming/api/queries";
import { useColors } from "@/hooks/use-colors";

export function LiveStreamScreen({ streamId }: { streamId: string }) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colors = useColors();
  const { data: streams, isLoading } = useLiveStreams();

  const stream = streams?.find((s) => s.id === streamId);

  const player = useVideoPlayer(stream?.playbackUrl || "", (player) => {
    player.loop = true;
    player.play();
  });

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!stream) {
    return (
      <View className="flex-1 items-center justify-center bg-background p-6">
        <Text variant="h3" className="mb-2">
          Stream Ended
        </Text>
        <Text className="text-muted-foreground text-center mb-6">
          This live stream is no longer available.
        </Text>
        <Pressable onPress={() => router.back()} className="px-6 py-3 bg-muted rounded-full">
          <Text className="text-foreground font-bold">Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <View className="flex-1 bg-black">
        {/* Fullscreen Video */}
        <VideoView
          style={StyleSheet.absoluteFill}
          player={player}
          allowsPictureInPicture={false}
          nativeControls={false}
          contentFit="cover"
        />

        {/* Top Overlay Gradient */}
        <LinearGradient
          colors={["rgba(0,0,0,0.7)", "transparent"]}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 150,
            pointerEvents: "none",
          }}
        />

        {/* Header UI */}
        <View
          style={{ paddingTop: insets.top + 10 }}
          className="absolute top-0 left-0 right-0 px-4 flex-row items-center justify-between"
          pointerEvents="box-none">
          {/* Author Info & Live Badge */}
          <View className="flex-row items-center gap-3 bg-black/40 rounded-full p-1 pr-4">
            <Avatar
              url={stream.author.avatarUrl}
              username={stream.author.username}
              size={36}
              ring
            />
            <View>
              <Text className="text-white font-bold text-sm">@{stream.author.username}</Text>
              <View className="flex-row items-center gap-1.5 mt-0.5">
                <View className="bg-destructive px-1.5 py-0.5 rounded flex-row items-center gap-1">
                  <View className="w-1.5 h-1.5 bg-destructive-foreground rounded-full" />
                  <Text className="text-[9px] font-bold text-destructive-foreground uppercase">
                    Live
                  </Text>
                </View>
                <View className="flex-row items-center gap-1">
                  <Icon as={Users} size={10} color="#fff" />
                  <Text className="text-white text-[10px] font-bold">{stream.viewerCount}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Close Button */}
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-black/40 items-center justify-center">
            <Icon as={X} size={20} color="#fff" />
          </Pressable>
        </View>

        {/* Bottom Overlay Gradient */}
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.8)"]}
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 200,
            pointerEvents: "none",
          }}
        />

        {/* Bottom Info */}
        <View
          style={{ paddingBottom: insets.bottom + 20 }}
          className="absolute bottom-0 left-0 right-0 px-6"
          pointerEvents="box-none">
          <Text className="text-white font-bold text-xl mb-2">{stream.title}</Text>
          <Text className="text-white/80 text-sm">
            Welcome to the stream! Chat is disabled in this preview.
          </Text>
        </View>
      </View>
    </ErrorBoundary>
  );
}
