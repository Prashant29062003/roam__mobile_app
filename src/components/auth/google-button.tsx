import { GoogleMark } from "@/components/brand/google-mark";
import { Button } from "@/components/ui";
import { useSocialSignIn } from "./use-social-sign-in";

/**
 * "Continue with Google", on the sign-in and sign-up screens.
 *
 * The flow is a browser session: Clerk sends the user to Google, Google sends
 * them back to the app's deep link, and Clerk exchanges the code. It is the
 * one flow that cannot run inside the app, and it needs the app's redirect URL
 * whitelisted in the Clerk Dashboard.
 */
export function GoogleButton() {
  const { onPress, loading } = useSocialSignIn("oauth_google");

  return (
    <Button
      title="Continue with Google"
      variant="secondary"
      size="md"
      leading={<GoogleMark size={20} />}
      loading={loading}
      onPress={onPress}
    />
  );
}
