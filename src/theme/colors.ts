import { useColorScheme } from "react-native";

/**
 * Light-mode brand values.
 *
 * Two access paths exist on purpose:
 *
 * - `className` styling uses the `@theme` block in `src/global.css`, which
 *   resolves colors as CSS variables and flips with the system appearance.
 * - React Native APIs that cannot take a `className` — `SymbolView.tintColor`,
 *   `Switch.trackColor`, `ActivityIndicator.color`, `GlassView.tintColor` —
 *   need a value in JS. That is what this file is for.
 *
 * The literals below mirror the `:root` block in `src/global.css` exactly.
 * Change both together or they will drift.
 */
export interface ThemeColors {
  /** Brand yellow: primary actions and active states. */
  primary: string;
  /** Text/icon color that sits on `primary`. */
  onPrimary: string;
  /** Lavender: secondary actions, highlights, the AI prompt pill. */
  lavender: string;
  /** Text/icon color that sits on `lavender`. */
  onLavender: string;
  /** Headings and primary text. */
  foreground: string;
  /** Body and secondary text. */
  muted: string;
  /** Cards, sheets, modals. */
  surface: string;
  /** App background and input fields. */
  background: string;
  /** Dividers and borders. */
  border: string;
  /** Tab bar and other frosted surfaces. */
  glass: string;
  /** Rating star and favourite badges. */
  star: string;
  success: string;
  error: string;
}

export const lightColors: ThemeColors = {
  primary: "#FFC629",
  onPrimary: "#0B0B1A",
  lavender: "#C984F4",
  onLavender: "#FFFFFF",
  foreground: "#0B0B1A",
  muted: "#6B7280",
  surface: "#FFFFFF",
  background: "#F4F5F7",
  border: "#E5E7EB",
  glass: "rgba(255, 255, 255, 0.7)",
  star: "#FFC629",
  success: "#0E7A54",
  error: "#D92D20",
};

const darkColors: ThemeColors = {
  primary: "#FFC629",
  onPrimary: "#0B0B1A",
  lavender: "#D8A6F8",
  onLavender: "#0B0B1A",
  foreground: "#F5F5F7",
  muted: "#9CA3AF",
  surface: "#17172A",
  background: "#0B0B1A",
  border: "#2A2A3F",
  glass: "rgba(23, 23, 42, 0.7)",
  star: "#FFC629",
  success: "#3DDC9A",
  error: "#FF7A70",
};

export type ColorToken = keyof ThemeColors;

/**
 * Resolves the light or dark half of the palette at render time.
 *
 * This is a hook, so it can only be called inside a component — that is the
 * documented trade-off for brand light/dark pairs, and the reason the
 * `className` path exists for everything else.
 */
export function useThemeColors(): ThemeColors {
  const scheme = useColorScheme();
  return scheme === "dark" ? darkColors : lightColors;
}
