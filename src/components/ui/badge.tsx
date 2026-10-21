import { View } from "react-native";

import type { ColorToken } from "@/theme";
import { Icon, type IconName } from "./icon";
import { ThemedText, type TextTone } from "./themed-text";

const containers = {
  /** Rating honours — "Guest favorite". */
  favorite: "bg-star-tint",
  /** Freshness — "New". */
  new: "bg-success-tint",
  /** Commercial — "20% off". */
  discount: "bg-error-tint",
  /** Trust — "Superhost". */
  superhost: "bg-info-tint",
  /** Progress or membership — "Roam Explorer". */
  accent: "bg-lavender-tint",
} as const;

const labelTones = {
  favorite: "default",
  new: "success",
  discount: "error",
  superhost: "default",
  accent: "default",
} as const satisfies Record<string, TextTone>;

/** Glyph colors are their own map: an icon on the cream tint wants the star,
 * not the foreground text color. */
const iconTones = {
  favorite: "star",
  new: "success",
  discount: "error",
  superhost: "foreground",
  accent: "foreground",
} as const satisfies Record<string, ColorToken>;

export type BadgeVariant = keyof typeof containers;

export type BadgeProps = {
  label: string;
  variant?: BadgeVariant;
  icon?: IconName;
};

/**
 * Small status pill — the tags from the design's tag sheet.
 *
 * `leading-none` on the label for the same reason as `Chip`: the caption ramp's
 * 1.4 ratio leaves the glyphs sitting low in their line box next to the icon.
 */
export function Badge({ label, variant = "accent", icon }: BadgeProps) {
  return (
    <View
      className={`flex-row items-center justify-center gap-xs self-start rounded-full px-sm py-xs ${containers[variant]}`}
      accessibilityRole="text"
      accessibilityLabel={label}
    >
      {icon ? <Icon name={icon} size={12} tone={iconTones[variant]} /> : null}
      <ThemedText variant="caption" tone={labelTones[variant]} className="leading-none">
        {label}
      </ThemedText>
    </View>
  );
}
