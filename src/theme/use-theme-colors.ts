import { darkColors, lightColors, type ThemeColors } from "./colors";
import { useThemeScheme } from "./theme-context";

/**
 * Resolves the light or dark half of the palette at render time.
 *
 * This is a hook, so it can only be called inside a component — that is the
 * documented trade-off for brand light/dark pairs, and the reason the
 * `className` path exists for everything else.
 *
 * It lives in its own module because `colors.ts` has to stay free of
 * imports. The provider builds the CSS variables from those literals, and
 * the scheme this hook reads comes from the provider's context, so a hook
 * next to the literals closed a require cycle:
 *
 *   theme-provider → theme/index → theme/colors → theme/theme-context → theme-provider
 */
export function useThemeColors(): ThemeColors {
  const scheme = useThemeScheme();
  return scheme === "dark" ? darkColors : lightColors;
}
