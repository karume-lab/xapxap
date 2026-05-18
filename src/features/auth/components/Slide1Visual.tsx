import { FlameIcon } from "lucide-react-native";
import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { Glass } from "@/components/layout/Glass";
import { Text } from "@/components/ui/text";
import { useColors } from "@/hooks/use-colors";

export function Slide1Visual() {
  const colors = useColors();
  const pulse = useSharedValue(1);
  const rotation = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(withTiming(1.1, { duration: 1200 }), withTiming(1.0, { duration: 1200 })),
      -1,
      true
    );
    rotation.value = withRepeat(withTiming(360, { duration: 10000 }), -1, false);
  }, [pulse, rotation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const rotatingStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Glass className="h-64 w-full items-center justify-center relative overflow-hidden border border-border">
      {/* Decorative Rotating Radar */}
      <Animated.View
        style={rotatingStyle}
        className="w-[180px] h-[180px] rounded-full border border-dashed border-primary/20 absolute"
      />
      <View className="w-32 h-32 rounded-full border border-border items-center justify-center bg-muted/80 backdrop-blur-md relative z-10">
        <Animated.View
          style={animatedStyle}
          className="p-5 rounded-full border bg-primary/10 border-primary/30">
          <FlameIcon size={44} color={colors.primary} />
        </Animated.View>
      </View>
      <View className="absolute bottom-4 flex-row items-center gap-1.5 px-3 py-1 bg-muted/60 rounded-full border border-border">
        <View className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
        <Text className="text-xs text-muted-foreground font-mono">0:59 / 60s LIMIT</Text>
      </View>
    </Glass>
  );
}
