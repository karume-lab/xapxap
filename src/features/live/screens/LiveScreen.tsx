import { router, Stack } from "expo-router";
import { ArrowLeft, Zap } from "lucide-react-native";
import { ScrollView, View } from "react-native";

import { Glass } from "@/components/layout/Glass";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";

export function LiveScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Live", headerTransparent: true }} />
      <ScrollView className="flex-1 bg-background px-6 pt-32">
        <Text className="text-sm font-bold text-muted-foreground tracking-widest mb-4 uppercase">
          Upcoming
        </Text>
        <Glass className="w-full h-32 rounded-3xl mb-8" />

        <Text className="text-sm font-bold text-muted-foreground tracking-widest mb-4 uppercase">
          1 Minute Fame
        </Text>
        <Glass className="p-6 rounded-3xl gap-4 w-full mb-32">
          <View className="flex-row items-start gap-4">
            <View className="bg-amber-500/20 p-4 rounded-full mt-1">
              <Icon as={Zap} className="text-amber-500 size-6" />
            </View>
            <View className="flex-1">
              <Text className="text-xl font-bold text-foreground mb-2">Boost any wave</Text>
              <Text className="text-muted-foreground text-base leading-6">
                Tap the <Icon as={Zap} className="text-amber-500 size-4 inline" /> "1 Min Fame"
                button on your waves in the feed to launch a 60-second boost window and track live
                engagement.
              </Text>
            </View>
          </View>
          <View className="flex-row mt-4">
            <Button
              variant="outline"
              className="rounded-full border-amber-500/30 gap-2 px-6"
              onPress={() => router.push("/")}>
              <Icon as={ArrowLeft} className="text-amber-500 size-4" />
              <Text className="text-amber-500 font-semibold">Go to Feed</Text>
            </Button>
          </View>
        </Glass>
      </ScrollView>
    </>
  );
}
