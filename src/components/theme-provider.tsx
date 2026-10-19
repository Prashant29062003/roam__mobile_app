import type { ReactNode } from "react";
import { useColorScheme } from "react-native";
import { VariableContextProvider } from "react-native-css";

import { darkVariables, lightVariables } from "@/theme";

/**
 * Supplies the active scheme's `--roam-*` values to every descendant, so the
 * `className` utilities and the JS theme read from the same place.
 *
 * Mount this once, in the root layout, and every screen — including the
 * `/design-system` preview — needs no scheme logic of its own.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const scheme = useColorScheme();

  return (
    <VariableContextProvider
      value={scheme === "dark" ? darkVariables : lightVariables}
    >
      {children}
    </VariableContextProvider>
  );
}
