import { Pressable, View } from "react-native";

import { Icon, type IconName } from "./icon";
import { ThemedText } from "./themed-text";

export type SegmentedOption<T extends string> = {
  value: T;
  label: string;
  icon?: IconName;
};

export type SegmentedControlProps<T extends string> = {
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel?: string;
};

/**
 * Two-or-three mutually exclusive views (List / Map). The selected segment
 * fills with `foreground` rather than the brand yellow, so the control never
 * competes with the page's primary action for attention.
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
}: SegmentedControlProps<T>) {
  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
      className="flex-row items-center gap-xs rounded-full bg-background p-xs"
    >
      {options.map((option) => {
        const selected = option.value === value;

        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityLabel={option.label}
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            className={`flex-1 flex-row items-center justify-center gap-sm rounded-full py-sm ${
              selected ? "bg-foreground" : "bg-transparent"
            }`}
            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
          >
            {option.icon ? (
              <Icon
                name={option.icon}
                size={16}
                tone={selected ? "surface" : "foreground"}
              />
            ) : null}
            <ThemedText
              variant="caption"
              tone={selected ? "default" : "muted"}
              // Selected text sits on the dark fill, so it needs the light color.
              className={selected ? "!text-surface" : undefined}
            >
              {option.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}
