import { WifiOffIcon, ZapIcon } from "lucide-react-native";
import { ActivityIndicator, FlatList, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ErrorBoundary } from "@/components/error-boundary/ErrorBoundary";
import { XapXapHeader } from "@/components/layout/XapXapHeader";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/contexts/auth-context";
import { useFleetThreads } from "@/features/fleet/api/queries";
import { PollUI } from "@/features/fleet/components/PollUI";
import { WaveCard } from "@/features/waves/components/WaveCard";
import { useColors } from "@/hooks/use-colors";
import { useNetwork } from "@/hooks/use-network";

export function FleetDeckScreen() {
  const insets = useSafeAreaInsets();
  const { isOnline } = useNetwork();
  const { session, showAuthModal } = useAuth();
  const { data: posts, isLoading, refetch } = useFleetThreads(session?.user?.id || null);
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
        <XapXapHeader />

        <View className="px-6 py-2">
          <Text variant="h2" className="text-primary">
            Fleet Hub
          </Text>
          <Text className="text-xs text-muted-foreground">Community Decks • Active</Text>
        </View>

        {!isOnline && (
          <View className="bg-amber/10 p-2 flex-row items-center justify-center gap-2">
            <Icon as={WifiOffIcon} size={14} className="text-amber" />
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
            <WaveCard post={item}>
              {item.pollId && <PollUI pollId={item.pollId} />}

              {/* Nested Threading Indicator (Visual only for now) */}
              <View className="mt-4 pt-4 border-t border-border flex-row items-center gap-2">
                <View className="w-1 h-4 bg-primary/40 rounded-full" />
                <Text className="text-[10px] text-muted-foreground font-medium">
                  3 nested replies in this thread
                </Text>
              </View>
            </WaveCard>
          )}
          refreshing={isLoading}
          onRefresh={refetch}
          ListEmptyComponent={
            <View className="p-10 items-center">
              <Text className="text-muted-foreground">No fleets floating by...</Text>
            </View>
          }
        />

        {/* Floating Action for Low-Bandwidth Drop */}
        <View className="absolute right-6" style={{ bottom: insets.bottom + 120 }}>
          <Button
            size="icon"
            onPress={() => {
              if (!session) return showAuthModal();
            }}
            className="rounded-full h-14 w-14 bg-primary shadow-lg shadow-primary/40">
            <Icon as={ZapIcon} className="text-primary-foreground" size={24} />
          </Button>
        </View>
      </View>
    </ErrorBoundary>
  );
}
