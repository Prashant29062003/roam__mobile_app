import { Alert, View } from "react-native";
import { router } from "expo-router";

import { AuthShell, AuthSwitch } from "@/components/auth/auth-shell";
import { GoogleMark } from "@/components/brand/google-mark";
import { Button, InputField, ThemedText } from "@/components/ui";
import { useSession, type AuthError } from "@/auth/session";
import { useState } from "react";
import AppleMark from "@/components/brand/apple-mark";

/** Keyed by `AuthError["field"]` so each message lands on the box that caused it. */
type FieldErrors = Partial<Record<AuthError["field"], string>>;

export default function SignUp() {
  const { signUp } = useSession();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setLoading(true);
    const result = await signUp({ email, password, fullName });
    setLoading(false);

    if (!result.ok) {
      setErrors({ [result.error.field]: result.error.message });
      return;
    }

    router.replace(`/verify-email?email=${encodeURIComponent(email)}`);
  };

  const onSocial = () => {
    Alert.alert("Not available yet", "This sign-in method isn't connected yet.");
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Join roam to save your stays, get personalized recommendations and access them across all your devices."
      footer={
        <AuthSwitch
          prompt="Already have an account?"
          actionLabel="Sign in"
          onPress={() => router.replace("/sign-in")}
        />
      }
    >
      <View className="gap-md">
        <InputField
          icon="person"
          label="Full name"
          value={fullName}
          onChangeText={setFullName}
          placeholder="e.g. Adrian Hajdin"
          autoComplete="name"
          textContentType="name"
          error={!!errors.fullName}
          errorMessage={errors.fullName}
        />
        <InputField
          icon="mail"
          label="Email address"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
          error={!!errors.email}
          errorMessage={errors.email}
        />
        <InputField
          variant="password"
          icon="lock"
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="At least 8 characters"
          autoCapitalize="none"
          autoComplete="password-new"
          textContentType="newPassword"
          error={!!errors.password}
          errorMessage={errors.password}
        />

        <Button
          title="Create account"
          size="md"
          trailingIcon="arrowRight"
          loading={loading}
          onPress={onSubmit}
        />

        <View className="flex-row items-center gap-sm my-sm">
          <View className="flex-1 border-t border-border" />
          <ThemedText variant="caption" tone="muted">or</ThemedText>
          <View className="flex-1 border-t border-border" />
        </View>

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
    </AuthShell>
  );
}
