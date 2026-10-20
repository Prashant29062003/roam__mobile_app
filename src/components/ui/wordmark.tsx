import { View } from "react-native";

import { ThemedText } from "./themed-text";

const sizes = {
  /** The hero lockup — onboarding and the top of the brand page. */
  display: "text-display font-extrabold tracking-tighter",
  /** Screen headers. */
  heading: "text-heading font-extrabold tracking-tight",
  /** Dense chrome, such as a sheet header. */
  title: "text-title font-extrabold tracking-tight",
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
 * with Dynamic Type and repaints with the theme. That is also its limitation:
 * the design draws the wordmark in Geometric Sans, which is not bundled yet,
 * so this currently renders in the platform sans and looks lighter and more
 * geometric-futura than the design's. Replace this with the brand's vector
 * asset once it exists — keep the type ramp entry until then.
 */
export function Wordmark({ size = "display", tagline }: WordmarkProps) {
  return (
    <View className="gap-xs self-start">
      <ThemedText className={sizes[size]}>roam</ThemedText>
      {tagline ? (
        <ThemedText variant="body" tone="muted" className="">
          {tagline}
        </ThemedText>
      ) : null}
    </View>
  );
}