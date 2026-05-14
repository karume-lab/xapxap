import { useLocalSearchParams, useRouter } from "expo-router";
import { DiamondIcon, SendIcon, XIcon } from "lucide-react-native";
import { useState } from "react";
import { Alert, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Glass } from "@/components/ui/glass";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { useTipMutation, useWalletBalance } from "@/features/gems/api/queries";

const TIP_AMOUNTS = [10, 50, 100, 500, 1000];

export default function GemsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { creatorId, username, avatarUrl } = useLocalSearchParams<{
    creatorId: string;
    username: string;
    avatarUrl: string;
  }>();

  const { data: wallet } = useWalletBalance();
  const { mutate: tip, isPending } = useTipMutation();
  const [selectedAmount, setSelectedAmount] = useState(50);

  const handleTip = () => {
    if ((wallet?.balance ?? 0) < selectedAmount) {
      Alert.alert("Insufficient Gems", "Top up your wallet to send this gift.");
      return;
    }

    tip(
      { creatorId: creatorId as string, amount: selectedAmount },
      {
        onSuccess: () => {
          Alert.alert("Success!", `You sent ${selectedAmount} Gems to ${username}.`);
          router.back();
        },
      }
    );
  };

  return (
    <View className="flex-1 justify-end bg-black/60">
      <Glass
        intensity={95}
        className="rounded-t-[40px] p-8 border-t border-white/20"
        style={{ paddingBottom: insets.bottom + 100 }}>
        <View className="flex-row justify-between items-center mb-8">
          <View>
            <Text variant="h2" className="text-white">
              Send a Gift
            </Text>
            <Text className="text-muted-foreground text-sm">Empower creator content</Text>
          </View>
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-white/10 items-center justify-center">
            <Icon as={XIcon} className="text-white" size={20} />
          </Pressable>
        </View>

        <View className="items-center mb-10">
          <View className="relative">
            <Avatar url={avatarUrl as string} username={username as string} size={100} ring />
            <View className="absolute -bottom-1 -right-1 bg-primary w-6 h-6 rounded-full items-center justify-center border-2 border-background">
              <Icon as={DiamondIcon} className="text-black" size={12} />
            </View>
          </View>
          <Text className="mt-4 font-bold text-2xl text-white">@{username}</Text>
          <Text className="text-muted-foreground text-xs uppercase tracking-widest mt-1">
            Verified Creator
          </Text>
        </View>

        <Text className="text-[10px] font-bold uppercase text-muted-foreground mb-4 ml-1 tracking-widest">
          Select Gem Amount
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="flex-row mb-10"
          contentContainerStyle={{ gap: 12 }}>
          {TIP_AMOUNTS.map((amount) => (
            <Pressable
              key={amount}
              onPress={() => setSelectedAmount(amount)}
              className={`px-8 py-4 rounded-3xl border ${selectedAmount === amount ? "bg-[#bef445] border-[#bef445]" : "bg-white/5 border-white/10"}`}>
              <View className="flex-row items-center gap-2">
                <Icon
                  as={DiamondIcon}
                  size={16}
                  className={selectedAmount === amount ? "text-black" : "text-[#bef445]"}
                />
                <Text
                  className={`font-bold text-xl ${selectedAmount === amount ? "text-black" : "text-white"}`}>
                  {amount}
                </Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>

        <View className="bg-white/5 p-5 rounded-3xl border border-white/10 mb-10 flex-row justify-between items-center">
          <View>
            <Text className="text-[10px] font-bold uppercase text-muted-foreground mb-1 tracking-widest">
              Available Balance
            </Text>
            <Text className="font-bold text-[#bef445] text-2xl">{wallet?.balance ?? 0} Gems</Text>
          </View>
          <View className="w-12 h-12 rounded-2xl bg-[#bef445]/10 items-center justify-center">
            <DiamondIcon size={28} color="#bef445" />
          </View>
        </View>

        <Button
          onPress={handleTip}
          isLoading={isPending}
          className="h-18 rounded-3xl bg-[#bef445] shadow-lg shadow-[#bef445]/20">
          <View className="flex-row items-center gap-3">
            <Text className="text-black font-bold text-xl">Confirm & Send</Text>
            <Icon as={SendIcon} className="text-black" size={20} />
          </View>
        </Button>
      </Glass>
    </View>
  );
}
