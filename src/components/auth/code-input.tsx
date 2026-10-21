import { useRef, useState } from "react";
import { Pressable, TextInput, type TextInputInstance, View } from "react-native";

import { ThemedText } from "@/components/ui";

export type CodeInputProps = {
  /** Current code value, capped at 6 digits. */
  value: string;
  /** Called whenever the value changes. */
  onChange: (value: string) => void;
  /** Called once all six digits are filled. */
  onComplete?: (code: string) => void;
  /** Colours the box borders lavender instead of the default border. */
  active?: boolean;
  /** Box size in pixels. */
  size?: number;
};

/**
 * Six digit boxes for a one-time verification code.
 *
 * A single hidden TextInput owns the keyboard, paste and backspace so the
 * behaviour is consistent across platforms; six visual boxes mirror its value.
 * The first empty box is highlighted, and entering a digit fills the next box.
 */
export function CodeInput({
  value,
  onChange,
  onComplete,
  active = false,
  size = 48,
}: CodeInputProps) {
  const inputRef = useRef<TextInputInstance>(null);
  const [focused, setFocused] = useState(false);

  const isFocusedOrActive = focused || active;
  const currentIndex = Math.min(value.length, 5);

  const handleChange = (text: string) => {
    const digits = text.replace(/\D/g, "").slice(0, 6);
    onChange(digits);
    if (digits.length === 6 && onComplete) {
      onComplete(digits);
    }
  };

  return (
    <Pressable
      onPress={() => inputRef.current?.focus()}
      accessibilityRole="button"
      accessibilityLabel="Verification code input"
      className="relative"
    >
      <View className="flex-row justify-between gap-sm">
        {Array.from({ length: 6 }).map((_, i) => {
          const shown = i < value.length;
          const lit = isFocusedOrActive && i === currentIndex && !shown;
          const isHighlighted = shown || lit || active;

          return (
            <View
              key={i}
              className={`items-center justify-center border-[1.5px] rounded-control ${
                isHighlighted
                  ? "bg-lavender-tint border-lavender"
                  : "bg-background border-border"
              }`}
              style={{ width: size, height: size }}
            >
              {shown ? (
                <ThemedText variant="title" className="text-center">
                  {value[i]}
                </ThemedText>
              ) : null}
            </View>
          );
        })}
      </View>

      <TextInput
        ref={inputRef}
        className="font-sans"
        value={value}
        maxLength={6}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        autoCapitalize="none"
        autoCorrect={false}
        autoFocus
        caretHidden
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChangeText={handleChange}
        style={{
          position: "absolute",
          opacity: 0,
          width: 1,
          height: 1,
        }}
      />
    </Pressable>
  );
}
