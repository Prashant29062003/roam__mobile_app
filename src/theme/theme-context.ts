
import { useColorScheme } from "react-native";
import { useOptionalAppTheme } from "@/components/theme-provider";

export function useThemeScheme(): "light" | "dark" {
  const systemScheme = useColorScheme();
  const appTheme = useOptionalAppTheme();

  if (appTheme) {
    return appTheme.scheme;
  }

  return systemScheme === "dark" ? "dark" : "light";
}
