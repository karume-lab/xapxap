import { useUniwind } from "uniwind";
import { THEME } from "@/lib/theme";

export function useColors() {
  const { theme } = useUniwind();
  const currentTheme = theme === "dark" ? THEME.dark : THEME.light;
  return currentTheme;
}
