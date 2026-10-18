import { useState } from "react";
import {
  Pressable,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";

import { Icon, type IconName } from "./icon";
import { ThemedText } from "./themed-text";

const fieldContainers = {
  /** Search — a wide pill with a leading glyph and an optional trailing action. */
  search: "rounded-full px-md",
  /** Form — a softer radius, taller, sits under a label. */
  form: "rounded-control px-md",
  /** Password — as form, with the reveal toggle. */
  password: "rounded-control px-md",
} as const;

const focusBorders = {
  search: "border-lavender",
  form: "border-lavender",
  password: "border-lavender",
} as const;

const errorBorders = {
  search: "border-error",
  form: "border-error",
  password: "border-error",
} as const;

export type InputVariant = keyof typeof fieldContainers;

export type InputFieldProps = Omit<TextInputProps, "className"> & {
  variant?: InputVariant;
  /** Leading glyph, e.g. search, person, or lock. */
  icon?: IconName;
  /** Trailing glyph that is not itself interactive. */
  trailingIcon?: IconName;
  /** Trailing control that the caller wants to handle, e.g. open filters. */
  onTrailingPress?: () => void;
  trailingAccessibilityLabel?: string;
  error?: boolean;
  /** Error copy. Announced with the field rather than shown inline here. */
  errorMessage?: string;
};

/**
 * The single input surface from the design. Focus is expressed as a lavender
 * border and caret, error as a red one — no other decoration, so the state is
 * obvious without a floating label.
 *
 * The password variant owns its own reveal toggle; every other variant takes an
 * optional trailing control.
 */
export function InputField({
  variant = "form",
  icon,
  trailingIcon,
  onTrailingPress,
  trailingAccessibilityLabel,
  error,
  errorMessage,
  editable = true,
  secureTextEntry,
  style,
  ...props
}: InputFieldProps) {
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const isPassword = variant === "password";
  const trailing = isPassword
    ? revealed
      ? "eyeOff"
      : "eye"
    : trailingIcon;

  const trailingHandler = isPassword
    ? () => setRevealed((was) => !was)
    : onTrailingPress;

  const borderClass = error
    ? errorBorders[variant]
    : focused
      ? focusBorders[variant]
      : "border-transparent";

  return (
    <View className="w-full gap-xs">
      <View
        className={`h-14 flex-row items-center gap-sm border ${borderClass} bg-background ${fieldContainers[variant]}`}
      >
        {icon ? <Icon name={icon} size={20} tone="foreground" /> : null}

        <TextInput
          className="flex-1 text-field text-foreground"
          placeholderTextColor="#6B7280"
          editable={editable}
          secureTextEntry={isPassword ? !revealed : secureTextEntry}
          accessibilityLabel={props.accessibilityLabel ?? props.placeholder}
          onFocus={(event) => {
            setFocused(true);
            props.onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            props.onBlur?.(event);
          }}
          {...props}
          style={style}
        />

        {trailing && trailingHandler ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              isPassword
                ? revealed
                  ? "Hide password"
                  : "Show password"
                : (trailingAccessibilityLabel ?? "Field action")
            }
            onPress={trailingHandler}
            hitSlop={8}
          >
            <Icon name={trailing} size={20} tone="foreground" />
          </Pressable>
        ) : null}
      </View>

      {error && errorMessage ? (
        <ThemedText variant="caption" tone="error">
          {errorMessage}
        </ThemedText>
      ) : null}
    </View>
  );
}
