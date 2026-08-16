import { Bell } from "lucide-react-native";
import { useState } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Glass } from "@/components/layout/Glass";
import { ComingSoonSheet } from "@/components/ui/coming-soon-sheet";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";

export default function NotificationsTabComingSoon() {
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);

  return (
    <View
      className="flex-1 bg-background items-center justify-center p-6"
      style={{ paddingTop: insets.top }}>
      <Glass radius={32} className="p-8 items-center border border-border w-full">
        <View className="w-16 h-16 rounded-full bg-primary/10 items-center justify-center border border-primary/20 mb-4">
          <Icon as={Bell} size={28} className="text-primary" />
        </View>
        <Text className="text-foreground font-bold text-xl mb-2 text-center">Notifications</Text>
        <Text className="text-muted-foreground text-center text-sm leading-6">
          Track likes, comments, gems, and account updates. Coming soon!
        </Text>
      </Glass>
      <ComingSoonSheet
        open={open}
        onOpenChange={setOpen}
        title="Notifications"
        description="Track likes, comments, gems tipped by fans, and account updates. This feature is launching soon!"
      />
    </View>
  );
}
