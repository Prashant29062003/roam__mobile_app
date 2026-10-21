import { useState } from "react";
import { Alert, Keyboard, View } from "react-native";
import { router } from "expo-router";

import { AuthShell, AuthSwitch } from "@/components/auth/auth-shell";
import AppleMark from "@/components/brand/apple-mark";
import { GoogleMark } from "@/components/brand/google-mark";
import { Button, InputField, ThemedText } from "@/components/ui";
import { useSession, type AuthError } from "@/auth/session";

/** Keyed by `AuthError["field"]` so each message lands on the box that caused it. */
type FieldErrors = Partial<Record<AuthError["field"], string>>;

export default function SignIn() {
  const { signIn } = useSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);

  const clearFieldError = (field: AuthError["field"]) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const onSubmit = async () => {
    if (loading) return;
    Keyboard.dismiss();
    setErrors({});
    setLoading(true);

    const result = await signIn({
      email: email.trim(),
      password,
    });
    setLoading(false);

    if (!result.ok) {
      setErrors({ [result.error.field]: result.error.message });
      return;
    }

    if (result.needsCode) {
      // Clerk asked for a second factor — the instance has Device Trust on,
      // so a password sign-in on a new device gets an email code.
      router.replace(`/verify-email?email=${encodeURIComponent(email.trim())}`);
      return;
    }

    router.replace("/home");
  };

  const onSocial = () => {
    Alert.alert(
      "Not available yet",
      "This sign-in method isn't connected yet.",
    );
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to pick up where you left off and see your saved stays."
      footer={
        <AuthSwitch
          prompt="New to roam?"
          actionLabel="Create an account"
          onPress={() => router.replace("/sign-up")}
        />
      }
    >
      <View className="gap-md">
        <InputField
          icon="mail"
          label="Email address"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            clearFieldError("email");
          }}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="next"
          error={!!errors.email}
          errorMessage={errors.email}
        />

        <InputField
          variant="password"
          icon="lock"
          label="Password"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            clearFieldError("password");
          }}
          placeholder="At least 15 characters"
          autoCapitalize="none"
          autoComplete="password"
          textContentType="password"
          returnKeyType="done"
          onSubmitEditing={onSubmit}
          error={!!errors.password}
          errorMessage={errors.password}
        />

        <View className="mt-xs">
          <Button
            title="Sign in"
            variant="primary"
            size="md"
            trailingIcon="arrowRight"
            loading={loading}
            onPress={onSubmit}
          />
        </View>

        <View className="flex-row items-center gap-md my-xs">
          <View className="flex-1 h-[1px] bg-border" />
          <ThemedText variant="caption" tone="muted">
            or
          </ThemedText>
          <View className="flex-1 h-[1px] bg-border" />
        </View>

        <View className="gap-sm">
          <Button
            title="Continue with Google"
            variant="secondary"
            size="md"
            leading={<GoogleMark size={20} />}
            onPress={onSocial}
          />
          <Button
            title="Continue with Apple"
            variant="secondary"
            size="md"
            leading={<AppleMark size={20} />}
            onPress={onSocial}
          />
        </View>
      </View>
    </AuthShell>
  );
}
