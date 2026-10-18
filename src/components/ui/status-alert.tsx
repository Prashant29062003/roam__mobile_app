import { Pressable, View } from "react-native";

import { Icon } from "./icon";
import { ThemedText } from "./themed-text";

const containers = {
  success: "bg-success-tint",
  error: "bg-error-tint",
} as const;

const labelTones = {
  success: "success",
  error: "error",
} as const;

const glyphs = {
  success: "check",
  error: "alert",
} as const;

export type AlertVariant = keyof typeof containers;

export type StatusAlertProps = {
  message: string;
  variant?: AlertVariant;
  /** Shows the trailing dismiss control when provided. */
  onDismiss?: () => void;
};

/**
 * Inline status banner. Announced as an alert so a screen reader picks up the
 * message the moment it appears, instead of leaving it to be discovered.
 */
export function StatusAlert({
  message,
  variant = "success",
  onDismiss,
}: StatusAlertProps) {
  return (
    <View
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      accessibilityLabel={message}
      className={`flex-row items-center gap-sm rounded-control px-md py-sm ${containers[variant]}`}
    >
      <Icon name={glyphs[variant]} size={20} tone={labelTones[variant]} />

      <ThemedText
        variant="caption"
        tone={labelTones[variant]}
        className="flex-1"
      >
        {message}
      </ThemedText>

      {onDismiss ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dismiss"
          onPress={onDismiss}
          hitSlop={8}
        >
          <Icon name="close" size={16} tone={labelTones[variant]} />
        </Pressable>
      ) : null}
    </View>
  );
}

  