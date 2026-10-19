import {
  GlassView,
  isLiquidGlassAvailable,
  type GlassColorScheme,
  type GlassEffectStyleConfig,
  type GlassStyle,
} from "expo-glass-effect";
import type { ComponentType } from "react";
import { Pressable, type ColorValue, type ViewProps } from "react-native";
import { styled } from "react-native-css";

import { useThemeColors } from "@/theme";
import { Icon, type IconName } from "./icon";
import { ThemedText } from "./themed-text";

type GlassSurfaceProps = ViewProps & {
  className?: string;
  glassEffectStyle?: GlassStyle | GlassEffectStyleConfig;
  tintColor?: ColorValue;
  isInteractive?: boolean;
  colorScheme?: GlassColorScheme;
};

/**
 * `GlassView` is a third-party view, so it needs `styled` before `className`
 * resolves to anything — React Native components take `style`, and this maps
 * the CSS slot onto it.
 *
 * Both casts are load-bearing. `styled`'s generic inference over
 * `GlassViewProps` explodes into a union TypeScript cannot represent (TS2590),
 * so the component is narrowed to plain `ViewProps` on the way in and widened
 * back to the real props on the way out.
 */
const StyledGlassView = styled(
  GlassView as unknown as ComponentType<ViewProps>,
  { className: "style" },
) as ComponentType<GlassSurfaceProps>;

export type TabItem<T extends string> = {
  value: T;
  label: string;
  icon: IconName;
};

export type TabBarProps<T extends string> = {
  tabs: readonly TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Wrap in safe-area insets when the bar sits at the very bottom of a screen. */
  style?: object;
};

/**
 * The liquid-glass tab bar from the design: a frosted plate where the active
 * destination sits in a yellow shape. The layout is **vertical** — icon above
 * label, with the active shape wrapping both — per `home.png`.
 *
 * Rendered with `GlassView` so iOS 26 gets real Liquid Glass; on platforms
 * without it the component falls back to the flat `glass` token fill, which is
 * why the tint is explicit rather than left to the effect.
 *
 * Deliberately controlled — the routing decision belongs to the navigator, so
 * an Expo Router `Tabs` layout can drive this without this component importing
 * the router.
 */
export function TabBar<T extends string>({
  tabs,
  value,
  onChange,
  style,
}: TabBarProps<T>) {
  const colors = useThemeColors();
  const canBlur = isLiquidGlassAvailable();

  return (
    <StyledGlassView
      glassEffectStyle="clear"
      tintColor={colors.glass}
      colorScheme="auto"
      isInteractive={false}
      style={[
        {
          borderRadius: 9999,
          overflow: "hidden",
        },
        // Without Liquid Glass the tint is a plain translucent fill; keep a
        // hairline so the bar still reads as a separate surface.
        canBlur ? null : { borderWidth: 1, borderColor: colors.border },
        style,
      ]}
      className="mx-md mb-md flex-row items-center justify-between px-sm py-xs"
    >
      {tabs.map((tab) => {
        const selected = tab.value === value;

        return (
          <Pressable
            key={tab.value}
            accessibilityRole="tab"
            accessibilityLabel={tab.label}
            accessibilityState={{ selected }}
            onPress={() => onChange(tab.value)}
            className={`flex-1 flex-col items-center justify-center gap-xs rounded-full py-sm ${
              selected ? "bg-primary" : "bg-transparent"
            }`}
            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
          >
            <Icon
              name={tab.icon}
              size={22}
              tone={selected ? "onPrimary" : "foreground"}
            />
            <ThemedText
              variant="caption"
              tone={selected ? "onPrimary" : "default"}
              className={selected ? undefined : "font-medium"}
            >
              {tab.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </StyledGlassView>
  );
}
