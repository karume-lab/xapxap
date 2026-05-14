import { Stack } from "expo-router";
import { MoonStarIcon, SunIcon } from "lucide-react-native";
import { View } from "react-native";
import { Uniwind, useUniwind } from "uniwind";
import { Button } from "@/components/ui/button";
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
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-3xl font-bold">Fame Feed</Text>
        <Text className="text-muted-foreground mt-2">1 Minute Fame Discovery Engine</Text>
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
      <Icon as={THEME_ICONS[theme ?? "light"]} className="size-5" />
    </Button>
  );
}
