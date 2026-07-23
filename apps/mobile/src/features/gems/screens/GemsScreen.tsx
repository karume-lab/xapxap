import { useLocalSearchParams, useRouter } from "expo-router";
import { Diamond, Send, X } from "lucide-react-native";
import { useState } from "react";
import { Alert, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Glass } from "@/components/layout/Glass";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/contexts/auth-context";
import { useTipMutation, useWalletBalance } from "@/features/gems/api/queries";
import { useColors } from "@/hooks/use-colors";

const TIP_AMOUNTS = [10, 50, 100, 500, 1000];

export default function GemsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colors = useColors();
  const { creatorId, username, avatarUrl } = useLocalSearchParams<{
    creatorId: string;
    username: string;
    avatarUrl: string;
  }>();

  const { session } = useAuth();
  const { data: wallet } = useWalletBalance(session?.user?.id || null);
  const { mutate: tip, isPending } = useTipMutation(session?.user?.id || null);
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
    <View className="flex-1 justify-end bg-background/60">
      <Glass
        intensity={95}
        className="rounded-t-[40px] p-8 border-t border-border"
        style={{ paddingBottom: insets.bottom + 100 }}>
        <View className="flex-row justify-between items-center mb-8">
          <View>
            <Text variant="h2" className="text-foreground">
              Send a Gift
            </Text>
            <Text className="text-muted-foreground text-sm">Empower creator content</Text>
          </View>
          <Button
            variant="ghost"
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-muted items-center justify-center p-0 min-w-0 min-h-0 active:bg-transparent">
            <Icon as={X} className="text-foreground" size={20} />
          </Button>
        </View>

        <View className="items-center mb-10">
          <View className="relative">
            <Avatar url={avatarUrl as string} username={username as string} size={100} ring />
            <View className="absolute -bottom-1 -right-1 bg-primary w-6 h-6 rounded-full items-center justify-center border-2 border-background">
              <Icon as={Diamond} className="text-primary-foreground" size={12} />
            </View>
          </View>
          <Text className="mt-4 font-bold text-2xl text-foreground">@{username}</Text>
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
            <Button
              key={amount}
              variant="ghost"
              onPress={() => setSelectedAmount(amount)}
              className={`px-8 py-4 rounded-3xl border h-auto min-h-0 min-w-0 active:bg-transparent ${selectedAmount === amount ? "bg-primary border-primary" : "bg-muted border-border"}`}>
              <View className="flex-row items-center gap-2">
                <Icon
                  as={Diamond}
                  size={16}
                  className={selectedAmount === amount ? "text-primary-foreground" : "text-primary"}
                />
                <Text
                  className={`font-bold text-xl ${selectedAmount === amount ? "text-primary-foreground" : "text-foreground"}`}>
                  {amount}
                </Text>
              </View>
            </Button>
          ))}
        </ScrollView>

        <View className="bg-muted p-5 rounded-3xl border border-border mb-10 flex-row justify-between items-center">
          <View>
            <Text className="text-[10px] font-bold uppercase text-muted-foreground mb-1 tracking-widest">
              Available Balance
            </Text>
            <Text className="font-bold text-primary text-2xl">{wallet?.balance ?? 0} Gems</Text>
          </View>
          <View className="w-12 h-12 rounded-2xl bg-primary/10 items-center justify-center">
            <Diamond size={28} color={colors.primary} />
          </View>
        </View>

        <Button
          onPress={handleTip}
          isLoading={isPending}
          className="h-18 rounded-3xl bg-primary shadow-lg shadow-primary/20">
          <View className="flex-row items-center gap-3">
            <Text className="text-primary-foreground font-bold text-xl">Confirm & Send</Text>
            <Icon as={Send} className="text-primary-foreground" size={20} />
          </View>
        </Button>
      </Glass>
    </View>
  );
}
