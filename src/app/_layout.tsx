import { ClerkProvider } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import "../global.css";

import { useEffect } from "react";
import { Stack, SplashScreen } from "expo-router";
import { useFonts } from "expo-font";

import { ThemeProvider } from "@/components/theme-provider";
import { SessionProvider, useSession } from "@/auth/session";
import { useThemeColors } from "@/theme";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";

// The publishable key is public — it ships in the bundle. Only a missing one
// is a problem, and only in development: in a build it is the environment's
// job to provide it, and Clerk's own error is the honest one to show.
if (__DEV__ && !publishableKey) {
  throw new Error(
    "Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY.\n" +
      "Run `npx clerk@latest auth login`, then `npx clerk@latest link`, " +
      "then `npx clerk@latest env pull`, and restart the dev server.",
  );
}

SplashScreen.preventAutoHideAsync();

/**
 * The brand typeface, loaded at runtime.
 *
 * One family name, five faces. expo-font aliases the faces to that name, so
 * `fontFamily: "Poppins"` plus a `fontWeight` picks the real face: on iOS
 * through the swizzled `UIFont.fontNames(forFamilyName:)`, on Android through
 * the declared weight. The default face has to come first — React Native falls
 * back to the first name when it cannot match a weight.
 *
 * The files live in `assets/fonts/` and are the Poppins cuts (SIL OFL 1.1,
 * see `assets/fonts/OFL.txt`).
 */
const POPPINS = [
  {
    fontFamily: "Poppins",
    fontDefinitions: [
      { path: require("../../assets/fonts/Poppins-Regular.ttf"), weight: 400 },
      { path: require("../../assets/fonts/Poppins-Medium.ttf"), weight: 500 },
      { path: require("../../assets/fonts/Poppins-SemiBold.ttf"), weight: 600 },
      { path: require("../../assets/fonts/Poppins-Bold.ttf"), weight: 700 },
      { path: require("../../assets/fonts/Poppins-ExtraBold.ttf"), weight: 800 },
    ],
  },
];

/**
 * Holds the splash until the session read settles, so a returning user never
 * sees onboarding flash before the guard moves them to `/home`.
 *
 * The session read is a real one now: Clerk restores the session from the
 * keychain, so this is the wait that keeps a signed-in user out of onboarding.
 *
 * The fonts are part of that wait: rendering before they are ready shows the
 * platform font for a frame, which is the one flash this app cannot have.
 */
function SplashScreenController({ fontsReady }: { fontsReady: boolean }) {
  const { isLoading } = useSession();

  useEffect(() => {
    if (!isLoading && fontsReady) {
      SplashScreen.hide();
    }
  }, [isLoading, fontsReady]);

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
  const [fontsLoaded, fontError] = useFonts(POPPINS);

  // Nothing renders before the family is ready. A font that fails to load
  // must not strand the app on the splash, so an error falls through to the
  // platform font instead.
  if (!fontsLoaded && !fontError) {
    return null;
  }

  if (fontError) {
    console.warn("Poppins failed to load; text falls back to the platform font.", fontError);
  }

  return (
    // `tokenCache` persists the session in the device keychain through
    // `expo-secure-store`, so a signed-in user stays signed in across a
    // restart. On web it is undefined and Clerk falls back to its own
    // storage, so there is no platform branch to write.
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ThemeProvider>
        <SessionProvider>
          <SplashScreenController fontsReady={fontsLoaded} />
          <RootNavigator />
        </SessionProvider>
      </ThemeProvider>
    </ClerkProvider>
  );
}