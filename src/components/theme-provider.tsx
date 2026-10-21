
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useColorScheme } from "react-native";
import { VariableContextProvider } from "nativewind";

/**
 * The variables come from the module, not from the `@/theme` barrel.
 *
 * The barrel re-exports `useThemeColors`, which reads the scheme from this
 * provider, so importing the barrel here closed a require cycle:
 *
 *   theme-provider → theme/index → theme/colors → theme/theme-context → theme-provider
 *
 * Importing `@/theme/variables` directly keeps the graph acyclic, and the
 * barrel stays a leaf that only other modules import.
 */
import { darkVariables, lightVariables } from "@/theme/variables";

export type ThemeMode = "system" | "light" | "dark";
export type ColorScheme = "light" | "dark";

type ThemeContextValue = {
  mode: ThemeMode;
  scheme: ColorScheme;
  setMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useAppTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useAppTheme must be used inside ThemeProvider");
  }

  return context;
}

export function useOptionalAppTheme(): ThemeContextValue | null {
  return useContext(ThemeContext);
}

export function ThemeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>("system");

  const scheme: ColorScheme =
    mode === "system"
      ? systemScheme === "dark"
        ? "dark"
        : "light"
      : mode;

  const setMode = useCallback((nextMode: ThemeMode) => {
    setModeState(nextMode);
  }, []);

  const variables =
    scheme === "dark" ? darkVariables : lightVariables;

  const contextValue = useMemo(
    () => ({ mode, scheme, setMode }),
    [mode, scheme, setMode],
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      <VariableContextProvider value={variables}>
        {children}
      </VariableContextProvider>
    </ThemeContext.Provider>
  );
}
