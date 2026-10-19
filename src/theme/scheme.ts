import { Appearance as AppearanceImport } from "react-native";

export type Scheme = "light" | "dark" | "system";

/**
 * Metro's ESM/CJS interop hands us either the `Appearance` object itself or the
 * module namespace wrapping it in `.default` — react-native-css hit exactly
 * that on web (`Appearance.default.setColorScheme is not a function`), and the
 * same resolution has to happen on this side of the boundary too.
 */
const appearance =
  (AppearanceImport as { default?: typeof AppearanceImport }).default ??
  AppearanceImport;

/** Exposed so the diagnostics readout can report what the platform supports. */
export const appearanceInfo = {
  canOverride: typeof appearance.setColorScheme === "function",
  get: () => appearance.getColorScheme(),
};

/**
 * Forces the app's color scheme.
 *
 * This is now the *only* scheme switch the app needs. `ThemeProvider` derives
 * the CSS variables from `useColorScheme()`, and everything read through that
 * hook (icon tints, `Switch`, glass) already follows it — so one call moves
 * both halves. Calling react-native-css's `colorScheme.set()` as well was
 * redundant, and on web it invoked the very method react-native-web lacks.
 *
 * Returns `false` when the platform cannot override at all, which is web:
 * react-native-web has no `Appearance.setColorScheme`. There both halves read
 * the browser's `prefers-color-scheme` and agree, so a no-op is correct.
 */
export function applyColorScheme(value: Scheme): boolean {
  if (!appearanceInfo.canOverride) return false;

  appearance.setColorScheme(value === "system" ? "unspecified" : value);
  return true;
}
