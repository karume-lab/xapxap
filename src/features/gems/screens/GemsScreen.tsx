import { Stack } from "expo-router";
import { DiamondIcon } from "lucide-react-native";
import { View } from "react-native";
import { Glass } from "@/components/ui/glass";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";

export function GemsScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Gem Economy", headerTransparent: true }} />
      <View className="flex-1 bg-background items-center justify-center p-6">
        <Glass glow="magenta" className="p-8 items-center gap-4 w-full">
          <View className="bg-magenta/20 p-4 rounded-full">
            <Icon as={DiamondIcon} className="text-magenta size-10" />
          </View>
          <Text className="text-2xl font-bold text-foreground">Gems</Text>
          <Text className="text-muted-foreground text-center">
            The heartbeat of the XapXap economy.
          </Text>
        </Glass>
      </View>
    </>
  );
}
