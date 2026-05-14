import { SearchIcon, TrendingUpIcon, XIcon } from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, FlatList, Pressable, ScrollView, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar } from "@/components/ui/avatar";
import { Glass } from "@/components/ui/glass";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { useColors } from "@/hooks/use-colors";

// Mock data to match design
const TRENDING_WAVES = [
  {
    id: "1",
    author: "anax",
    content: "Hello guys, this is my first post on XapXap",
    buzz: 4,
  },
  {
    id: "2",
    author: "anax",
    content: "A great recommendation",
    buzz: 3,
  },
  {
    id: "3",
    author: "drift_queen",
    content: "Hello from the other side of the ocean!",
    buzz: 3,
  },
];

import { XapXapHeader } from "@/components/ui/header";

export function SearchScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (text: string) => {
    setQuery(text);
    if (text.length > 2) {
      setIsSearching(true);
      setTimeout(() => {
        setIsSearching(false);
      }, 800);
    }
  };

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <XapXapHeader />

      <View className="px-6 py-2">
        <View className="bg-white/10 rounded-full flex-row items-center px-5 h-14 border border-white/5">
          <Icon as={SearchIcon} size={20} className="text-muted-foreground mr-3" />
          <TextInput
            value={query}
            onChangeText={handleSearch}
            placeholder="Search waves, people, #tags..."
            placeholderTextColor="rgba(255,255,255,0.4)"
            className="flex-1 h-full text-white font-medium text-base"
            autoCapitalize="none"
          />
          {query.length > 0 && (
            <Pressable onPress={() => handleSearch("")}>
              <Icon as={XIcon} size={20} className="text-muted-foreground" />
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
        showsVerticalScrollIndicator={false}>
        {/* Popular Tags Section */}
        <View className="mt-6">
          <View className="px-6 mb-6">
            <Text className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-12">
              Popular Tags
            </Text>
            <View className="items-center py-10">
              <Text className="text-muted-foreground text-center text-sm px-10">
                No tags yet. Drop a wave with a #tag to start a trend.
              </Text>
            </View>
          </View>
        </View>

        {/* Trending Waves Section */}
        <View className="mt-4">
          <View className="px-6 mb-4">
            <Text className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Trending Waves
            </Text>
          </View>

          {isSearching ? (
            <View className="h-40 items-center justify-center">
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : (
            <FlatList
              horizontal
              data={TRENDING_WAVES}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20 }}
              renderItem={({ item }) => (
                <Glass radius={24} className="w-64 h-48 p-5 mr-4 border border-white/5 bg-white/5">
                  <View className="flex-row items-center mb-4">
                    <Avatar username={item.author} size={32} />
                    <Text className="ml-3 font-bold text-white text-sm">@{item.author}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-white/80 text-sm leading-5" numberOfLines={3}>
                      {item.content}
                    </Text>
                  </View>
                  <View className="flex-row items-center mt-2">
                    <Icon as={TrendingUpIcon} size={14} className="text-primary mr-1.5" />
                    <Text className="text-primary font-bold text-xs">{item.buzz} buzz</Text>
                  </View>
                </Glass>
              )}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}
