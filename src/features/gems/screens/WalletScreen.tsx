import { LinearGradient } from "expo-linear-gradient";
import { ArrowDownLeftIcon, DownloadIcon, PlusCircleIcon, ZapIcon } from "lucide-react-native";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Glass } from "@/components/ui/glass";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { useWalletBalance } from "@/features/gems/api/queries";

const MOCK_ACTIVITY = [
  { id: "1", type: "received", label: "Received gems", sublabel: "Gift on a wave", amount: "+1" },
  { id: "2", type: "received", label: "Received gems", sublabel: "Gift on a wave", amount: "+1" },
  { id: "3", type: "received", label: "Received gems", sublabel: "Welcome gift", amount: "+50" },
];

export function WalletScreen() {
  const insets = useSafeAreaInsets();
  const { data: wallet } = useWalletBalance();

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120, paddingHorizontal: 24 }}
        showsVerticalScrollIndicator={false}>
        <View className="mt-4 mb-8">
          <Text className="text-white text-3xl font-bold font-[Inter_700Bold]">My Treasure</Text>
          <Text className="text-muted-foreground text-sm mt-1">
            Live balance from your gem ledger.
          </Text>
        </View>

        {/* Balance Card */}
        <LinearGradient
          colors={["#1A2A1A", "#1A1A2A", "#2A1A2A"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="rounded-[40px] p-8 items-center border border-white/5 overflow-hidden">
          <View className="items-center">
            <Icon as={ZapIcon} size={32} className="text-primary mb-2" />
            <Text className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">
              Gem Balance
            </Text>

            <View className="my-2 items-center">
              <Text className="text-white text-7xl font-bold shadow-xl shadow-primary/20">
                {wallet?.balance ?? 52}
              </Text>
              <Text className="text-muted-foreground text-base font-medium mt-1">gems</Text>
            </View>

            <Glass radius={20} className="px-4 py-2 mt-4 border border-white/10">
              <View className="flex-row items-center">
                <Text className="text-xs mr-2">🇰🇪</Text>
                <Text className="text-white text-xs font-bold">≈ KSh68</Text>
              </View>
            </Glass>
          </View>
        </LinearGradient>

        {/* Actions */}
        <View className="flex-row gap-4 mt-6">
          <Glass radius={28} className="flex-1 overflow-hidden border border-white/5">
            <View className="flex-row items-center justify-center h-16 gap-3 active:bg-white/5">
              <Icon as={PlusCircleIcon} size={20} className="text-primary" />
              <Text className="text-white font-bold text-sm">Buy gems</Text>
            </View>
          </Glass>
          <Glass radius={28} className="flex-1 overflow-hidden border border-white/5">
            <View className="flex-row items-center justify-center h-16 gap-3 active:bg-white/5">
              <Icon as={DownloadIcon} size={20} className="text-accent" />
              <Text className="text-white font-bold text-sm">Withdraw</Text>
            </View>
          </Glass>
        </View>

        {/* Activity Section */}
        <View className="mt-10">
          <Text className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-6 ml-1">
            Activity
          </Text>

          <View className="gap-3">
            {MOCK_ACTIVITY.map((item) => (
              <Glass
                key={item.id}
                radius={24}
                className="p-4 flex-row items-center border border-white/5">
                <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center mr-4">
                  <Icon as={ArrowDownLeftIcon} size={20} className="text-primary" />
                </View>
                <View className="flex-1">
                  <Text className="text-white font-bold text-sm">{item.label}</Text>
                  <Text className="text-muted-foreground text-xs">{item.sublabel}</Text>
                </View>
                <Text className="text-primary font-bold text-base">{item.amount}</Text>
              </Glass>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
