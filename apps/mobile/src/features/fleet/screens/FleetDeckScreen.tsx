import { useRouter } from "expo-router";
import { ArrowLeft, Users, WifiOff, Zap } from "lucide-react-native";
import { ActivityIndicator, FlatList, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ErrorBoundary } from "@/components/error-boundary/ErrorBoundary";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/contexts/auth-context";
import { PollUI } from "@/features/fleet/components/PollUI";
import { useFleetDeck, useFleetDeckPosts } from "@/features/fleet/services/queries";
import { WaveCard } from "@/features/waves/components/WaveCard";
import { useColors } from "@/hooks/use-colors";
import { useNetwork } from "@/hooks/use-network";
import { useRealtimeFleetPosts } from "@/hooks/use-realtime";

export function FleetDeckScreen({ deckId }: { deckId?: string }) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  useRealtimeFleetPosts();
  const { isOnline } = useNetwork();
  const { session, showAuthModal } = useAuth();
  const userId = session?.user?.id || null;
  const { data: deck } = useFleetDeck(deckId || "");
  const { data: posts, isLoading, refetch } = useFleetDeckPosts(deckId || "", userId);
  const colors = useColors();

  if (isLoading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
        <View className="px-6 flex-row items-center pt-4 pb-4">
          <Button
            variant="ghost"
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-muted items-center justify-center mr-4 p-0 min-w-0 min-h-0 active:bg-transparent">
            <Icon as={ArrowLeft} size={20} className="text-foreground" />
          </Button>
          <View className="flex-1">
            <Text
              className="text-foreground font-bold text-xl font-[Inter_700Bold]"
              numberOfLines={1}>
              {deck?.name || "Fleet Deck"}
            </Text>
            {deck && (
              <View className="flex-row items-center gap-1 mt-0.5">
                <Icon as={Users} size={12} className="text-muted-foreground" />
                <Text className="text-muted-foreground text-xs">{deck.memberCount} members</Text>
                {deck.category && (
                  <>
                    <Text className="text-muted-foreground text-xs mx-1">·</Text>
                    <Text className="text-muted-foreground text-xs capitalize">
                      {deck.category}
                    </Text>
                  </>
                )}
              </View>
            )}
          </View>
        </View>

        {!isOnline && (
          <View className="bg-amber/10 p-2 flex-row items-center justify-center gap-2">
            <Icon as={WifiOff} size={14} className="text-amber" />
            <Text className="text-[10px] text-amber font-bold uppercase">
              Offline Mode: Syncing via Mesh
            </Text>
          </View>
        )}

        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingVertical: 20, paddingBottom: 100 }}
          renderItem={({ item }) => (
            <WaveCard post={item}>{item.pollId && <PollUI pollId={item.pollId} />}</WaveCard>
          )}
          refreshing={isLoading}
          onRefresh={refetch}
          ListEmptyComponent={
            <View className="p-10 items-center">
              <Text className="text-muted-foreground">No posts in this deck yet.</Text>
            </View>
          }
        />

        <View className="absolute right-6" style={{ bottom: insets.bottom + 120 }}>
          <Button
            size="icon"
            onPress={() => {
              if (!session) return showAuthModal();
              router.push("/fleet/create");
            }}
            className="rounded-full h-14 w-14 bg-primary shadow-lg shadow-primary/40">
            <Icon as={Zap} className="text-primary-foreground" size={24} />
          </Button>
        </View>
      </View>
    </ErrorBoundary>
  );
}
