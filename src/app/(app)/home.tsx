import { View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, ThemedText, Wordmark } from "@/components/ui";
import { useSession } from "@/auth/session";

/**
 * The first screen past authentication, and a placeholder for the home screen
 * that replaces it. It exists so the signed-in branch of the guard has somewhere
 * real to land and so sign-out has somewhere to go.
 */
export default function Home() {
  const { session, signOut } = useSession();
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-1 items-center justify-center gap-lg bg-background px-lg"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <Wordmark size="title" />

      <ThemedText variant="body" tone="muted" className="text-center">
        Signed in as {session?.email}
      </ThemedText>

      <View className="w-full gap-sm">
        <Button
          title="Sign out"
          variant="secondary"
          onPress={async () => {
            // Clerk tears the session down over the network, so the route
            // change waits for it. Otherwise the guard and the navigation
            // race, and the app can land back on a screen that is already
            // being torn down.
            await signOut();
            router.replace("/");
          }}
        />
        <Button
          title="View Design System"
          variant="ghost"
          onPress={() => router.push("/design-system")}
        />
      </View>
    </View>
  );
}
