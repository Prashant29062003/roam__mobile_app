import { Appearance as AppearanceImport, ColorSchemeName } from "react-native";

export type Scheme = "light" | "dark" | "system";

/**
 * Metro's ESM/CJS interop hands us either the `Appearance` object itself or the
 * module namespace wrapping it in `.default`.
 */
const appearance =
  (AppearanceImport as { default?: typeof AppearanceImport }).default ??
  AppearanceImport;

/** Exposed so the diagnostics readout can report what the platform supports. */
export const appearanceInfo = {
  canOverride: typeof appearance.setColorScheme === "function",
  get: (): ColorSchemeName | null => {
    try {
      return appearance.getColorScheme();
    } catch {
      return "light";
    }
  },
};

/**
 * Forces the app's color scheme.
 */
export function applyColorScheme(value: Scheme): boolean {
  if (!appearanceInfo.canOverride || typeof appearance.setColorScheme !== "function") {
    return false;
  }

  appearance.setColorScheme(value === "system" ? "unspecified" : value);
  return true;
}
