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
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

import { GoogleMark } from "@/components/brand/google-mark";
import { PageDots } from "@/components/onboarding/page-dots";
import { SlideCopy } from "@/components/onboarding/slide-copy";
import { useSteadyHeight } from "@/components/onboarding/use-steady-height";
import { Button, Icon, ThemedText, Wordmark } from "@/components/ui";
import { onboardingSlides } from "@/data/onboarding-slides";
import { shadows, useThemeColors } from "@/theme";
import { useAppTheme } from "@/components/theme-provider";

/** `--spacing-sm`, which cannot ride along in a `className` next to a runtime inset. */
const GUTTER = 8;

export default function Onboarding() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(0);
  const { steadyHeight, record } = useSteadyHeight();

  // Every photo is fetched up front to prevent flashing during swipes.
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

  // Inside Onboarding():
  const { scheme } = useAppTheme();
  const colors = useThemeColors();

  return (
    <View className="flex-1 bg-background">
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />

      {/* Carousel Section */}
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

        {/* Top Header: Wordmark & Skip Button */}
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

        {/* Location Badge with Glassmorphism */}
        <View className="absolute inset-x-0 bottom-6 px-lg pb-lg">
          <BlurView
            intensity={50}
            tint="dark"
            className="flex-row items-center gap-sm self-start rounded-full px-4 py-2 border border-white/20 overflow-hidden"
          >
            <Icon name="location" size={16} tone="onScrim" />
            <ThemedText variant="caption" tone="onScrim">
              {slide.location}
            </ThemedText>
          </BlurView>
        </View>
      </View>

      {/* Bottom Sheet Container */}
      <View className="bg-surface relative px-lg pt-sm" style={shadows.overlay}>
        {/* Organic Wavy Top SVG matching onboarding_2.png */}
        <View
          className="absolute left-0 right-0 bottom-full overflow-hidden pointer-events-none"
          style={{ height: 48 }}
        >
          <Svg
            viewBox="0 0 375 48"
            width="100%"
            height="100%"
            preserveAspectRatio="none"
          >
            <Path
              d="M0,48 C100,48 150,5 240,20 C300,30 340,40 375,10 L375,48 Z"
              fill={colors.surface}
            />
          </Svg>
        </View>

        <View className="gap-md" style={{ paddingBottom: insets.bottom + 24 }}>
          <PageDots count={onboardingSlides.length} index={index} />

          <View style={{ minHeight: steadyHeight || undefined }}>
            <SlideCopy slide={slide} />
          </View>

          {/* Off-screen layout measurement for steady height */}
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
              style={{ backgroundColor: "#FFC629", borderRadius: 999 }}
            />
            <Button
              title="Continue with Google"
              variant="secondary"
              size="md"
              leading={<GoogleMark size={20} />}
              onPress={() =>
                Alert.alert(
                  "Not available yet",
                  "Google sign-in is not connected yet. Use email to get started.",
                )
              }
              style={{
                borderRadius: 999,
                borderColor: "#E5E7EB",
                borderWidth: 1,
              }}
            />
          </View>
        </View>
      </View>
    </View>
  );
}
