import { Stack } from "expo-router";
import { MoonStarIcon, SunIcon, ZapIcon } from "lucide-react-native";
import { View } from "react-native";
import { Uniwind, useUniwind } from "uniwind";
import { Button } from "@/components/ui/button";
import { Glass } from "@/components/ui/glass";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";

const SCREEN_OPTIONS = {
  title: "Fame",
  headerTransparent: true,
  headerRight: () => <ThemeToggle />,
};

export function FameFeedScreen() {
  return (
    <>
      <Stack.Screen options={SCREEN_OPTIONS} />
      <View className="flex-1 bg-background items-center justify-center p-6 gap-8">
        <Glass glow="lime" className="p-8 items-center gap-4">
          <View className="bg-primary/20 p-4 rounded-full">
            <Icon as={ZapIcon} className="text-primary size-10" />
          </View>
          <View className="items-center">
            <Text className="text-4xl font-bold text-foreground">XapXap</Text>
            <Text className="text-muted-foreground text-center mt-1">
              1 Minute Fame Discovery Engine
            </Text>
          </View>
        </Glass>

        <View className="w-full gap-4">
          <Button size="lg" className="rounded-2xl">
            <Text className="font-bold">Enter the Deck</Text>
          </Button>

          <View className="flex-row gap-4">
            <Glass className="flex-1 p-4 items-center gap-2" glow="cyan">
              <Text className="text-cyan font-bold">Trending</Text>
              <Text className="text-foreground/80 text-xs">24.5k Waves</Text>
            </Glass>
            <Glass className="flex-1 p-4 items-center gap-2" glow="magenta">
              <Text className="text-magenta font-bold">Gems</Text>
              <Text className="text-foreground/80 text-xs">842 Earned</Text>
            </Glass>
          </View>
        </View>
      </View>
    </>
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
    <Button onPressIn={toggleTheme} size="icon" variant="ghost" className="ios:size-9 rounded-full">
      <Icon as={THEME_ICONS[theme ?? "light"]} className="text-foreground size-5" />
    </Button>
  );
}
