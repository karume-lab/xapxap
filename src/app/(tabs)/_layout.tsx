import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import { CameraIcon, PlusIcon, RadioIcon, SearchIcon, UserIcon } from "lucide-react-native";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/use-colors";

function TabBarBackground() {
  return (
    <View style={StyleSheet.absoluteFill}>
      <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(10,10,15,0.95)" }]} />
    </View>
  );
}

export default function TabLayout() {
  const _colors = useColors();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#bef445",
        tabBarInactiveTintColor: "rgba(255,255,255,0.4)",
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
          tabBarIcon: ({ color }) => <RadioIcon size={24} color={color} strokeWidth={2.5} />,
        }}
      />
      <Tabs.Screen
        name="hunt"
        options={{
          title: "Hunt",
          tabBarIcon: ({ color }) => <SearchIcon size={24} color={color} strokeWidth={2.5} />,
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
                backgroundColor: "#bef445", // Back to primary lime
                alignItems: "center",
                justifyContent: "center",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
                elevation: 10,
                borderWidth: 6,
                borderColor: "#0A0A0F",
              }}>
              <PlusIcon size={32} color="black" strokeWidth={3} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="fleet"
        options={{
          title: "Fleet",
          tabBarIcon: ({ color }) => <CameraIcon size={24} color={color} strokeWidth={2.5} />,
        }}
      />
      <Tabs.Screen
        name="space"
        options={{
          title: "Space",
          tabBarIcon: ({ color }) => <UserIcon size={24} color={color} strokeWidth={2.5} />,
        }}
      />

      <Tabs.Screen name="live" options={{ href: null }} />
      <Tabs.Screen name="gems" options={{ href: null }} />
    </Tabs>
  );
}
