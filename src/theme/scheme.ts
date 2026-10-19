import { Appearance as AppearanceImport } from "react-native";
import { colorScheme } from "react-native-css";

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
 * Forces both theme halves to the same value.
 *
 * Returns `false` when the platform cannot override the scheme at all.
 * react-native-web has no `Appearance.setColorScheme`, and react-native-css's
 * web implementation calls that same missing method — so on web neither half
 * works and there is nothing to do. That is not a split: on web both halves
 * read the browser's `prefers-color-scheme` and agree with each other.
 */
export function applyColorScheme(value: Scheme): boolean {
  if (!appearanceInfo.canOverride) return false;

  appearance.setColorScheme(value === "system" ? "unspecified" : value);
  colorScheme.set(value === "system" ? null : value);
  return true;
}
