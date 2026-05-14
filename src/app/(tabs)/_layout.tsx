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
        tabBarInactiveTintColor: colors.mutedForeground,
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: "transparent",
          borderTopWidth: 0,
          elevation: 0,
          height: 88,
          paddingTop: 12,
        },
        tabBarBackground: () => (
          <View style={StyleSheet.absoluteFill}>
            <BlurView intensity={70} tint="dark" style={StyleSheet.absoluteFill} />
            <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(6,6,11,0.65)" }]} />
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: StyleSheet.hairlineWidth,
                backgroundColor: colors.border,
              }}
            />
          </View>
        ),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Fame",
          tabBarIcon: ({ color }) => <ZapIcon size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="fleet"
        options={{
          title: "Fleet",
          tabBarIcon: ({ color }) => <LayersIcon size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="drop"
        options={{
          title: "Drop",
          tabBarIcon: ({ focused }) => (
            <View
              className="w-12 h-12 rounded-full items-center justify-center -mt-2 border border-primary/40"
              style={{ backgroundColor: focused ? colors.primary : "rgba(196,255,61,0.15)" }}>
              <PlusCircleIcon
                size={24}
                color={focused ? colors.primaryForeground : colors.primary}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="gems"
        options={{
          title: "Gems",
          tabBarIcon: ({ color }) => <DiamondIcon size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="live"
        options={{
          title: "Live",
          tabBarIcon: ({ color }) => <VideoIcon size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}
