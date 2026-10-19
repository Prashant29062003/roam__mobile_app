import { View, type LayoutChangeEvent } from "react-native";

import { ThemedText } from "@/components/ui";
import type { OnboardingSlide } from "@/data/onboarding-slides";

export type SlideCopyProps = {
  slide: OnboardingSlide;
  /**
   * Reports this block's natural height. Set on the off-screen copy of every
   * slide, not on the visible one — see `useSteadyHeight`.
   */
  onHeight?: (key: string, height: number) => void;
};

/** The headline and body of one onboarding slide. */
export function SlideCopy({ slide, onHeight }: SlideCopyProps) {
  const onLayout = (event: LayoutChangeEvent) =>
    onHeight?.(slide.key, event.nativeEvent.layout.height);

  return (
    <View className="gap-md" onLayout={onHeight ? onLayout : undefined}>
      <ThemedText variant="hero">{slide.heading}</ThemedText>
      <ThemedText variant="body" tone="muted">
        {slide.body}
      </ThemedText>
    </View>
  );
}
