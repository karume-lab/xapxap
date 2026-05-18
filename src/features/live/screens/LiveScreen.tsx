import { Stack } from "expo-router";
import { VideoIcon } from "lucide-react-native";
import { View } from "react-native";
import { Glass } from "@/components/layout/Glass";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";

export function LiveScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Live Streaming", headerTransparent: true }} />
      <View className="flex-1 bg-background items-center justify-center p-6">
        <Glass glow="lime" className="p-8 items-center gap-4 w-full">
          <View className="bg-primary/20 p-4 rounded-full">
            <Icon as={VideoIcon} className="text-primary size-10" />
          </View>
          <Text className="text-2xl font-bold text-foreground">Live Streams</Text>
          <Text className="text-muted-foreground text-center">
            Drift Expo & Aqua Premium streams.
          </Text>
        </Glass>
      </View>
    </>
  );
}
