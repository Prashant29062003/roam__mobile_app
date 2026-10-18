import { Pressable, View, type StyleProp, type ViewStyle } from "react-native";

import { Icon, type IconName } from "./icon";
import { ThemedText } from "./themed-text";

export type ProfileRowProps = {
  label: string;
  icon: IconName;
  /** Optional secondary line under the label. */
  detail?: string;
  onPress?: () => void;
  /** Overrides the row's own width so it can sit in a narrower column. */
  style?: StyleProp<ViewStyle>;
};

/**
 * A settings row: glyph on a soft circle, label, trailing chevron. Rows sit in
 * a `Card` and separate with hairlines rather than each getting their own
 * shadowed box.
 */
export function ProfileRow({ label, icon, detail, onPress, style }: ProfileRowProps) {
  const body = (
    <>
      <View className="h-11 w-11 items-center justify-center rounded-full bg-background">
        <Icon name={icon} size={20} tone="foreground" />
      </View>

      <View className="flex-1 gap-xs">
        <ThemedText variant="body">{label}</ThemedText>
        {detail ? (
          <ThemedText variant="caption" tone="muted">
            {detail}
          </ThemedText>
        ) : null}
      </View>

      <Icon name="chevronRight" size={16} tone="foreground" />
    </>
  );

  if (!onPress) {
    return (
      <View
        className="flex-row items-center gap-md py-sm"
        accessibilityRole="text"
        accessibilityLabel={detail ? `${label}, ${detail}` : label}
        style={style}
      >
        {body}
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={detail ? `${label}, ${detail}` : label}
      onPress={onPress}
      className="flex-row items-center gap-md py-sm"
      style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }, style]}
    >
      {body}
    </Pressable>
  );
}
