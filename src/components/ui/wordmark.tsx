import { View } from "react-native";

import { ThemedText } from "./themed-text";

/**
 * The logotype sizes.
 *
 * Each entry names the ramp step and the weight, so the wordmark never puts
 * two size or two weight utilities in one class list — the cascade would
 * then depend on the order Tailwind happens to emit them.
 */
const sizes = {
  /** The hero lockup — onboarding and the top of the brand page. */
  display: {
    variant: "display",
    weight: "extrabold",
    className: "tracking-tighter",
  },
  /** Screen headers. */
  heading: {
    variant: "heading",
    weight: "extrabold",
    className: "tracking-tight",
  },
  /** Dense chrome, such as a sheet header. */
  title: {
    variant: "title",
    weight: "extrabold",
    className: "tracking-tight",
  },
} as const;

export type WordmarkSize = keyof typeof sizes;

export type WordmarkProps = {
  size?: WordmarkSize;
  /** Shows the brand line under the logotype. */
  tagline?: string;
};

/**
 * The `roam` logotype and its tagline.
 *
 * This is set from the type ramp rather than shipped as an image, so it scales
 * with Dynamic Type and repaints with the theme. It renders in Poppins, the
 * closest match to the design's geometric sans.
 *
 * That is also its limitation: the design draws the wordmark as a bespoke
 * geometric logotype, and a typeface can only get close. Replace this with the
 * brand's vector asset once it exists — keep the ramp entries until then.
 */
export function Wordmark({ size = "display", tagline }: WordmarkProps) {
  const { variant, weight, className } = sizes[size];

  return (
    <View className="gap-xs self-start">
      <ThemedText variant={variant} weight={weight} className={className}>
        roam
      </ThemedText>
      {tagline ? (
        <ThemedText variant="body" tone="muted">
          {tagline}
        </ThemedText>
      ) : null}
    </View>
  );
}
