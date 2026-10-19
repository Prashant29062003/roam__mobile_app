import { useState } from "react";
import {
  TextInput,
  TextInputKeyPressEvent,
  View,
} from "react-native";

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
  size = 44,
}: CodeInputProps) {
  const boxActive = active || value.length > 0;
  const currentIndex = Math.min(value.length, 5);

  const handleChange = (text: string) => {
    const digits = text.replace(/\D/g, "").slice(0, 6);
    onChange(digits);
    if (digits.length === 6 && onComplete) {
      onComplete(digits);
    }
  };

  const handleKeyPress = (event: TextInputKeyPressEvent) => {
    if (event.nativeEvent.key === "Backspace" && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <>
      <View className="flex-row gap-sm">
        {Array.from({ length: 6 }).map((_, i) => {
          const shown = i < value.length;
          const lit = i === currentIndex && !shown;
          return (
            <View
              key={i}
              className={`border rounded-control ${boxActive ? "bg-lavender-tint border-lavender" : "bg-background border-border"}`}
              style={{ width: size, height: size }}
            >
              {shown ? (
                <TextInput
                  editable={false}
                  value={value[i]}
                  className="text-foreground font-semibold text-center"
                />
              ) : null}
            </View>
          );
        })}
      </View>

      <TextInput
        value={value}
        maxLength={6}
        keyboardType="numeric"
        textContentType="oneTimeCode"
        autoCapitalize="none"
        autoCorrect={false}
        autoFocus
        editable
        onChangeText={handleChange}
        onKeyPress={handleKeyPress}
        style={{
          position: "absolute",
          opacity: 0,
          width: 0,
          height: 0,
        }}
      />
    </>
  );
}
