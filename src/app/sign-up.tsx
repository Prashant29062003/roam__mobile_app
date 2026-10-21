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

export default function SignUp() {
  const { signUp } = useSession();

  const [fullName, setFullName] = useState("");
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

    const result = await signUp({
      email: email.trim(),
      password,
      fullName: fullName.trim(),
    });
    setLoading(false);

    if (!result.ok) {
      setErrors({ [result.error.field]: result.error.message });
      return;
    }

    router.replace(`/verify-email?email=${encodeURIComponent(email.trim())}`);
  };

  const onSocial = () => {
    Alert.alert(
      "Not available yet",
      "This sign-in method isn't connected yet.",
    );
  };

  return (
    <AuthShell
      title={"Create your account"}
      subtitle="Join roam to save your stays, get personalized recommendations and access them across all your devices."
      footer={
        <AuthSwitch
          prompt="Already have an account?"
          actionLabel="Sign in"
          onPress={() => router.replace("/sign-in")}
        />
      }
    >
      <View className="gap-3.5">
        <InputField
          icon="person"
          label="Full name"
          value={fullName}
          onChangeText={(text) => {
            setFullName(text);
            clearFieldError("fullName");
          }}
          placeholder="e.g. Adrian Hajdin"
          autoComplete="name"
          textContentType="name"
          returnKeyType="next"
          error={!!errors.fullName}
          errorMessage={errors.fullName}
        />

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
          autoComplete="password-new"
          textContentType="newPassword"
          returnKeyType="done"
          onSubmitEditing={onSubmit}
          error={!!errors.password}
          errorMessage={errors.password}
        />

        <View className="mt-2">
          <Button
            title="Create account"
            variant="primary"
            size="md"
            trailingIcon="arrowRight"
            loading={loading}
            onPress={onSubmit}
          />
        </View>

        {/* "or" Divider */}
        <View className="flex-row items-center gap-4 my-2">
          <View className="flex-1 h-[1px] bg-border" />
          <ThemedText variant="caption" tone="muted">
            or
          </ThemedText>
          <View className="flex-1 h-[1px] bg-border" />
        </View>

        {/* Social Buttons */}
        <View className="gap-3">
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
