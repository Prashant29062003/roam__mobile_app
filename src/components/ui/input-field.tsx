import { useRef, useState } from "react";
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
  search: "rounded-full px-md min-h-[52px]",
  /** Form — a softer radius, taller, sits under a label. */
  form: "rounded-2xl px-md min-h-[64px]",
  /** Password — as form, with the reveal toggle. */
  password: "rounded-2xl px-md min-h-[64px]",
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

const defaultBorders = {
  search: "border-border",
  form: "border-transparent",
  password: "border-transparent",
} as const;

export type InputVariant = keyof typeof fieldContainers;

export type InputFieldProps = Omit<TextInputProps, "className"> & {
  variant?: InputVariant;
  /** Leading glyph, e.g. search, person, or lock. */
  icon?: IconName;
  /** Label rendered above the placeholder inside the same field box. */
  label?: string;
  /** Trailing glyph that is not itself interactive. */
  trailingIcon?: IconName;
  /** Trailing control that the caller wants to handle, e.g. open filters. */
  onTrailingPress?: () => void;
  trailingAccessibilityLabel?: string;
  error?: boolean;
  /** Error copy. Announced with the field rather than shown inline here. */
  errorMessage?: string;
};

export function InputField({
  variant = "form",
  icon,
  label,
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
  const inputRef = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const isPassword = variant === "password";
  // In auth.png & design.png (05), the default unrevealed state shows the slashed eye ("eyeOff")
  const trailing = isPassword
    ? revealed
      ? "eye"
      : "eyeOff"
    : trailingIcon;

  const trailingHandler = isPassword
    ? () => setRevealed((was) => !was)
    : onTrailingPress;

  const borderClass = error
    ? errorBorders[variant]
    : focused
      ? focusBorders[variant]
      : defaultBorders[variant];

  const trailingElement = trailing ? (
    trailingHandler ? (
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
        hitSlop={12}
        className="ml-sm justify-center items-center"
      >
        <Icon name={trailing} size={22} tone="foreground" />
      </Pressable>
    ) : (
      <View className="ml-sm justify-center items-center">
        <Icon name={trailing} size={22} tone="foreground" />
      </View>
    )
  ) : null;

  return (
    <View className="w-full gap-xs">
      <Pressable
        onPress={() => editable && inputRef.current?.focus()}
        className={`flex-row items-center border-[1.5px] bg-background ${fieldContainers[variant]} ${borderClass} ${
          label ? "py-2.5" : "py-2"
        }`}
      >
        {/* Leading Icon — Vertically centered */}
        {icon ? (
          <View className="mr-3.5 justify-center items-center">
            <Icon name={icon} size={22} tone="foreground" />
          </View>
        ) : null}

        {/* Center Stack: Dark Label on top + Muted/Foreground TextInput below */}
        <View className="flex-1 justify-center">
          {label ? (
            <ThemedText
              variant="caption"
              tone="foreground"
              className="font-medium text-[14px] leading-tight mb-0.5"
            >
              {label}
            </ThemedText>
          ) : null}

          <TextInput
            ref={inputRef}
            className="text-foreground text-[15px] p-0 m-0 leading-snug"
            placeholderTextColor="#9CA3AF"
            selectionColor="#C9B4FF"
            cursorColor="#C9B4FF"
            editable={editable}
            secureTextEntry={isPassword ? !revealed : secureTextEntry}
            accessibilityLabel={
              props.accessibilityLabel ?? label ?? props.placeholder
            }
            onFocus={(event) => {
              setFocused(true);
              props.onFocus?.(event);
            }}
            onBlur={(event) => {
              setFocused(false);
              props.onBlur?.(event);
            }}
            {...props}
            style={[{ paddingVertical: 0 }, style]}
          />
        </View>

        {/* Trailing Icon / Password Toggle */}
        {trailingElement}
      </Pressable>

      {error && errorMessage ? (
        <ThemedText variant="caption" tone="error" className="px-xs">
          {errorMessage}
        </ThemedText>
      ) : null}
    </View>
  );
}
