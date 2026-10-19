import { darkColors, lightColors, type ThemeColors } from "./colors";

/**
 * The `--roam-*` values as react-native-css variable overrides.
 *
 * These replace the `@media (prefers-color-scheme: dark)` block that used to
 * live in `global.css`. That media query never applied to `:root` custom
 * properties on Android: every scheme readout reported `dark` while the page
 * still rendered light. Driving the same variables from React means the CSS
 * half follows `useColorScheme()` — the one value the JS half already trusted.
 *
 * Built from `colors.ts`, so there is still exactly one list of literals.
 */
function toVariables(colors: ThemeColors) {
  return {
    "--roam-primary": colors.primary,
    "--roam-lavender": colors.lavender,
    "--roam-on-primary": colors.onPrimary,
    "--roam-on-lavender": colors.onLavender,
    "--roam-background": colors.background,
    "--roam-surface": colors.surface,
    "--roam-foreground": colors.foreground,
    "--roam-muted": colors.muted,
    "--roam-border": colors.border,
    "--roam-lavender-tint": colors.lavenderTint,
    "--roam-glass": colors.glass,
    "--roam-success": colors.success,
    "--roam-success-tint": colors.successTint,
    "--roam-error": colors.error,
    "--roam-error-tint": colors.errorTint,
    "--roam-star-tint": colors.starTint,
    "--roam-info-tint": colors.infoTint,
  };
}

export const lightVariables = toVariables(lightColors);
export const darkVariables = toVariables(darkColors);
