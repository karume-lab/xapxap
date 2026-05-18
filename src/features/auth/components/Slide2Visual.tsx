import { CoinsIcon, SparklesIcon } from "lucide-react-native";
import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { Glass } from "@/components/ui/glass";
import { Text } from "@/components/ui/text";
import { useColors } from "@/hooks/use-colors";

export function Slide2Visual() {
  const colors = useColors();
  const floatVal = useSharedValue(0);
  const spinVal = useSharedValue(0);

  useEffect(() => {
    floatVal.value = withRepeat(
      withSequence(withTiming(-12, { duration: 1500 }), withTiming(0, { duration: 1500 })),
      -1,
      true
    );
    spinVal.value = withRepeat(
      withSequence(withTiming(15, { duration: 2000 }), withTiming(-15, { duration: 2000 })),
      -1,
      true
    );
  }, [floatVal, spinVal]);

  const animatedGemStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatVal.value }, { rotate: `${spinVal.value}deg` }],
  }));

  return (
    <Glass
      glow="cyan"
      className="h-64 w-full items-center justify-center relative overflow-hidden border border-zinc-800 shadow-2xl">
      <Animated.View style={[animatedGemStyle]} className="items-center justify-center relative">
        {/* Floating Diamond Gem */}
        <View
          style={{ borderColor: colors.accent }}
          className="w-24 h-24 bg-zinc-900/95 border rounded-2xl items-center justify-center transform rotate-45 shadow-2xl">
          <View className="transform -rotate-45">
            <CoinsIcon size={38} color={colors.accent} />
          </View>
        </View>
      </Animated.View>

      <View className="absolute bottom-4 px-3 py-1 bg-zinc-900/60 rounded-full border border-zinc-800 flex-row items-center gap-1.5">
        <SparklesIcon size={12} color={colors.primary} />
        <Text className="text-xs text-zinc-400 font-mono">INSTANT PAYOUTS</Text>
      </View>
    </Glass>
  );
}
