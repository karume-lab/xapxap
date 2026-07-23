import { useRouter } from "expo-router";
import { Bell, Wifi } from "lucide-react-native";
import { View } from "react-native";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { useDataSaver } from "@/contexts/data-saver-context";

export function XapXapHeader() {
  const router = useRouter();

  const { dataSaver, toggle: toggleDataSaver } = useDataSaver();

  return (
    <View className="flex-row items-center justify-between px-6 py-4">
      {/* Logo */}
      <View className="flex-row">
        <Text className="text-foreground text-2xl font-bold font-[Inter_700Bold]">Xap</Text>
        <Text className="text-primary text-2xl font-bold font-[Inter_700Bold]">Xap</Text>
      </View>

      {/* Right Actions */}
      <View className="flex-row items-center gap-3">
        {/* Notification Bell */}
        <Button
          variant="ghost"
          onPress={() => router.push("/notifications")}
          className="w-10 h-10 rounded-full bg-muted items-center justify-center border border-border active:scale-95 p-0 min-w-0 min-h-0 active:bg-transparent">
          <Icon as={Bell} size={18} className="text-foreground" />
        </Button>

        {/* Data Saver / Signal */}
        <Button
          variant="ghost"
          onPress={toggleDataSaver}
          className={`w-10 h-10 rounded-full items-center justify-center border p-0 min-w-0 min-h-0 active:bg-transparent ${dataSaver ? "bg-primary/10 border-primary/40" : "bg-muted border-border"}`}>
          <Icon as={Wifi} size={18} className={dataSaver ? "text-primary" : "text-foreground"} />
        </Button>
      </View>
    </View>
  );
}
