import BottomSheet, {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  ArrowDownLeftIcon,
  ArrowLeft,
  ArrowUpRightIcon,
  Clock,
  DownloadIcon,
  PlusCircleIcon,
  Zap,
} from "lucide-react-native";
import { useCallback, useRef, useState } from "react";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Glass } from "@/components/layout/Glass";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/contexts/auth-context";
import { useGemActivity, useWalletBalance } from "@/features/gems/api/queries";
import { useColors } from "@/hooks/use-colors";

export function WalletScreen() {
  const insets = useSafeAreaInsets();
  const { session } = useAuth();
  const { data: wallet } = useWalletBalance(session?.user?.id || null);
  const { data: activity } = useGemActivity(session?.user?.id || null);
  const colors = useColors();
  const router = useRouter();

  const bottomSheetRef = useRef<BottomSheet>(null);
  const [sheetType, setSheetType] = useState<"buy" | "withdraw">("buy");

  const openSheet = (type: "buy" | "withdraw") => {
    setSheetType(type);
    bottomSheetRef.current?.expand();
  };

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        pressBehavior="close"
      />
    ),
    []
  );

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120, paddingHorizontal: 24 }}
        showsVerticalScrollIndicator={false}>
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
              <Text className="text-foreground text-7xl font-bold">{wallet?.balance ?? 1250}</Text>
              <Text className="text-muted-foreground text-base font-medium mt-1">gems</Text>
            </View>

            <Glass radius={20} className="px-4 py-2 mt-4 border border-border">
              <View className="flex-row items-center">
                <Text className="text-xs mr-2">🇰🇪</Text>
                <Text className="text-foreground text-xs font-bold">
                  ≈ KSh{((wallet?.balance ?? 1250) * 1.3).toFixed(0)}
                </Text>
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
            {(activity || []).map((item) => {
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
            })}
          </View>
        </View>
      </ScrollView>

      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        enableDynamicSizing
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: colors.background, borderRadius: 32 }}
        handleIndicatorStyle={{ backgroundColor: colors.mutedForeground }}>
        <BottomSheetView className="px-8 pt-4 pb-10 items-center">
          <View className="w-16 h-16 rounded-full bg-primary/10 items-center justify-center border border-primary/20 mb-6">
            <Icon as={Clock} size={28} className="text-primary" />
          </View>
          <Text className="text-foreground font-bold text-2xl mb-2">Coming Soon</Text>
          <Text className="text-primary font-bold text-xs uppercase tracking-widest mb-4">
            {sheetType === "buy" ? "BUY GEMS" : "WITHDRAW EARNINGS"}
          </Text>
          <Text className="text-muted-foreground text-center text-base px-2 mb-8 font-[Inter_400Regular]">
            We're polishing this experience for launch. You'll be the first to know when it goes
            live.
          </Text>
          <Button
            onPress={() => bottomSheetRef.current?.close()}
            className="w-full h-14 rounded-full bg-primary">
            <Text className="text-primary-foreground font-bold text-lg">Okay</Text>
          </Button>
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}
