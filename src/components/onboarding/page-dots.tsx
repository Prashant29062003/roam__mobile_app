import { View } from "react-native";

export type PageDotsProps = {
  count: number;
  /** Zero-based. */
  index: number;
};

/**
 * The segmented page indicator from the onboarding design.
 *
 * The active segment is lavender and the rest are hairlines, so position reads
 * at a glance without a number. It is a `progressbar` to assistive tech rather
 * than three loose views — the segments themselves carry no labels, and the
 * slide's own heading is what announces the change.
 *
 * Local to onboarding for now. It graduates to `ui/` when a second screen needs
 * it, not before.
 */
export function PageDots({ count, index }: PageDotsProps) {
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={`Slide ${index + 1} of ${count}`}
      accessibilityValue={{ min: 1, max: count, now: index + 1 }}
      className="flex-row gap-sm"
    >
      {Array.from({ length: count }, (_, dot) => (
        <View
          key={dot}
          className={`h-sm w-xl rounded-full ${
            dot === index ? "bg-lavender" : "bg-border"
          }`}
        />
      ))}
    </View>
  );
}
