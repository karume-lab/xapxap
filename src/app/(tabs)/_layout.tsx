import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import { Plus, Radio, Search, User, Video } from "lucide-react-native";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/use-colors";

function TabBarBackground() {
  const colors = useColors();
  return (
    <View style={StyleSheet.absoluteFill}>
      <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.background }]} />
    </View>
  );
}

export default function TabLayout() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: "transparent",
          borderTopWidth: 0,
          elevation: 0,
          height: 80 + insets.bottom,
          paddingTop: 10,
          paddingBottom: insets.bottom,
        },
        tabBarBackground: TabBarBackground,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <Radio size={24} color={color} strokeWidth={2.5} />,
        }}
      />
      <Tabs.Screen
        name="hunt"
        options={{
          title: "Hunt",
          tabBarIcon: ({ color }) => <Search size={24} color={color} strokeWidth={2.5} />,
        }}
      />
      <Tabs.Screen
        name="drop"
        options={{
          title: "Drop",
          tabBarIcon: () => (
            <View
              style={{
                marginTop: -30,
                width: 68,
                height: 68,
                borderRadius: 34,
                backgroundColor: colors.primary, // Back to primary lime
                alignItems: "center",
                justifyContent: "center",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
                elevation: 10,
                borderWidth: 6,
                borderColor: colors.background,
              }}>
              <Plus size={32} color={colors.primaryForeground} strokeWidth={3} />
            </View>
          ),
        }}
      />
      <Tabs.Screen name="fleet" options={{ href: null, tabBarStyle: { display: "none" } }} />
      <Tabs.Screen
        name="live"
        options={{
          title: "Live",
          tabBarIcon: ({ color }) => (
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              <Video size={24} color={color} strokeWidth={2.5} />
              <View
                style={{
                  position: "absolute",
                  bottom: -8,
                  width: 4,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: "#FBBF24", // Yellow-400 or warning
                }}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="space"
        options={{
          title: "Space",
          tabBarIcon: ({ color }) => <User size={24} color={color} strokeWidth={2.5} />,
        }}
      />
      <Tabs.Screen name="gems" options={{ href: null, tabBarStyle: { display: "none" } }} />
    </Tabs>
  );
}
