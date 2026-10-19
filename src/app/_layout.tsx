import "../global.css";

import { useEffect } from "react";
import { Stack, SplashScreen } from "expo-router";

import { ThemeProvider } from "@/components/theme-provider";
import { SessionProvider, useSession } from "@/auth/session";
import { useThemeColors } from "@/theme";

SplashScreen.preventAutoHideAsync();

/**
 * Holds the splash until the session read settles, so a returning user never
 * sees onboarding flash before the guard moves them to `/home`.
 */
function SplashScreenController() {
  const { isLoading } = useSession();

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hide();
    }
  }, [isLoading]);

  return null;
}

function RootNavigator() {
  const { session } = useSession();
  const colors = useThemeColors();

  return (
    <Stack
      screenOptions={{
        // Without this the navigator paints its own background and the screen
        // flashes white between transitions in dark mode.
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      {/* Signed out. `/` is onboarding and is the anchor, so it has to be the
          first screen here or a cold start has nothing to land on. */}
      <Stack.Protected guard={!session}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="sign-in" options={{ headerShown: false }} />
        <Stack.Screen name="sign-up" options={{ headerShown: false }} />
        <Stack.Screen name="verify-email" options={{ headerShown: false }} />
      </Stack.Protected>

      <Stack.Protected guard={!!session}>
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
      </Stack.Protected>

      {/* The design system reference is always reachable, so a new session can
          check a token without signing in first. */}
      <Stack.Screen name="design-system" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <SessionProvider>
        <SplashScreenController />
        <RootNavigator />
      </SessionProvider>
    </ThemeProvider>
  );
}