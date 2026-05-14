import { DiamondIcon, LandmarkIcon, PhoneIcon, WalletIcon } from "lucide-react-native";
import { useRef, useState } from "react";
import { Alert, Pressable, ScrollView, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ErrorBoundary } from "@/components/error-boundary/ErrorBoundary";
import { Button } from "@/components/ui/button";
import { Glass } from "@/components/ui/glass";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { usePayoutMutation, useWalletBalance } from "@/features/gems/api/queries";
import { useNetwork } from "@/hooks/use-network";

const PROVIDERS = [
  { id: "mpesa", name: "M-Pesa", color: "#4CAF50" },
  { id: "airtel", name: "Airtel Money", color: "#F44336" },
  { id: "mtn", name: "MTN MoMo", color: "#FFC107" },
];

export function WalletScreen() {
  const insets = useSafeAreaInsets();
  const { isOnline } = useNetwork();
  const { data: wallet, isLoading: isWalletLoading } = useWalletBalance();
  const { mutate: payout, isPending } = usePayoutMutation();

  const [amount, setAmount] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [provider, setProvider] = useState("mpesa");

  const phoneRef = useRef<TextInput>(null);

  const handlePayout = () => {
    const numAmount = parseInt(amount, 10);
    if (!numAmount || numAmount <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid amount of Gems.");
      return;
    }
    if ((wallet?.balance ?? 0) < numAmount) {
      Alert.alert("Insufficient Balance", "You do not have enough Gems for this payout.");
      return;
    }
    if (!phoneNumber) {
      Alert.alert("Phone Number Required", "Please enter your mobile money number.");
      return;
    }

    payout(
      {
        gemAmount: numAmount,
        provider: provider,
        mobileMoneyNumber: phoneNumber,
        fiatAmount: (numAmount / 100).toString(),
        fiatCurrency: "KES",
      },
      {
        onSuccess: () => {
          Alert.alert(
            "Payout Initiated",
            "Your request is being processed. Funds will arrive in your wallet shortly."
          );
          setAmount("");
        },
        onError: (error) => {
          Alert.alert("Payout Failed", error.message || "Something went wrong.");
        },
      }
    );
  };

  if (!isOnline) {
    return (
      <View className="flex-1 items-center justify-center p-6 bg-background">
        <Glass className="p-6 items-center">
          <Text variant="h3" className="mb-2">
            Offline Dashboard
          </Text>
          <Text className="text-muted-foreground text-center">
            Wallet operations require a live connection. Showing last cached balance.
          </Text>
        </Glass>
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <ScrollView
        className="flex-1 bg-background"
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: insets.top + 20,
          paddingBottom: 140,
          paddingHorizontal: 20,
        }}>
        <Text variant="h1" className="mb-6 text-[#bef445]">
          Gems Wallet
        </Text>

        {/* Balance Card */}
        <Glass intensity={40} className="p-6 mb-8 border border-[#bef445]/20">
          <View className="flex-row items-center gap-3 mb-2">
            <Icon as={WalletIcon} className="text-[#bef445]" size={20} />
            <Text className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">
              Current Balance
            </Text>
          </View>
          <View className="flex-row items-end gap-2">
            <Text className="text-4xl font-bold text-white">
              {isWalletLoading ? "..." : wallet?.balance.toLocaleString()}
            </Text>
            <Text className="text-xl font-bold text-[#bef445] mb-1">GEMS</Text>
          </View>
          <Text className="text-muted-foreground text-xs mt-4">
            ≈ ${((wallet?.balance ?? 0) / 100).toFixed(2)} USD available for payout
          </Text>
        </Glass>

        {/* Payout Form */}
        <View>
          <Text variant="h3" className="mb-4">
            Initiate Payout
          </Text>

          <Text className="text-xs font-bold uppercase text-muted-foreground mb-2 ml-1">
            Payout Provider
          </Text>
          <View className="flex-row gap-2 mb-6">
            {PROVIDERS.map((p) => (
              <Pressable
                key={p.id}
                onPress={() => setProvider(p.id)}
                className={`flex-1 py-3 px-2 rounded-xl border items-center justify-center ${provider === p.id ? "bg-[#bef445]/10 border-[#bef445]" : "bg-white/5 border-white/10"}`}>
                <Text
                  className={`text-[10px] font-bold text-center ${provider === p.id ? "text-[#bef445]" : "text-white"}`}>
                  {p.name}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text className="text-xs font-bold uppercase text-muted-foreground mb-2 ml-1">
            Amount to Payout
          </Text>
          <Glass className="mb-6 h-14 justify-center px-4">
            <View className="flex-row items-center gap-3">
              <Icon as={DiamondIcon} className="text-[#bef445]" size={18} />
              <TextInput
                value={amount}
                onChangeText={setAmount}
                placeholder="0"
                placeholderTextColor="rgba(255,255,255,0.3)"
                keyboardType="numeric"
                returnKeyType="next"
                onSubmitEditing={() => phoneRef.current?.focus()}
                className="flex-1 text-white font-bold text-lg"
              />
            </View>
          </Glass>

          <Text className="text-xs font-bold uppercase text-muted-foreground mb-2 ml-1">
            Phone Number (Mobile Money)
          </Text>
          <Glass className="mb-8 h-14 justify-center px-4">
            <View className="flex-row items-center gap-3">
              <Icon as={PhoneIcon} className="text-muted-foreground" size={18} />
              <TextInput
                ref={phoneRef}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="+254..."
                placeholderTextColor="rgba(255,255,255,0.3)"
                keyboardType="phone-pad"
                returnKeyType="done"
                onSubmitEditing={handlePayout}
                className="flex-1 text-white font-bold text-lg"
              />
            </View>
          </Glass>

          <Button
            onPress={handlePayout}
            isLoading={isPending}
            className="h-16 rounded-xl bg-[#bef445]">
            <View className="flex-row items-center gap-2">
              <Text className="text-black font-bold text-lg">Convert to Cash</Text>
              <Icon as={LandmarkIcon} className="text-black" size={20} />
            </View>
          </Button>

          <Text className="text-[10px] text-muted-foreground text-center mt-4 px-6">
            By initiating a payout, you agree to our 2% processing fee. Funds are typically
            available within 5 minutes.
          </Text>
        </View>
      </ScrollView>
    </ErrorBoundary>
  );
}
