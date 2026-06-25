import BottomSheet, {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import { ArrowLeft, Clock, Plus, Users } from "lucide-react-native";
import { useCallback, useRef } from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Glass } from "@/components/layout/Glass";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { useFleets } from "@/features/fleet/api/queries";
import { useColors } from "@/hooks/use-colors";

export function FleetScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: fleets } = useFleets();
  const colors = useColors();
  const bottomSheetRef = useRef<BottomSheet>(null);

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
    <View className="flex-1 bg-background relative">
      {/* Custom Header with Back Button */}
      <View
        className="px-6 flex-row items-center z-10 bg-background/80"
        style={{ paddingTop: insets.top + 16, paddingBottom: 16 }}>
        <Button
          variant="ghost"
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-muted items-center justify-center mr-4 p-0 min-w-0 min-h-0 active:bg-transparent">
          <Icon as={ArrowLeft} size={20} className="text-foreground" />
        </Button>
        <Text className="text-foreground font-bold text-2xl font-[Inter_700Bold]">Fleet Decks</Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingTop: 16,
          paddingHorizontal: 24,
          paddingBottom: 120,
        }}
        showsVerticalScrollIndicator={false}>
        {(fleets || []).map((deck) => (
          <TouchableOpacity
            key={deck.id}
            activeOpacity={0.7}
            onPress={() => bottomSheetRef.current?.expand()}>
            <Glass radius={24} className="p-6 border border-border mb-4">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-foreground font-bold text-lg">{deck.name}</Text>
                <View className="bg-primary/10 px-2 py-1 rounded-full border border-primary/20">
                  <Text className="text-primary text-xs font-bold capitalize">
                    {deck.category || "General"}
                  </Text>
                </View>
              </View>
              <Text className="text-muted-foreground text-sm mb-4 leading-5" numberOfLines={2}>
                {deck.description}
              </Text>
              <View className="flex-row items-center">
                <Icon as={Users} size={14} className="text-muted-foreground mr-1" />
                <Text className="text-muted-foreground text-xs font-medium">
                  {deck.memberCount.toLocaleString()} members
                </Text>
                {!deck.isOpen && (
                  <Text className="text-accent text-xs font-bold ml-auto">Private</Text>
                )}
              </View>
            </Glass>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Floating Action Button */}
      <View className="absolute right-6" style={{ bottom: Math.max(insets.bottom + 24, 100) }}>
        <Button
          onPress={() => router.push("/fleet/create")}
          className="w-16 h-16 rounded-full bg-primary shadow-xl shadow-primary/20 items-center justify-center p-0 min-w-0 min-h-0">
          <Icon as={Plus} size={28} className="text-primary-foreground" />
        </Button>
      </View>

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
            JOIN FLEET DECK
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
