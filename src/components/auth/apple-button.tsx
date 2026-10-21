import AppleMark from "@/components/brand/apple-mark";
import { Button } from "@/components/ui";
import { useSocialSignIn } from "./use-social-sign-in";

/**
 * "Continue with Apple", on the sign-in and sign-up screens.
 *
 * The same browser session as Google, so it works on every platform without
 * an Apple Developer account, a native entitlement, or a development build.
 *
 * Apple's own sheet is the better experience on iOS, and it becomes its own
 * task when there is an Apple Developer account to configure.
 */
export function AppleButton() {
  const { onPress, loading } = useSocialSignIn("oauth_apple");

  return (
    <Button
      title="Continue with Apple"
      variant="secondary"
      size="md"
      leading={<AppleMark size={20} />}
      loading={loading}
      onPress={onPress}
    />
  );
}
