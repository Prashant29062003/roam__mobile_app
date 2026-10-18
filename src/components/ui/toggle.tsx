import { Switch } from "react-native";

import { useThemeColors } from "@/theme";

export type ToggleProps = {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
};

/**
 * A `Switch` wearing the brand color, rather than a hand-rolled toggle. The
 * native control keeps the platform's accessibility semantics, hit target, and
 * animation; only the track and thumb colors are ours.
 *
 * Use this anywhere the switch stands on its own. Settings rows that are mostly
 * text should be a `ProfileRow` that opens a screen instead.
 */
export function Toggle({ label, description, value, onValueChange }: ToggleProps) {
  const colors = useThemeColors();

  return (
    <Switch
      value={value}
      onValueChange={onValueChange}
      accessibilityRole="switch"
      accessibilityLabel={description ? `${label}, ${description}` : label}
      trackColor={{ false: colors.border, true: colors.primary }}
      thumbColor={colors.surface}
      ios_backgroundColor={colors.border}
    />
  );
}