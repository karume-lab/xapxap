import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { type FlatList, useWindowDimensions, View, type ViewToken } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  type SharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useColors } from "@/hooks/use-colors";
import { Slide1Visual } from "../components/Slide1Visual";
import { Slide2Visual } from "../components/Slide2Visual";
import { Slide3Visual } from "../components/Slide3Visual";
import { TagSelectionSlide } from "../components/TagSelectionSlide";

const SLIDES = [
  {
    id: "1",
    title: "1 Minute Fame.",
    description:
      "Get discovered instantly. Share your best moments and ride the algorithm to the top.",
    type: "fame",
  },
  {
    id: "2",
    title: "Earn Real Gems.",
    description:
      "Get tipped directly by your fans. Convert gems to mobile money instantly, with zero middleman fees.",
    type: "gems",
  },
  {
    id: "3",
    title: "Built for 3G.",
    description:
      "Data-saver mode ensures you stay connected and streaming, even on the weakest networks.",
    type: "network",
  },
  {
    id: "4",
    title: "Pick your interests.",
    description:
      "Choose your favorite topics to personalize your feed. You can change these anytime.",
    type: "interests",
  },
];

interface PaginatorDotProps {
  index: number;
  scrollX: SharedValue<number>;
  width: number;
}

function PaginatorDot({ index, scrollX, width }: PaginatorDotProps) {
  const colors = useColors();

  const dotStyle = useAnimatedStyle(() => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

    const dotWidth = interpolate(
      scrollX.value,
      inputRange,
      [10, 24, 10], // Stretches to 24px when active
      Extrapolation.CLAMP
    );

    const opacity = interpolate(scrollX.value, inputRange, [0.3, 1, 0.3], Extrapolation.CLAMP);

    return {
      width: dotWidth,
      opacity,
    };
  });

  return (
    <Animated.View
      style={[dotStyle, { backgroundColor: colors.primary }]}
      className="h-2.5 rounded-full"
    />
  );
}

export function OnboardingScreen() {
  const colors = useColors();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const scrollX = useSharedValue(0);
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Offload scroll events to the UI thread for 60fps smoothness
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  // Track the current index for the button text and state logic
  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (
      viewableItems[0] &&
      viewableItems[0].index !== null &&
      viewableItems[0].index !== undefined
    ) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const handleToggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const handleFinishOnboarding = async () => {
    try {
      await AsyncStorage.setItem("has_seen_onboarding", "true");
      if (selectedTags.length > 0) {
        await AsyncStorage.setItem("user_interests", JSON.stringify(selectedTags));
      }
      // TikTok flow: go straight to feed tabs without forcing authentication first!
      router.replace("/(tabs)");
    } catch (e) {
      console.error("Failed to save onboarding progress", e);
      router.replace("/(tabs)");
    }
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      {/* The Animated FlatList */}
      <Animated.FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16} // Fires often for smooth animation
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        renderItem={({ item }) => {
          return (
            <View style={{ width }} className="flex-1 justify-center px-8">
              <View className="mb-12">
                {item.type === "fame" && <Slide1Visual />}
                {item.type === "gems" && <Slide2Visual />}
                {item.type === "network" && <Slide3Visual />}
                {item.type === "interests" && (
                  <TagSelectionSlide selectedTags={selectedTags} onToggleTag={handleToggleTag} />
                )}
              </View>
              <Text className="text-4xl font-[Inter_700Bold] font-bold text-white text-center mb-4">
                {item.title}
              </Text>
              <Text className="text-base text-zinc-400 text-center font-[Inter_400Regular] leading-6">
                {item.description}
              </Text>
            </View>
          );
        }}
      />

      {/* Bottom Controls (Paginator & Button) */}
      <View style={{ paddingBottom: Math.max(insets.bottom, 24) }} className="px-8 w-full">
        {/* The Fluid Paginator */}
        <View className="flex-row justify-center h-16 items-center gap-2">
          {SLIDES.map((_, i) => (
            <PaginatorDot key={i.toString()} index={i} scrollX={scrollX} width={width} />
          ))}
        </View>

        {/* Action Button */}
        <Button
          style={{ backgroundColor: colors.primary }}
          className="w-full h-14 rounded-[26px]"
          onPress={() => {
            if (currentIndex < SLIDES.length - 1) {
              flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
            } else {
              handleFinishOnboarding();
            }
          }}>
          <Text
            style={{ color: colors.primaryForeground }}
            className="font-bold text-lg text-center font-[Inter_700Bold]">
            {currentIndex === SLIDES.length - 1 ? "Enter Wave" : "Next"}
          </Text>
        </Button>
      </View>
    </View>
  );
}
