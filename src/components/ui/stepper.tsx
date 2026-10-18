import { Pressable, View } from "react-native";

import { Icon } from "./icon";
import { ThemedText } from "./themed-text";

export type StepperProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  /** Rendered after the number, e.g. "guests" or "nights". */
  unit?: string;
};

/**
 * Numeric stepper for guest counts and nights. The decrement control disables
 * itself at `min` and the increment at `max` rather than silently clamping, so
 * the bound is visible before the tap.
 */
export function Stepper({
  label,
  value,
  onChange,
  min = 0,
  max = 99,
  unit,
}: StepperProps) {
  const canDecrease = value > min;
  const canIncrease = value < max;

  return (
    <View className="flex-row items-center justify-between py-sm">
      <ThemedText variant="body">{label}</ThemedText>

      <View
        className="flex-row items-center gap-md rounded-full bg-background px-sm py-xs"
        accessibilityRole="adjustable"
        accessibilityLabel={label}
        accessibilityValue={{ min, max, now: value, text: `${value}${unit ? ` ${unit}` : ""}` }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Decrease ${label}`}
          accessibilityState={{ disabled: !canDecrease }}
          disabled={!canDecrease}
          onPress={() => onChange(value - 1)}
          hitSlop={8}
          className="p-xs"
        >
          <Icon name="minus" size={16} tone="foreground" />
        </Pressable>

        <ThemedText variant="body" className="min-w-6 text-center">
          {unit ? `${value} ${unit}` : value}
        </ThemedText>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Increase ${label}`}
          accessibilityState={{ disabled: !canIncrease }}
          disabled={!canIncrease}
          onPress={() => onChange(value + 1)}
          hitSlop={8}
          className="p-xs"
        >
          <Icon name="plus" size={16} tone="foreground" />
        </Pressable>
      </View>
    </View>
  );
}
