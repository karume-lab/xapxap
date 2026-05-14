import { BlurView } from "expo-blur";
import { Platform, StyleSheet, View, type ViewProps } from "react-native";
import { useColors } from "@/hooks/use-colors";

interface GlassProps extends ViewProps {
  intensity?: number;
  tint?: "dark" | "light" | "default";
  radius?: number;
  bordered?: boolean;
  glow?: "lime" | "cyan" | "magenta" | null;
}

/**
 * Glass surface — the foundational visual element of XapXap.
 * Renders a frosted blur on iOS with a hairline highlight.
 */
export function Glass({
  intensity = 40,
  tint = "dark",
  radius,
  bordered = true,
  glow = null,
  style,
  children,
  ...rest
}: GlassProps) {
  const colors = useColors();
  const r = radius ?? colors.radius;

  const glowColor =
    glow === "lime"
      ? colors.primary
      : glow === "cyan"
        ? colors.accent
        : glow === "magenta"
          ? "#FF5FA8" // magenta from palette
          : null;

  const containerStyle = [
    {
      borderRadius: r,
      overflow: "hidden" as const,
      backgroundColor: Platform.OS === "ios" ? "transparent" : "rgba(255,255,255,0.05)",
      borderWidth: bordered ? StyleSheet.hairlineWidth : 0,
      borderColor: colors.border,
    },
    glowColor
      ? {
          shadowColor: glowColor,
          shadowOpacity: 0.25,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: 0 },
        }
      : null,
    style,
  ];

  return (
    <View style={containerStyle} {...rest}>
      {Platform.OS === "ios" ? (
        <BlurView intensity={intensity} tint={tint} style={StyleSheet.absoluteFill} />
      ) : null}
      <View
        style={{
          backgroundColor: Platform.OS === "ios" ? "rgba(255,255,255,0.03)" : "rgba(20,20,30,0.55)",
        }}>
        {children}
      </View>
    </View>
  );
}
