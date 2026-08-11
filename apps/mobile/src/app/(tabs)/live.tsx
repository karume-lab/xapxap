import { Video } from "lucide-react-native";
import { useState } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Glass } from "@/components/layout/Glass";
import { ComingSoonDialog } from "@/components/ui/coming-soon-dialog";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";

export default function LiveTabComingSoon() {
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(true);

  return (
    <View
      className="flex-1 bg-background items-center justify-center p-6"
      style={{ paddingTop: insets.top }}>
      <Glass radius={32} className="p-8 items-center border border-border w-full">
        <View className="w-16 h-16 rounded-full bg-destructive/10 items-center justify-center border border-destructive/20 mb-4">
          <Icon as={Video} size={28} className="text-destructive" />
        </View>
        <Text className="text-foreground font-bold text-xl mb-2 text-center">Live Streaming</Text>
        <Text className="text-muted-foreground text-center text-sm leading-6">
          Go live and broadcast to your crew. This feature is launching soon!
        </Text>
      </Glass>
      <ComingSoonDialog
        open={open}
        onOpenChange={setOpen}
        title="Live Streaming"
        description="Go live and broadcast to your crew in real time. This feature is launching soon!"
      />
    </View>
  );
}
