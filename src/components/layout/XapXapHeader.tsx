import { useRouter } from "expo-router";
import { BellIcon, WifiIcon } from "lucide-react-native";
import { Pressable, View } from "react-native";

import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { useDataSaver } from "@/contexts/data-saver-context";
import { useWalletBalance } from "@/features/gems/api/queries";

export function XapXapHeader() {
  const router = useRouter();
  const { data: wallet } = useWalletBalance();
  const { dataSaver, toggle: toggleDataSaver } = useDataSaver();

  return (
    <View className="flex-row items-center justify-between px-6 py-4">
      {/* Logo */}
      <View className="flex-row">
        <Text className="text-white text-2xl font-bold font-[Inter_700Bold]">Xap</Text>
        <Text className="text-[#bef445] text-2xl font-bold font-[Inter_700Bold]">Xap</Text>
      </View>

      {/* Right Actions */}
      <View className="flex-row items-center gap-3">
        {/* Gems Pill */}
        <Pressable onPress={() => router.push("/gems")}>
          <View className="px-4 py-1.5 rounded-full border border-[#bef445]/30 bg-black/60">
            <Text
              className="text-[#bef445] font-bold text-sm"
              style={{
                textShadowColor: "rgba(0,0,0,0.8)",
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 3,
              }}>
              {wallet?.balance ?? 1250} gems
            </Text>
          </View>
        </Pressable>

        {/* Notification Bell */}
        <Pressable
          onPress={() => router.push("/notifications")}
          className="w-10 h-10 rounded-full bg-black/40 items-center justify-center border border-white/20 active:scale-95">
          <Icon as={BellIcon} size={18} className="text-white" />
        </Pressable>

        {/* Data Saver / Signal */}
        <Pressable
          onPress={toggleDataSaver}
          className={`w-10 h-10 rounded-full items-center justify-center border ${dataSaver ? "bg-[#bef445]/10 border-[#bef445]/40" : "bg-black/40 border-white/20"}`}>
          <Icon as={WifiIcon} size={18} className={dataSaver ? "text-[#bef445]" : "text-white"} />
        </Pressable>
      </View>
    </View>
  );
}
