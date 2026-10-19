import { useState } from "react";
import { Alert, Pressable, ScrollView, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, IconButton, ThemedText, Wordmark } from "@/components/ui";
import { CodeInput } from "@/components/auth/code-input";
import { useSession } from "@/auth/session";

/** `--spacing-sm`, which cannot ride in a `className` alongside a runtime inset. */
const GUTTER = 8;

export default function VerifyEmail() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const email = params.email as string | undefined;
  const { verifyCode } = useSession();
  const insets = useSafeAreaInsets();

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const maskedEmail = email
    ? email.replace(/^[^@]+/, () => "•".repeat(email.split("@")[0]!.length))
    : "••••@example.com";

  const onSubmit = async () => {
    setLoading(true);
    const result = await verifyCode({ email: email ?? "", code });
    setLoading(false);
    if (!result.ok) {
      return;
    }
    router.replace("/home");
  };

  const onResend = () => {
    Alert.alert("Code sent", `We've sent a new code to ${maskedEmail}.`);
  };

  return (
    <View className="flex-1 bg-surface">
      <StatusBar style="auto" />

      <View
        className="flex-row items-center justify-between px-md"
        style={{ paddingTop: insets.top + GUTTER }}
      >
        <IconButton
          accessibilityLabel="Go back"
          name="chevronLeft"
          onPress={() => router.back()}
        />
        <Wordmark size="title" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-xl px-lg pt-xl"
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-sm px-lg">
          <ThemedText variant="hero">Verify your email</ThemedText>
          <ThemedText variant="body" tone="muted">
            We&rsquo;ve sent a 6-digit code to {maskedEmail}.
          </ThemedText>

          <View className="gap-lg">
            <CodeInput value={code} onChange={setCode} onComplete={onSubmit} />

            <View className="flex-row justify-end">
              <Pressable accessibilityLabel="Resend code" onPress={onResend}>
                <ThemedText variant="caption" tone="lavender">
                  Resend code
                </ThemedText>
              </Pressable>
            </View>
          </View>

          <View className="gap-sm">
            <Button
              title="Verify"
              size="md"
              trailingIcon="arrowRight"
              loading={loading}
              disabled={code.length !== 6}
              onPress={onSubmit}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
