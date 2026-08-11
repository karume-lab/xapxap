import BottomSheet, {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { Clock } from "lucide-react-native";
import { useCallback } from "react";
import { View } from "react-native";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { useColors } from "@/hooks/use-colors";

interface ComingSoonSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
}

export function ComingSoonSheet({
  open,
  onOpenChange,
  title = "Coming Soon",
  description = "We're polishing this experience for launch. You'll be the first to know when it goes live.",
}: ComingSoonSheetProps) {
  const colors = useColors();

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        pressBehavior="close"
      />
    ),
    []
  );

  return (
    <BottomSheet
      index={open ? 0 : -1}
      enableDynamicSizing
      enablePanDownToClose
      onClose={() => onOpenChange(false)}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: colors.background, borderRadius: 32 }}
      handleIndicatorStyle={{ backgroundColor: colors.mutedForeground }}>
      <BottomSheetView className="px-8 pt-2 pb-10 items-center">
        <View className="w-16 h-16 rounded-full bg-primary/10 items-center justify-center border border-primary/20 mb-6">
          <Icon as={Clock} size={28} className="text-primary" />
        </View>
        <Text className="text-foreground font-bold text-2xl mb-2">{title}</Text>
        <Text className="text-muted-foreground text-center text-base px-2 mb-8 font-[Inter_400Regular]">
          {description}
        </Text>
        <Button onPress={() => onOpenChange(false)} className="w-full h-14 rounded-full bg-primary">
          <Text className="text-primary-foreground font-bold text-lg">Got it</Text>
        </Button>
      </BottomSheetView>
    </BottomSheet>
  );
}
