import { View, type StyleProp, type ViewStyle } from "react-native";

export type CardVariant = "surface" | "tinted" | "plain";

const containers = {
  /** White card on the gray app background — the listing and profile cards. */
  surface: "bg-surface",
  /** Lavender wash — policy cards and other "this is information" panels. */
  tinted: "bg-lavender-tint",
  /** No fill, for grouping that only needs spacing. */
  plain: "bg-transparent",
} as const;

export type CardProps = {
  variant?: CardVariant;
  /** Show the hairline border. Off for cards already sitting on a fill. */
  bordered?: boolean;
  className?: string;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
};

/**
 * A surface, not a slot. The design separates content with background contrast
 * and hairlines rather than stacking shadowed boxes, so `bordered` defaults to
 * off and shadows stay out of this primitive entirely.
 */
export function Card({
  variant = "surface",
  bordered = false,
  className,
  style,
  children,
}: CardProps) {
  return (
    <View
      className={[
        "rounded-card",
        containers[variant],
        bordered ? "border border-border" : "",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
    >
      {children}
    </View>
  );
}
