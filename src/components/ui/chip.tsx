import { Pressable, type StyleProp, type ViewStyle } from "react-native";

import { Icon, type IconName } from "./icon";
import { ThemedText } from "./themed-text";

const containers = {
  /** Unselected filter or category. */
  default: "bg-background",
  /** Selected category — the brand yellow tab on the home screen. */
  primary: "bg-primary",
  /** Selected filter — lavender, as in the search result filters. */
  lavender: "bg-lavender",
} as const;

const labelTones = {
  default: "default",
  primary: "onPrimary",
  lavender: "onLavender",
} as const;

const sizes = {
  sm: "px-sm py-xs",
  md: "px-md py-sm",
} as const;

export type ChipVariant = keyof typeof containers;
export type ChipSize = keyof typeof sizes;

export type ChipProps = {
  label: string;
  variant?: ChipVariant;
  size?: ChipSize;
  icon?: IconName;
  /** Set alongside `accessibilityState.selected`. */
  selected?: boolean;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
};

/**
 * Filter and category chips. The same primitive covers both the lavender
 * search filters and the yellow home categories — pick the variant, not a new
 * component.
 */
export function Chip({
  label,
  variant = "default",
  size = "md",
  icon,
  selected,
  style,
  onPress,
}: ChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: !!selected }}
      onPress={onPress}
      className={`flex-row items-center gap-xs rounded-full ${containers[variant]} ${sizes[size]}`}
      style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }, style]}
    >
      {icon ? (
        <Icon
          name={icon}
          size={16}
          tone={
            variant === "primary"
              ? "onPrimary"
              : variant === "lavender"
                ? "onLavender"
                : "foreground"
          }
        />
      ) : null}
      <ThemedText
        variant="caption"
        tone={labelTones[variant]}
        className="font-medium"
      >
        {label}
      </ThemedText>
    </Pressable>
  );
}
