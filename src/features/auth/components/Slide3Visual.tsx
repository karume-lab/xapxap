import { RadioIcon } from "lucide-react-native";
import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { Glass } from "@/components/layout/Glass";
import { Text } from "@/components/ui/text";
import { useColors } from "@/hooks/use-colors";

export function Slide3Visual() {
  const colors = useColors();
  const signalVal = useSharedValue(0);
  const dataSaverPulse = useSharedValue(1);

  useEffect(() => {
    signalVal.value = withRepeat(
      withSequence(withTiming(1, { duration: 1800 }), withTiming(0, { duration: 1800 })),
      -1,
      true
    );
    dataSaverPulse.value = withRepeat(
      withSequence(withTiming(1.05, { duration: 800 }), withTiming(1.0, { duration: 800 })),
      -1,
      true
    );
  }, [signalVal, dataSaverPulse]);

  const animatedSignalStyle = useAnimatedStyle(() => {
    const opacity = interpolate(signalVal.value, [0, 0.5, 1], [0.3, 0.7, 1]);
    return { opacity };
  });

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: dataSaverPulse.value }],
  }));

  return (
    <Glass className="h-64 w-full items-center justify-center relative overflow-hidden border border-zinc-800">
      <View className="flex-row items-end justify-center gap-2 h-20 mb-4">
        {/* Signal Bars */}
        <View className="w-3 h-8 bg-zinc-800 rounded-full" />
        <Animated.View
          style={animatedSignalStyle}
          className="w-3 h-12 rounded-full bg-primary/60"
        />
        <Animated.View style={animatedSignalStyle} className="w-3 h-16 rounded-full bg-primary" />
      </View>

      <Animated.View
        style={pulseStyle}
        className="px-4 py-1.5 rounded-full flex-row items-center gap-1.5 bg-primary/10 border border-primary/30">
        <RadioIcon size={14} color={colors.primary} />
        <Text className="text-xs font-bold tracking-wider font-mono text-primary">
          DATA SAVER ACTIVE
        </Text>
      </Animated.View>

      <View className="absolute bottom-4">
        <Text className="text-xs text-zinc-500 font-mono">STABLE STREAMING AT 200 KB/S</Text>
      </View>
    </Glass>
  );
}
