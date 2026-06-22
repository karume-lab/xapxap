import { Stack } from "expo-router";
import { Layers } from "lucide-react-native";
import { View } from "react-native";
import { Glass } from "@/components/layout/Glass";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";

export function FleetScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Fleet Decks", headerTransparent: true }} />
      <View className="flex-1 bg-background items-center justify-center p-6">
        <Glass glow="cyan" className="p-8 items-center gap-4 w-full">
          <View className="bg-accent/20 p-4 rounded-full">
            <Icon as={Layers} className="text-accent size-10" />
          </View>
          <Text className="text-2xl font-bold text-foreground">Fleet Decks</Text>
          <Text className="text-muted-foreground text-center">
            Community-driven content streams. Coming soon.
          </Text>
        </Glass>
      </View>
    </>
  );
}
