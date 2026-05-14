import { LinearGradient } from "expo-linear-gradient";
import { Stack } from "expo-router";
import { MoonStarIcon, SunIcon } from "lucide-react-native";
import React from "react";
import { FlatList, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Uniwind, useUniwind } from "uniwind";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { WaveCard } from "@/components/ui/wave-card";
import { useColors } from "@/hooks/use-colors";

const MOCK_POSTS = [
  {
    id: "1",
    content: "Just dropped my first wave on XapXap! The discovery engine here is insane. 🌊🚀",
    createdAt: new Date().toISOString(),
    author: {
      id: "user1",
      username: "drift_master",
      avatarUrl: null,
      isPremium: true,
    },
    counts: { hugs: 24, echoes: 5, casts: 12, anchors: 3 },
    myInteractions: { hug: true, echo: false, cast: false, anchor: false },
  },
  {
    id: "2",
    content:
      "Is anyone else seeing the neon burst in the trend deck? Looks like someone is going viral! #FameBurst",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    author: {
      id: "user2",
      username: "neon_vibes",
      avatarUrl: null,
      isPremium: false,
    },
    counts: { hugs: 156, echoes: 42, casts: 89, anchors: 12 },
    myInteractions: { hug: false, echo: true, cast: false, anchor: true },
  },
  {
    id: "3",
    content:
      "The Aqua Premium stream tonight was top tier. The quality difference is actually worth the gems.",
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    author: {
      id: "user3",
      username: "stream_junkie",
      avatarUrl: null,
      isPremium: true,
    },
    counts: { hugs: 89, echoes: 12, casts: 4, anchors: 2 },
    myInteractions: { hug: false, echo: false, cast: false, anchor: false },
  },
];

export function FameFeedScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <LinearGradient
        colors={["#1A0A2E", "transparent"]}
        className="absolute top-0 left-0 right-0 h-[280px] opacity-70"
      />

      <FlatList
        data={MOCK_POSTS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <WaveCard post={item} />}
        contentContainerStyle={{
          paddingTop: insets.top + 20,
          paddingBottom: 100,
        }}
        ListHeaderComponent={
          <View className="px-6 mb-6 flex-row items-center justify-between">
            <View>
              <Text className="text-foreground font-bold text-3xl tracking-tight font-[Inter_700Bold]">
                Xap<Text className="text-primary">Xap</Text>
              </Text>
              <Text className="text-muted-foreground text-sm font-[Inter_400Regular]">
                The global tide
              </Text>
            </View>
            <ThemeToggle />
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const THEME_ICONS = {
  light: SunIcon,
  dark: MoonStarIcon,
};

function ThemeToggle() {
  const { theme } = useUniwind();

  function toggleTheme() {
    const newTheme = theme === "dark" ? "light" : "dark";
    Uniwind.setTheme(newTheme);
  }

  return (
    <Button
      onPressIn={toggleTheme}
      size="icon"
      variant="ghost"
      className="ios:size-9 rounded-full bg-foreground/5 border border-border">
      <Icon as={THEME_ICONS[theme ?? "light"]} className="text-foreground size-5" />
    </Button>
  );
}
