import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GoogleMark } from "@/components/brand/google-mark";
import { PageDots } from "@/components/onboarding/page-dots";
import { SlideCopy } from "@/components/onboarding/slide-copy";
import { useSteadyHeight } from "@/components/onboarding/use-steady-height";
import { Button, Icon, ThemedText, Wordmark } from "@/components/ui";
import { onboardingSlides } from "@/data/onboarding-slides";
import { shadows } from "@/theme";

/** `--spacing-sm`, which cannot ride along in a `className` next to a runtime inset. */
const GUTTER = 8;

export default function Onboarding() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(0);
  const { steadyHeight, record } = useSteadyHeight();

  // Every photo is fetched up front, because a swipe into a half-loaded page is
  // what read as a flash: the outgoing photo was there, the incoming one was
  // not, and the light background showed through the gap. Nothing is swipeable
  // until the set has landed, and a failure never blocks — one dead photo
  // should not strand the carousel.
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    Promise.all(
      onboardingSlides.map((item) => Image.prefetch(item.image)),
    )
      .catch(() => undefined)
      .then(() => {
        if (!cancelled) {
          setReady(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const slide = onboardingSlides[index];

  const onScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ): void => {
    const next = Math.round(event.nativeEvent.contentOffset.x / width);
    if (next !== index && next >= 0 && next < onboardingSlides.length) {
      setIndex(next);
    }
  };

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="dark" />

      {/* `bg-scrim` rather than the app background: it only shows in the gaps
          between pages during a swipe, where a light rectangle would flash. */}
      <View className="flex-1 bg-scrim">
        <FlatList
          data={onboardingSlides}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => (
            <View style={{ width }}>
              <Image
                source={{ uri: item.image }}
                placeholder={{ blurhash: item.placeholder }}
                style={{ flex: 1 }}
                contentFit="cover"
                cachePolicy="memory-disk"
                // No fade transition. On a full-bleed background a 250ms
                // fade-in is indistinguishable from a flash; the blurhash
                // covers the gap instead, and prefetch means the swap is
                // usually a cache hit.
                // Decorative: the slide's copy is the content, and a photo
                // behind it adds nothing a screen reader can use.
                accessible={false}
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
              />
            </View>
          )}
          horizontal
          pagingEnabled
          scrollEnabled={ready}
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onScrollEnd}
        />

        <View
          className="absolute inset-x-0 top-0 flex-row items-center justify-between px-lg"
          style={{ paddingTop: insets.top + GUTTER }}
        >
          <Wordmark size="display" />
          <Button
            title="Skip"
            variant="secondary"
            size="sm"
            className="border-0 bg-glass"
            onPress={() => router.replace("/sign-in")}
          />
        </View>

        <View className="absolute inset-x-0 bottom-0 px-lg pb-lg">
          <View className="flex-row items-center gap-sm self-start rounded-full bg-scrim px-md py-sm">
            <Icon name="location" size={16} tone="onScrim" />
            <ThemedText variant="caption" tone="onScrim">
              {slide.location}
            </ThemedText>
          </View>
        </View>
      </View>

      <View className="rounded-t-sheet bg-surface px-lg pt-lg" style={shadows.overlay}>
        <View className="gap-md" style={{ paddingBottom: insets.bottom + 24 }}>
          <PageDots count={onboardingSlides.length} index={index} />

          <View style={{ minHeight: steadyHeight || undefined }}>
            <SlideCopy slide={slide} />
          </View>

          {/* Every slide's copy, laid out off-screen so the visible block above
              can be pinned to the tallest of them. Absolute so it contributes
              nothing to the sheet, and transparent so it cannot be seen or
              touched. */}
          <View
            style={[StyleSheet.absoluteFill, { opacity: 0 }]}
            pointerEvents="none"
          >
            {onboardingSlides.map((item) => (
              <SlideCopy key={item.key} slide={item} onHeight={record} />
            ))}
          </View>

          <View className="gap-sm">
            <Button
              title="Get started"
              variant="primary"
              size="md"
              trailingIcon="arrowRight"
              onPress={() => router.replace("/sign-up")}
            />
            <Button
              title="Continue with Google"
              variant="secondary"
              size="md"
              leading={<GoogleMark />}
              onPress={() =>
                Alert.alert(
                  "Not available yet",
                  "Google sign-in is not connected yet. Use email to get started.",
                )
              }
            />
          </View>
        </View>
      </View>
    </View>
  );
}
