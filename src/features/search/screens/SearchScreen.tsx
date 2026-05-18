import { SearchIcon, TrendingUpIcon, XIcon } from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, FlatList, Pressable, ScrollView, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Glass } from "@/components/layout/Glass";
import { XapXapHeader } from "@/components/layout/XapXapHeader";
import { Avatar } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";

import {
  incrementBuzz,
  mockPopularTags,
  mockTrendingWaves,
} from "@/features/search/mock-data/search";
import { useColors } from "@/hooks/use-colors";

export function SearchScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [trendingWaves, setTrendingWaves] = useState(mockTrendingWaves);
  const [popularTags] = useState(mockPopularTags);

  const handleSearch = (text: string) => {
    setQuery(text);
    if (text.length > 2) {
      setIsSearching(true);
      setTimeout(() => {
        setIsSearching(false);
      }, 800);
    }
  };

  const handlePressWave = (id: string) => {
    incrementBuzz(id);
    setTrendingWaves([...mockTrendingWaves]);
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
            <Text className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">
              Popular Tags
            </Text>
            <View className="flex-row flex-wrap gap-2.5">
              {popularTags.map((tag) => (
                <Pressable
                  key={tag.id}
                  onPress={() => {
                    setQuery(tag.tag);
                    setIsSearching(true);
                    setTimeout(() => setIsSearching(false), 600);
                  }}
                  className="bg-white/5 border border-white/10 px-4 py-2.5 rounded-full active:bg-white/10">
                  <View className="flex-row items-center gap-1.5">
                    <Text className="text-white text-sm font-semibold">{tag.tag}</Text>
                    <Text className="text-muted-foreground text-[10px] font-medium">
                      • {tag.count} drops
                    </Text>
                  </View>
                </Pressable>
              ))}
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
              data={trendingWaves}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20 }}
              renderItem={({ item }) => (
                <Pressable onPress={() => handlePressWave(item.id)}>
                  <Glass
                    radius={24}
                    className="w-64 h-48 p-5 mr-4 border border-white/5 bg-white/5">
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
                </Pressable>
              )}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}
