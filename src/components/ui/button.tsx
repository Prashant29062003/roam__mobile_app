import {
  ActivityIndicator,
  Pressable,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import type { ReactNode } from "react";

import { useThemeColors, type ColorToken } from "@/theme";
import { Icon, type IconName } from "./icon";
import { ThemedText, type TextTone } from "./themed-text";

const containers = {
  /** Brand yellow — the one action a screen wants you to take. */
  primary: "bg-primary",
  /** White with a hairline border — the alternative path. */
  secondary: "bg-surface border border-border",
  /** No fill — low-emphasis actions sitting on content. */
  ghost: "bg-transparent",
} as const;

const labelTones: Record<keyof typeof containers, TextTone> = {
  primary: "onPrimary",
  secondary: "default",
  ghost: "lavender",
};

const trailingIconTones: Record<ButtonVariant, ColorToken> = {
  primary: "onPrimary",
  secondary: "foreground",
  ghost: "lavender",
};

const sizes = {
  sm: "px-md py-sm",
  md: "px-lg py-md",
  lg: "px-lg py-lg",
} as const;

export type ButtonVariant = keyof typeof containers;
export type ButtonSize = keyof typeof sizes;

export type ButtonProps = {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /**
   * Slot before the label, for anything the `Icon` glyph set cannot express —
   * a brand mark, a spinner, an avatar. Omit it and use `trailingIcon` for the
   * common case of a glyph that is already in the set.
   */
  leading?: ReactNode;
  /** Trailing glyph, e.g. the arrow on the primary CTA. */
  trailingIcon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  /** Merged last so callers can adjust layout without forking the variant. */
  className?: string;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
};

/**
 * Every tappable action in the app. Pressed feedback is an opacity dip, not a
 * hover state, and the accessible label stays on the control while loading so
 * a spinner never leaves the button unnamed.
 */
export function Button({
  title,
  variant = "primary",
  size = "md",
  leading,
  trailingIcon,
  loading,
  disabled,
  className,
  style,
  onPress,
}: ButtonProps) {
  const colors = useThemeColors();
  const inactive = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: !!disabled, busy: !!loading }}
      disabled={inactive}
      onPress={onPress}
      className={`flex-row items-center justify-center gap-sm rounded-full ${containers[variant]} ${sizes[size]} ${className ?? ""}`}
      style={({ pressed }) => [
        { opacity: disabled ? 0.4 : pressed ? 0.7 : 1 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "primary" ? colors.onPrimary : colors.foreground}
        />
      ) : (
        <>
          {leading}
          <ThemedText variant="button" tone={labelTones[variant]}>
            {title}
          </ThemedText>
          {trailingIcon ? (
            <Icon name={trailingIcon} size={18} tone={trailingIconTones[variant]} />
          ) : null}
        </>
      )}
    </Pressable>
  );
}

export type IconButtonProps = {
  /** Required: an icon-only control has no text to supply the label. */
  accessibilityLabel: string;
  name: IconName;
  size?: ButtonSize;
  tone?: "default" | "lavender" | "primary";
  disabled?: boolean;
  /** Overrides the circular treatment for non-icon shapes. */
  className?: string;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
};

const glyphTones: Record<NonNullable<IconButtonProps["tone"]>, ColorToken> = {
  default: "foreground",
  lavender: "lavender",
  primary: "primary",
};

/** The circular icon control from the design — back, share, and favourite. */
export function IconButton({
  accessibilityLabel,
  name,
  size = "md",
  tone = "default",
  disabled,
  className,
  style,
  onPress,
}: IconButtonProps) {
  const glyphSize = size === "lg" ? 24 : size === "sm" ? 16 : 20;
  const boxSize = size === "lg" ? 56 : size === "sm" ? 36 : 44;
  const glyphTone = glyphTones[tone];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      className={`items-center justify-center rounded-full bg-background ${className ?? ""}`}
      style={({ pressed }) => [
        {
          width: boxSize,
          height: boxSize,
          opacity: disabled ? 0.4 : pressed ? 0.7 : 1,
        },
        style,
      ]}
    >
      <Icon name={name} size={glyphSize} tone={glyphTone} />
    </Pressable>
  );
}
