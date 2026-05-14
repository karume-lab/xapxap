import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import { DiamondIcon, LayersIcon, PlusCircleIcon, VideoIcon, ZapIcon } from "lucide-react-native";
import { StyleSheet, View } from "react-native";
import { useColors } from "@/hooks/use-colors";

export default function TabLayout() {
  const colors = useColors();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: "rgba(255,255,255,0.45)",
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: "transparent",
          borderTopWidth: 0,
          elevation: 0,
          height: 94,
          paddingTop: 12,
        },
        tabBarBackground: () => (
          <View style={StyleSheet.absoluteFill}>
            <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
            <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(6,6,11,0.8)" }]} />
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 1,
                backgroundColor: "rgba(255,255,255,0.05)",
              }}
            />
          </View>
        ),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Fame",
          tabBarIcon: ({ color, focused }) => (
            <View className="items-center justify-center">
              <ZapIcon size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
              {focused && <View className="absolute -bottom-2 w-1 h-1 rounded-full bg-primary" />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="fleet"
        options={{
          title: "Fleet",
          tabBarIcon: ({ color, focused }) => (
            <View className="items-center justify-center">
              <LayersIcon size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
              {focused && <View className="absolute -bottom-2 w-1 h-1 rounded-full bg-primary" />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="drop"
        options={{
          title: "Drop",
          tabBarIcon: () => (
            <View>
              <PlusCircleIcon size={32} color="#bef445" strokeWidth={2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="gems"
        options={{
          title: "Gems",
          tabBarIcon: ({ color, focused }) => (
            <View className="items-center justify-center">
              <DiamondIcon size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
              {focused && <View className="absolute -bottom-2 w-1 h-1 rounded-full bg-primary" />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="live"
        options={{
          title: "Live",
          tabBarIcon: ({ color, focused }) => (
            <View className="items-center justify-center">
              <VideoIcon size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
              {focused && <View className="absolute -bottom-2 w-1 h-1 rounded-full bg-primary" />}
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
