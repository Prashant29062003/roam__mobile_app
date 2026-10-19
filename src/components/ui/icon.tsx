import { SymbolView, type AndroidSymbol, type SFSymbol } from "expo-symbols";

import { useThemeColors, type ColorToken } from "@/theme";

/**
 * SF Symbols on iOS, Material Symbols on Android and web — the iconography the
 * design specifies. Emoji are never used as iconography.
 *
 * Each entry pairs both platforms so a glyph is never missing on one of them.
 */
const glyphs = {
  home: { ios: "house.fill", android: "home" },
  search: { ios: "magnifyingglass", android: "search" },
  heart: { ios: "heart.fill", android: "favorite" },
  heartOutline: { ios: "heart", android: "favorite_border" },
  bookmark: { ios: "bookmark.fill", android: "bookmark" },
  calendar: { ios: "calendar", android: "calendar_month" },
  person: { ios: "person.fill", android: "person" },
  gear: { ios: "gearshape.fill", android: "settings" },
  location: { ios: "mappin.and.ellipse", android: "location_on" },
  sliders: { ios: "slider.horizontal.3", android: "tune" },
  arrowRight: { ios: "arrow.right", android: "arrow_forward" },
  chevronRight: { ios: "chevron.right", android: "chevron_right" },
  chevronLeft: { ios: "chevron.left", android: "chevron_left" },
  check: { ios: "checkmark", android: "check" },
  close: { ios: "xmark", android: "close" },
  alert: { ios: "exclamationmark.circle.fill", android: "error" },
  mail: { ios: "envelope", android: "mail" },
  lock: { ios: "lock", android: "lock" },
  star: { ios: "star.fill", android: "star" },
  share: { ios: "square.and.arrow.up", android: "share" },
  plus: { ios: "plus", android: "add" },
  minus: { ios: "minus", android: "remove" },
  eye: { ios: "eye", android: "visibility" },
  eyeOff: { ios: "eye.slash", android: "visibility_off" },
  sparkle: { ios: "wand.and.stars", android: "auto_awesome" },
  // Category glyphs follow the home design: a pine tree, a wave, a building,
  // and a house for villas (no palm glyph exists in SF Symbols or Material).
  cabin: { ios: "tree.fill", android: "park" },
  beach: { ios: "water.waves", android: "waves" },
  city: { ios: "building.2.fill", android: "location_city" },
  villa: { ios: "house.lodge", android: "villa" },
} as const satisfies Record<
  string,
  { ios: SFSymbol; android: AndroidSymbol }
>;

export type IconName = keyof typeof glyphs;

export type IconProps = {
  name: IconName;
  size?: number;
  /** Resolves through the theme so the glyph flips with the system appearance. */
  tone?: ColorToken;
};

/**
 * Themed icon glyph. Decorative by default — `accessibilityElementsHidden` is
 * set because these almost always sit beside a text label or inside a control
 * that already carries its own label.
 */
export function Icon({ name, size = 24, tone = "foreground" }: IconProps) {
  const colors = useThemeColors();
  const glyph = glyphs[name];

  return (
    <SymbolView
      name={{ ios: glyph.ios, android: glyph.android, web: glyph.android }}
      size={size}
      tintColor={colors[tone]}
      style={{ width: size, height: size }}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    />
  );
}
