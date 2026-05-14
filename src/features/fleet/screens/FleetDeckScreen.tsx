import { ShieldCheckIcon, WifiOffIcon, ZapIcon } from "lucide-react-native";
import React, { useState } from "react";
import { ActivityIndicator, FlatList, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ErrorBoundary } from "@/components/error-boundary/ErrorBoundary";
import { Button } from "@/components/ui/button";
import { Glass } from "@/components/ui/glass";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { WaveCard } from "@/components/ui/wave-card";
import { useFleetThreads } from "@/features/fleet/api/queries";
import { PollUI } from "@/features/fleet/components/PollUI";
import { useNetwork } from "@/hooks/use-network";

export function FleetDeckScreen() {
  const insets = useSafeAreaInsets();
  const { isOnline } = useNetwork();
  const { data: posts, isLoading, refetch } = useFleetThreads();
  const [dataSaver, setDataSaver] = useState(true);

  if (isLoading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator color="#bef445" />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <View className="flex-1 bg-background">
        {/* Header */}
        <View
          style={{ paddingTop: insets.top + 10 }}
          className="px-6 pb-4 border-b border-border bg-background/80 backdrop-blur-lg">
          <View className="flex-row items-center justify-between">
            <View>
              <Text variant="h2" className="text-[#bef445]">
                Fleet Hub
              </Text>
              <Text className="text-xs text-muted-foreground">Community Decks • Standard 3G</Text>
            </View>

            <Pressable
              onPress={() => setDataSaver(!dataSaver)}
              className={`flex-row items-center gap-2 px-3 py-1.5 rounded-full border ${dataSaver ? "bg-[#bef445]/10 border-[#bef445]/30" : "bg-muted border-border"}`}>
              <Icon
                as={dataSaver ? ShieldCheckIcon : ZapIcon}
                size={14}
                className={dataSaver ? "text-[#bef445]" : "text-muted-foreground"}
              />
              <Text
                className={`text-[10px] font-bold ${dataSaver ? "text-[#bef445]" : "text-muted-foreground"}`}>
                {dataSaver ? "DATA SAVER ON" : "HIGH BANDWIDTH"}
              </Text>
            </Pressable>
          </View>
        </View>

        {!isOnline && (
          <View className="bg-amber-500/10 p-2 flex-row items-center justify-center gap-2">
            <Icon as={WifiOffIcon} size={14} className="text-amber-500" />
            <Text className="text-[10px] text-amber-500 font-bold uppercase">
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
              <View className="mt-4 pt-4 border-t border-white/5 flex-row items-center gap-2">
                <View className="w-1 h-4 bg-[#bef445]/40 rounded-full" />
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
        <View className="absolute right-6" style={{ bottom: insets.bottom + 100 }}>
          <Button
            size="icon"
            className="rounded-full h-14 w-14 bg-[#bef445] shadow-lg shadow-[#bef445]/40">
            <Icon as={ZapIcon} className="text-black" size={24} />
          </Button>
        </View>
      </View>
    </ErrorBoundary>
  );
}
