import type { ViewStyle } from "react-native";

/**
 * Elevation scale.
 *
 * The Roam design is mostly flat — surfaces are separated by `Border Gray`
 * hairlines and background contrast rather than drop shadows. These three
 * levels exist for the cases that genuinely float above the page: the sticky
 * booking bar, the glass tab bar, and overlays.
 *
 * `boxShadow` is the React Native 0.76+ style prop, which is what this app
 * runs on. Do not fall back to the legacy `shadowColor`/`shadowOffset`/
 * `shadowOpacity`/`shadowRadius` or Android `elevation` props.
 */
export type ShadowToken = "card" | "raised" | "overlay";

export const shadows: Record<ShadowToken, ViewStyle> = {
  /** Barely-there lift for a card that overlaps content. */
  card: { boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)" },
  /** A bar that stays pinned while content scrolls under it. */
  raised: { boxShadow: "0 4px 12px rgba(0, 0, 0, 0.10)" },
  /** Sheets, dialogs, and anything modal. */
  overlay: { boxShadow: "0 8px 24px rgba(0, 0, 0, 0.18)" },
};
