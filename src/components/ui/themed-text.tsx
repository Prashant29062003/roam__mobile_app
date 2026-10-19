import { Text, type TextProps } from "react-native";

/**
 * The type ramp from the design, mapped onto the `--text-*` tokens in
 * `src/global.css`. Screens pick a step and a tone; they never set `fontSize`.
 *
 * `display` is for non-stack contexts (onboarding heroes). Screen titles still
 * come from the navigation header.
 */
const variants = {
  display: "text-display font-bold",
  /** Screen heroes — onboarding and auth headings. Heavy and tight. */
  hero: "text-hero font-extrabold tracking-tight",
  heading: "text-heading font-bold",
  title: "text-title font-bold",
  body: "text-body",
  caption: "text-caption font-medium",
  button: "text-button font-medium",
} as const;

const tones = {
  /** `foreground` — headings and primary text. */
  default: "text-foreground",
  /** `muted` — body copy, placeholders, supporting labels. */
  muted: "text-muted",
  /** Brand yellow — prices and emphasis on light surfaces. */
  primary: "text-primary",
  /** Lavender — secondary actions and highlights. */
  lavender: "text-lavender",
  /** Rating star. */
  star: "text-star",
  success: "text-success",
  error: "text-error",
  /** For text sitting on the brand yellow fill. */
  onPrimary: "text-on-primary",
  /** For text sitting on the lavender fill. */
  onLavender: "text-on-lavender",
  /** For text sitting on the scrim, e.g. the location pill over a photo. */
  onScrim: "text-on-scrim",
} as const;

export type TextVariant = keyof typeof variants;
export type TextTone = keyof typeof tones;

export type ThemedTextProps = TextProps & {
  variant?: TextVariant;
  tone?: TextTone;
};

/**
 * Every piece of text in the app goes through here, which is what keeps the
 * ramp honest. Text scales with the user's Dynamic Type setting by default —
 * do not set `allowFontScaling={false}`.
 */
export function ThemedText({
  variant = "body",
  tone = "default",
  className,
  ...props
}: ThemedTextProps) {
  return (
    <Text
      className={[variants[variant], tones[tone], className].join(" ")}
      {...props}
    />
  );
}
