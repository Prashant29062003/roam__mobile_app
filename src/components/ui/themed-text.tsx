import { Text, type TextProps } from "react-native";

/**
 * Roam typography system.
 *
 * Use variants for text hierarchy and tones for semantic colors. Sizes and
 * line heights live in `global.css`; the family is `--font-sans` (Poppins),
 * loaded at runtime by expo-font.
 *
 * The weight is a slot of its own so a caller can change it without two
 * weight utilities ending up in the same class list. React Native's cascade
 * follows the compiled CSS order, not the order of the classes, so two
 * weights in one list resolve by whichever Tailwind happens to emit last.
 */
const variants = {
  /** Large promotional display text. */
  display: { size: "text-display", weight: "font-bold", tracking: "" },

  /** Onboarding and authentication hero headings. */
  hero: {
    size: "text-hero",
    weight: "font-extrabold",
    tracking: "tracking-tight",
  },

  /** Section headings. */
  heading: { size: "text-heading", weight: "font-bold", tracking: "" },

  /** Listing titles and card headings. */
  title: { size: "text-title", weight: "font-bold", tracking: "" },

  /** Standard paragraph text. */
  body: { size: "text-body", weight: "font-normal", tracking: "" },

  /** Supporting labels and metadata. */
  caption: { size: "text-caption", weight: "font-medium", tracking: "" },

  /** Button labels. */
  button: { size: "text-button", weight: "font-medium", tracking: "" },
} as const;

/**
 * The weights the design sheet names, and the faces Poppins ships for them.
 * The class carries the weight, so the family resolves the matching face.
 */
const weights = {
  regular: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
  extrabold: "font-extrabold",
} as const;

/**
 * Semantic text colors.
 *
 * Prefer these tones instead of hardcoding text colors on screens.
 */
const tones = {
  default: "text-foreground",
  muted: "text-muted",
  primary: "text-primary",
  lavender: "text-lavender",
  star: "text-star",
  success: "text-success",
  error: "text-error",
  onPrimary: "text-on-primary",
  onLavender: "text-on-lavender",
  onScrim: "text-on-scrim",
} as const;

export type TextVariant = keyof typeof variants;
export type TextTone = keyof typeof tones;
export type TextWeight = keyof typeof weights;

export type ThemedTextProps = TextProps & {
  variant?: TextVariant;
  tone?: TextTone;
  /** Overrides the variant's weight. */
  weight?: TextWeight;
  className?: string;
};

export function ThemedText({
  variant = "body",
  tone = "default",
  weight,
  className,
  ...props
}: ThemedTextProps) {
  const { size, weight: variantWeight, tracking } = variants[variant];

  const classes = [
    // React Native has no font inheritance, so the family is set on every
    // text element instead of being inherited from a parent.
    "font-sans",
    size,
    weight ? weights[weight] : variantWeight,
    tracking,
    tones[tone],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Text
      className={classes}
      {...props}
    />
  );
}
