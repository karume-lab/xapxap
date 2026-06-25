import { Stack, useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Glass } from "@/components/layout/Glass";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

export function FleetScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <>
      <Stack.Screen options={{ title: "Fleet Decks", headerTransparent: true }} />
      <View className="flex-1 bg-background relative">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            paddingTop: insets.top + 80,
            paddingHorizontal: 24,
            paddingBottom: 120,
          }}
          showsVerticalScrollIndicator={false}>
          {/* Mock Empty Decks */}
          <Glass radius={24} className="h-40 border border-border mb-4 bg-muted/30" />
          <Glass radius={24} className="h-40 border border-border mb-4 bg-muted/30" />
          <Glass radius={24} className="h-40 border border-border mb-4 bg-muted/30" />
        </ScrollView>

        {/* Floating Action Button */}
        <View className="absolute bottom-6 right-6">
          <Button
            onPress={() => router.push("/fleet/create")}
            className="w-16 h-16 rounded-full bg-primary shadow-xl shadow-primary/20 items-center justify-center p-0 min-w-0 min-h-0">
            <Icon as={Plus} size={28} className="text-primary-foreground" />
          </Button>
        </View>
      </View>
    </>
  );
}
