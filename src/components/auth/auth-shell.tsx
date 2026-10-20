import type { ReactNode } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { IconButton, ThemedText, Wordmark } from "@/components/ui";

/** `--spacing-sm`, which cannot ride in a `className` alongside a runtime inset. */
const GUTTER = 8;

export type AuthShellProps = {
  title: string;
  subtitle: string;
  /** The sign-in / sign-up switch that sits below the form area. */
  footer: ReactNode;
  children: ReactNode;
};

/**
 * The frame both auth screens share: back button, wordmark, a scrolling body,
 * and a footer.
 *
 * Only the structure lives here. The fields, the CTA, and the copy stay in each
 * screen, because the two differ in more than their wording — sign-up carries a
 * name field and sign-in does not.
 */
export function AuthShell({
  title,
  subtitle,
  footer,
  children,
}: AuthShellProps) {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-surface">
      <StatusBar style="auto" />

      {/* Top Bar — aligned with px-lg to match the form edges in auth.png */}
      <View
        className="flex-row items-center justify-between px-lg pb-sm"
        style={{ paddingTop: insets.top + GUTTER }}
      >
        <IconButton
          accessibilityLabel="Go back"
          name="chevronLeft"
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace("/");
            }
          }}
        />
        <Wordmark size="title" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-xl px-lg pt-lg"
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: insets.bottom + 24,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-sm">
          <ThemedText variant="hero">{title}</ThemedText>
          <ThemedText variant="body" tone="muted">
            {subtitle}
          </ThemedText>
        </View>

        {children}

        <View className="items-center pt-sm">{footer}</View>
      </ScrollView>
    </View>
  );
}

export type AuthSwitchProps = {
  prompt: string;
  actionLabel: string;
  onPress: () => void;
};

/** "Already have an account? Sign in" — the footer that swaps between the two. */
export function AuthSwitch({ prompt, actionLabel, onPress }: AuthSwitchProps) {
  return (
    <View className="flex-row items-center justify-center gap-xs">
      <ThemedText variant="body" tone="muted">
        {prompt}
      </ThemedText>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={actionLabel}
        onPress={onPress}
        hitSlop={8}
      >
        <ThemedText
          variant="body"
          tone="default"
          className="font-semibold underline"
        >
          {actionLabel}
        </ThemedText>
      </Pressable>
    </View>
  );
}
