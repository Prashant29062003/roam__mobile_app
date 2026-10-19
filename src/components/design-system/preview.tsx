import type { ReactNode } from "react";
import { View } from "react-native";

import { ThemedText } from "@/components/ui";

/**
 * Scaffolding for the `/design-system` preview page.
 *
 * These are deliberately **not** in `src/components/ui/`. Nothing else uses
 * them, so promoting them into the shared system would break its own rule —
 * a view earns a place there once two screens use it.
 */

export function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <View className="gap-md">
      <View className="gap-xs">
        <ThemedText variant="title">{title}</ThemedText>
        {description ? (
          <ThemedText variant="caption" tone="muted">
            {description}
          </ThemedText>
        ) : null}
      </View>
      {children}
    </View>
  );
}

/** A bordered surface that groups one family of examples. */
export function Frame({ children }: { children: ReactNode }) {
  return (
    <View className="gap-md rounded-card border border-border bg-surface p-md">
      {children}
    </View>
  );
}

/** A labelled example row. `hint` carries the class or prop under test. */
export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children?: ReactNode;
}) {
  return (
    <View className="gap-xs">
      <View className="flex-row flex-wrap items-baseline gap-sm">
        <ThemedText variant="caption" tone="default">
          {label}
        </ThemedText>
        {hint ? (
          <ThemedText variant="caption" tone="muted" className="flex-1 shrink">
            {hint}
          </ThemedText>
        ) : null}
      </View>
      {children}
    </View>
  );
}

/**
 * One color token: the swatch is filled by a Tailwind utility, so this row
 * proves the CSS variable chain actually resolves rather than just printing a
 * hex string.
 */
export function Swatch({
  className,
  token,
  variable,
  light,
  dark,
}: {
  className: string;
  token: string;
  variable: string;
  light: string;
  dark: string;
}) {
  return (
    <View className="flex-row items-center gap-md border-b border-border py-sm last:border-b-0">
      <View className={`h-12 w-12 shrink-0 rounded-control border border-border ${className}`} />

      {/* One column, not two: a side-by-side hex column left the variable name
          too little room and broke tokens mid-word ("--color-gla ss"). */}
      <View className="flex-1 gap-xs">
        <ThemedText variant="body">{token}</ThemedText>
        <ThemedText variant="caption" tone="muted">
          {variable}
        </ThemedText>
        <ThemedText variant="caption" tone="muted">
          {light} · {dark}
        </ThemedText>
      </View>
    </View>
  );
}

/** A bar whose width shows a spacing or radius step at true size. */
export function ScaleBar({
  label,
  hint,
  value,
}: {
  label: string;
  hint: string;
  value: number;
}) {
  return (
    <View className="flex-row items-center gap-md py-xs">
      <ThemedText variant="caption" className="w-16">
        {label}
      </ThemedText>
      <View className="h-4 rounded-full bg-primary" style={{ width: value }} />
      <ThemedText variant="caption" tone="muted">
        {hint}
      </ThemedText>
    </View>
  );
}

/** A box showing a corner radius at true size. */
export function RadiusBox({ label, hint, className }: { label: string; hint: string; className: string }) {
  return (
    <View className="flex-row items-center gap-md py-xs">
      <ThemedText variant="caption" className="w-16">
        {label}
      </ThemedText>
      <View className={`h-12 w-20 border border-border bg-lavender-tint ${className}`} />
      <ThemedText variant="caption" tone="muted">
        {hint}
      </ThemedText>
    </View>
  );
}