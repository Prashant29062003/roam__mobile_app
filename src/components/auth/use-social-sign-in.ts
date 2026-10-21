import { useState } from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import { useSSO } from "@clerk/expo/experimental";

export type SocialProvider = "oauth_google" | "oauth_apple";

const PROVIDER_NAMES: Record<SocialProvider, string> = {
  oauth_google: "Google",
  oauth_apple: "Apple",
};

/**
 * The browser-session sign-in flow, shared by the Google and Apple buttons.
 *
 * Clerk sends the user to the provider, the provider sends them back to the
 * app's deep link, and Clerk exchanges the code. One code path for both
 * providers, on every platform: no native module, no entitlement, and no
 * Apple or Google account of our own — the instance uses Clerk's shared
 * credentials in development.
 *
 * The Core 3 `useSSO` is used rather than the legacy one, because the rest of
 * the app's auth already speaks in future resources: this hook activates the
 * completed session itself, so there is no `setActive` to call and no second
 * API generation in the codebase.
 */
export function useSocialSignIn(provider: SocialProvider) {
  const { startSSOFlow } = useSSO();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onPress = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const { createdSessionId, signUp } = await startSSOFlow({ strategy: provider });

      if (createdSessionId) {
        // The session is already active, so the guard in the root layout has
        // moved the user to the signed-in stack. This just skips the flash of
        // the sign-in screen on the way there.
        router.replace("/home");
        return;
      }

      if (signUp?.status === "missing_requirements") {
        // The provider did not give us everything the instance asks for.
        // Nothing else can complete this sign-up, so say so instead of
        // failing quietly.
        Alert.alert(
          "One more thing",
          "Your account is missing something we need. Please sign up with your email address instead.",
        );
        return;
      }

      // No session and nothing missing: the user closed the browser. That is
      // not an error, so nothing is shown.
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Please try again.";
      Alert.alert(`${PROVIDER_NAMES[provider]} sign-in failed`, message);
    } finally {
      setLoading(false);
    }
  };

  return { onPress, loading };
}
