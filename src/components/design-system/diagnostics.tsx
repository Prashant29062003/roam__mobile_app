import { Platform, useColorScheme, View } from "react-native";
import { colorScheme } from "react-native-css";

import { ThemedText } from "@/components/ui";
import { appearanceInfo } from "@/theme";

/**
 * TEMPORARY. Delete once the dark-mode question is settled.
 *
 * The switch has failed on device more than once and the cause is not obvious
 * from the code, so this reports each layer separately instead of guessing.
 * Read the page itself as the sixth signal: if these say "dark" but the page
 * renders light, the `:root` tokens are ignoring the media query.
 *
 * `useUnstableNativeVariable` is deliberately NOT used here. It calls
 * `cleanupEffect()` during render, which destabilises hook bookkeeping under
 * Fabric and crashed the screen with "Rendered fewer hooks than expected".
 */
export function Diagnostics() {
  const hookScheme = useColorScheme();

  const rows: [string, string][] = [
    ["platform", Platform.OS],
    ["can override scheme", String(appearanceInfo.canOverride)],
    ["Appearance.getColorScheme()", String(appearanceInfo.get())],
    ["useColorScheme()", String(hookScheme)],
    ["colorScheme.get() (react-native-css)", String(colorScheme.get())],
  ];

  return (
    <View className="gap-xs rounded-control border border-border bg-surface p-md">
      <ThemedText variant="caption" tone="muted">
        DIAGNOSTIC — delete once dark mode is settled
      </ThemedText>
      {rows.map(([label, value]) => (
        <View key={label} className="gap-xs">
          <ThemedText variant="caption" tone="muted">
            {label}
          </ThemedText>
          <ThemedText variant="caption">{value}</ThemedText>
        </View>
      ))}
    </View>
  );
}