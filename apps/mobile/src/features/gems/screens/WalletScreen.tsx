import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  ArrowDownLeftIcon,
  ArrowLeft,
  ArrowUpRightIcon,
  DownloadIcon,
  PlusCircleIcon,
  Zap,
} from "lucide-react-native";
import { useState } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Glass } from "@/components/layout/Glass";
import { Button } from "@/components/ui/button";
import { ComingSoonSheet } from "@/components/ui/coming-soon-sheet";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/contexts/auth-context";
import { useGemActivity, useWalletBalance } from "@/features/gems/services/queries";
import { useColors } from "@/hooks/use-colors";

export function WalletScreen() {
  const insets = useSafeAreaInsets();
  const { session } = useAuth();
  const {
    data: wallet,
    isLoading: isWalletLoading,
    refetch: refetchWallet,
    isRefetching: isRefetchingWallet,
  } = useWalletBalance(session?.user?.id || null);
  const {
    data: activity,
    isLoading: isActivityLoading,
    refetch: refetchActivity,
    isRefetching: isRefetchingActivity,
  } = useGemActivity(session?.user?.id || null);
  const colors = useColors();
  const router = useRouter();

  const [sheetType, setSheetType] = useState<"buy" | "withdraw">("buy");
  const [comingSoonOpen, setComingSoonOpen] = useState(false);

  const openSheet = (type: "buy" | "withdraw") => {
    setSheetType(type);
    setComingSoonOpen(true);
  };

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120, paddingHorizontal: 24 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetchingWallet || isRefetchingActivity}
            onRefresh={() => {
              refetchWallet();
              refetchActivity();
            }}
            tintColor={colors.primary}
          />
        }>
        <View className="mt-4 mb-8 flex-row items-center">
          <Button
            variant="ghost"
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-muted items-center justify-center mr-4 p-0 min-w-0 min-h-0 active:bg-transparent">
            <Icon as={ArrowLeft} size={20} className="text-foreground" />
          </Button>
          <View>
            <Text className="text-foreground text-3xl font-bold font-[Inter_700Bold]">
              My Treasure
            </Text>
            <Text className="text-muted-foreground text-sm mt-1">
              Live balance from your gem ledger.
            </Text>
          </View>
        </View>

        {/* Balance Card */}
        <LinearGradient
          colors={[colors.background, colors.muted]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="rounded-[40px] p-8 items-center border border-border overflow-hidden">
          <View className="items-center">
            <Icon as={Zap} size={32} className="text-primary mb-2" />
            <Text className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">
              Gem Balance
            </Text>

            <View className="my-2 items-center">
              {isWalletLoading ? (
                <Skeleton className="h-16 w-32" />
              ) : (
                <Text className="text-foreground text-7xl font-bold">{wallet?.balance ?? 0}</Text>
              )}
              <Text className="text-muted-foreground text-base font-medium mt-1">gems</Text>
            </View>

            <Glass radius={20} className="px-4 py-2 mt-4 border border-border">
              <View className="flex-row items-center">
                <Text className="text-xs mr-2">🇰🇪</Text>
                {isWalletLoading ? (
                  <Skeleton className="h-4 w-12" />
                ) : (
                  <Text className="text-foreground text-xs font-bold">
                    ≈ KSh{((wallet?.balance ?? 0) * 1.3).toFixed(0)}
                  </Text>
                )}
              </View>
            </Glass>
          </View>
        </LinearGradient>

        {/* Actions */}
        <View className="flex-row gap-4 mt-6">
          <Glass radius={28} className="flex-1 overflow-hidden border border-border">
            <Button
              variant="ghost"
              onPress={() => openSheet("buy")}
              className="flex-row items-center justify-center h-16 gap-3 p-0 min-h-0 min-w-0 bg-transparent active:bg-muted rounded-none">
              <Icon as={PlusCircleIcon} size={20} className="text-primary" />
              <Text className="text-foreground font-bold text-sm">Buy gems</Text>
            </Button>
          </Glass>
          <Glass radius={28} className="flex-1 overflow-hidden border border-border">
            <Button
              variant="ghost"
              onPress={() => openSheet("withdraw")}
              className="flex-row items-center justify-center h-16 gap-3 p-0 min-h-0 min-w-0 bg-transparent active:bg-muted rounded-none">
              <Icon as={DownloadIcon} size={20} className="text-accent" />
              <Text className="text-foreground font-bold text-sm">Withdraw</Text>
            </Button>
          </Glass>
        </View>

        {/* Activity Section */}
        <View className="mt-10">
          <Text className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-6 ml-1">
            Activity
          </Text>

          <View className="gap-3">
            {isActivityLoading ? (
              <Skeleton className="h-20 w-full rounded-[24px]" />
            ) : activity?.length === 0 ? (
              <Text className="text-muted-foreground text-center py-4">No recent activity.</Text>
            ) : (
              (activity || []).map((item) => {
                const isReceived = item.type === "received";
                const iconColor = isReceived ? "text-primary" : "text-destructive";
                const bgColor = isReceived ? "bg-primary/10" : "bg-destructive/10";

                return (
                  <Glass
                    key={item.id}
                    radius={24}
                    className="p-4 flex-row items-center border border-border">
                    <View
                      className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${bgColor}`}>
                      <Icon
                        as={isReceived ? ArrowDownLeftIcon : ArrowUpRightIcon}
                        size={20}
                        className={iconColor}
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-foreground font-bold text-sm">{item.label}</Text>
                      <Text className="text-muted-foreground text-xs">{item.sublabel}</Text>
                    </View>
                    <Text
                      className={`font-bold text-base ${isReceived ? "text-primary" : "text-destructive"}`}>
                      {item.amount}
                    </Text>
                  </Glass>
                );
              })
            )}
          </View>
        </View>
      </ScrollView>

      <ComingSoonSheet
        open={comingSoonOpen}
        onOpenChange={setComingSoonOpen}
        title={sheetType === "buy" ? "Buy Gems" : "Withdraw Earnings"}
      />
    </View>
  );
}
