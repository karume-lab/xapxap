import { useLocalSearchParams, useRouter } from "expo-router";
import { DiamondIcon, SendIcon, XIcon } from "lucide-react-native";
import React, { useState } from "react";
import { Alert, Pressable, ScrollView, View } from "react-native";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Glass } from "@/components/ui/glass";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { useTipMutation, useWalletBalance } from "@/features/gems/api/queries";

const TIP_AMOUNTS = [10, 50, 100, 500, 1000];

export default function GemsScreen() {
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
    <View className="flex-1 justify-end bg-black/40">
      <Glass intensity={80} className="rounded-t-[32px] p-6 border-t border-white/20">
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text variant="h3">Send a Gift</Text>
            <Text className="text-muted-foreground">Support creator growth</Text>
          </View>
          <Pressable onPress={() => router.back()} className="p-2">
            <Icon as={XIcon} className="text-white" size={24} />
          </Pressable>
        </View>

        <View className="items-center mb-8">
          <Avatar url={avatarUrl as string} username={username as string} size={80} ring />
          <Text className="mt-3 font-bold text-xl">@{username}</Text>
        </View>

        <Text className="text-xs font-bold uppercase text-muted-foreground mb-3 ml-1">
          Select Amount
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="flex-row gap-3 mb-8">
          {TIP_AMOUNTS.map((amount) => (
            <Pressable
              key={amount}
              onPress={() => setSelectedAmount(amount)}
              className={`px-6 py-3 rounded-2xl border ${selectedAmount === amount ? "bg-[#bef445] border-[#bef445]" : "bg-white/5 border-white/10"}`}>
              <View className="flex-row items-center gap-2">
                <Icon
                  as={DiamondIcon}
                  size={16}
                  className={selectedAmount === amount ? "text-black" : "text-[#bef445]"}
                />
                <Text
                  className={`font-bold text-lg ${selectedAmount === amount ? "text-black" : "text-white"}`}>
                  {amount}
                </Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>

        <View className="bg-white/5 p-4 rounded-2xl border border-white/10 mb-8 flex-row justify-between items-center">
          <View>
            <Text className="text-xs text-muted-foreground">Your Balance</Text>
            <Text className="font-bold text-[#bef445] text-lg">{wallet?.balance ?? 0} Gems</Text>
          </View>
          <DiamondIcon size={24} color="#bef445" />
        </View>

        <Button onPress={handleTip} isLoading={isPending} className="h-16 rounded-xl bg-[#bef445]">
          <View className="flex-row items-center gap-2">
            <Text className="text-black font-bold text-lg">Send {selectedAmount} Gems</Text>
            <Icon as={SendIcon} className="text-black" size={20} />
          </View>
        </Button>
      </Glass>
    </View>
  );
}
